-- Migration 008: Basic school years system (Step 1)
-- This is a minimal version to avoid any conflicts

-- Step 1: Create school_years table
CREATE TABLE IF NOT EXISTS school_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_school_year_format
        CHECK (name ~ '^[0-9]{4}-[0-9]{4}$'),
    CONSTRAINT check_school_year_dates
        CHECK (end_date > start_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_school_years_current ON school_years(is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_school_years_name ON school_years(name);

-- Ensure only one current year
CREATE UNIQUE INDEX IF NOT EXISTS idx_school_years_only_one_current
ON school_years(is_current) WHERE is_current = TRUE;

-- Insert default data
INSERT INTO school_years (name, start_date, end_date, is_current) VALUES
('2023-2024', '2023-09-01', '2024-08-31', FALSE),
('2024-2025', '2024-09-01', '2025-08-31', TRUE),
('2025-2026', '2025-09-01', '2026-08-31', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create student_classes table
CREATE TABLE IF NOT EXISTS student_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    class_id UUID NOT NULL,
    school_year_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_status
        CHECK (status IN ('active', 'transferred', 'graduated', 'dropped')),
    CONSTRAINT unique_student_class_year
        UNIQUE(student_id, class_id, school_year_id)
);

-- Add foreign keys
ALTER TABLE student_classes
ADD CONSTRAINT fk_student_classes_student_id
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

ALTER TABLE student_classes
ADD CONSTRAINT fk_student_classes_class_id
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

ALTER TABLE student_classes
ADD CONSTRAINT fk_student_classes_school_year_id
FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE RESTRICT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_classes_student ON student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_class ON student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_school_year ON student_classes(school_year_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_status ON student_classes(status);

-- Enable RLS
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;

-- Basic policies (permissive for now)
CREATE POLICY "Allow all access to school_years" ON school_years FOR ALL USING (true);
CREATE POLICY "Allow all access to student_classes" ON student_classes FOR ALL USING (true);

-- Add comments
COMMENT ON TABLE school_years IS 'School years management with format and logic constraints';
COMMENT ON TABLE student_classes IS 'Many-to-many relationship between students and classes with temporal management';