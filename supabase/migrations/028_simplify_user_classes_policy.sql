-- Migration 028: Simplify user_classes INSERT policy
-- Use the most basic form possible to ensure it works

-- Drop all existing INSERT policies
DROP POLICY IF EXISTS "Users can join any class" ON user_classes;
DROP POLICY IF EXISTS "Users can join any active class" ON user_classes;
DROP POLICY IF EXISTS "Users can create class associations" ON user_classes;

-- Create the simplest possible INSERT policy first
-- This allows ANY authenticated user to insert with their own user_id
CREATE POLICY "allow_insert_own_user" ON user_classes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Test if this simple policy works
-- If it does, we can add the class active check later

COMMENT ON POLICY "allow_insert_own_user" ON user_classes IS
  'Simplified policy: users can only insert rows with their own user_id';

-- Verify the policy was created
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_classes'
    AND policyname = 'allow_insert_own_user'
  ) INTO policy_exists;

  IF policy_exists THEN
    RAISE NOTICE '✅ Policy "allow_insert_own_user" created successfully';
  ELSE
    RAISE EXCEPTION '❌ Policy "allow_insert_own_user" was not created!';
  END IF;
END $$;
