-- Migration 003: Create evaluations and evaluation_results tables
-- Created: 2024-01-XX
-- Description: Add tables for storing evaluations and their results

-- 1. Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL,
  description text,
  framework_id uuid NOT NULL REFERENCES competency_frameworks(id) ON DELETE CASCADE,
  class_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create evaluation_results table
CREATE TABLE IF NOT EXISTS evaluation_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  student_id text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  specific_competency_id uuid NOT NULL REFERENCES specific_competencies(id) ON DELETE CASCADE,
  level text NOT NULL CHECK (level IN ('A', 'B', 'C', 'D', 'E', 'N/A')),
  comment text,
  evaluated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraint: one result per evaluation/student/competency combination
  UNIQUE(evaluation_id, student_id, specific_competency_id)
);

-- 3. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_evaluations_framework_id ON evaluations(framework_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_class_id ON evaluations(class_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at);

CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluation_id ON evaluation_results(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_student_id ON evaluation_results(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_specific_competency_id ON evaluation_results(specific_competency_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_level ON evaluation_results(level);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluated_at ON evaluation_results(evaluated_at);

-- 4. Create or update the trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create triggers for automatic updated_at management
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_results_updated_at
  BEFORE UPDATE ON evaluation_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies (permissive for now, should be customized based on requirements)
CREATE POLICY "Enable all operations for evaluations" ON evaluations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for evaluation_results" ON evaluation_results
  FOR ALL USING (true) WITH CHECK (true);

-- 8. Add comments for documentation
COMMENT ON TABLE evaluations IS 'Stores evaluation sessions with metadata';
COMMENT ON TABLE evaluation_results IS 'Stores individual student results for specific competencies within evaluations';

COMMENT ON COLUMN evaluations.framework_id IS 'Reference to the competency framework used for this evaluation';
COMMENT ON COLUMN evaluations.class_id IS 'Identifier for the class/group being evaluated';

COMMENT ON COLUMN evaluation_results.level IS 'Evaluation level: A (excellent), B (good), C (satisfactory), D (needs improvement), E (insufficient), N/A (not evaluated)';
COMMENT ON COLUMN evaluation_results.specific_competency_id IS 'Reference to the specific competency being evaluated';
COMMENT ON COLUMN evaluation_results.evaluated_at IS 'Timestamp when the evaluation was made by the teacher';