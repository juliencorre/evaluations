# Fix: Nouvel utilisateur voit toutes les classes

## Problème
Un nouvel utilisateur voit toutes les classes alors qu'il ne devrait voir que celles auxquelles il est affecté via la table `user_classes`.

## Cause
Les politiques RLS (Row Level Security) ne sont pas correctement appliquées ou activées sur la table `classes`.

## Solution

### Option 1: Via Supabase Dashboard (Recommandé)

1. **Connectez-vous au Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez le SQL Editor**
   - Cliquez sur "SQL Editor" dans la sidebar

3. **Exécutez la migration 018**

   Copiez et collez le contenu de `supabase/migrations/018_fix_classes_rls_policies.sql` dans l'éditeur SQL et exécutez-le.

   Ou exécutez ce script de vérification/correction:

   ```sql
   -- 1. Vérifier si RLS est activé
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename IN ('classes', 'user_classes');

   -- 2. Activer RLS si nécessaire
   ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;

   -- 3. Appliquer les politiques de la migration 018
   -- Drop les anciennes politiques trop permissives
   DROP POLICY IF EXISTS "Enable all operations for classes" ON classes;
   DROP POLICY IF EXISTS "Enable all operations for user_classes" ON user_classes;

   -- Créer les nouvelles politiques restrictives pour classes
   CREATE POLICY "Users can view their classes" ON classes
     FOR SELECT
     USING (
       id IN (
         SELECT class_id
         FROM user_classes
         WHERE user_id = auth.uid()
       )
     );

   CREATE POLICY "Users can create classes" ON classes
     FOR INSERT
     WITH CHECK (auth.uid() IS NOT NULL);

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

   CREATE POLICY "Users can delete their classes" ON classes
     FOR DELETE
     USING (
       id IN (
         SELECT class_id
         FROM user_classes
         WHERE user_id = auth.uid()
       )
     );

   -- Créer les nouvelles politiques pour user_classes
   CREATE POLICY "Users can view their class associations" ON user_classes
     FOR SELECT
     USING (user_id = auth.uid());

   CREATE POLICY "Users can create class associations" ON user_classes
     FOR INSERT
     WITH CHECK (user_id = auth.uid());

   CREATE POLICY "Users can update their class associations" ON user_classes
     FOR UPDATE
     USING (user_id = auth.uid())
     WITH CHECK (user_id = auth.uid());

   CREATE POLICY "Users can delete their class associations" ON user_classes
     FOR DELETE
     USING (user_id = auth.uid());
   ```

### Option 2: Via Supabase CLI (Si configuré)

```bash
# Appliquer la migration
npx supabase db push

# Ou appliquer spécifiquement la migration 018
npx supabase migration up --db-url "your-db-url"
```

### Option 3: Script de vérification manuel

Exécutez le script `scripts/check-rls-policies.sql` pour vérifier l'état actuel des politiques:

```bash
# Via psql
psql "your-database-url" -f scripts/check-rls-policies.sql
```

## Vérification

Après avoir appliqué les politiques RLS:

1. **Testez avec un nouvel utilisateur:**
   - Créez un nouveau compte
   - Vérifiez qu'aucune classe n'est visible
   - Créez une nouvelle classe
   - Vérifiez que seule cette classe est visible

2. **Testez l'association:**
   - Ajoutez un utilisateur à une classe existante via `user_classes`
   - Vérifiez qu'il peut maintenant voir cette classe

3. **Vérifiez dans le code:**
   ```typescript
   // Le store classe utilise déjà la bonne méthode
   // src/stores/classStore.ts ligne 43
   classes.value = await supabaseClassesService.getClassesForUser(currentUserId)
   ```

## Comment ça fonctionne

### Architecture RLS

```
┌─────────────┐
│   User A    │ auth.uid() = 'user-a-id'
└──────┬──────┘
       │
       │ SELECT * FROM classes
       │
       ▼
┌─────────────────────────────────────────┐
│  RLS Policy: "Users can view their     │
│  classes"                               │
│                                         │
│  WHERE id IN (                          │
│    SELECT class_id FROM user_classes   │
│    WHERE user_id = auth.uid()          │
│  )                                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  user_classes                           │
│  ├─ user_id: 'user-a-id'               │
│  ├─ class_id: 'class-1'                │
│  └─ role: 'teacher'                    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  classes                                │
│  └─ id: 'class-1' ✅ VISIBLE           │
│  └─ id: 'class-2' ❌ NOT VISIBLE       │
└─────────────────────────────────────────┘
```

### Flux de création de classe

1. User crée une classe → Policy "Users can create classes" autorise (auth.uid() IS NOT NULL)
2. Application crée automatiquement l'association dans `user_classes` via `addUserToClass()`
3. User peut maintenant voir la classe via Policy "Users can view their classes"

## Notes importantes

- **RLS doit être ACTIVÉ** sur les deux tables (`classes` et `user_classes`)
- **Les politiques doivent être CRÉÉES** comme défini dans la migration 018
- **L'application gère déjà correctement** l'association user-class lors de la création
- **Pas besoin de modifier le code** - le problème est uniquement au niveau de la base de données

## État attendu après correction

```sql
-- Doit retourner true pour les deux tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('classes', 'user_classes');

-- Doit montrer 8 politiques (4 pour classes, 4 pour user_classes)
SELECT count(*) FROM pg_policies
WHERE tablename IN ('classes', 'user_classes');
```
