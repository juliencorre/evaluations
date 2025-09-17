-- Create enum for result types
CREATE TYPE result_type AS ENUM ('scale', 'boolean', 'custom');

-- Create table for result type configurations
CREATE TABLE result_type_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type result_type NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add some default result type configurations
INSERT INTO result_type_configs (name, type, config) VALUES
('Échelle A-E', 'scale', '{"values": ["A", "B", "C", "D", "E", "N/A"], "labels": {"A": "Très bonne maîtrise", "B": "Maîtrise satisfaisante", "C": "Maîtrise fragile", "D": "Maîtrise insuffisante", "E": "Maîtrise très insuffisante", "N/A": "Non évalué"}}'),
('Oui/Non', 'boolean', '{"values": ["Oui", "Non", "N/A"], "labels": {"Oui": "Acquis", "Non": "Non acquis", "N/A": "Non évalué"}}'),
('Acquis/En cours/Non acquis', 'custom', '{"values": ["Acquis", "En cours", "Non acquis", "N/A"], "labels": {"Acquis": "Compétence acquise", "En cours": "En cours d''acquisition", "Non acquis": "Non acquis", "N/A": "Non évalué"}}');

-- Add result_type_config_id to specific_competencies table
ALTER TABLE specific_competencies
ADD COLUMN result_type_config_id UUID REFERENCES result_type_configs(id);

-- Set default result type for existing specific competencies (échelle A-E)
UPDATE specific_competencies
SET result_type_config_id = (SELECT id FROM result_type_configs WHERE name = 'Échelle A-E');

-- Make the column NOT NULL after setting defaults
ALTER TABLE specific_competencies
ALTER COLUMN result_type_config_id SET NOT NULL;

-- Update evaluation_results to store value as TEXT instead of enum
ALTER TABLE evaluation_results DROP CONSTRAINT evaluation_results_level_check;

-- Rename column level to value for clarity
ALTER TABLE evaluation_results RENAME COLUMN level TO value;

-- Add index for performance
CREATE INDEX idx_specific_competencies_result_type ON specific_competencies(result_type_config_id);

-- Enable RLS on new table
ALTER TABLE result_type_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for result_type_configs
CREATE POLICY "Enable read access for all users" ON result_type_configs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON result_type_configs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON result_type_configs
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON result_type_configs
  FOR DELETE USING (true);