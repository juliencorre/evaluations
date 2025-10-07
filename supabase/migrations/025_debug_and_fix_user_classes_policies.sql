-- Migration 025: Debug and fix user_classes policies
-- Force recreation of policies even if they exist

-- 1. FORCE DROP all policies (ignore errors if they don't exist)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their class associations" ON user_classes;
    DROP POLICY IF EXISTS "Users can create class associations" ON user_classes;
    DROP POLICY IF EXISTS "Users can update their class associations" ON user_classes;
    DROP POLICY IF EXISTS "Users can delete their class associations" ON user_classes;
    DROP POLICY IF EXISTS "Users can join any class" ON user_classes;
    DROP POLICY IF EXISTS "Users can join any active class" ON user_classes;
    DROP POLICY IF EXISTS "Users can leave classes" ON user_classes;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some policies did not exist, continuing...';
END $$;

-- 2. Ensure RLS is enabled
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;

-- 3. Create fresh policies with correct permissions

-- Policy 1: Users can view their own class associations
CREATE POLICY "Users can view their class associations" ON user_classes
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Users can add themselves to any active class
-- IMPORTANT: This is the key policy that allows joining classes
CREATE POLICY "Users can join any active class" ON user_classes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND class_id IN (SELECT id FROM classes WHERE active = true)
  );

-- Policy 3: Users can update their own class associations
CREATE POLICY "Users can update their class associations" ON user_classes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can remove themselves from classes
CREATE POLICY "Users can leave classes" ON user_classes
  FOR DELETE
  USING (user_id = auth.uid());

-- 4. Verify the setup
DO $$
DECLARE
    rls_enabled boolean;
    policy_count integer;
BEGIN
    -- Check if RLS is enabled
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE tablename = 'user_classes';

    IF NOT rls_enabled THEN
        RAISE EXCEPTION 'RLS is not enabled on user_classes table!';
    END IF;

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'user_classes';

    IF policy_count < 4 THEN
        RAISE EXCEPTION 'Not enough policies created. Expected 4, got %', policy_count;
    END IF;

    RAISE NOTICE '✅ RLS is enabled and % policies are active', policy_count;
END $$;

-- 5. Add helpful comments
COMMENT ON POLICY "Users can view their class associations" ON user_classes IS
  'Users can only see their own class memberships';

COMMENT ON POLICY "Users can join any active class" ON user_classes IS
  'Users can add themselves to any active class through the search/join feature';

COMMENT ON POLICY "Users can update their class associations" ON user_classes IS
  'Users can modify their own class memberships (e.g., change role)';

COMMENT ON POLICY "Users can leave classes" ON user_classes IS
  'Users can remove themselves from classes they have joined';
