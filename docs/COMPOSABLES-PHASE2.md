# Phase 2.2 - Documentation des Composables

## Vue d'ensemble

La Phase 2.2 a créé une architecture de composables métier pour extraire la logique business des composants monolithiques. Cette approche améliore la maintenabilité, la réutilisabilité et la testabilité du code.

## Structure des composables

```
src/composables/
├── analysis/              # Composables pour l'analyse de données
│   ├── useChartData.ts           # Préparation de données pour graphiques
│   ├── useMetricCalculations.ts  # Calculs de métriques d'évaluation
│   ├── useRadarData.ts           # Transformation données radar
│   └── useComparisonAnalysis.ts  # Analyse comparative
├── charts/                # Composables pour les graphiques
│   ├── useChartColors.ts         # Palettes de couleurs
│   ├── useChartConfig.ts         # Configurations Chart.js
│   └── useChartExport.ts         # Export de graphiques
├── evaluations/           # Composables pour les évaluations
│   ├── useEvaluationFilters.ts   # Filtrage d'évaluations
│   ├── useResultCalculations.ts  # Calculs sur résultats
│   └── useEvaluationExport.ts    # Export CSV/JSON
├── students/              # Composables pour les étudiants
│   ├── useStudentSearch.ts       # Recherche d'étudiants
│   └── useStudentFilters.ts      # Filtrage d'étudiants
├── shared/                # Composables utilitaires
│   ├── useDebounce.ts            # Debounce pour inputs
│   ├── usePagination.ts          # Pagination de listes
│   ├── useSort.ts                # Tri de listes
│   └── useLocalStorage.ts        # Persistance localStorage
└── index.ts               # Exports centralisés
```

## Composables d'analyse

### useMetricCalculations

Extrait la logique complexe de calcul de métriques depuis DashboardView.

**Fonctionnalités:**
- Conversion de valeurs d'évaluation en scores numériques
- Navigation dans la hiérarchie du framework (domaine > champ > compétence)
- Récupération de configurations de types de résultats
- Calcul de moyennes et groupement de résultats

**Usage:**
```typescript
import { useMetricCalculations } from '@/composables'

const {
  getScoreFromValue,
  getDomainIdFromSpecificCompetencyId,
  calculateAverage,
  groupResultsById
} = useMetricCalculations(framework, resultTypes)

// Convertir une valeur en score
const score = getScoreFromValue('A', resultTypeConfigId)

// Trouver le domaine d'une compétence
const domainId = getDomainIdFromSpecificCompetencyId(compId)
```

### useRadarData

Transforme les données d'évaluation en format attendu par les graphiques radar.

**Usage:**
```typescript
import { useRadarData } from '@/composables'

const {
  transformToRadarFormat,
  calculateAveragesByCategory,
  getTopCategories
} = useRadarData()

// Transformer les données
const radarData = transformToRadarFormat(evaluationData)

// Top 5 catégories
const top5 = getTopCategories(radarData, 5)
```

### useChartData

Prépare les données pour différents types de graphiques Chart.js.

**Usage:**
```typescript
import { useChartData } from '@/composables'

const {
  prepareDomainBarData,
  prepareValueDistributionData,
  prepareTimeSeriesData
} = useChartData(results, framework)

// Données pour graphique en barres
const barData = prepareDomainBarData.value

// Série temporelle
const timeData = prepareTimeSeriesData('week')
```

## Composables de graphiques

### useChartColors

Fournit des palettes de couleurs cohérentes pour tous les graphiques.

**Usage:**
```typescript
import { useChartColors } from '@/composables'

const { generateColors, getColor, adjustOpacity } = useChartColors()

// Générer 5 couleurs primary
const colors = generateColors(5, 'primary')

// Obtenir une couleur spécifique
const color = getColor('success', 0)
```

### useChartConfig

Configurations prédéfinies pour Chart.js par type de graphique.

**Usage:**
```typescript
import { useChartConfig } from '@/composables'

const { radarConfig, barConfig, createCustomConfig } = useChartConfig()

// Config personnalisée
const config = createCustomConfig('bar', {
  scales: {
    y: { max: 100 }
  }
})
```

### useChartExport

Export de graphiques en images ou impression.

**Usage:**
```typescript
import { useChartExport } from '@/composables'

const { exportToPNG, copyToClipboard, printChart } = useChartExport()

// Exporter en PNG
exportToPNG(chartInstance, 'mon-graphique.png')

// Copier dans le presse-papiers
await copyToClipboard(chartInstance)
```

## Composables d'évaluation

### useEvaluationFilters

