-- Migration 022: Add public classes search functionality
-- Allows users to search and discover classes they can join

-- 1. Create a function to get all searchable classes (bypasses RLS)
-- This function runs with SECURITY DEFINER to bypass RLS for search purposes
CREATE OR REPLACE FUNCTION get_searchable_classes()
RETURNS TABLE (
  id uuid,
  name character varying,
  description text,
  school_year character varying,
  level character varying,
  subject character varying,
  active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return all active classes for search
  -- This allows users to discover classes they can join
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.description,
    c.school_year,
    c.level,
    c.subject,
    c.active,
    c.created_at,
    c.updated_at
  FROM classes c
  WHERE c.active = true
  ORDER BY c.school_year DESC, c.level, c.name;
END;
$$;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_searchable_classes() TO authenticated;

-- 3. Create a policy to allow users to add themselves to any class via user_classes
-- This allows the "join class" functionality to work
CREATE POLICY "Users can join any class" ON user_classes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND class_id IN (SELECT id FROM classes WHERE active = true)
  );

-- Drop the old restrictive policy if it conflicts
DROP POLICY IF EXISTS "Users can create class associations" ON user_classes;

-- 4. Add comment
COMMENT ON FUNCTION get_searchable_classes() IS 'Returns all active classes for search and discovery, bypassing RLS to allow users to find classes they can join';
