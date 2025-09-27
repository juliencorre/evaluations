-- Migration 007: Add classes system
-- Created: 2024-01-XX
-- Description: Add classes table, user_classes association, and update students/evaluations

-- 1. Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL,
  description text,
  school_year character varying NOT NULL DEFAULT '2024-2025',
  level character varying, -- ex: "6ème", "5ème", "CM2", etc.
  subject character varying, -- ex: "Mathématiques", "Français", etc.
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create user_classes association table (many-to-many)
CREATE TABLE IF NOT EXISTS user_classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- Will reference auth.users.id when authentication is implemented
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  role character varying DEFAULT 'teacher' CHECK (role IN ('teacher', 'assistant', 'admin')),
  created_at timestamptz DEFAULT now(),

  -- Constraint: one role per user per class
  UNIQUE(user_id, class_id)
);

-- 3. Add class_id to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES classes(id) ON DELETE SET NULL;

-- 4. Handle existing evaluations with invalid class_id values
-- First, create a default class for existing evaluations
INSERT INTO classes (id, name, description, school_year, level, subject)
VALUES (
  gen_random_uuid(),
  'Classe par défaut',
  'Classe créée automatiquement pour les évaluations existantes',
  '2024-2025',
  NULL,
  NULL
) ON CONFLICT DO NOTHING;

-- Get the ID of the default class
DO $$
DECLARE
    default_class_uuid uuid;
BEGIN
    -- Get the default class ID
    SELECT id INTO default_class_uuid
    FROM classes
    WHERE name = 'Classe par défaut'
    LIMIT 1;

    -- If no default class exists, create one
    IF default_class_uuid IS NULL THEN
        INSERT INTO classes (name, description, school_year)
        VALUES ('Classe par défaut', 'Classe créée automatiquement pour les évaluations existantes', '2024-2025')
        RETURNING id INTO default_class_uuid;
    END IF;

    -- Update all evaluations that have invalid class_id values
    -- Handle both text and uuid types safely
    BEGIN
        -- First, try to update NULL values
        UPDATE evaluations
        SET class_id = default_class_uuid
        WHERE class_id IS NULL;

        -- Then try to handle invalid text values (if class_id is still text type)
        -- This will only work if class_id is text, otherwise it will be caught in exception
        UPDATE evaluations
        SET class_id = default_class_uuid
        WHERE class_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

    EXCEPTION WHEN OTHERS THEN
        -- If the above fails (e.g., class_id is already UUID), just ensure NULL values are handled
        UPDATE evaluations
        SET class_id = default_class_uuid
        WHERE class_id IS NULL;
    END;

END $$;

-- Now safely convert class_id to uuid type (if not already)
DO $$
BEGIN
    -- Check if class_id is already uuid type
    IF (SELECT data_type FROM information_schema.columns
        WHERE table_name = 'evaluations' AND column_name = 'class_id') != 'uuid' THEN

        -- Convert to uuid if it's not already
        ALTER TABLE evaluations
        ALTER COLUMN class_id TYPE uuid USING class_id::uuid;
    END IF;
END $$;

-- Make class_id required (if not already)
DO $$
BEGIN
    IF (SELECT is_nullable FROM information_schema.columns
        WHERE table_name = 'evaluations' AND column_name = 'class_id') = 'YES' THEN

        ALTER TABLE evaluations
        ALTER COLUMN class_id SET NOT NULL;
    END IF;
END $$;

-- Add foreign key constraint for evaluations.class_id (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_evaluations_class_id'
                   AND table_name = 'evaluations') THEN

        ALTER TABLE evaluations
        ADD CONSTRAINT fk_evaluations_class_id
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_classes_school_year ON classes(school_year);
CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(level);
CREATE INDEX IF NOT EXISTS idx_classes_subject ON classes(subject);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_name_unique ON classes(name);

CREATE INDEX IF NOT EXISTS idx_user_classes_user_id ON user_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_classes_class_id ON user_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_user_classes_role ON user_classes(role);

CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);

-- 6. Create triggers for automatic updated_at management (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers
                   WHERE trigger_name = 'update_classes_updated_at'
                   AND event_object_table = 'classes') THEN

        CREATE TRIGGER update_classes_updated_at
          BEFORE UPDATE ON classes
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 7. Enable Row Level Security (RLS)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies (permissive for now, will be refined with authentication)
DO $$
BEGIN
    -- Create policy for classes if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies
                   WHERE policyname = 'Enable all operations for classes'
                   AND tablename = 'classes') THEN

        CREATE POLICY "Enable all operations for classes" ON classes
          FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Create policy for user_classes if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies
                   WHERE policyname = 'Enable all operations for user_classes'
                   AND tablename = 'user_classes') THEN

        CREATE POLICY "Enable all operations for user_classes" ON user_classes
          FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 9. Update existing RLS policies for students to consider class access
-- (Will be refined when authentication is implemented)

-- 10. Add comments for documentation
COMMENT ON TABLE classes IS 'Stores class/group information for organizing students and evaluations';
COMMENT ON TABLE user_classes IS 'Associates users with classes they can access (many-to-many relationship)';

COMMENT ON COLUMN classes.school_year IS 'Academic year (e.g., "2024-2025")';
COMMENT ON COLUMN classes.level IS 'Class level (e.g., "6ème", "CM2")';
COMMENT ON COLUMN classes.subject IS 'Main subject taught in this class';
COMMENT ON COLUMN classes.active IS 'Whether the class is currently active';

COMMENT ON COLUMN user_classes.user_id IS 'Reference to auth.users.id (will be implemented with authentication)';
COMMENT ON COLUMN user_classes.role IS 'User role in this class: teacher, assistant, or admin';

COMMENT ON COLUMN students.class_id IS 'Reference to the class this student belongs to';

-- Note: Sample classes removed to avoid cluttering new installations
-- Users should create their own classes through the application interface