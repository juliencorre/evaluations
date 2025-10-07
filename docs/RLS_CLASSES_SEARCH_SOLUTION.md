# Solution: Recherche de classes avec RLS activé

## Problème résolu

Avec RLS (Row Level Security) activé sur la table `classes`, les utilisateurs ne pouvaient plus rechercher de classes pour s'y associer car ils ne voyaient que leurs propres classes.

## Architecture de la solution

### 1. Fonction Postgres sécurisée (`get_searchable_classes`)

```sql
CREATE OR REPLACE FUNCTION get_searchable_classes()
RETURNS TABLE (...)
SECURITY DEFINER  -- ⚡ Exécute avec les privilèges du créateur
```

**Pourquoi `SECURITY DEFINER` ?**
- Permet de contourner RLS de manière contrôlée et sécurisée
- L'utilisateur n'accède qu'aux données que la fonction retourne (classes actives seulement)
- Évite de créer une politique RLS trop permissive qui affaiblirait la sécurité

### 2. Politique pour rejoindre une classe

```sql
CREATE POLICY "Users can join any class" ON user_classes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND class_id IN (SELECT id FROM classes WHERE active = true)
  );
```

**Validation:**
- ✅ L'utilisateur ne peut s'ajouter que lui-même (`user_id = auth.uid()`)
- ✅ Seulement aux classes actives (`active = true`)
- ❌ Ne peut pas ajouter d'autres utilisateurs sans permission

### 3. Modification du service TypeScript

```typescript
// Avant (ne fonctionne plus avec RLS):
const { data } = await supabase
  .from('classes')
  .select('*')
  .eq('active', true)

// Après (utilise la fonction sécurisée):
const { data } = await supabase
  .rpc('get_searchable_classes')
```

## Flux utilisateur

```
┌─────────────────────────────────────────────────┐
│  1. Utilisateur ouvre "Rechercher une classe"  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. App appelle get_searchable_classes()        │
│     → Fonction SECURITY DEFINER                 │
│     → Contourne RLS de manière sécurisée        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. Retourne TOUTES les classes actives         │
│     (pas de filtre user_id)                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. Utilisateur sélectionne une classe          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. INSERT INTO user_classes                    │
│     WHERE user_id = auth.uid()  ✅              │
│     AND class_id = [classe active]  ✅          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  6. L'utilisateur voit maintenant cette classe  │
│     (via RLS policy "Users can view their       │
│      classes")                                  │
└─────────────────────────────────────────────────┘
```

## Sécurité

### ✅ Ce qui est protégé

1. **Lecture des classes personnelles:**
   - Les utilisateurs ne voient que LEURS classes via `getClassesForUser()`
   - Policy RLS: `id IN (SELECT class_id FROM user_classes WHERE user_id = auth.uid())`

2. **Recherche publique contrôlée:**
   - Fonction `get_searchable_classes()` retourne uniquement les classes actives
   - Pas d'accès aux données sensibles (évaluations, élèves, etc.)

3. **Association limitée:**
   - Un utilisateur ne peut s'ajouter que lui-même
   - Seulement aux classes actives
   - Validation au niveau SQL (impossible à contourner côté client)

### ❌ Ce qui n'est PAS exposé

- ❌ Classes inactives/archivées
- ❌ Données des élèves d'autres classes
- ❌ Évaluations d'autres classes
- ❌ Possibilité d'ajouter d'autres utilisateurs

## Cas d'usage

### Scénario 1: Nouvel utilisateur
```
1. Login → Aucune classe visible ✅
2. Recherche → Voit toutes les classes actives ✅
3. Rejoint "CM2 A" → Association créée ✅
4. Refresh → Voit "CM2 A" dans sa liste ✅
```

### Scénario 2: Utilisateur existant
```
1. Login → Voit ses 3 classes ✅
2. Recherche → Voit toutes les classes actives (incluant les siennes)
3. Rejoint "CE1 B" → Maintenant 4 classes ✅
```

### Scénario 3: Tentative malveillante
```
1. Utilisateur tente: INSERT INTO user_classes (user_id='autre', class_id='xxx')
2. Policy vérifie: user_id = auth.uid() ❌
3. Résultat: ERREUR - Permission refusée ✅
```

## Migration à appliquer

Exécutez dans Supabase Dashboard → SQL Editor:

```sql
-- Contenu de supabase/migrations/022_add_public_classes_view.sql
```

## Vérification

### Test 1: Recherche fonctionne
```javascript
const { data } = await supabase.rpc('get_searchable_classes')
console.log(data.length) // Doit retourner toutes les classes actives
```

### Test 2: Association fonctionne
```javascript
const { error } = await supabase
  .from('user_classes')
  .insert({ user_id: authUser.id, class_id: selectedClass.id, role: 'teacher' })
console.log(error) // Doit être null
```

### Test 3: RLS protège toujours
```javascript
const { data: userClasses } = await supabase
  .from('user_classes')
  .select('*, classes(*)')
  .eq('user_id', authUser.id)
console.log(userClasses.length) // Voit uniquement SES associations
```

## Alternative considérée (non retenue)

### Option 1: Policy RLS permissive pour SELECT
```sql
CREATE POLICY "Anyone can view active classes" ON classes
  FOR SELECT
  USING (active = true);
```

**Problème:** Trop permissif, expose potentiellement des métadonnées sensibles.

### Option 2: Table publique séparée
```sql
CREATE TABLE public_classes AS SELECT * FROM classes;
```

**Problème:** Duplication des données, synchronisation complexe.

### ✅ Option 3 choisie: Fonction SECURITY DEFINER
**Avantages:**
- Contrôle précis des données exposées
- Pas de duplication
- Facilement modifiable
- Audit trail clair

## Maintenance

### Ajouter une colonne à la recherche

1. Modifier la fonction:
```sql
CREATE OR REPLACE FUNCTION get_searchable_classes()
RETURNS TABLE (..., nouvelle_colonne text)
...
```

2. Mettre à jour le service TypeScript:
```typescript
return (data || []).map((cls: any) => ({
  ...
  nouvelleColonne: cls.nouvelle_colonne
}))
```

### Changer les critères de visibilité

Modifier le WHERE dans la fonction:
```sql
WHERE c.active = true
  AND c.public = true  -- Nouveau critère
```

## Logs et monitoring

La fonction logue automatiquement dans `pg_stat_statements`:
```sql
SELECT * FROM pg_stat_statements
WHERE query LIKE '%get_searchable_classes%';
```

## Support

- Migration: `supabase/migrations/022_add_public_classes_view.sql`
- Service: `src/services/supabaseClassesService.ts`
- UI: `src/components/classes/SearchClassDialog.vue`
