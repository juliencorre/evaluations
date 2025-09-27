-- =====================================================
-- RESTRUCTURATION DES RELATIONS CLASSES/ÉTUDIANTS
-- =====================================================
--
-- OBJECTIF : Remplacer la relation directe students.class_id par une relation
-- many-to-many via user_classes avec gestion des années scolaires
--
-- NOUVELLE ARCHITECTURE :
-- - Table school_years : Gestion centralisée des années scolaires
-- - Table user_classes étendue : Inclut school_year_id pour la temporalité
-- - Table students simplifiée : Plus de class_id direct
-- - Table student_classes : Relation many-to-many students <-> classes avec année scolaire
--
-- =====================================================

-- =====================================================
-- ÉTAPE 1 : CRÉATION DE LA TABLE SCHOOL_YEARS
-- =====================================================

CREATE TABLE school_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(20) NOT NULL UNIQUE, -- Format: "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Contraintes
    CONSTRAINT check_school_year_format
        CHECK (name ~ '^\d{4}-\d{4}$'),
    CONSTRAINT check_school_year_dates
        CHECK (end_date > start_date),
    CONSTRAINT check_school_year_name_logic
        CHECK (
            CAST(SUBSTRING(name FROM 1 FOR 4) AS INTEGER) + 1 =
            CAST(SUBSTRING(name FROM 6 FOR 4) AS INTEGER)
        )
);

-- Index pour les requêtes courantes
CREATE INDEX idx_school_years_current ON school_years(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_school_years_name ON school_years(name);

-- Contrainte pour qu'il n'y ait qu'une seule année courante
CREATE UNIQUE INDEX idx_school_years_only_one_current
ON school_years(is_current) WHERE is_current = TRUE;

-- =====================================================
-- ÉTAPE 2 : INSERTION DES ANNÉES SCOLAIRES PAR DÉFAUT
-- =====================================================

INSERT INTO school_years (name, start_date, end_date, is_current) VALUES
('2023-2024', '2023-09-01', '2024-08-31', FALSE),
('2024-2025', '2024-09-01', '2025-08-31', TRUE),
('2025-2026', '2025-09-01', '2026-08-31', FALSE);

-- =====================================================
-- ÉTAPE 3 : CRÉATION DE LA TABLE STUDENT_CLASSES
-- =====================================================

CREATE TABLE student_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL, -- Référence vers students.id
    class_id UUID NOT NULL,   -- Référence vers classes.id
    school_year_id UUID NOT NULL, -- Référence vers school_years.id
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'graduated', 'dropped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Contraintes de clé étrangère
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE RESTRICT,

    -- Un étudiant ne peut être dans la même classe qu'une fois par année scolaire
    UNIQUE(student_id, class_id, school_year_id)
);

-- Index pour les requêtes courantes
CREATE INDEX idx_student_classes_student ON student_classes(student_id);
CREATE INDEX idx_student_classes_class ON student_classes(class_id);
CREATE INDEX idx_student_classes_school_year ON student_classes(school_year_id);
CREATE INDEX idx_student_classes_status ON student_classes(status);

-- =====================================================
-- ÉTAPE 4 : MIGRATION DES DONNÉES EXISTANTES
-- =====================================================

-- Migrer les associations existantes students.class_id vers student_classes
INSERT INTO student_classes (student_id, class_id, school_year_id, status)
SELECT
    s.id as student_id,
    s.class_id,
    sy.id as school_year_id,
    'active' as status
FROM students s
JOIN classes c ON s.class_id = c.id
JOIN school_years sy ON sy.name = c.school_year
WHERE s.class_id IS NOT NULL;

-- =====================================================
-- ÉTAPE 5 : EXTENSION DE LA TABLE USER_CLASSES
-- =====================================================

-- Ajouter la colonne school_year_id à user_classes
ALTER TABLE user_classes
ADD COLUMN school_year_id UUID REFERENCES school_years(id) ON DELETE RESTRICT;

-- Mettre à jour les associations existantes avec l'année courante
UPDATE user_classes
SET school_year_id = (SELECT id FROM school_years WHERE is_current = TRUE)
WHERE school_year_id IS NULL;

-- Rendre la colonne obligatoire
ALTER TABLE user_classes
ALTER COLUMN school_year_id SET NOT NULL;

-- Ajouter une contrainte unique pour éviter les doublons
ALTER TABLE user_classes
ADD CONSTRAINT unique_user_class_school_year
UNIQUE(user_id, class_id, school_year_id);

-- Index pour les requêtes par année scolaire
CREATE INDEX idx_user_classes_school_year ON user_classes(school_year_id);

-- =====================================================
-- ÉTAPE 6 : SUPPRESSION DE LA COLONNE CLASS_ID DES STUDENTS
-- =====================================================

-- Supprimer la contrainte de clé étrangère
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_class_id_fkey;

-- Supprimer la colonne class_id
ALTER TABLE students DROP COLUMN class_id;

-- =====================================================
-- ÉTAPE 7 : CRÉATION DES VUES UTILITAIRES
-- =====================================================

-- Vue pour les étudiants avec leurs classes actuelles
CREATE OR REPLACE VIEW student_current_classes AS
SELECT
    s.*,
    sc.class_id,
    c.name as class_name,
    c.level as class_level,
    sc.school_year_id,
    sy.name as school_year_name,
    sc.status as enrollment_status
FROM students s
LEFT JOIN student_classes sc ON s.id = sc.student_id
LEFT JOIN classes c ON sc.class_id = c.id
LEFT JOIN school_years sy ON sc.school_year_id = sy.id
WHERE sy.is_current = TRUE AND sc.status = 'active';

-- Vue pour les classes avec le nombre d'étudiants
CREATE OR REPLACE VIEW classes_with_student_counts AS
SELECT
    c.*,
    sy.name as school_year_name,
    COUNT(sc.student_id) as student_count
