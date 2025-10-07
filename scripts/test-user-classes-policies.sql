-- Script de test pour déboguer les politiques user_classes
-- Exécutez ce script pour comprendre pourquoi le INSERT échoue

-- 1. Vérifier que RLS est activé
SELECT
    tablename,
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN '✅ RLS activé' ELSE '❌ RLS DÉSACTIVÉ' END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_classes';

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
    END as operation_fr,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'user_classes'
ORDER BY cmd;

-- 3. Vérifier si l'utilisateur courant peut voir la clause WITH CHECK
SELECT
    policyname,
    cmd,
    pg_get_expr(polwithcheck, polrelid) as with_check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'user_classes'
AND cmd = 'INSERT';

-- 4. Tester la clause WITH CHECK manuellement
-- Remplacez 'VOTRE-USER-ID' par l'ID de l'utilisateur qui essaie de rejoindre
-- Remplacez 'VOTRE-CLASS-ID' par l'ID de la classe à rejoindre
/*
SELECT
    'VOTRE-USER-ID'::uuid as user_id,
    'VOTRE-CLASS-ID'::uuid as class_id,
    -- Test 1: Vérifier que l'utilisateur correspond
    ('VOTRE-USER-ID'::uuid = auth.uid()) as user_matches,
    -- Test 2: Vérifier que la classe est active
    ('VOTRE-CLASS-ID'::uuid IN (SELECT id FROM classes WHERE active = true)) as class_is_active,
    -- Test 3: Résultat final de la clause WITH CHECK
    (
        'VOTRE-USER-ID'::uuid = auth.uid()
        AND 'VOTRE-CLASS-ID'::uuid IN (SELECT id FROM classes WHERE active = true)
    ) as with_check_result;
*/

-- 5. Vérifier les classes actives
SELECT
    id,
    name,
    active,
    CASE WHEN active THEN '✅ Active' ELSE '❌ Inactive' END as status
FROM classes
ORDER BY name;

-- 6. Vérifier l'utilisateur courant
SELECT
    auth.uid() as current_user_id,
    CASE
        WHEN auth.uid() IS NULL THEN '❌ Non authentifié'
        ELSE '✅ Authentifié: ' || auth.uid()::text
    END as auth_status;

-- 7. Instructions pour déboguer
/*
POUR DÉBOGUER:

1. Exécutez les requêtes ci-dessus dans Supabase SQL Editor
2. Notez l'ID utilisateur retourné par la requête 6
3. Notez l'ID d'une classe active de la requête 5
4. Décommentez et complétez la requête 4 avec ces IDs
5. Si with_check_result = false, identifiez quelle condition échoue

CAUSES POSSIBLES:
- auth.uid() retourne NULL → Problème d'authentification
- class_is_active = false → La classe n'est pas active
- user_matches = false → L'ID utilisateur ne correspond pas

SOLUTION:
Si auth.uid() retourne NULL, le problème vient de l'authentification Supabase,
pas des politiques RLS.
*/
