# Debug RLS Authentication Issue

## Problème actuel
```
Error: new row violates row-level security policy for table "user_classes"
```

Malgré les politiques RLS correctement configurées, l'INSERT échoue.

## Diagnostic en 3 étapes

### Étape 1: Exécuter la migration 026

Exécutez `supabase/migrations/026_test_auth_uid.sql` dans Supabase Dashboard.

Cette migration crée 2 fonctions de débogage:
- `debug_auth_context()` - Montre l'état d'authentification
- `test_user_class_insert()` - Teste la logique RLS sans faire d'INSERT réel

### Étape 2: Tester dans Supabase SQL Editor

**Test 1: Vérifier l'authentification**
```sql
SELECT * FROM debug_auth_context();
```

**Résultat attendu:**
```json
{
  "current_user_id": "5a53caa6-4555-4aff-907f-7ab88ccd3272",
  "current_role": "authenticated",
  "jwt_claims": { ... }
}
```

**❌ Si current_user_id est NULL:**
→ Le token JWT n'est pas correctement envoyé à Supabase
→ Vérifiez l'initialisation du client Supabase

**Test 2: Tester la logique RLS**
```sql
-- Remplacez les UUIDs par les vraies valeurs
SELECT * FROM test_user_class_insert(
  '5a53caa6-4555-4aff-907f-7ab88ccd3272'::uuid,  -- User ID du log
  'ID-DE-LA-CLASSE-GRANDE-SECTION'::uuid,        -- Class ID
  'teacher'
);
```

**Résultat attendu:**
```json
{
  "auth_uid": "5a53caa6-4555-4aff-907f-7ab88ccd3272",
  "passed_user_id": "5a53caa6-4555-4aff-907f-7ab88ccd3272",
  "user_ids_match": true,
  "class_id": "...",
  "class_is_active": true,
  "with_check_passes": true
}
```

### Étape 3: Interpréter les résultats

| Champ | Valeur | Signification | Action |
|-------|--------|---------------|--------|
| `auth_uid` | null | Token JWT non reçu | Vérifier authentification client |
| `user_ids_match` | false | IDs ne correspondent pas | Bug dans le code client |
| `class_is_active` | false | Classe inactive | Activer la classe en DB |
| `with_check_passes` | false | Policy échoue | Voir ci-dessus |
| `with_check_passes` | true | Policy devrait passer | Bug Supabase RLS |

## Solutions par scénario

### Scénario 1: auth_uid est null
**Cause:** Le client Supabase n'envoie pas le token JWT.

**Vérification dans le code:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,  // IMPORTANT
      autoRefreshToken: true  // IMPORTANT
    }
  }
)
```

**Test manuel:**
```typescript
// Dans la console du navigateur
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
console.log('Access token:', session?.access_token)
```

Si `session` est null → L'utilisateur n'est pas vraiment connecté.

### Scénario 2: user_ids_match est false
**Cause:** Le code passe un mauvais user_id à `addUserToClass()`.

**Code à vérifier:**
```typescript
// src/components/classes/SearchClassDialog.vue ligne 238
await supabaseClassesService.addUserToClass(
  currentUserId,  // ← Cette valeur doit correspondre à auth.uid()
  selectedClass.value.id,
  'teacher'
)
```

**Vérifiez:**
```typescript
const authStore = useAuthStore()
await authStore.ensureInitialized()
console.log('User ID from store:', authStore.user.value?.id)

// Doit être identique à:
const { data: { user } } = await supabase.auth.getUser()
console.log('User ID from Supabase:', user?.id)
```

### Scénario 3: class_is_active est false
**Cause:** La classe "Grande section" n'est pas active en base.

**Fix rapide:**
```sql
UPDATE classes
SET active = true
WHERE name = 'Grande section';
```

### Scénario 4: with_check_passes est true mais INSERT échoue quand même
**Cause:** Bug rare de Supabase - la fonction de test passe mais le vrai INSERT échoue.

**Solution:** Désactiver temporairement RLS pour tester:
```sql
-- ⚠️ TEMPORAIRE - Pour tester uniquement
ALTER TABLE user_classes DISABLE ROW LEVEL SECURITY;

-- Essayez l'INSERT dans l'application

-- ⚠️ RÉACTIVER IMMÉDIATEMENT
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;
```

Si ça fonctionne avec RLS désactivé → Problème dans la définition de la politique.

**Fix de la politique:**
```sql
-- Recréer avec une syntaxe différente
DROP POLICY IF EXISTS "Users can join any active class" ON user_classes;

CREATE POLICY "Users can join any active class" ON user_classes
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM classes WHERE id = class_id AND active = true)
  );
```

## Checklist de débogage

- [ ] Migration 026 exécutée
- [ ] `debug_auth_context()` retourne un user_id valide
- [ ] `test_user_class_insert()` retourne `with_check_passes: true`
- [ ] La classe "Grande section" est active (`SELECT * FROM classes WHERE name = 'Grande section'`)
- [ ] Le code utilise le bon user_id (`authStore.user.value?.id`)
- [ ] Les variables d'environnement Supabase sont correctes (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

## Commandes utiles

```sql
-- Voir toutes les politiques
SELECT * FROM pg_policies WHERE tablename = 'user_classes';

-- Voir le contenu de user_classes
SELECT * FROM user_classes;

-- Voir toutes les classes
SELECT id, name, active FROM classes;

-- Vérifier RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_classes';
```
