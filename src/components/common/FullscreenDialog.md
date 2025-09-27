# FullscreenDialog - Composant transverse

Composant de dialogue plein écran conforme Material Design 3, réutilisable et extensible.

## 🎯 Fonctionnalités

- ✅ **Material Design 3** - Respect des guidelines MD3
- ✅ **Responsive** - S'adapte à tous les écrans
- ✅ **Accessible** - Support clavier et screen readers
- ✅ **Transitions fluides** - Animations intégrées
- ✅ **État de chargement** - Spinner et désactivation automatique
- ✅ **Slots flexibles** - Header, footer et contenu personnalisables
- ✅ **Actions secondaires** - Support de boutons supplémentaires
- ✅ **Barre de progression** - Pour les opérations longues

## 📝 API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `visible` | `boolean` | - | **Requis** - Contrôle la visibilité du dialogue |
| `title` | `string` | - | **Requis** - Titre du dialogue |
| `subtitle` | `string` | - | Sous-titre optionnel |
| `saveButtonText` | `string` | `'Enregistrer'` | Texte du bouton principal |
| `savingText` | `string` | `'Enregistrement...'` | Texte affiché pendant l'enregistrement |
| `saveDisabled` | `boolean` | `false` | Désactive le bouton principal |
| `isSaving` | `boolean` | `false` | Affiche l'état de chargement |
| `secondaryButtonText` | `string` | - | Texte du bouton secondaire |
| `secondaryDisabled` | `boolean` | `false` | Désactive le bouton secondaire |
| `closeButtonLabel` | `string` | `'Fermer'` | Label aria du bouton fermer |
| `allowBackdropClose` | `boolean` | `false` | Permet la fermeture en cliquant à l'extérieur |
| `showProgress` | `boolean` | `false` | Affiche la barre de progression |
| `progress` | `number` | `0` | Valeur de progression (0-100) |
| `compact` | `boolean` | `false` | Mode compact pour les petits formulaires |

### Events

| Event | Paramètres | Description |
|-------|------------|-------------|
| `close` | - | Émis quand l'utilisateur ferme le dialogue |
| `save` | - | Émis quand l'utilisateur clique sur sauvegarder |
| `secondary-action` | - | Émis quand l'utilisateur clique sur l'action secondaire |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Contenu principal du dialogue |
| `header` | En-tête du contenu (après l'app bar) |
| `footer` | Pied de page du contenu |

## 🚀 Exemples d'utilisation

### Exemple simple

```vue
<template>
  <FullscreenDialog
    :visible="showDialog"
    title="Ajouter un élément"
    save-button-text="Ajouter"
    :save-disabled="!isValid"
    @close="closeDialog"
    @save="saveItem"
  >
    <MyForm v-model="formData" />
  </FullscreenDialog>
</template>
```

### Exemple avec état de chargement

```vue
<template>
  <FullscreenDialog
    :visible="showDialog"
    title="Modification"
    subtitle="Mise à jour des données"
    save-button-text="Modifier"
    saving-text="Modification en cours..."
    :is-saving="isLoading"
    :save-disabled="!isValid || isLoading"
    @close="closeDialog"
    @save="updateItem"
  >
    <MyForm v-model="formData" />
  </FullscreenDialog>
</template>
```

### Exemple avec header et footer

```vue
<template>
  <FullscreenDialog
    :visible="showDialog"
    title="Configuration avancée"
    compact
    @close="closeDialog"
    @save="saveConfig"
  >
    <template #header>
      <div class="config-info">
        <p>Configurez les paramètres selon vos besoins.</p>
      </div>
    </template>

    <ConfigForm v-model="config" />

    <template #footer>
      <div class="validation-info">
        <p><span class="required">*</span> Champs obligatoires</p>
      </div>
    </template>
  </FullscreenDialog>
</template>
```

### Exemple avec action secondaire

```vue
<template>
  <FullscreenDialog
    :visible="showDialog"
    title="Éditeur de contenu"
    save-button-text="Publier"
    secondary-button-text="Brouillon"
    @close="closeDialog"
    @save="publish"
    @secondary-action="saveDraft"
  >
    <ContentEditor v-model="content" />
  </FullscreenDialog>
</template>
```

### Exemple avec barre de progression

```vue
<template>
  <FullscreenDialog
    :visible="showDialog"
    title="Import de données"
    save-button-text="Importer"
    :is-saving="isImporting"
    :show-progress="isImporting"
    :progress="importProgress"
    @close="closeDialog"
    @save="startImport"
  >
    <ImportConfiguration v-model="importConfig" />
  </FullscreenDialog>
</template>

<script setup>
const importProgress = ref(0)
const isImporting = ref(false)

const startImport = async () => {
  isImporting.value = true

  // Simulation de progression
  for (let i = 0; i <= 100; i += 10) {
    importProgress.value = i
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  isImporting.value = false
  // Fermer le dialogue ou afficher le succès
}
</script>
```

## 🎨 Personnalisation

### Classes CSS disponibles

- `.fullscreen-dialog` - Container principal
- `.fullscreen-app-bar` - Barre d'application
- `.app-bar-title` - Titre principal
- `.app-bar-subtitle` - Sous-titre
- `.fullscreen-content` - Zone de contenu
- `.fullscreen-body` - Corps du contenu
- `.content-header` - En-tête du contenu
- `.content-main` - Contenu principal
- `.content-footer` - Pied de page

### Variables CSS Material Design 3

Le composant utilise automatiquement les tokens de couleur MD3 :
- `--md-sys-color-surface`
- `--md-sys-color-on-surface`
- `--md-sys-color-primary`
- `--md-sys-color-outline-variant`
- etc.

## ♿ Accessibilité

- Support du clavier (Tab, Enter, Escape)
- Labels aria appropriés
- Focus management automatique
- Structure sémantique (header, main, footer)
- Contraste respectant WCAG 2.1

## 📱 Responsive

- Desktop : Largeur max 800px (600px en mode compact)
- Tablet : Adaptation automatique
- Mobile : Optimisations spécifiques (boutons plus petits, padding réduit)

## 🔧 Bonnes pratiques

1. **Utilisez `compact`** pour les petits formulaires simples
2. **Ajoutez des sous-titres** pour clarifier le contexte
3. **Utilisez les slots header/footer** pour les informations complémentaires
4. **Gérez l'état `isSaving`** pour une meilleure UX
5. **Désactivez `saveDisabled`** quand le formulaire n'est pas valide
6. **Utilisez la progression** pour les opérations longues

## 🔄 Migration depuis l'ancienne version

Remplacez :
```vue
<!-- Ancienne version -->
<FullscreenDialog
  :visible="show"
  title="Titre"
  save-button-text="Sauver"
  :save-disabled="invalid"
  @close="close"
  @save="save"
>
```

Par :
```vue
<!-- Nouvelle version (compatible) -->
<FullscreenDialog
  :visible="show"
  title="Titre"
  save-button-text="Sauver"
  :save-disabled="invalid"
  @close="close"
  @save="save"
>
```

Toutes les props existantes restent compatibles ! 🎉