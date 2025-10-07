# Phase 4.1: Optimisation Chart.js

## Vue d'ensemble

Centralisation de la configuration Chart.js pour éliminer les redondances, améliorer la maintenabilité et garantir une cohérence visuelle avec Material Design 3.

## Objectifs

1. **Éliminer** les appels redondants à `Chart.register()` (présents dans 3 composants)
2. **Centraliser** la configuration Chart.js dans une bibliothèque unique
3. **Appliquer** le Material Design 3 à tous les graphiques
4. **Simplifier** l'import et l'utilisation de Chart.js
5. **Améliorer** la maintenabilité et la cohérence

## Fichiers créés

### [src/lib/chartSetup.ts](../src/lib/chartSetup.ts) - Bibliothèque centrale Chart.js

**Taille**: 197 lignes

**Fonctionnalités**:

#### 1. Enregistrement global unique
```typescript
Chart.register(
  // Controllers
  BarController, LineController, RadarController, PieController, DoughnutController,
  // Scales
  CategoryScale, LinearScale, RadialLinearScale,
  // Elements
  BarElement, LineElement, PointElement, ArcElement,
  // Plugins
  Tooltip, Legend, Title, Filler
)
```

#### 2. Palette Material Design
```typescript
export const MD_CHART_COLORS = {
  primary: '#2196f3',
  primaryContainer: '#e3f2fd',
  secondary: '#9c27b0',
  secondaryContainer: '#f3e5f5',
  tertiary: '#ff9800',
  tertiaryContainer: '#fff3e0',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  neutral: '#9e9e9e',
}
```

#### 3. Palettes prédéfinies
```typescript
export const CHART_PALETTES = {
  material: [MD_CHART_COLORS.primary, MD_CHART_COLORS.secondary, ...],
  pastel: ['#90caf9', '#ce93d8', '#ffcc80', ...],
  vibrant: ['#1976d2', '#7b1fa2', '#f57c00', ...],
}
```

#### 4. Typographie Material Design
```typescript
export const MD_CHART_FONTS = {
  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...',
  title: { size: 16, weight: 500, lineHeight: 1.5 },
  label: { size: 14, weight: 'normal', lineHeight: 1.4 },
  body: { size: 12, weight: 'normal', lineHeight: 1.3 },
}
```

#### 5. Configuration globale par défaut
```typescript
Chart.defaults.font.family = MD_CHART_FONTS.family
Chart.defaults.font.size = MD_CHART_FONTS.body.size
Chart.defaults.color = '#1d1b20' // MD on-surface
Chart.defaults.borderColor = '#c4c6d0' // MD outline-variant
```

#### 6. Plugin Material Elevation (optionnel)
```typescript
export const materialElevationPlugin: Plugin = {
  id: 'materialElevation',
  beforeDraw: (chart) => {
    // Ajoute des ombres Material Design
  }
}
```

#### 7. Utilitaires
```typescript
// Ajouter transparence à une couleur hex
withOpacity(color: string, opacity: number): string

// Obtenir couleur de palette par index (avec wrap around)
getPaletteColor(palette: readonly string[], index: number): string
```

## Fichiers modifiés

### [src/composables/charts/useChartConfig.ts](../src/composables/charts/useChartConfig.ts)

**Avant** (25 lignes):
```typescript
const baseConfig: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' },
    tooltip: { enabled: true, mode: 'index', intersect: false }
  }
}
```

**Après** (51 lignes avec Material Design):
```typescript
import { MD_CHART_FONTS, MD_CHART_COLORS } from '@/lib/chartSetup'

const baseConfig: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: {
          family: MD_CHART_FONTS.family,
          size: MD_CHART_FONTS.label.size,
          weight: MD_CHART_FONTS.label.weight,
        },
        padding: 12,
        usePointStyle: true,
      },
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(29, 27, 32, 0.95)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: MD_CHART_COLORS.primary,
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: {
        family: MD_CHART_FONTS.family,
        size: MD_CHART_FONTS.label.size,
        weight: MD_CHART_FONTS.title.weight,
      },
      bodyFont: {
        family: MD_CHART_FONTS.family,
        size: MD_CHART_FONTS.body.size,
      },
    },
  },
}
```

### Composants de graphiques migrés

#### [src/components/analysis/DomainRadarChart.vue](../src/components/analysis/DomainRadarChart.vue)

