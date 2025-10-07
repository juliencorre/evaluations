-- Script pour vérifier l'état du RLS sur les tables classes et user_classes

-- 1. Vérifier si RLS est activé
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity THEN '✅ RLS activé'
    ELSE '❌ RLS DÉSACTIVÉ - PROBLÈME DE SÉCURITÉ!'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('classes', 'user_classes')
ORDER BY tablename;

-- 2. Lister toutes les politiques existantes
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as operation,
  CASE
    WHEN cmd = 'SELECT' THEN 'Lecture'
    WHEN cmd = 'INSERT' THEN 'Création'
    WHEN cmd = 'UPDATE' THEN 'Modification'
    WHEN cmd = 'DELETE' THEN 'Suppression'
    ELSE 'Toutes'
  END as operation_fr
FROM pg_policies
WHERE tablename IN ('classes', 'user_classes')
ORDER BY tablename, cmd;

-- 3. Compter les politiques par table
SELECT
  tablename,
  COUNT(*) as nombre_de_politiques
FROM pg_policies
WHERE tablename IN ('classes', 'user_classes')
GROUP BY tablename;

-- Résultat attendu:
-- classes: RLS enabled = true, 4 politiques (SELECT, INSERT, UPDATE, DELETE)
-- user_classes: RLS enabled = true, 4 politiques (SELECT, INSERT, UPDATE, DELETE)
