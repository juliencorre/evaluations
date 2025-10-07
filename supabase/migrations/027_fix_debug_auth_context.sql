-- Migration 027: Fix debug function with proper column names
-- Avoid reserved keywords by using quoted identifiers

-- Drop the problematic function
DROP FUNCTION IF EXISTS debug_auth_context();

-- Recreate with quoted column names to avoid reserved word conflicts
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS TABLE (
  "current_user_id" uuid,
  "current_role" text,
  "jwt_claims" jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    auth.uid() as "current_user_id",
    auth.role() as "current_role",
    auth.jwt() as "jwt_claims";
END;
$$;

GRANT EXECUTE ON FUNCTION debug_auth_context() TO authenticated;

-- Also create a simpler version that just returns the user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;

-- Add comments
COMMENT ON FUNCTION debug_auth_context() IS
  'Debug function to check authentication context (user ID, role, JWT claims)';

COMMENT ON FUNCTION get_current_user_id() IS
  'Simple function to get the current authenticated user ID';
