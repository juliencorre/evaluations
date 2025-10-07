-- Migration 032: Fix column ambiguity in get_class_members function
-- Error: column reference "class_id" is ambiguous

DROP FUNCTION IF EXISTS get_class_members(uuid);

CREATE OR REPLACE FUNCTION get_class_members(p_class_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  class_id uuid,
  role character varying,
  created_at timestamp with time zone,
  user_email character varying,
  user_full_name character varying
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is a member of this class
  -- Fix: Use uc.class_id to avoid ambiguity
  IF NOT EXISTS (
    SELECT 1 FROM user_classes uc
    WHERE uc.class_id = p_class_id
    AND uc.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this class';
  END IF;

  -- Return all members of the class
  RETURN QUERY
  SELECT
    uc.id,
    uc.user_id,
    uc.class_id,
    uc.role,
    uc.created_at,
    COALESCE(au.email, 'unknown')::character varying as user_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Unknown User')::character varying as user_full_name
  FROM user_classes uc
  LEFT JOIN auth.users au ON au.id = uc.user_id
  WHERE uc.class_id = p_class_id
  ORDER BY uc.role, uc.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION get_class_members(uuid) TO authenticated;

COMMENT ON FUNCTION get_class_members(uuid) IS
  'Returns all members of a class if the current user is a member of that class. Fixed column ambiguity.';

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed get_class_members() function - column ambiguity and type mismatch resolved';
END $$;
