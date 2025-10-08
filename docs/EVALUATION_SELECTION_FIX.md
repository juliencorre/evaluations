# Correction du bug de sélection d'évaluation

## Problème

Dans la page `/classes/:id/evaluations`, lorsqu'on cliquait sur une évaluation spécifique, **la mauvaise évaluation s'affichait** (toujours la première évaluation de la liste au lieu de celle sélectionnée).

## Cause Racine

Le problème provenait du **comportement automatique du store** `evaluations.store.ts` :

### Comportement problématique (AVANT)
```typescript
async function loadEvaluations() {
  const data = await evaluationRepository.findAll()
  evaluations.value = data

  // ❌ PROBLÈME: Définition automatique de la première évaluation
  if (data.length > 0 && !currentEvaluation.value) {
    currentEvaluation.value = data[0]  // Force toujours la première!
  }
}
```

### Séquence du bug
1. User clique sur "Évaluation B" (ID: `xyz-456`)
2. Navigation vers `/evaluation/xyz-456`
3. `HomeView.vue` appelle `loadEvaluations()`
4. Le store **force automatiquement** `currentEvaluation = data[0]` (Évaluation A)
5. Ensuite `getEvaluationById('xyz-456')` trouve bien l'Évaluation B
6. Mais `setCurrentEvaluation()` est appelé **APRÈS** que le store ait déjà défini la première
7. Résultat: L'Évaluation A s'affiche au lieu de B

## Solution Appliquée

### 1. Suppression du comportement automatique du store

**Fichier**: `src/stores/modules/evaluations.store.ts`

```typescript
async function loadEvaluations() {
  isLoading.value = true
  error.value = null

  try {
    const data = await evaluationRepository.findAll()
    evaluations.value = data

    // ✅ Ne PAS définir automatiquement une évaluation courante
    // Cela doit être fait explicitement par le composant appelant
    // Pour éviter de changer l'évaluation sélectionnée lors de la navigation
  } catch (err) {
    console.error('[EvaluationsStore] Erreur lors du chargement des évaluations:', err)
    error.value = 'Impossible de charger les évaluations'
    throw err
  } finally {
    isLoading.value = false
  }
}
```

### 2. Amélioration du logging dans HomeView

**Fichier**: `src/views/HomeView.vue`

```typescript
onMounted(async () => {
  // ...

  // ✅ Get the evaluation ID from route FIRST
  const evaluationId = props.id || (route?.params?.id as string)
  console.log('📋 [HomeView] Loading evaluation with ID:', evaluationId)

  // Load evaluations from database
  await loadEvaluations()

  // Ensure school years are loaded
  await schoolYearStore.ensureLoaded()

  // ✅ Load the specific evaluation based on the route parameter
  if (evaluationId) {
    const evaluation = getEvaluationById(evaluationId)
    if (evaluation) {
      console.log('📋 [HomeView] Found evaluation:', evaluation.name, 'ID:', evaluation.id)
      setCurrentEvaluation(evaluation)  // Définition explicite!
      // ...
    }
  }
})
```

## Vérification

### Test de navigation
1. Aller sur `/classes/1ae34061-87a8-4ad3-ab9f-da6a8cf8de63/evaluations`
2. Cliquer sur différentes évaluations
3. Vérifier dans la console du navigateur :
   ```
   📋 [HomeView] Loading evaluation with ID: <correct-id>
   📋 [HomeView] Found evaluation: <correct-name> ID: <correct-id>
   ```
4. L'évaluation affichée doit correspondre à celle cliquée ✅

### Impact sur les autres composants
- ✅ Aucun autre composant n'utilise `setCurrentEvaluation()` (vérifié par grep)
- ✅ `EvaluationListView` utilise seulement `loadEvaluations()` sans dépendre de `currentEvaluation`
- ✅ Les composants d'analyse ne sont pas affectés

## Fichiers Modifiés

1. [src/stores/modules/evaluations.store.ts](../src/stores/modules/evaluations.store.ts)
   - Suppression de la définition automatique de `currentEvaluation`

2. [src/views/HomeView.vue](../src/views/HomeView.vue)
   - Ajout de logs pour déboguer
   - Récupération de l'ID d'évaluation en premier

## Leçon Apprise

⚠️ **Ne jamais modifier automatiquement l'état global dans une fonction de chargement**

Les fonctions de chargement (comme `loadEvaluations()`) doivent être **idempotentes** et ne pas avoir d'effets de bord sur l'état de l'application. La définition de l'élément "courant" doit toujours être **explicite** et contrôlée par le composant appelant.

### Mauvaise pratique ❌
```typescript
async function loadItems() {
  items.value = await fetchItems()
  currentItem.value = items.value[0]  // ❌ Effet de bord!
}
```

### Bonne pratique ✅
```typescript
async function loadItems() {
  items.value = await fetchItems()
  // Pas de modification de currentItem
}

// Le composant décide explicitement
await loadItems()
setCurrentItem(getItemById(specificId))  // ✅ Contrôle explicite
```
