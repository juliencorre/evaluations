-- Migration 018: Fix RLS policies for classes table
-- This migration restricts class access to only classes the user is associated with via user_classes

-- 1. Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable all operations for classes" ON classes;

-- 2. Create restrictive policies for classes table

-- Policy: Users can only SELECT classes they are associated with via user_classes
CREATE POLICY "Users can view their classes" ON classes
  FOR SELECT
  USING (
    id IN (
      SELECT class_id
      FROM user_classes
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can INSERT new classes (they will be automatically associated via user_classes)
CREATE POLICY "Users can create classes" ON classes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can UPDATE classes they are associated with
CREATE POLICY "Users can update their classes" ON classes
  FOR UPDATE
  USING (
    id IN (
      SELECT class_id
      FROM user_classes
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT class_id
      FROM user_classes
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can DELETE (soft delete) classes they are associated with
CREATE POLICY "Users can delete their classes" ON classes
  FOR DELETE
  USING (
    id IN (
      SELECT class_id
      FROM user_classes
      WHERE user_id = auth.uid()
    )
  );

-- 3. Update user_classes policies to allow users to manage their own associations

-- Drop the overly permissive policy for user_classes
DROP POLICY IF EXISTS "Enable all operations for user_classes" ON user_classes;

-- Policy: Users can view their class associations
CREATE POLICY "Users can view their class associations" ON user_classes
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can create class associations when creating a class
CREATE POLICY "Users can create class associations" ON user_classes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their class associations (change role, etc.)
CREATE POLICY "Users can update their class associations" ON user_classes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their class associations
CREATE POLICY "Users can delete their class associations" ON user_classes
  FOR DELETE
  USING (user_id = auth.uid());

-- Add comment
COMMENT ON TABLE classes IS 'Classes table with RLS policies restricting access to user-associated classes only';
COMMENT ON TABLE user_classes IS 'User-class associations with RLS policies for user-specific access';
