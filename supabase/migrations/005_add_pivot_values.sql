-- Add pivot_value field to result_type_configs config JSONB
-- This allows each result type to define its values on a 0-10 scale for analysis

-- Update existing configs to include pivot_value
UPDATE result_type_configs
SET config = jsonb_set(
  config,
  '{values}',
  CASE
    WHEN type = 'boolean' THEN
      jsonb_build_array(
        jsonb_build_object('label', 'Non', 'value', 'non', 'pivot_value', 0),
        jsonb_build_object('label', 'Oui', 'value', 'oui', 'pivot_value', 10)
      )
    WHEN type = 'scale' THEN
      jsonb_build_array(
        jsonb_build_object('label', 'A', 'value', 'A', 'pivot_value', 10),
        jsonb_build_object('label', 'B', 'value', 'B', 'pivot_value', 7.5),
        jsonb_build_object('label', 'C', 'value', 'C', 'pivot_value', 5),
        jsonb_build_object('label', 'D', 'value', 'D', 'pivot_value', 2.5),
        jsonb_build_object('label', 'E', 'value', 'E', 'pivot_value', 0)
      )
    WHEN type = 'custom' AND name = 'Acquis' THEN
      jsonb_build_array(
        jsonb_build_object('label', 'Non acquis', 'value', 'non_acquis', 'pivot_value', 0),
        jsonb_build_object('label', 'En cours', 'value', 'en_cours', 'pivot_value', 5),
        jsonb_build_object('label', 'Acquis', 'value', 'acquis', 'pivot_value', 10)
      )
    ELSE config->'values'
  END
)
WHERE config->'values' IS NOT NULL;

-- Note: PostgreSQL doesn't allow subqueries in check constraints
-- The pivot value validation will be handled at the application level