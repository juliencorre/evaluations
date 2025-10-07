-- Migration 029: Add active class check to user_classes INSERT policy
-- Now that the basic policy works, add the class active validation

-- Drop the simple policy
DROP POLICY IF EXISTS "allow_insert_own_user" ON user_classes;

-- Create the complete policy with active class check
CREATE POLICY "users_can_join_active_classes" ON user_classes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND class_id IN (SELECT id FROM classes WHERE active = true)
  );

COMMENT ON POLICY "users_can_join_active_classes" ON user_classes IS
  'Users can add themselves to any active class. Validates both user identity and class status.';

-- Verify the policy was created
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_classes'
    AND policyname = 'users_can_join_active_classes'
  ) INTO policy_exists;

  IF policy_exists THEN
    RAISE NOTICE '✅ Policy "users_can_join_active_classes" created successfully';
  ELSE
    RAISE EXCEPTION '❌ Policy was not created!';
  END IF;
END $$;
