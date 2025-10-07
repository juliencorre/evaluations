-- Migration 026: Test and debug auth.uid() in RLS context
-- This helps identify if the authentication token is properly passed to RLS policies

-- 1. Create a debug function to test auth context
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS TABLE (
  current_user_id uuid,
  current_role text,
  jwt_claims jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    auth.uid() as current_user_id,
    auth.role() as current_role,
    auth.jwt() as jwt_claims;
END;
$$;

GRANT EXECUTE ON FUNCTION debug_auth_context() TO authenticated;

-- 2. Create a test function that simulates the INSERT
CREATE OR REPLACE FUNCTION test_user_class_insert(
  p_user_id uuid,
  p_class_id uuid,
  p_role text DEFAULT 'teacher'
)
RETURNS jsonb
SECURITY INVOKER  -- Important: runs with caller's permissions
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  auth_user_id uuid;
  class_is_active boolean;
BEGIN
  -- Get the authenticated user ID
  auth_user_id := auth.uid();

  -- Check if the class is active
  SELECT active INTO class_is_active
  FROM classes
  WHERE id = p_class_id;

  -- Return debug information
  result := jsonb_build_object(
    'auth_uid', auth_user_id,
    'passed_user_id', p_user_id,
    'user_ids_match', (auth_user_id = p_user_id),
    'class_id', p_class_id,
    'class_is_active', class_is_active,
    'with_check_passes', (
      auth_user_id = p_user_id
      AND p_class_id IN (SELECT id FROM classes WHERE active = true)
    )
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION test_user_class_insert(uuid, uuid, text) TO authenticated;

-- 3. Add comments
COMMENT ON FUNCTION debug_auth_context() IS
  'Debug function to check what auth.uid() returns in the current context';

COMMENT ON FUNCTION test_user_class_insert(uuid, uuid, text) IS
  'Test function to debug why INSERT into user_classes fails RLS policy';

-- 4. Instructions for testing
/*
TESTING INSTRUCTIONS:

1. Call this function from your application or Supabase SQL Editor while authenticated:
   SELECT * FROM debug_auth_context();

   Expected result should show:
   - current_user_id: your UUID (e.g., 5a53caa6-4555-4aff-907f-7ab88ccd3272)
   - current_role: 'authenticated'
   - jwt_claims: JSON with user info

2. Test the INSERT logic:
   SELECT * FROM test_user_class_insert(
     '5a53caa6-4555-4aff-907f-7ab88ccd3272'::uuid,  -- Replace with your user ID
     'YOUR-CLASS-ID'::uuid,                          -- Replace with class ID
     'teacher'
   );

   This will return:
   - auth_uid: What auth.uid() returns
   - passed_user_id: What you're trying to insert
   - user_ids_match: true/false (MUST be true)
   - class_is_active: true/false (MUST be true)
   - with_check_passes: true/false (MUST be true for INSERT to work)

3. If user_ids_match is false:
   → The problem is that the client is passing a different user ID than the authenticated user
   → FIX: Make sure the client uses the authenticated user's ID

4. If class_is_active is false:
   → The class is not active in the database
   → FIX: Update the class to be active

5. If auth_uid is null:
   → Authentication token is not being passed correctly
   → FIX: Check Supabase client initialization and auth headers
*/
