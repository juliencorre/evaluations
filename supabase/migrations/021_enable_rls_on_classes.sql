-- Migration 021: Enable RLS on classes and user_classes tables
-- This ensures Row Level Security is actually enforced

-- Enable RLS on classes table
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_classes table
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled (for logging purposes)
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('classes', 'user_classes');

-- Add comment
COMMENT ON TABLE classes IS 'Classes table with RLS ENABLED - users can only see classes they are associated with via user_classes';
COMMENT ON TABLE user_classes IS 'User-class associations with RLS ENABLED - users can only see their own associations';
