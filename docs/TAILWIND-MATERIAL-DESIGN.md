# Tailwind CSS avec Material Design 3

## Vue d'ensemble

Ce projet utilise **Tailwind CSS v4** avec une configuration complète mappant les **variables Material Design 3** pour créer un système de design cohérent et maintenable.

## Structure des styles

```
src/styles/
├── tokens/                    # Variables Material Design
│   ├── colors.css            # Palette de couleurs MD3
│   ├── spacing.css           # Échelle d'espacement 4px
│   ├── typography.css        # Échelle typographique
│   └── shadows.css           # Système d'élévation
├── base/                     # Styles de base
│   ├── reset.css            # Reset CSS moderne
│   └── global.css           # Styles globaux
├── utilities/               # Utilitaires personnalisés
│   └── custom-utilities.css # Classes utilitaires MD3
├── themes/                  # Thèmes
│   ├── light.css           # Thème clair (défaut)
│   └── dark.css            # Thème sombre
└── main.css                # Point d'entrée principal
```

## Installation

```bash
npm install -D tailwindcss@latest @tailwindcss/postcss@latest autoprefixer@latest
```

## Configuration

### PostCSS Config

```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### Tailwind Config

[tailwind.config.js](../tailwind.config.js) mappe toutes les variables Material Design vers Tailwind.

## Tokens Material Design

### Couleurs

Toutes les couleurs Material Design 3 sont disponibles comme variables CSS et classes Tailwind:

```css
/* Variables CSS */
var(--md-sys-color-primary)
var(--md-sys-color-on-primary)
var(--md-sys-color-primary-container)
```

```html
<!-- Classes Tailwind -->
<div class="bg-md-primary text-md-on-primary">Primary</div>
<div class="bg-md-surface text-md-on-surface">Surface</div>
<div class="bg-md-error text-md-on-error">Error</div>
```

#### Palette complète

**Couleurs principales:**
- `md-primary` / `md-on-primary` / `md-primary-container` / `md-on-primary-container`
- `md-secondary` / `md-on-secondary` / `md-secondary-container` / `md-on-secondary-container`
- `md-tertiary` / `md-on-tertiary` / `md-tertiary-container` / `md-on-tertiary-container`

**Couleurs d'état:**
- `md-error` / `md-on-error` / `md-error-container` / `md-on-error-container`
- `md-success` / `md-on-success` / `md-success-container` / `md-on-success-container`
- `md-warning` / `md-on-warning` / `md-warning-container` / `md-on-warning-container`
- `md-info` / `md-on-info` / `md-info-container` / `md-on-info-container`

**Surfaces:**
- `md-surface` / `md-on-surface`
- `md-surface-variant` / `md-on-surface-variant`
- `md-surface-container` / `md-surface-container-low` / `md-surface-container-high`

**Background:**
- `md-background` / `md-on-background`

**Outline:**
- `md-outline` / `md-outline-variant`

### Espacement

Basé sur une grille de 4px:

```html
<!-- Variables CSS -->
<div style="padding: var(--md-sys-spacing-4)">16px</div>

