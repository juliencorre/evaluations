# Actions à faire dans Supabase Dashboard

## 🚨 IMPORTANT: Migrations SQL à exécuter

Vous devez exécuter ces migrations dans **Supabase Dashboard → SQL Editor** pour que l'application fonctionne correctement.

---

## ✅ Étape 1: Activer RLS sur les tables classes

**Fichier:** `supabase/migrations/021_enable_rls_on_classes.sql`

```sql
-- Activer RLS sur les tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;
```

**Effet:**
- Les utilisateurs ne verront que LEURS classes (celles dans `user_classes`)
- Un nouvel utilisateur sans classe affectée verra une liste vide ✅

**Vérification:**
```sql
-- Doit retourner rls_enabled = true pour les deux tables
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('classes', 'user_classes');
```

---

## ✅ Étape 2: Créer la fonction de recherche publique

**Fichier:** `supabase/migrations/023_fix_get_searchable_classes_types.sql` ⚠️ **UTILISEZ LA 023, PAS LA 022**

```sql
-- 1. Fonction pour rechercher des classes (contourne RLS de manière sécurisée)
-- IMPORTANT: Les types doivent correspondre exactement à ceux de la table
CREATE OR REPLACE FUNCTION get_searchable_classes()
RETURNS TABLE (
  id uuid,
  name character varying,
  description text,
  school_year character varying,
  level character varying,
  subject character varying,
  active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.description,
    c.school_year,
    c.level,
    c.subject,
    c.active,
    c.created_at,
    c.updated_at
  FROM classes c
  WHERE c.active = true
  ORDER BY c.school_year DESC, c.level, c.name;
END;
$$;

-- 2. Donner les permissions
GRANT EXECUTE ON FUNCTION get_searchable_classes() TO authenticated;

-- 3. Permettre aux utilisateurs de rejoindre n'importe quelle classe
DROP POLICY IF EXISTS "Users can create class associations" ON user_classes;

CREATE POLICY "Users can join any class" ON user_classes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND class_id IN (SELECT id FROM classes WHERE active = true)
  );

-- 4. Commentaires
COMMENT ON FUNCTION get_searchable_classes() IS 'Returns all active classes for search and discovery, bypassing RLS to allow users to find classes they can join';
```

**Effet:**
- Les utilisateurs peuvent **rechercher** toutes les classes actives
- Les utilisateurs peuvent **rejoindre** n'importe quelle classe active
- RLS protège toujours les données sensibles (évaluations, élèves)

**Vérification:**
```sql
-- Test de la fonction
SELECT * FROM get_searchable_classes();
-- Doit retourner toutes les classes actives
```

---

---

## ✅ Étape 3: Corriger les politiques user_classes (OBLIGATOIRE)

**Fichier:** `supabase/migrations/024_fix_user_classes_policies.sql` ⚠️ **MIGRATION CRITIQUE**

```sql
-- Supprimer toutes les anciennes politiques qui causent des conflits
DROP POLICY IF EXISTS "Users can view their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can create class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can update their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can delete their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can join any class" ON user_classes;

-- Créer les nouvelles politiques correctes
CREATE POLICY "Users can view their class associations" ON user_classes
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can join any active class" ON user_classes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND class_id IN (SELECT id FROM classes WHERE active = true)
  );

CREATE POLICY "Users can update their class associations" ON user_classes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave classes" ON user_classes
  FOR DELETE
  USING (user_id = auth.uid());

ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;
```

**Effet:**
- ✅ Les utilisateurs peuvent s'ajouter à n'importe quelle classe active
- ✅ Les utilisateurs ne peuvent gérer que leurs propres associations
- ❌ Impossible d'ajouter d'autres utilisateurs sans permission

---

## 📋 Ordre d'exécution

1. **D'abord:** Migration 021 (Activer RLS)
2. **Ensuite:** Migration 023 (Fonction de recherche avec types corrects)
3. **ENFIN:** Migration 024 ⚠️ **OBLIGATOIRE** (Corriger politiques user_classes)

