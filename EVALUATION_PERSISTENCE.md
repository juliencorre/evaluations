# Service de Persistance des Résultats d'Évaluation

## Vue d'ensemble

Ce service fournit une solution de persistance temporaire pour les résultats d'évaluation en utilisant le localStorage du navigateur, en attendant la migration vers Supabase.

## Fichiers créés

### Services
- `src/services/evaluationResultsService.ts` - Service principal de persistance
- `src/stores/evaluationResultsStore.ts` - Store Vue réactif pour la gestion d'état

### Composants
- `src/components/EvaluationPersistenceStatus.vue` - Composant d'affichage du statut
- `src/components/EvaluationTable.vue` - Mis à jour pour utiliser le service

## Fonctionnalités

### ✅ Implémentées

1. **Sauvegarde automatique des résultats**
   - Persistance locale via localStorage
   - Sauvegarde en temps réel lors de la saisie
   - Gestion des erreurs avec retry automatique

2. **Structure de données temporaire**
   - Format JSON compatible avec les types TypeScript existants
   - Stockage par évaluation avec métadonnées
   - Horodatage automatique des modifications

3. **Interface utilisateur intégrée**
   - Édition inline dans le tableau d'évaluation
   - Indicateurs visuels de statut de sauvegarde
   - Composant de monitoring des données

4. **Utilitaires de gestion**
   - Export/import des données JSON
   - Statistiques d'utilisation du stockage
   - Réinitialisation des évaluations
   - Effacement des données

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

## Migration vers Supabase

Le service est conçu pour faciliter la migration future vers Supabase :

1. **Structure compatible** : Les données sont déjà au format attendu
2. **Interface unifiée** : Les méthodes du service peuvent être adaptées
3. **Export facile** : Fonction d'export pour la migration des données
4. **Fallback pattern** : Même pattern que les autres services du projet

### Étapes de migration suggérées

1. Créer les tables Supabase équivalentes
2. Adapter le service pour utiliser Supabase
3. Migrer les données existantes avec `exportAllData()`
4. Implémenter le fallback localStorage comme backup
5. Tester et déployer

## Exemple d'intégration

Voir `src/components/EvaluationTable.vue` pour un exemple complet d'intégration du service dans un composant existant.

## Limitations

- **Stockage local uniquement** : Données limitées au navigateur
- **Pas de synchronisation** : Pas de sync entre appareils/utilisateurs
- **Limite de stockage** : Contrainte par les limites du localStorage (~5-10MB)
- **Temporaire** : Solution en attendant la migration Supabase

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