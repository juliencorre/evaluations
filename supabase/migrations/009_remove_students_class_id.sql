-- Migration 009: Remove students.class_id column
-- Created: 2025-01-XX
-- Description: Remove the direct class_id reference from students table after migration to student_classes

-- =====================================================
-- ÉTAPE 1 : VÉRIFICATION DE LA MIGRATION
-- =====================================================

-- Vérifier que toutes les données ont bien été migrées vers student_classes
DO $$
DECLARE
    unmigrated_count INTEGER;
BEGIN
    -- Compter les étudiants qui ont un class_id mais pas d'entrée dans student_classes
    SELECT COUNT(*) INTO unmigrated_count
    FROM students s
    WHERE s.class_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM student_classes sc
        WHERE sc.student_id = s.id
        AND sc.class_id = s.class_id
        AND sc.status = 'active'
    );

    -- Si des données ne sont pas migrées, lever une erreur
    IF unmigrated_count > 0 THEN
        RAISE EXCEPTION 'Migration incomplète : % étudiants ont un class_id mais pas d''entrée dans student_classes', unmigrated_count;
    END IF;

    RAISE NOTICE 'Vérification OK : Toutes les données ont été migrées vers student_classes';
END $$;

-- =====================================================
-- ÉTAPE 2 : SUPPRESSION DE LA CONTRAINTE DE CLÉ ÉTRANGÈRE
-- =====================================================

-- Supprimer la contrainte de clé étrangère students.class_id -> classes.id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints
               WHERE constraint_name = 'students_class_id_fkey'
               AND table_name = 'students') THEN

        ALTER TABLE students DROP CONSTRAINT students_class_id_fkey;
        RAISE NOTICE 'Contrainte de clé étrangère students_class_id_fkey supprimée';
    END IF;
END $$;

-- =====================================================
-- ÉTAPE 3 : SUPPRESSION DE L'INDEX
-- =====================================================

-- Supprimer l'index sur students.class_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes
               WHERE indexname = 'idx_students_class_id'
               AND tablename = 'students') THEN

        DROP INDEX idx_students_class_id;
        RAISE NOTICE 'Index idx_students_class_id supprimé';
    END IF;
END $$;

-- =====================================================
-- ÉTAPE 4 : SUPPRESSION DE LA COLONNE CLASS_ID
-- =====================================================

-- Supprimer la colonne class_id de la table students
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'students' AND column_name = 'class_id') THEN

        ALTER TABLE students DROP COLUMN class_id;
        RAISE NOTICE 'Colonne class_id supprimée de la table students';
    ELSE
        RAISE NOTICE 'Colonne class_id déjà supprimée de la table students';
    END IF;
END $$;

-- =====================================================
-- ÉTAPE 5 : MISE À JOUR DES COMMENTAIRES
-- =====================================================

-- Mettre à jour les commentaires de la table students
COMMENT ON TABLE students IS 'Informations des étudiants. Les relations avec les classes sont gérées via la table student_classes';

-- =====================================================
-- ÉTAPE 6 : CRÉATION D'UNE VUE DE COMPATIBILITÉ (OPTIONNEL)
-- =====================================================

-- Créer une vue pour maintenir la compatibilité avec l'ancien code
-- qui pourrait encore chercher students.class_id
CREATE OR REPLACE VIEW students_with_current_class AS
SELECT
    s.*,
    sc.class_id,
    c.name as class_name,
    c.level as class_level,
    c.subject as class_subject,
    sc.status as enrollment_status,
    sc.enrolled_at
FROM students s
LEFT JOIN student_classes sc ON s.id = sc.student_id
LEFT JOIN classes c ON sc.class_id = c.id
LEFT JOIN school_years sy ON sc.school_year_id = sy.id
WHERE sy.is_current = TRUE AND sc.status = 'active';

COMMENT ON VIEW students_with_current_class IS 'Vue de compatibilité pour l''ancien code utilisant students.class_id. Affiche les étudiants avec leur classe actuelle.';

-- =====================================================
-- ÉTAPE 7 : VALIDATION FINALE
-- =====================================================

-- Vérification finale que la migration s'est bien passée
DO $$
DECLARE
    students_count INTEGER;
    active_enrollments_count INTEGER;
BEGIN
    -- Compter le nombre total d'étudiants
    SELECT COUNT(*) INTO students_count FROM students;

    -- Compter le nombre d'inscriptions actives pour l'année courante
    SELECT COUNT(*) INTO active_enrollments_count
    FROM student_classes sc
    JOIN school_years sy ON sc.school_year_id = sy.id
    WHERE sy.is_current = TRUE AND sc.status = 'active';

    RAISE NOTICE 'Migration terminée avec succès :';
    RAISE NOTICE '- % étudiants dans la base', students_count;
    RAISE NOTICE '- % inscriptions actives pour l''année courante', active_enrollments_count;
    RAISE NOTICE '- Colonne students.class_id supprimée';
    RAISE NOTICE '- Vue students_with_current_class créée pour la compatibilité';
END $$;