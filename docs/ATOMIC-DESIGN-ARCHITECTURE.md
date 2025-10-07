# Architecture Atomic Design

## Vue d'ensemble

Ce projet suit l'architecture **Atomic Design** de Brad Frost pour créer une hiérarchie de composants maintenables et réutilisables.

## Structure des dossiers

```
src/components/
├── atoms/              # Composants de base (50-100 lignes max)
│   ├── Button.vue      # Bouton Material Design avec variants
│   ├── Input.vue       # Champ de saisie avec validation
│   ├── Chip.vue        # Chip filtrable/sélectionnable
│   ├── Icon.vue        # Icône avec tailles personnalisables
│   └── Card.vue        # Carte Material Design
│
├── molecules/          # Compositions simples (100-200 lignes)
│   ├── SearchField.vue      # Champ de recherche avec suggestions
│   ├── FilterChip.vue       # Chip de filtre interactif
│   ├── MetricCard.vue       # Carte affichant une métrique
│   └── ChartLegend.vue      # Légende de graphique
│
├── organisms/          # Sections complexes (200-400 lignes)
│   ├── NavigationBar.vue    # Barre de navigation principale
│   ├── DataTable.vue        # Table de données triable
│   └── FilterPanel.vue      # Panneau de filtres
│
├── features/           # Fonctionnalités métier (300-500 lignes)
│   ├── analysis/            # Fonctionnalités d'analyse
│   │   ├── dashboard/       # Dashboard d'analyse
│   │   ├── DomainRadarChart.vue
│   │   └── DetailedAnalysisChart.vue
│   ├── evaluations/         # Gestion des évaluations
│   ├── students/            # Gestion des étudiants
│   └── classes/             # Gestion des classes
│
└── layouts/            # Layouts de page
    ├── MainLayout.vue       # Layout principal de l'app
    ├── AuthLayout.vue       # Layout d'authentification
    └── PrintLayout.vue      # Layout pour impression
```

## Principes de l'Atomic Design

### 1. Atoms (Atomes) - 50-100 lignes max

**Composants de base non décomposables**

- **Responsabilité unique** : Un seul objectif clair
- **Pas de logique métier** : Uniquement présentation et interaction de base
- **Hautement réutilisables** : Utilisables dans tout contexte
- **Props simples** : Configuration minimale

**Exemples** :
- `Button.vue` : Bouton avec variants (filled, outlined, text)
- `Input.vue` : Champ de saisie avec gestion d'erreur
- `Chip.vue` : Chip Material Design
- `Icon.vue` : Icône personnalisable
- `Card.vue` : Carte conteneur

**Règles** :
- ✅ Accepte des props de configuration
- ✅ Émet des événements simples
- ❌ Pas d'appels API
- ❌ Pas d'accès aux stores
- ❌ Pas de logique métier complexe

### 2. Molecules (Molécules) - 100-200 lignes

**Combinaisons d'atomes pour une fonction spécifique**

- **Groupe fonctionnel** : Plusieurs atomes travaillant ensemble
- **Logique d'interaction** : Coordination entre atomes
- **Réutilisabilité contextuelle** : Réutilisables dans contextes similaires

**Exemples** :
- `SearchField.vue` : Input + Icon + Suggestions
- `FilterChip.vue` : Chip + logique de sélection
- `MetricCard.vue` : Card + Icon + formatage de données
- `ChartLegend.vue` : Liste de Chips + couleurs

**Règles** :
- ✅ Compose plusieurs atomes
- ✅ Logique de présentation simple
- ✅ Gestion d'état local
- ❌ Pas d'appels API directs
- ❌ Pas d'accès aux stores (sauf composables)

### 3. Organisms (Organismes) - 200-400 lignes

**Sections complètes et autonomes**

- **Sections de l'interface** : Parties distinctes de l'UI
- **Logique orchestrée** : Coordination de molécules
- **Possibilité d'accès aux stores** : Via composables

**Exemples** :
- `NavigationBar.vue` : Navigation complète avec slots
- `DataTable.vue` : Table triable et filtrable
- `FilterPanel.vue` : Panneau de filtres complet

**Règles** :
- ✅ Compose molécules et atomes
- ✅ Peut utiliser des composables
- ✅ Peut accéder aux stores (via composables)
- ⚠️ Appels API via composables uniquement
- ❌ Logique métier complexe dans le template

### 4. Features (Fonctionnalités) - 300-500 lignes

**Modules métier complets**

