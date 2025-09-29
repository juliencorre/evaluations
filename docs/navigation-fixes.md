# Corrections de Navigation - Material Design 3

## Problèmes résolus

### 1. Navigation Rail corrigé selon MD3
- **Largeur fixe** : 80px (ne s'expand plus - conforme MD3)
- **Breakpoint** : 840px au lieu de 1440px
- **Suppression** du bouton menu toggle (non conforme MD3)
- **Indicateur actif** : Pill shape 56×32px derrière l'icône
- **Labels** : Toujours visibles sous les icônes

### 2. Bouton de retour dans l'app bar
- **Ajouté** sur toutes les pages de détail
- **Icône SVG** cohérente avec le design Material
- **Position fixe** avec ajustement pour le navigation rail

## Pages affectées

### Pages avec bouton de retour :
- `/classes/:id/students` - Gestion des élèves d'une classe
- `/classes/:id` - Détails d'une classe
- `/evaluations/:id` - Détails d'une évaluation
- Toutes les pages de niveau 2+ dans la hiérarchie

## Ajustements CSS

### CenterAppBar
```css
/* Ajustement pour le navigation rail */
@media (min-width: 840px) {
  .app-bar {
    left: 80px; /* Compte pour la largeur du rail */
  }
}
```

### App.vue
```css
/* Layout avec navigation rail */
@media (min-width: 840px) {
  #app {
    padding-left: 80px; /* Largeur fixe MD3 */
  }
}
```

## Navigation Flow

### Desktop (≥840px)
```
Navigation Rail (80px) | Content Area
     [Home]           |   [← Back] Page Title
   [Classes]          |     Content...
 [Evaluations]        |
   [Students]         |
   [Analysis]         |
```

### Mobile (<840px)
```
Bottom Navigation Bar
[Home] [Classes] [Evaluations] [Students] [Analysis]
```

## Comportement du bouton retour

### ClassStudentsView
- Retour vers `/classes` (liste des classes)
- Navigation programmatique avec `router.push()`

### ClassDetailView
- Retour avec `$router.back()` (historique du navigateur)
- Retour naturel à la page précédente

## Standards Material Design 3

### Navigation Rail
- **Largeur** : 80px fixe
- **Destinations** : 3-7 items max
- **Hauteur item** : 56px avec label
- **Indicateur** : Secondary container, pill shape
- **États** : Hover (8%), Pressed (12%), Selected

### App Bar
- **Hauteur** : 64px
- **Leading icon** : 48×48px zone tactile
- **Padding** : 16px horizontal
- **Z-index** : 900 (sous le rail à 1000)

## Tests recommandés

1. Vérifier le bouton retour sur toutes les pages de détail
2. Tester la navigation sur desktop (≥840px) et mobile
3. Vérifier l'alignement avec le navigation rail
4. Tester les transitions et animations
5. Vérifier l'accessibilité (focus, aria-labels)

## Notes

- Le navigation rail NE S'EXPAND PAS selon MD3 (erreur commune)
- Les labels sont TOUJOURS visibles dans le rail
- Le bouton retour doit être cohérent sur toutes les pages
- L'app bar doit s'ajuster au navigation rail sur desktop