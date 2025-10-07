-- Migration 024: Fix user_classes policies to allow joining classes
-- This migration ensures users can join classes they discover via search

-- 1. Drop ALL existing policies on user_classes to start fresh
DROP POLICY IF EXISTS "Users can view their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can create class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can update their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can delete their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can join any class" ON user_classes;

-- 2. Create new policies that allow proper functionality

-- Policy 1: Users can view their own class associations
CREATE POLICY "Users can view their class associations" ON user_classes
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Users can add themselves to any active class (JOIN functionality)
CREATE POLICY "Users can join any active class" ON user_classes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND class_id IN (SELECT id FROM classes WHERE active = true)
  );

-- Policy 3: Users can update their own class associations (change role, etc.)
CREATE POLICY "Users can update their class associations" ON user_classes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can remove themselves from classes
CREATE POLICY "Users can leave classes" ON user_classes
  FOR DELETE
  USING (user_id = auth.uid());

-- 3. Verify RLS is enabled (should already be from migration 021)
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;

-- 4. Add helpful comments
COMMENT ON POLICY "Users can view their class associations" ON user_classes IS
  'Users can only see their own class memberships';

COMMENT ON POLICY "Users can join any active class" ON user_classes IS
  'Users can add themselves to any active class through the search/join feature';

COMMENT ON POLICY "Users can update their class associations" ON user_classes IS
  'Users can modify their own class memberships (e.g., change role)';

COMMENT ON POLICY "Users can leave classes" ON user_classes IS
  'Users can remove themselves from classes they have joined';