<!-- Classes Tailwind -->
<div class="p-md-4 gap-md-3">Espacement MD</div>
<div class="md-container">Container avec max-width</div>
```

**Échelle disponible:**
- `md-0` = 0
- `md-1` = 4px
- `md-2` = 8px
- `md-3` = 12px
- `md-4` = 16px
- `md-5` = 20px
- `md-6` = 24px
- `md-8` = 32px
- `md-10` = 40px
- `md-12` = 48px
- `md-16` = 64px
- `md-20` = 80px
- `md-24` = 96px

### Typographie

Échelle complète Material Design 3:

```html
<!-- Classes Tailwind -->
<h1 class="text-md-display-large">Display Large</h1>
<h2 class="text-md-headline-medium">Headline Medium</h2>
<p class="text-md-body-large">Body Large</p>
<span class="text-md-label-medium">Label Medium</span>
```

**Échelles disponibles:**
- **Display**: `md-display-large` / `md-display-medium` / `md-display-small`
- **Headline**: `md-headline-large` / `md-headline-medium` / `md-headline-small`
- **Title**: `md-title-large` / `md-title-medium` / `md-title-small`
- **Body**: `md-body-large` / `md-body-medium` / `md-body-small`
- **Label**: `md-label-large` / `md-label-medium` / `md-label-small`

### Border Radius

```html
<div class="rounded-md-card">Card radius (12px)</div>
<button class="rounded-md-button">Button radius (16px)</button>
<input class="rounded-md-input">Input radius (4px)</input>
<div class="rounded-md-full">Fully rounded</div>
```

**Disponibles:**
- `md-none` = 0
- `md-xs` = 4px
- `md-sm` = 8px
- `md-md` = 12px
- `md-lg` = 16px
- `md-xl` = 28px
- `md-full` = 9999px
- Composants spécifiques: `md-button`, `md-card`, `md-chip`, `md-dialog`, `md-input`

### Élévations (Shadows)

```html
<div class="shadow-md-1">Élévation 1</div>
<div class="shadow-md-card hover:shadow-md-card-hover">Card avec hover</div>
<button class="shadow-md-button hover:shadow-md-button-hover">Button</button>
```

**Niveaux disponibles:**
- `md-0` à `md-5` (niveaux d'élévation)
- Composants: `md-card`, `md-button`, `md-dialog`, `md-navigation`, `md-fab`
- Variants hover: `md-card-hover`, `md-button-hover`, `md-fab-hover`

## Utilitaires personnalisés

### State Layer

Effet de survol Material Design:

```html
<button class="md-state-layer">
  Hover me
</button>
```

### Elevation Classes

```html
<div class="md-elevation-0">No shadow</div>
<div class="md-elevation-1">Level 1</div>
<div class="md-elevation-3">Level 3</div>
```

### Focus Ring

```html
<button class="focus:md-focus-ring">Focus ring externe</button>
<input class="focus:md-focus-ring-inset">Focus ring interne</input>
```

### Surface Utilities

```html
<div class="md-surface">Surface de base</div>
<div class="md-surface-variant">Surface variant</div>
<div class="md-surface-container">Surface container</div>
```

### Scrollbar Utilities

```html
<div class="md-scrollbar">Scrollbar stylisée MD</div>
<div class="md-scrollbar-hidden">Sans scrollbar</div>
```

### Truncate Text

```html
<p class="md-truncate-2">Texte tronqué à 2 lignes...</p>
<p class="md-truncate-3">Texte tronqué à 3 lignes...</p>
```

### Grid & Flex Utilities

```html
<div class="md-grid">Grid avec gap MD</div>
<div class="md-grid-auto">Grid auto-fit responsive</div>
<div class="md-flex">Flex avec gap MD</div>
<div class="md-flex-center">Flex centré</div>
```

### Ripple Effect

```html
<button class="md-ripple">Click for ripple</button>
```

### Container

```html
<div class="md-container">
  Conteneur centré avec max-width 1400px et padding responsive
</div>
```

## Thèmes

### Thème clair (défaut)

Appliqué automatiquement sur `:root`.

### Thème sombre

```html
<html data-theme="dark">
  <!-- Tout le contenu aura le thème sombre -->
</html>
```

Ou avec JavaScript:

```javascript
// Activer le thème sombre
document.documentElement.setAttribute('data-theme', 'dark')

// Désactiver (revenir au thème clair)
document.documentElement.setAttribute('data-theme', 'light')
// ou
document.documentElement.removeAttribute('data-theme')
```

### Toggle dynamique

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const isDark = ref(false)

watch(isDark, (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
})
</script>

<template>
  <button @click="isDark = !isDark">
    Toggle theme
  </button>
</template>
```

## Exemples d'utilisation

### Bouton Material Design

