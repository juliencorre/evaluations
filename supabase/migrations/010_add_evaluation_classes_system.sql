-- Migration 010: Add evaluation_classes many-to-many system
-- Created: 2025-01-XX
-- Description: Add evaluation_classes table for many-to-many relationships between evaluations, classes, and school years

-- =====================================================
-- ÉTAPE 1 : CRÉATION DE LA TABLE EVALUATION_CLASSES
-- =====================================================

CREATE TABLE IF NOT EXISTS evaluation_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL,
    class_id UUID NOT NULL,
    school_year_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Contraintes de clés étrangères
    CONSTRAINT fk_evaluation_classes_evaluation
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_classes_class
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_classes_school_year
        FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE CASCADE,

    -- Contrainte d'unicité pour éviter les doublons
    CONSTRAINT unique_evaluation_class_school_year
        UNIQUE(evaluation_id, class_id, school_year_id)
);

-- Index pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_evaluation_classes_evaluation_id ON evaluation_classes(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_classes_class_id ON evaluation_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_classes_school_year_id ON evaluation_classes(school_year_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_classes_class_school_year ON evaluation_classes(class_id, school_year_id);

-- =====================================================
-- ÉTAPE 2 : MIGRATION DES DONNÉES EXISTANTES
-- =====================================================

-- Migrer les évaluations existantes qui ont un class_id vers la nouvelle table
DO $$
DECLARE
    current_school_year_id UUID;
    eval_record RECORD;
    migrated_count INTEGER := 0;
BEGIN
    -- Récupérer l'année scolaire courante
    SELECT id INTO current_school_year_id
    FROM school_years
    WHERE is_current = TRUE
    LIMIT 1;

    -- Si pas d'année courante, utiliser 2024-2025
    IF current_school_year_id IS NULL THEN
        SELECT id INTO current_school_year_id
        FROM school_years
        WHERE name = '2024-2025'
        LIMIT 1;
    END IF;

    -- Si toujours pas d'année, créer une année par défaut
    IF current_school_year_id IS NULL THEN
        INSERT INTO school_years (name, start_date, end_date, is_current)
        VALUES ('2024-2025', '2024-09-01', '2025-08-31', TRUE)
        RETURNING id INTO current_school_year_id;

        RAISE NOTICE 'Année scolaire par défaut créée : %', current_school_year_id;
    END IF;

    -- Migrer chaque évaluation qui a un class_id
    FOR eval_record IN
        SELECT id, class_id
        FROM evaluations
        WHERE class_id IS NOT NULL
    LOOP
        -- Vérifier que la classe existe encore
        IF EXISTS (SELECT 1 FROM classes WHERE id = eval_record.class_id) THEN
            -- Insérer dans evaluation_classes
            INSERT INTO evaluation_classes (evaluation_id, class_id, school_year_id)
            VALUES (eval_record.id, eval_record.class_id, current_school_year_id)
            ON CONFLICT (evaluation_id, class_id, school_year_id) DO NOTHING;

            migrated_count := migrated_count + 1;
        ELSE
            RAISE NOTICE 'Classe % introuvable pour l''évaluation %, migration ignorée', eval_record.class_id, eval_record.id;
        END IF;
    END LOOP;

    RAISE NOTICE 'Migration terminée : % évaluations migrées vers evaluation_classes', migrated_count;
END $$;

-- =====================================================
-- ÉTAPE 3 : VÉRIFICATION DE LA MIGRATION
-- =====================================================

-- Vérifier que toutes les évaluations avec class_id ont été migrées
DO $$
DECLARE
    unmigrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmigrated_count
    FROM evaluations e
    WHERE e.class_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM evaluation_classes ec
        WHERE ec.evaluation_id = e.id
        AND ec.class_id = e.class_id
    );

    IF unmigrated_count > 0 THEN
        RAISE WARNING 'Attention : % évaluations avec class_id n''ont pas été migrées', unmigrated_count;
    ELSE
        RAISE NOTICE 'Vérification OK : Toutes les évaluations ont été migrées vers evaluation_classes';
    END IF;
END $$;

-- =====================================================
-- ÉTAPE 4 : FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour obtenir les classes d'une évaluation
CREATE OR REPLACE FUNCTION get_evaluation_classes(eval_id UUID, school_year_id UUID DEFAULT NULL)
RETURNS TABLE (
    class_id UUID,
    class_name TEXT,
    class_level TEXT,
    class_subject TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.level,
        c.subject
    FROM evaluation_classes ec
    JOIN classes c ON ec.class_id = c.id
    WHERE ec.evaluation_id = eval_id
    AND (school_year_id IS NULL OR ec.school_year_id = school_year_id)
    AND c.active = TRUE
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour obtenir les évaluations d'une classe
CREATE OR REPLACE FUNCTION get_class_evaluations(class_id UUID, school_year_id UUID DEFAULT NULL)
RETURNS TABLE (
    evaluation_id UUID,
    evaluation_name TEXT,
    evaluation_description TEXT,
    framework_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.name,
        e.description,
        e.framework_id
    FROM evaluation_classes ec
    JOIN evaluations e ON ec.evaluation_id = e.id
    WHERE ec.class_id = class_id
    AND (school_year_id IS NULL OR ec.school_year_id = school_year_id)
    ORDER BY e.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- ÉTAPE 5 : TRIGGERS POUR MAINTENIR LA COHÉRENCE
-- =====================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_evaluation_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evaluation_classes_updated_at
    BEFORE UPDATE ON evaluation_classes
    FOR EACH ROW
    EXECUTE FUNCTION update_evaluation_classes_updated_at();

-- =====================================================
-- ÉTAPE 6 : COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE evaluation_classes IS 'Table de liaison many-to-many entre evaluations, classes et school_years';
COMMENT ON COLUMN evaluation_classes.evaluation_id IS 'Référence vers l''évaluation';
COMMENT ON COLUMN evaluation_classes.class_id IS 'Référence vers la classe';
COMMENT ON COLUMN evaluation_classes.school_year_id IS 'Référence vers l''année scolaire';

-- =====================================================
-- ÉTAPE 7 : POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur la table
ALTER TABLE evaluation_classes ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient seulement les évaluations de leurs classes
CREATE POLICY evaluation_classes_user_policy ON evaluation_classes
    FOR ALL
    USING (
        class_id IN (
            SELECT uc.class_id
            FROM user_classes uc
            WHERE uc.user_id = auth.uid()
        )
    );

-- =====================================================
-- RÉSUMÉ DE LA MIGRATION
-- =====================================================

-- Afficher un résumé
DO $$
DECLARE
    total_eval_classes INTEGER;
    total_evaluations INTEGER;
    total_classes INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_eval_classes FROM evaluation_classes;
    SELECT COUNT(*) INTO total_evaluations FROM evaluations;
    SELECT COUNT(*) INTO total_classes FROM classes WHERE active = TRUE;

    RAISE NOTICE '=== RÉSUMÉ DE LA MIGRATION 010 ===';
    RAISE NOTICE 'Table evaluation_classes créée avec % associations', total_eval_classes;
    RAISE NOTICE 'Total évaluations : %', total_evaluations;
    RAISE NOTICE 'Total classes actives : %', total_classes;
    RAISE NOTICE 'Fonctions utilitaires : get_evaluation_classes(), get_class_evaluations()';
    RAISE NOTICE 'RLS activé avec politique utilisateur';
    RAISE NOTICE '=====================================';
END $$;