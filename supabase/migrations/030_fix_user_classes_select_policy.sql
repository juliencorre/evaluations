-- Migration 030: Fix SELECT policy on user_classes to see other class members
-- Users should be able to see ALL members of classes they belong to

-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their class associations" ON user_classes;

-- Create a new SELECT policy that allows viewing all members of classes the user belongs to
CREATE POLICY "users_can_view_class_members" ON user_classes
  FOR SELECT
  TO authenticated
  USING (
    -- Can see rows where:
    -- 1. It's their own association
    user_id = auth.uid()
    OR
    -- 2. It's another member of a class they belong to
    class_id IN (
      SELECT class_id
      FROM user_classes
      WHERE user_id = auth.uid()
    )
  );

COMMENT ON POLICY "users_can_view_class_members" ON user_classes IS
  'Users can see all members (teachers, assistants) of classes they belong to';

-- Verify the policy was created
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_classes'
    AND policyname = 'users_can_view_class_members'
  ) INTO policy_exists;

  IF policy_exists THEN
    RAISE NOTICE '✅ Policy "users_can_view_class_members" created successfully';
  ELSE
    RAISE EXCEPTION '❌ Policy was not created!';
  END IF;
END $$;
