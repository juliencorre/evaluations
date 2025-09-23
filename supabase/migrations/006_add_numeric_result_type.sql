-- Add numeric value to result_type enum
ALTER TYPE result_type ADD VALUE IF NOT EXISTS 'numeric' AFTER 'boolean';