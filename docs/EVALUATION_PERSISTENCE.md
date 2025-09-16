# Service de Persistance des Résultats d'Évaluation

## Vue d'ensemble

Ce service fournit une solution de persistance pour les résultats d'évaluation avec **double backup** :
1. **Supabase** (primaire) - Base de données cloud PostgreSQL
2. **localStorage** (fallback) - Stockage local du navigateur

Le système bascule automatiquement vers localStorage si Supabase n'est pas disponible.

## Fichiers créés

### Services
- `src/services/evaluationResultsService.ts` - Service localStorage (fallback)
- `src/services/supabaseEvaluationResultsService.ts` - Service Supabase (primaire)
- `src/stores/evaluationResultsStore.ts` - Store Vue réactif avec gestion automatique du fallback

### Composants
- `src/components/EvaluationPersistenceStatus.vue` - Composant d'affichage du statut
- `src/components/EvaluationTable.vue` - Mis à jour pour utiliser le service

## Fonctionnalités

### ✅ Implémentées

1. **Persistance double avec fallback automatique**
   - **Supabase primaire** : Base de données PostgreSQL cloud
   - **localStorage fallback** : Backup local automatique
   - Basculement transparent en cas d'erreur Supabase

2. **Sauvegarde robuste des résultats**
   - Sauvegarde simultanée Supabase + localStorage
   - Détection automatique des pannes réseau
   - Retry intelligent avec fallback

3. **Structure de données normalisée**
   - Tables relationnelles Supabase (`evaluations`, `evaluation_results`)
   - Types TypeScript fortement typés
   - Contraintes d'intégrité référentielle

4. **Interface utilisateur avancée**
   - Indicateur de source (Supabase/Local)
   - Édition inline temps réel
   - Monitoring du statut de connexion
   - Statistiques détaillées

5. **Fonctionnalités temps réel**
   - Souscriptions PostgreSQL en temps réel
   - Synchronisation multi-utilisateurs
   - Mises à jour automatiques

## Utilisation

### 1. Initialisation dans un composant

```vue
<script setup lang="ts">
import { useEvaluationResultsStore } from '@/stores/evaluationResultsStore'
import { onMounted } from 'vue'

const evaluationStore = useEvaluationResultsStore()

onMounted(async () => {
  await evaluationStore.initializeEvaluation({
    id: 'evaluation-id',
    name: 'Mon Évaluation',
    description: 'Description de l\'évaluation',
    frameworkId: 'framework-id',
    classId: 'class-id',
    createdAt: new Date().toISOString()
  })
})
</script>
```

### 2. Sauvegarde d'un résultat

```typescript
const result = await evaluationStore.saveResult(
  'student-id',
  'competency-id',
  'A', // niveau
  'Commentaire optionnel'
)
```

### 3. Récupération d'un résultat

```typescript
const result = evaluationStore.getResult('student-id', 'competency-id')
```

### 4. Affichage du statut (optionnel)

```vue
<template>
  <EvaluationPersistenceStatus />
</template>
```

## API du Service

### EvaluationResultsService

#### Méthodes principales
- `saveResult(evaluationId, studentId, competencyId, level, comment?)` - Sauvegarde un résultat
- `getResult(evaluationId, studentId, competencyId)` - Récupère un résultat
- `getAllResults(evaluationId)` - Récupère tous les résultats d'une évaluation
- `deleteResult(evaluationId, studentId, competencyId)` - Supprime un résultat
- `bulkSaveResults(evaluationId, results[])` - Sauvegarde en lot
- `resetEvaluation(evaluationId)` - Remet à zéro une évaluation

#### Méthodes utilitaires
- `exportAllData()` - Export JSON de toutes les données
- `importAllData(data)` - Import de données JSON
- `clearAllData()` - Suppression de toutes les données
- `getStats()` - Statistiques du service

### EvaluationResultsStore

#### Getters réactifs
- `evaluation` - Évaluation courante
- `results` - Résultats de l'évaluation courante
- `hasResults` - Booléen indiquant la présence de résultats
- `evaluationStats` - Statistiques détaillées
- `isLoading` - État de chargement
- `error` - Erreur courante

#### Actions
- `initializeEvaluation(data)` - Initialise une évaluation
- `saveResult(studentId, competencyId, level, comment?)` - Sauvegarde
- `getResult(studentId, competencyId)` - Récupération
- `deleteResult(studentId, competencyId)` - Suppression
- `resetEvaluation()` - Réinitialisation
- `refreshEvaluation()` - Actualisation

## Structure des Données

### Stockage localStorage

```json
{
  "evaluation_results_temp": {
    "evaluation-id-1": {
      "id": "evaluation-id-1",
      "name": "Évaluation Trimestre 1",
      "description": "Évaluation des compétences",
      "frameworkId": "framework-id",
      "classId": "class-id",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "results": [
        {
          "studentId": "student-id-1",
          "competencyId": "competency-id-1",
          "level": "A",
          "comment": "Excellent travail",
          "evaluatedAt": "2024-01-15T14:30:00.000Z"
        }
      ]
    }
  }
}
```

## Configuration Supabase

### Prérequis

1. **Tables Supabase** : Exécuter le script de migration (voir `SUPABASE_MIGRATION.md`)
2. **Configuration client** : Variables d'environnement Supabase configurées
3. **Types TypeScript** : Types Supabase à jour dans `src/types/supabase.ts`

### Migration depuis localStorage

Si vous avez des données existantes en localStorage :

```typescript
// 1. Exporter les données localStorage
const localData = evaluationResultsService.exportAllData()

// 2. Pour chaque évaluation, créer en Supabase
for (const [evaluationId, evaluation] of Object.entries(localData)) {
  await supabaseEvaluationResultsService.getOrCreateEvaluation(evaluation)

  // 3. Migrer les résultats
  if (evaluation.results.length > 0) {
    await supabaseEvaluationResultsService.bulkSaveResults(
      evaluationId,
      evaluation.results
    )
  }
}
```

### Basculement automatique

Le système détecte automatiquement les erreurs Supabase et bascule vers localStorage :

- **Erreurs réseau** → Fallback localStorage
- **Erreurs d'authentification** → Fallback localStorage
- **Tables manquantes** → Fallback localStorage
- **Timeouts** → Fallback localStorage

## Exemple d'intégration

Voir `src/components/EvaluationTable.vue` pour un exemple complet d'intégration du service dans un composant existant.

## Avantages et Limitations

### ✅ Avantages

- **Haute disponibilité** : Fallback automatique localStorage
- **Synchronisation multi-utilisateurs** : Via Supabase en temps réel
- **Persistance durable** : Base de données PostgreSQL
- **Performance** : Index optimisés et requêtes efficaces
- **Intégrité** : Contraintes relationnelles strictes
- **Backup automatique** : Double sauvegarde systématique

### ⚠️ Limitations

- **Dépendance réseau** : Supabase nécessite une connexion
- **Configuration** : Tables Supabase doivent être créées manuellement
- **Complexité** : Plus complexe que localStorage seul
- **Coût** : Supabase peut avoir des coûts selon l'usage

## Support et Debug

### Logs console
Le service génère des logs détaillés pour le debug :
- `🚀` Initialisation
- `💾` Sauvegarde
- `✅` Succès
- `❌` Erreur
- `🔄` Actualisation

### Vérification des données
```javascript
// Dans la console du navigateur
console.log(localStorage.getItem('evaluation_results_temp'))
```

### Statistiques
```javascript
// Utilisation du composant de statut ou directement :
console.log(evaluationResultsService.getStats())
```