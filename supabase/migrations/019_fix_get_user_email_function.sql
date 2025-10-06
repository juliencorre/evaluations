-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_email(UUID);

-- Recreate the function with proper security and permissions
CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TABLE (
  email TEXT,
  raw_user_meta_data JSONB
)
SECURITY DEFINER
SET search_path = auth, public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow authenticated users to call this function
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    au.email::TEXT,
    au.raw_user_meta_data
  FROM auth.users au
  WHERE au.id = user_uuid;
END;
$$;

-- Grant execution permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION get_user_email(UUID) IS 'Securely retrieves email and metadata for a user from auth.users table';
