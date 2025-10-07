-- Migration 023: Fix type mismatch in get_searchable_classes function
-- PostgreSQL distinguishes between 'text' and 'character varying' types

-- Drop the old function
DROP FUNCTION IF EXISTS get_searchable_classes();

-- Recreate with correct types matching the actual table schema
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_searchable_classes() TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_searchable_classes() IS 'Returns all active classes for search and discovery, bypassing RLS to allow users to find classes they can join';

-- Note: The user_classes INSERT policy is configured in migration 024
-- to properly allow users to join classes they discover through this function