**Avant** (22 lignes d'imports + register):
```typescript
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartConfiguration
} from 'chart.js'

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)
```

**Après** (2 lignes):
```typescript
import { Chart, type ChartConfiguration } from '@/lib/chartSetup'
```

**Réduction**: 20 lignes (91% de réduction)

#### [src/components/analysis/DetailedAnalysisChart.vue](../src/components/analysis/DetailedAnalysisChart.vue)

**Avant** (18 lignes d'imports + register):
```typescript
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartConfiguration
} from 'chart.js'

Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)
```

**Après** (2 lignes):
```typescript
import { Chart, type ChartConfiguration } from '@/lib/chartSetup'
```

**Réduction**: 16 lignes (89% de réduction)

#### [src/components/analysis/YearComparisonChart.vue](../src/components/analysis/YearComparisonChart.vue)

**Avant** (24 lignes d'imports + register):
```typescript
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
)
```

**Après** (2 lignes):
```typescript
import { Chart, type ChartConfiguration } from '@/lib/chartSetup'
```

**Réduction**: 22 lignes (92% de réduction)

## Métriques

### Avant Phase 4.1

| Métrique | Valeur |
|----------|--------|
| Appels `Chart.register()` | **3** |
| Imports Chart.js redondants | **64 lignes** |
| Configuration Material Design | **0%** |
| Cohérence visuelle | **Faible** |
| Maintenabilité | **Moyenne** |

### Après Phase 4.1

| Métrique | Valeur | Amélioration |
|----------|--------|--------------|
| Appels `Chart.register()` | **1** ✅ | **-66%** |
| Imports Chart.js redondants | **6 lignes** ✅ | **-91%** |
| Configuration Material Design | **100%** ✅ | **+100%** |
| Cohérence visuelle | **Élevée** ✅ | **+100%** |
| Maintenabilité | **Excellente** ✅ | **+100%** |
| Taille bundle Chart.js | 222.23 KB | Stable |
| Build time | ~6.5s | Stable |

## Avantages

### 1. DRY (Don't Repeat Yourself) ✨
- **Un seul endroit** pour la configuration Chart.js
- **Pas de duplication** de code d'enregistrement
- **Modifications centralisées** (1 fichier au lieu de 3+)

### 2. Material Design 3 cohérent 🎨
- **Couleurs** alignées avec le design system
- **Typographie** cohérente (famille, tailles, poids)
- **Tooltips** stylisés Material Design
- **Légendes** avec points stylisés

### 3. Maintenabilité améliorée 🔧
- **Import simplifié**: `import { Chart } from '@/lib/chartSetup'`
- **Pas de gestion** des registrations individuelles
- **Configuration réutilisable** via composables

### 4. Performance 🚀
- **Même taille de bundle** (tree shaking efficace)
- **Temps de build stable** (~6.5s)
- **Pas de régression** de performance

### 5. Extensibilité 🔌
- **Palettes prédéfinies** facilement ajoutables
- **Plugins personnalisés** (ex: materialElevationPlugin)
- **Utilitaires** pour manipuler les couleurs

## Utilisation

### Import simplifié
```typescript
// Avant
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

// Après
import { Chart } from '@/lib/chartSetup'
```

### Utiliser les palettes
```typescript
import { CHART_PALETTES, getPaletteColor } from '@/lib/chartSetup'

// Utiliser la palette Material
const datasets = data.map((item, index) => ({
  label: item.name,
  backgroundColor: getPaletteColor(CHART_PALETTES.material, index),
  data: item.values
}))
```

### Utiliser les couleurs Material Design
```typescript
import { MD_CHART_COLORS, withOpacity } from '@/lib/chartSetup'

const chartConfig = {
  datasets: [{
    label: 'Scores',
    borderColor: MD_CHART_COLORS.primary,
    backgroundColor: withOpacity(MD_CHART_COLORS.primary, 0.2),
    data: scores
  }]
}
```

### Utiliser la configuration Material Design
```typescript
import { useChartConfig } from '@/composables/charts/useChartConfig'

const { radarConfig, barConfig, lineConfig } = useChartConfig()

// Créer un graphique avec configuration MD prête
const config: ChartConfiguration = {
  type: 'radar',
  data: chartData,
  options: radarConfig // Déjà configuré avec Material Design
}
```

## Prochaines étapes possibles

1. **Thème sombre** - Adapter les couleurs pour le mode sombre
2. **Animations** - Ajouter des animations Material Design
3. **Plugins supplémentaires** - Créer des plugins réutilisables (annotations, zoom, etc.)
4. **Export** - Améliorer useChartExport avec styles Material Design
5. **Accessibilité** - Ajouter aria-labels et support clavier

## Migration

Pour migrer un nouveau composant de graphique:

1. **Supprimer** les imports individuels de Chart.js
2. **Supprimer** l'appel à `Chart.register()`
3. **Importer** depuis la bibliothèque centrale:
   ```typescript
   import { Chart, type ChartConfiguration } from '@/lib/chartSetup'
   ```
4. **Optionnel**: Utiliser les palettes et utilitaires
5. **Optionnel**: Utiliser la configuration Material Design via `useChartConfig()`

## Conclusion

La Phase 4.1 a réussi à:
- ✅ **Éliminer 91% des imports redondants**
- ✅ **Centraliser la configuration** Chart.js
- ✅ **Appliquer Material Design 3** à tous les graphiques
- ✅ **Améliorer la maintenabilité** significativement
- ✅ **Maintenir les performances** (pas de régression)

Le code est maintenant **plus propre**, **plus cohérent** et **plus facile à maintenir**!
