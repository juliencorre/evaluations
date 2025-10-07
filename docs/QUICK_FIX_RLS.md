# Fix Rapide: RLS Classes - Exécutez dans Supabase Dashboard

## 🚨 Problème actuel
- Erreur: `new row violates row-level security policy for table "user_classes"`
- Impossible de rejoindre une classe

## ✅ Solution en 3 étapes

Copiez-collez ces 3 migrations dans **Supabase Dashboard → SQL Editor** (dans l'ordre):

---

### 1️⃣ Migration 021: Activer RLS

```sql
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;
```

---

### 2️⃣ Migration 023: Fonction de recherche

```sql
DROP FUNCTION IF EXISTS get_searchable_classes();

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

GRANT EXECUTE ON FUNCTION get_searchable_classes() TO authenticated;
```

---

### 3️⃣ Migration 024: Corriger politiques (CRUCIAL) ⚠️

```sql
-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can create class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can update their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can delete their class associations" ON user_classes;
DROP POLICY IF EXISTS "Users can join any class" ON user_classes;

-- Créer les bonnes politiques
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
```

---

## ✅ Vérification rapide

Après avoir exécuté les 3 migrations:

```sql
-- Vérifier RLS activé (doit retourner true)
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('classes', 'user_classes');

-- Vérifier les politiques (doit retourner 4 politiques)
SELECT policyname FROM pg_policies
WHERE tablename = 'user_classes';

-- Tester la fonction (doit retourner les classes actives)
SELECT * FROM get_searchable_classes();
```

---

## 🎯 Résultat attendu

Après ces 3 migrations:
- ✅ Nouveaux utilisateurs ne voient pas toutes les classes
- ✅ Recherche de classes fonctionne
- ✅ Rejoindre une classe fonctionne
- ✅ Chaque utilisateur ne voit que SES classes

---

## 📚 Documentation complète

Pour plus de détails: [docs/ACTIONS_A_FAIRE_SUPABASE.md](ACTIONS_A_FAIRE_SUPABASE.md)
