-- Script to check RLS policies on classes and user_classes tables

-- Check if RLS is enabled on classes table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('classes', 'user_classes');

-- Check existing policies on classes table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('classes', 'user_classes')
ORDER BY tablename, policyname;