```html
<button
  class="
    bg-md-primary text-md-on-primary
    px-md-6 py-md-3
    rounded-md-button
    shadow-md-button hover:shadow-md-button-hover
    md-state-layer
    transition-all duration-md-medium
  "
>
  Click me
</button>
```

### Card Material Design

```html
<div
  class="
    md-surface
    rounded-md-card
    shadow-md-card hover:shadow-md-card-hover
    p-md-4
    transition-shadow duration-md-medium
  "
>
  <h3 class="text-md-title-large mb-md-2">Titre</h3>
  <p class="text-md-body-medium text-md-on-surface-variant">
    Contenu de la carte
  </p>
</div>
```

### Input Material Design

```html
<input
  type="text"
  class="
    w-full
    px-md-4 py-md-3
    rounded-md-input
    border border-md-outline
    focus:border-md-primary
    focus:md-focus-ring
    text-md-body-large
    bg-md-surface text-md-on-surface
  "
  placeholder="Enter text..."
/>
```

### Navigation Bar

```html
<nav
  class="
    md-surface
    shadow-md-navigation
    sticky top-0
    z-50
  "
>
  <div class="md-container">
    <div class="md-flex items-center justify-between py-md-3">
      <h1 class="text-md-title-large">App Name</h1>
      <!-- Actions -->
    </div>
  </div>
</nav>
```

## Animations

```html
<!-- Fade in -->
<div class="animate-md-fade-in">Fade in animation</div>

<!-- Slide in -->
<div class="animate-md-slide-in">Slide in animation</div>

<!-- Scale in -->
<div class="animate-md-scale-in">Scale in animation</div>
```

**Durées disponibles:**
- `duration-md-fast` = 100ms
- `duration-md-medium` = 200ms
- `duration-md-slow` = 300ms
- `duration-md-slower` = 500ms

## Responsive Design

Toutes les classes Tailwind fonctionnent avec les breakpoints standards:

```html
<div class="
  p-md-4 md:p-md-6 lg:p-md-8
  text-md-body-medium md:text-md-body-large
  bg-md-surface md:bg-md-surface-variant
">
  Responsive content
</div>
```

## Print Styles

```html
<div class="md-print-hidden">Caché à l'impression</div>
<div class="hidden md-print-visible">Visible uniquement à l'impression</div>
```

## Bonnes pratiques

### 1. Utiliser les tokens MD au lieu de valeurs arbitraires

```html
<!-- ✅ Bon -->
<div class="bg-md-primary text-md-on-primary">

<!-- ❌ Éviter -->
<div class="bg-[#2196f3] text-white">
```

### 2. Respecter l'échelle d'espacement

```html
<!-- ✅ Bon -->
<div class="p-md-4 gap-md-3">

<!-- ❌ Éviter -->
<div class="p-[17px] gap-[13px]">
```

### 3. Utiliser les utilitaires MD pour les composants

```html
<!-- ✅ Bon -->
<div class="md-surface rounded-md-card shadow-md-card">

<!-- ❌ Éviter -->
<div class="bg-white rounded-xl shadow-lg">
```

### 4. Combiner avec les composants atomiques

```vue
<template>
  <Button
    class="
      bg-md-secondary text-md-on-secondary
      px-md-6
    "
  >
    Custom styled button
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/atoms'
</script>
```

## Migration depuis style.css

L'ancien `style.css` a été remplacé par la nouvelle structure. Les variables Material Design restent compatibles:

```css
/* Avant */
.my-component {
  background-color: var(--md-sys-color-primary);
  padding: var(--md-sys-spacing-4);
}

/* Maintenant (classes Tailwind) */
<div class="bg-md-primary p-md-4">
```

## Support des navigateurs

- Chrome/Edge: 100%
- Firefox: 100%
- Safari: 100%
- Variables CSS: Tous les navigateurs modernes

## Ressources

- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Material Design 3](https://m3.material.io/)
- [Material Design Tokens](https://m3.material.io/foundations/design-tokens/overview)
