-- Migration pour standardiser les contraintes sur les classes
-- 1. Format school_year (YYYY-YYYY)
-- 2. Contraintes sur les niveaux de classe validés
-- 3. Soft delete pour students, classes, evaluations

-- ==============================================
-- 1. STANDARDISATION DU FORMAT SCHOOL_YEAR
-- ==============================================

-- Ajouter contrainte pour le format school_year (YYYY-YYYY)
ALTER TABLE classes ADD CONSTRAINT check_school_year_format
CHECK (school_year ~ '^\d{4}-\d{4}$' AND
       CAST(SUBSTRING(school_year FROM 1 FOR 4) AS INTEGER) + 1 =
       CAST(SUBSTRING(school_year FROM 6 FOR 4) AS INTEGER));

-- ==============================================
-- 2. CONTRAINTES SUR LES NIVEAUX DE CLASSE
-- ==============================================

-- Créer un enum pour les niveaux de classe validés
CREATE TYPE class_level_enum AS ENUM (
    'Petite Section',
    'Moyenne Section',
    'Grande Section',
    'CP',
    'CE1',
    'CE2',
    'CM1',
    'CM2',
    '6ème',
    '5ème',
    '4ème',
    '3ème',
    'Seconde',
    'Première',
    'Terminale'
);

-- Ajouter contrainte sur la colonne level
ALTER TABLE classes ADD CONSTRAINT check_valid_level
CHECK (level IS NULL OR level::text = ANY(ARRAY[
    'Petite Section'::text,
    'Moyenne Section'::text,
    'Grande Section'::text,
    'CP'::text,
    'CE1'::text,
    'CE2'::text,
    'CM1'::text,
    'CM2'::text,
    '6ème'::text,
    '5ème'::text,
    '4ème'::text,
    '3ème'::text,
    'Seconde'::text,
    'Première'::text,
    'Terminale'::text
]));

-- ==============================================
-- 3. SOFT DELETE IMPLEMENTATION
-- ==============================================

-- Ajouter colonne deleted_at pour soft delete sur students
ALTER TABLE students ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Ajouter colonne deleted_at pour soft delete sur classes
ALTER TABLE classes ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Ajouter colonne deleted_at pour soft delete sur evaluations
ALTER TABLE evaluations ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Créer des index pour optimiser les requêtes avec soft delete
CREATE INDEX idx_students_deleted_at ON students(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_classes_deleted_at ON classes(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_evaluations_deleted_at ON evaluations(deleted_at) WHERE deleted_at IS NULL;

-- ==============================================
-- 4. VUES POUR MASQUER LES ÉLÉMENTS SUPPRIMÉS
-- ==============================================

-- Vue pour les étudiants actifs (non supprimés)
CREATE OR REPLACE VIEW active_students AS
SELECT * FROM students WHERE deleted_at IS NULL;

-- Vue pour les classes actives (non supprimées)
CREATE OR REPLACE VIEW active_classes AS
SELECT * FROM classes WHERE deleted_at IS NULL;

-- Vue pour les évaluations actives (non supprimées)
CREATE OR REPLACE VIEW active_evaluations AS
SELECT * FROM evaluations WHERE deleted_at IS NULL;

-- ==============================================
-- 5. FONCTIONS UTILITAIRES POUR SOFT DELETE
-- ==============================================

-- Fonction pour soft delete d'un étudiant
CREATE OR REPLACE FUNCTION soft_delete_student(student_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE students
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = student_uuid::text AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour soft delete d'une classe
CREATE OR REPLACE FUNCTION soft_delete_class(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE classes
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = class_uuid AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour soft delete d'une évaluation
CREATE OR REPLACE FUNCTION soft_delete_evaluation(evaluation_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE evaluations
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = evaluation_uuid AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour restaurer un étudiant
CREATE OR REPLACE FUNCTION restore_student(student_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE students
    SET deleted_at = NULL, updated_at = NOW()
    WHERE id = student_uuid::text AND deleted_at IS NOT NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour restaurer une classe
CREATE OR REPLACE FUNCTION restore_class(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE classes
    SET deleted_at = NULL, updated_at = NOW()
    WHERE id = class_uuid AND deleted_at IS NOT NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour restaurer une évaluation
CREATE OR REPLACE FUNCTION restore_evaluation(evaluation_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE evaluations
    SET deleted_at = NULL, updated_at = NOW()
    WHERE id = evaluation_uuid AND deleted_at IS NOT NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 6. MISE À JOUR DES POLITIQUES RLS
-- ==============================================

-- Mettre à jour les politiques RLS pour exclure les éléments supprimés
-- Note: Les politiques exactes dépendent de votre implémentation d'authentification

-- Exemple pour students (à adapter selon vos politiques existantes)
-- DROP POLICY IF EXISTS "Users can view their students" ON students;
-- CREATE POLICY "Users can view their active students" ON students
--     FOR SELECT USING (deleted_at IS NULL);

-- Exemple pour classes (à adapter selon vos politiques existantes)
-- DROP POLICY IF EXISTS "Users can view their classes" ON classes;
-- CREATE POLICY "Users can view their active classes" ON classes
--     FOR SELECT USING (deleted_at IS NULL);

-- Exemple pour evaluations (à adapter selon vos politiques existantes)
-- DROP POLICY IF EXISTS "Users can view their evaluations" ON evaluations;
-- CREATE POLICY "Users can view their active evaluations" ON evaluations
--     FOR SELECT USING (deleted_at IS NULL);

-- ==============================================
-- 7. COMMENTS POUR DOCUMENTATION
-- ==============================================

COMMENT ON COLUMN students.deleted_at IS 'Timestamp for soft delete. NULL means active, non-NULL means deleted';
COMMENT ON COLUMN classes.deleted_at IS 'Timestamp for soft delete. NULL means active, non-NULL means deleted';
COMMENT ON COLUMN evaluations.deleted_at IS 'Timestamp for soft delete. NULL means active, non-NULL means deleted';

COMMENT ON CONSTRAINT check_school_year_format ON classes IS 'Ensures school_year follows YYYY-YYYY format with consecutive years';
COMMENT ON CONSTRAINT check_valid_level ON classes IS 'Ensures level is one of the valid French education system levels';

COMMENT ON FUNCTION soft_delete_student(UUID) IS 'Soft delete a student by setting deleted_at timestamp';
COMMENT ON FUNCTION soft_delete_class(UUID) IS 'Soft delete a class by setting deleted_at timestamp';
COMMENT ON FUNCTION soft_delete_evaluation(UUID) IS 'Soft delete an evaluation by setting deleted_at timestamp';

COMMENT ON FUNCTION restore_student(UUID) IS 'Restore a soft-deleted student by clearing deleted_at';
COMMENT ON FUNCTION restore_class(UUID) IS 'Restore a soft-deleted class by clearing deleted_at';
COMMENT ON FUNCTION restore_evaluation(UUID) IS 'Restore a soft-deleted evaluation by clearing deleted_at';