FROM classes c
LEFT JOIN school_years sy ON c.school_year = sy.name
LEFT JOIN student_classes sc ON c.id = sc.class_id
    AND sc.school_year_id = sy.id
    AND sc.status = 'active'
GROUP BY c.id, sy.id, sy.name;

-- =====================================================
-- ÉTAPE 8 : FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour inscrire un étudiant dans une classe
CREATE OR REPLACE FUNCTION enroll_student_in_class(
    p_student_id TEXT,
    p_class_id UUID,
    p_school_year_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_school_year_id UUID;
    v_enrollment_id UUID;
BEGIN
    -- Utiliser l'année courante si non spécifiée
    IF p_school_year_id IS NULL THEN
        SELECT id INTO v_school_year_id
        FROM school_years
        WHERE is_current = TRUE;
    ELSE
        v_school_year_id := p_school_year_id;
    END IF;

    -- Insérer l'inscription
    INSERT INTO student_classes (student_id, class_id, school_year_id)
    VALUES (p_student_id, p_class_id, v_school_year_id)
    ON CONFLICT (student_id, class_id, school_year_id)
    DO UPDATE SET
        status = 'active',
        updated_at = NOW()
    RETURNING id INTO v_enrollment_id;

    RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour désinscrire un étudiant d'une classe
CREATE OR REPLACE FUNCTION unenroll_student_from_class(
    p_student_id TEXT,
    p_class_id UUID,
    p_school_year_id UUID DEFAULT NULL,
    p_status VARCHAR DEFAULT 'transferred'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_school_year_id UUID;
BEGIN
    -- Utiliser l'année courante si non spécifiée
    IF p_school_year_id IS NULL THEN
        SELECT id INTO v_school_year_id
        FROM school_years
        WHERE is_current = TRUE;
    ELSE
        v_school_year_id := p_school_year_id;
    END IF;

    -- Mettre à jour le statut
    UPDATE student_classes
    SET status = p_status, updated_at = NOW()
    WHERE student_id = p_student_id
      AND class_id = p_class_id
      AND school_year_id = v_school_year_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les étudiants d'une classe
CREATE OR REPLACE FUNCTION get_students_for_class(
    p_class_id UUID,
    p_school_year_id UUID DEFAULT NULL
)
RETURNS TABLE (
    student_id TEXT,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    enrollment_status VARCHAR,
    enrolled_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_school_year_id UUID;
BEGIN
    -- Utiliser l'année courante si non spécifiée
    IF p_school_year_id IS NULL THEN
        SELECT id INTO v_school_year_id
        FROM school_years
        WHERE is_current = TRUE;
    ELSE
        v_school_year_id := p_school_year_id;
    END IF;

    RETURN QUERY
    SELECT
        s.id as student_id,
        s.first_name,
        s.last_name,
        s.display_name,
        sc.status as enrollment_status,
        sc.enrolled_at
    FROM students s
    JOIN student_classes sc ON s.id = sc.student_id
    WHERE sc.class_id = p_class_id
      AND sc.school_year_id = v_school_year_id
      AND sc.status = 'active'
    ORDER BY s.last_name, s.first_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ÉTAPE 9 : MISE À JOUR DES POLITIQUES RLS
-- =====================================================

-- Politiques pour school_years
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view school years"
ON school_years FOR SELECT
USING (true); -- Toutes les années scolaires sont visibles

-- Politiques pour student_classes
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view student classes"
ON student_classes FOR SELECT
USING (true); -- À adapter selon votre système d'authentification

CREATE POLICY "Users can manage student classes"
ON student_classes FOR ALL
USING (true); -- À adapter selon votre système d'authentification

-- =====================================================
-- ÉTAPE 10 : COMMENTAIRES POUR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE school_years IS 'Gestion centralisée des années scolaires avec contraintes de format et de logique';
COMMENT ON TABLE student_classes IS 'Relation many-to-many entre étudiants et classes avec gestion temporelle par année scolaire';

COMMENT ON COLUMN school_years.name IS 'Format YYYY-YYYY pour l\'année scolaire (ex: 2024-2025)';
COMMENT ON COLUMN school_years.is_current IS 'Indique l\'année scolaire en cours (une seule à la fois)';

COMMENT ON COLUMN student_classes.status IS 'Statut de l\'inscription: active, transferred, graduated, dropped';
COMMENT ON COLUMN student_classes.school_year_id IS 'Référence vers l\'année scolaire pour la temporalité';

COMMENT ON FUNCTION enroll_student_in_class(TEXT, UUID, UUID) IS 'Inscrit un étudiant dans une classe pour une année scolaire donnée';
COMMENT ON FUNCTION unenroll_student_from_class(TEXT, UUID, UUID, VARCHAR) IS 'Désinscrit un étudiant d\'une classe en mettant à jour son statut';
COMMENT ON FUNCTION get_students_for_class(UUID, UUID) IS 'Retourne la liste des étudiants actifs d\'une classe pour une année scolaire';

-- =====================================================
-- RÉSUMÉ DES CHANGEMENTS
-- =====================================================

/*
AVANT :
- students.class_id -> classes.id (relation 1:N)
- classes.school_year (VARCHAR)
- user_classes sans temporalité

APRÈS :
- school_years (table centralisée)
- student_classes (relation M:N avec temporalité)
- user_classes.school_year_id (temporalité pour les enseignants)
- students sans class_id (relation via student_classes)

AVANTAGES :
- Un étudiant peut être dans plusieurs classes
- Historique des inscriptions par année scolaire
- Gestion centralisée des années scolaires
- Relations temporelles pour les enseignants
- Évolutivité pour les transferts inter-classes
*/