Filtrage d'évaluations par classe, framework, date, recherche textuelle.

**Usage:**
```typescript
import { useEvaluationFilters } from '@/composables'

const {
  filters,
  filteredEvaluations,
  setClassFilter,
  setDateRange
} = useEvaluationFilters(evaluations)

// Filtrer par classe
setClassFilter('class-123')

// Filtrer par période
setDateRange('2024-01-01', '2024-12-31')
```

### useResultCalculations

Calculs et statistiques sur les résultats d'évaluation.

**Usage:**
```typescript
import { useResultCalculations } from '@/composables'

const {
  statistics,
  studentCompletionRates,
  getStudentResults
} = useResultCalculations(results, students)

// Stats globales
console.log(statistics.value.totalResults)

// Taux de complétion par étudiant
const rates = studentCompletionRates.value
```

### useEvaluationExport

Export d'évaluations en CSV ou JSON.

**Usage:**
```typescript
import { useEvaluationExport } from '@/composables'

const { exportToCSV, exportToJSON } = useEvaluationExport()

// Export CSV
exportToCSV(evaluation, students, results, framework)

// Export JSON
exportToJSON(evaluation, students, results, framework)
```

## Composables d'étudiants

### useStudentSearch

Recherche d'étudiants par nom (prénom, nom, ou les deux).

**Usage:**
```typescript
import { useStudentSearch } from '@/composables'

const { searchQuery, filteredStudents } = useStudentSearch(students)

// Rechercher
searchQuery.value = 'Dupont'
```

### useStudentFilters

Filtrage d'étudiants par classe, genre, statut.

**Usage:**
```typescript
import { useStudentFilters } from '@/composables'

const {
  filteredStudents,
  setClassFilter,
  setStatusFilter
} = useStudentFilters(students)

// Filtrer par statut
setStatusFilter('active')
```

## Composables utilitaires

### useDebounce

Debounce de valeurs réactives ou fonctions.

**Usage:**
```typescript
import { useDebounce, useDebounceFn } from '@/composables'

// Debounce d'une ref
const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 500)

// Debounce d'une fonction
const debouncedSearch = useDebounceFn(performSearch, 300)
```

### usePagination

Pagination de listes avec navigation.

**Usage:**
```typescript
import { usePagination } from '@/composables'

const {
  paginatedItems,
  currentPage,
  totalPages,
  nextPage,
  previousPage
} = usePagination(items, 20)
```

### useSort

Tri de listes par clé avec direction asc/desc.

**Usage:**
```typescript
import { useSort } from '@/composables'

const { sortedItems, toggleSort, sortDirection } = useSort(items)

// Trier par nom
toggleSort('name') // asc
toggleSort('name') // desc
toggleSort('name') // null (reset)
```

### useLocalStorage

Persistance réactive dans localStorage.

**Usage:**
```typescript
import { useLocalStorage } from '@/composables'

const preferences = useLocalStorage('user-prefs', {
  theme: 'light',
  language: 'fr'
})

// Modifier (auto-save)
preferences.value.theme = 'dark'
```

## Imports centralisés

Tous les composables sont exportés depuis `@/composables/index.ts`:

```typescript
// Import unique
import {
  useDebounce,
  useSort,
  useChartColors,
  useEvaluationFilters
} from '@/composables'
```

## Types créés

### Types de base
- `src/types/student.ts` - Types Student et StudentWithClass
- `src/types/resultType.ts` - Types ResultTypeConfig et ResultTypeValue

### Types de composables
Tous les types sont exportés depuis `@/composables/index.ts`:
- `SortDirection`
- `StudentFilters`
- `EvaluationFilters`
- `ChartColorPalette`
- `ExportData`
- `RadarDataPoint`
- `ChartData`
- `ComparisonData`

## Avantages de l'architecture

1. **Séparation des préoccupations**: La logique métier est isolée de la présentation
2. **Réutilisabilité**: Les composables peuvent être utilisés dans plusieurs composants
3. **Testabilité**: La logique est facilement testable en isolation
4. **Maintenabilité**: Code organisé et facile à retrouver
5. **Type-safety**: Tous les composables sont typés avec TypeScript
6. **Tree-shaking**: Les imports non utilisés sont automatiquement exclus du bundle

## Prochaines étapes

La prochaine phase (2.3) consistera à refactoriser les composants monolithiques pour utiliser ces composables, réduisant ainsi la taille et la complexité des fichiers Vue.

## Statistiques

- **16 composables créés**
- **8 types créés**
- **100% TypeScript**
- **Build réussi ✓**
- **Aucune dépendance externe ajoutée**
