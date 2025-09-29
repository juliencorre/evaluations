-- Add N/A support for all result types
-- This ensures that N/A values are not counted in calculations

-- First, let's check and update the structure of existing result types
-- We need to handle different config structures (old format vs new format)

-- Update existing A-E scale to have proper pivot values
UPDATE result_type_configs
SET config = '{
  "values": [
    {"value": "A", "label": "Très bonne maîtrise", "pivot_value": 10},
    {"value": "B", "label": "Maîtrise satisfaisante", "pivot_value": 7.5},
    {"value": "C", "label": "Maîtrise fragile", "pivot_value": 5},
    {"value": "D", "label": "Maîtrise insuffisante", "pivot_value": 2.5},
    {"value": "E", "label": "Maîtrise très insuffisante", "pivot_value": 0},
    {"value": "N/A", "label": "Non applicable", "pivot_value": null}
  ]
}'::jsonb
WHERE name = 'Échelle A-E' AND type = 'scale';

-- Update existing Oui/Non scale
UPDATE result_type_configs
SET config = '{
  "values": [
    {"value": "Oui", "label": "Acquis", "pivot_value": 10},
    {"value": "Non", "label": "Non acquis", "pivot_value": 0},
    {"value": "N/A", "label": "Non applicable", "pivot_value": null}
  ]
}'::jsonb
WHERE name = 'Oui/Non' AND type = 'boolean';

-- Update existing Acquis/En cours/Non acquis scale
UPDATE result_type_configs
SET config = '{
  "values": [
    {"value": "Acquis", "label": "Compétence acquise", "pivot_value": 10},
    {"value": "En cours", "label": "En cours d''acquisition", "pivot_value": 5},
    {"value": "Non acquis", "label": "Non acquis", "pivot_value": 0},
    {"value": "N/A", "label": "Non applicable", "pivot_value": null}
  ]
}'::jsonb
WHERE name = 'Acquis/En cours/Non acquis' AND type = 'custom';

-- For numeric types, we don't need to add N/A to values array
-- They will handle N/A differently (as NULL or empty value in evaluation_results)

-- Add comment to explain N/A handling
COMMENT ON TABLE result_type_configs IS
'Result type configurations. N/A values have null pivot_value and are excluded from calculations. Numeric types handle N/A as NULL in evaluation_results.';

-- Create a function to calculate averages excluding N/A values
CREATE OR REPLACE FUNCTION calculate_average_excluding_na(
  student_id UUID,
  evaluation_id UUID,
  competency_ids UUID[]
)
RETURNS NUMERIC AS $$
DECLARE
  total_score NUMERIC := 0;
  valid_count INTEGER := 0;
  rec RECORD;
  elem JSONB;
BEGIN
  FOR rec IN
    SELECT er.value, rt.config, rt.type
    FROM evaluation_results er
    JOIN specific_competencies sc ON er.specific_competency_id = sc.id
    JOIN result_type_configs rt ON sc.result_type_config_id = rt.id
    WHERE er.student_id = calculate_average_excluding_na.student_id
      AND er.evaluation_id = calculate_average_excluding_na.evaluation_id
      AND er.specific_competency_id = ANY(calculate_average_excluding_na.competency_ids)
      AND er.value IS NOT NULL
      AND er.value != 'N/A'
  LOOP
    -- Handle different config types
    IF rec.type IN ('scale', 'boolean', 'custom') THEN
      -- Extract pivot value from JSON config for scale/boolean/custom types
      FOR elem IN SELECT * FROM jsonb_array_elements(rec.config->'values')
      LOOP
        IF elem->>'value' = rec.value AND elem->'pivot_value' IS NOT NULL THEN
          total_score := total_score + (elem->>'pivot_value')::NUMERIC;
          valid_count := valid_count + 1;
          EXIT; -- Found the matching value, exit inner loop
        END IF;
      END LOOP;
    ELSIF rec.type = 'numeric' THEN
      -- For numeric types, use the value directly if it's a valid number
      IF rec.value ~ '^\d+(\.\d+)?$' THEN
        -- Assuming numeric types use a 0-10 scale or similar
        -- This would need adjustment based on actual numeric type config
        total_score := total_score + rec.value::NUMERIC;
        valid_count := valid_count + 1;
      END IF;
    END IF;
  END LOOP;

  IF valid_count > 0 THEN
    RETURN ROUND(total_score / valid_count, 2);
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_average_excluding_na IS
'Calculate average score for given competencies, excluding N/A values from calculation. Handles both scale/boolean/custom types with pivot values and numeric types.';