**⚠️ IMPORTANT:**
- **La migration 024 est OBLIGATOIRE** sinon vous aurez: `new row violates row-level security policy`
- La migration 023 corrige l'erreur de types de la 022
- Ne pas inverser l'ordre des migrations

---

## 🔍 Vérification complète

Après avoir exécuté les deux migrations, vérifiez:

### 1. RLS est activé
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('classes', 'user_classes');
```

**Résultat attendu:**
| tablename     | rowsecurity |
|---------------|-------------|
| classes       | true        |
| user_classes  | true        |

### 2. Les politiques existent
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('classes', 'user_classes')
ORDER BY tablename, policyname;
```

**Résultat attendu:** 8 politiques (4 pour classes, 4 pour user_classes)

### 3. La fonction existe
```sql
SELECT proname, prosecdef
FROM pg_proc
WHERE proname = 'get_searchable_classes';
```

**Résultat attendu:**
| proname                  | prosecdef |
|--------------------------|-----------|
| get_searchable_classes   | true      |

---

## 🧪 Tests fonctionnels

### Test 1: Nouvel utilisateur (liste vide)
1. Créer un nouveau compte utilisateur
2. Se connecter
3. **Résultat attendu:** Aucune classe visible dans la liste principale

### Test 2: Recherche de classes
1. Cliquer sur "Rechercher une classe"
2. **Résultat attendu:** Toutes les classes actives sont affichées
3. Sélectionner une classe et cliquer "Rejoindre"
4. **Résultat attendu:** La classe apparaît maintenant dans la liste principale

### Test 3: Création de classe
1. Créer une nouvelle classe
2. **Résultat attendu:**
   - La classe est créée
   - L'utilisateur est automatiquement associé comme "teacher"
   - La classe apparaît dans sa liste

---

## ⚠️ Dépannage

### Erreur: "policy ... already exists"
**Solution:** Les politiques existent déjà, ignorez cette erreur ou utilisez `DROP POLICY IF EXISTS` avant de recréer.

### Erreur: "function ... already exists"
**Solution:** Utilisez `CREATE OR REPLACE FUNCTION` au lieu de `CREATE FUNCTION`.

### Les utilisateurs voient toutes les classes
**Cause:** RLS n'est pas activé.
**Solution:** Exécutez la migration 021.

### Erreur: "structure of query does not match function result type"
**Cause:** Erreur de types dans la fonction (text vs character varying).
**Solution:** Exécutez la migration 023 (pas la 022).

### Les utilisateurs ne peuvent pas rechercher de classes
**Cause:** La fonction `get_searchable_classes()` n'existe pas.
**Solution:** Exécutez la migration 023.

### Les utilisateurs ne peuvent pas rejoindre une classe
**Cause:** La politique "Users can join any class" n'existe pas.
**Solution:** Vérifiez que la migration 023 est complète.

---

## 📚 Documentation complète

- **Architecture:** [docs/RLS_CLASSES_SEARCH_SOLUTION.md](RLS_CLASSES_SEARCH_SOLUTION.md)
- **Fix RLS:** [docs/FIX_RLS_CLASSES.md](FIX_RLS_CLASSES.md)
- **Migrations:** `supabase/migrations/021_*.sql` et `023_*.sql`

---

## ✅ Checklist finale

- [ ] Migration 021 exécutée (RLS activé)
- [ ] Migration 023 exécutée ⚠️ (fonction de recherche avec types corrects)
- [ ] Tests fonctionnels validés
- [ ] Nouvel utilisateur ne voit pas toutes les classes
- [ ] Recherche de classes fonctionne
- [ ] Rejoindre une classe fonctionne

## 🐛 Note importante

La migration **022** contenait une erreur de types PostgreSQL. Utilisez toujours la **migration 023** qui corrige ce problème.

**Erreur dans la 022:**
```sql
name text  -- ❌ INCORRECT
```

**Correction dans la 023:**
```sql
name character varying  -- ✅ CORRECT
```
