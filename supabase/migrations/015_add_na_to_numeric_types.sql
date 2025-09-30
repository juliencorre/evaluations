-- Add N/A value to all numeric result types that don't have it
UPDATE result_type_configs
SET config = jsonb_set(
  config,
  '{values}',
  config->'values' || '[{"label": "N/A - Non évalué", "value": "N/A", "pivot_value": null, "isFixed": true}]'::jsonb
)
WHERE type = 'numeric'
  AND config ? 'values'
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(config->'values') AS value
    WHERE value->>'value' = 'N/A'
  );

-- Update comment to reflect that all types must have N/A
COMMENT ON TABLE result_type_configs IS 'Stores result type configurations. All types (scale, boolean, custom, numeric) must include N/A value with null pivot_value for non-evaluated items.';