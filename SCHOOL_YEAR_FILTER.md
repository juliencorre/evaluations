# Système de Filtre d'Année Scolaire

Ce document explique comment utiliser le système de filtre d'année scolaire global implémenté dans l'application.

## 🎯 Fonctionnalités

### 1. **Chip de Sélection dans l'App Bar**
- Affiche l'année scolaire sélectionnée ou "Toutes les années"
- Accessible depuis toutes les pages utilisant `CenterAppBar`
- Animation au survol avec rotation de la flèche

### 2. **Dialog de Sélection**
- Interface Material Design 3
- Liste des années scolaires avec badges "Actuelle"
- Option "Toutes les années" pour afficher tous les données
- Responsive et accessible

### 3. **Store Global de Filtre**
- Persistance dans localStorage
- État synchronisé à travers l'application
- Helpers pour filtrer les données

## 🛠️ Utilisation

### Dans les Composants

```vue
<script setup lang="ts">
import { getSchoolYearFilterStore } from '@/stores/schoolYearFilterStore'

const schoolYearFilter = getSchoolYearFilterStore()

// Utiliser le filtre actuel
const currentFilter = schoolYearFilter.currentFilter.value
const displayText = schoolYearFilter.displayText.value
const isFilteringAllYears = schoolYearFilter.isFilteringAllYears.value
const activeYearId = schoolYearFilter.activeYearId.value
</script>
```

### Filtrer des Données côté Client

```typescript
// Filtrer un tableau d'objets basé sur l'année scolaire
const filteredData = schoolYearFilter.filterDataByYear(myData)
```

### Filtrer des Requêtes de Base de Données

```typescript
// Obtenir l'ID de l'année pour les requêtes SQL
const yearIdForQuery = schoolYearFilter.getFilterForQuery()

// Si null = toutes les années, sinon ID spécifique
if (yearIdForQuery) {
  // Filtrer par année spécifique
  const data = await service.getDataByYear(yearIdForQuery)
} else {
  // Récupérer toutes les données
  const data = await service.getAllData()
}
```

### Dans l'App Bar

```vue
<template>
  <CenterAppBar
    title="Ma Page"
    :show-school-year-selector="true"
  />
</template>
```

## 📱 Composants Créés

### 1. **SchoolYearChip.vue**
- Chip Material Design 3
- Props: `selectedYear`, `allYearsSelected`
- Emit: `click`

### 2. **SchoolYearSelectionDialog.vue**
- Dialog modal pour la sélection
- Props: `visible`, `initialSelection`
- Emit: `close`, `select`

### 3. **schoolYearFilterStore.ts**
- Store global réactif
- Méthodes de configuration et de filtrage
- Persistance automatique

## 🔄 Flux de Données

1. **Initialisation**: Le store charge les années scolaires disponibles
2. **Sélection**: L'utilisateur clique sur la chip → Dialog s'ouvre
3. **Confirmation**: Sélection confirmée → Store mis à jour → localStorage
4. **Filtrage**: Les vues utilisent le store pour filtrer leurs données
5. **Export**: Les exports incluent le filtre appliqué

## 💡 Exemple d'Intégration

L'export d'évaluations a été mis à jour pour inclure le filtre actuel :

```csv
"Évaluation","Mathématiques Trimestre 1"
"Filtre année scolaire","2024-2025"
"Nombre d'élèves","25"
```

## 🎨 Design Material Design 3

- Couleurs et élévations cohérentes
- Animations fluides (easing emphasized)
- Accessibilité complète (ARIA, focus management)
- Responsive design pour mobile

## 🚀 Extensions Futures

- Filtres multiples (classe + année)
- Sauvegarde de filtres personnalisés
- Intégration avec les analytics
- Synchronisation temps réel entre onglets