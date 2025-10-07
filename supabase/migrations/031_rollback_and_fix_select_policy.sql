-- Migration 031: Rollback and fix SELECT policy properly
-- The previous policy broke class loading - we need a different approach

-- Drop the broken policy
DROP POLICY IF EXISTS "users_can_view_class_members" ON user_classes;

-- Restore the simple policy that works for loading user's classes
CREATE POLICY "users_view_own_associations" ON user_classes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- For viewing other class members, we'll use a dedicated RPC function instead
-- This is safer and more performant

CREATE OR REPLACE FUNCTION get_class_members(p_class_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  class_id uuid,
  role character varying,
  created_at timestamp with time zone,
  user_email text,
  user_full_name text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is a member of this class
  IF NOT EXISTS (
    SELECT 1 FROM user_classes
    WHERE class_id = p_class_id
    AND user_id = auth.uid()
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
    COALESCE(au.email, 'unknown') as user_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Unknown User') as user_full_name
  FROM user_classes uc
  LEFT JOIN auth.users au ON au.id = uc.user_id
  WHERE uc.class_id = p_class_id
  ORDER BY uc.role, uc.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION get_class_members(uuid) TO authenticated;

COMMENT ON FUNCTION get_class_members(uuid) IS
  'Returns all members of a class if the current user is a member of that class';

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Policies restored and get_class_members() function created';
END $$;
