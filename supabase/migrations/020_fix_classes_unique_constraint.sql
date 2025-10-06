-- Migration 020: Fix classes unique constraint
-- Description: Remove global name unique constraint and add composite constraint
--              to allow same class names across different school years

-- Drop the existing unique constraint on name
DROP INDEX IF EXISTS idx_classes_name_unique;

-- Create a composite unique constraint on (name, school_year)
-- This allows the same class name in different school years
CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_name_school_year_unique
ON classes(name, school_year);

-- Add comment for documentation
COMMENT ON INDEX idx_classes_name_school_year_unique IS
'Ensures unique class names within the same school year, but allows reuse across different years';
