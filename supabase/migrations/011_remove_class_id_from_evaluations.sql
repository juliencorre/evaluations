-- Migration 011: Remove class_id column from evaluations table
-- Created: 2025-09-27
-- Description: Remove the deprecated class_id column from evaluations table since we now use evaluation_classes for many-to-many relationships

-- =====================================================
-- ÉTAPE 1 : SUPPRIMER LA CONTRAINTE DE CLÉ ÉTRANGÈRE
-- =====================================================

-- Supprimer la contrainte de clé étrangère d'abord
ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS fk_evaluations_class_id;

-- =====================================================
-- ÉTAPE 2 : SUPPRIMER LA COLONNE CLASS_ID
-- =====================================================

-- Supprimer la colonne class_id qui n'est plus nécessaire
ALTER TABLE evaluations DROP COLUMN IF EXISTS class_id;

-- =====================================================
-- ÉTAPE 3 : COMMENTAIRES ET DOCUMENTATION
-- =====================================================

-- Mettre à jour le commentaire de la table pour refléter les changements
COMMENT ON TABLE evaluations IS 'Stores evaluation sessions with metadata. Classes are now associated via evaluation_classes table for many-to-many relationships.';