- **Logique métier** : Implémentation des règles métier
- **Gestion d'état** : Utilisation intensive des stores
- **Appels API** : Via services et composables
- **Orchestration** : Coordination de plusieurs organismes

**Exemples** :
- `analysis/dashboard/` : Dashboard d'analyse complet
- `evaluations/` : Gestion des évaluations
- `students/` : Gestion des étudiants
- `classes/` : Gestion des classes

**Organisation interne** :
```
features/analysis/
├── dashboard/
│   ├── DashboardContainer.vue
│   ├── DashboardRadarSection.vue
│   ├── DashboardDetailedSection.vue
│   └── hooks/
│       ├── useDashboardData.ts
│       ├── useDashboardCalculations.ts
│       └── useDashboardCharts.ts
├── DomainRadarChart.vue
└── DetailedAnalysisChart.vue
```

**Règles** :
- ✅ Compose organismes, molécules et atomes
- ✅ Logique métier complexe
- ✅ Appels API via services
- ✅ Accès complet aux stores
- ✅ Hooks/composables pour logique réutilisable

### 5. Layouts (Gabarits) - 200-300 lignes

**Structure de page complète**

- **Architecture de page** : Définit zones et disposition
- **Slots pour contenu** : Flexibilité maximale
- **Pas de logique métier** : Uniquement structure

**Exemples** :
- `MainLayout.vue` : Layout principal avec navigation, sidebar, contenu
- `AuthLayout.vue` : Layout centré pour authentification
- `PrintLayout.vue` : Layout optimisé pour impression

**Règles** :
- ✅ Définit structure via slots
- ✅ Styles de mise en page
- ✅ Responsive design
- ❌ Pas de logique métier
- ❌ Pas d'accès aux stores

## Bonnes pratiques

### Limites de taille

| Niveau | Lignes max | Raison |
|--------|-----------|--------|
| Atoms | 100 | Composant simple et focalisé |
| Molecules | 200 | Groupe fonctionnel clair |
| Organisms | 400 | Section complète mais maintenable |
| Features | 500 | Module métier avec hooks séparés |
| Layouts | 300 | Structure sans logique |

### Décomposition

**Quand créer un nouvel atom ?**
- Élément réutilisé 3+ fois
- Fonction UI de base (bouton, input, etc.)
- Besoin de variants standardisés

**Quand créer une molecule ?**
- Groupe de 2+ atoms avec fonction commune
- Pattern d'interaction répété
- Logique de présentation partagée

**Quand créer un organism ?**
- Section UI complète et autonome
- Besoin de coordination de molécules
- Réutilisable dans plusieurs pages

**Quand créer une feature ?**
- Module métier distinct
- Logique complexe nécessitant des hooks
- Nécessite accès à stores spécifiques

### Imports et exports

**Utiliser les barrel exports** :
```typescript
// atoms/index.ts
export { default as Button } from './Button.vue'
export { default as Input } from './Input.vue'

// Dans un composant
import { Button, Input } from '@/components/atoms'
```

### Composition

**Bottom-up (recommandé)** :
1. Créer les atoms nécessaires
2. Composer en molecules
3. Assembler en organisms
4. Intégrer dans features
5. Placer dans layouts

### Testing

- **Atoms** : Tests unitaires de props/events
- **Molecules** : Tests d'interaction entre atoms
- **Organisms** : Tests d'intégration
- **Features** : Tests E2E de fonctionnalités

## Migration depuis l'ancienne structure

### Étapes

1. ✅ Créer structure atomic design
2. ✅ Créer composants atoms de base
3. ✅ Créer composants molecules
4. ✅ Créer composants organisms
5. ✅ Déplacer features existantes
6. ✅ Créer layouts
7. ⏳ Mettre à jour imports dans views
8. ⏳ Tester et valider

### Mapping

```
Ancien → Nouveau
components/common/Button.vue → atoms/Button.vue
components/analysis/ChartCard.vue → molecules/MetricCard.vue
components/analysis/DomainRadarChart.vue → features/analysis/DomainRadarChart.vue
components/analysis/dashboard/ → features/analysis/dashboard/
```

## Avantages

1. **Maintenabilité** : Composants petits et focalisés
2. **Réutilisabilité** : Hiérarchie claire de composition
3. **Testabilité** : Composants isolés faciles à tester
4. **Scalabilité** : Structure qui grandit avec le projet
5. **Onboarding** : Nouvelle équipe comprend rapidement
6. **Design System** : Base naturelle pour système de design

## Ressources

- [Atomic Design par Brad Frost](https://atomicdesign.bradfrost.com/)
- [Material Design 3](https://m3.material.io/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
