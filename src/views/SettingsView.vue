<template>
  <div class="settings-page">
    <!-- Center-aligned App Bar -->
    <header class="app-bar" :class="{ 'app-bar--elevated': isScrolled }">
      <div class="app-bar__leading">
        <!-- Empty leading section for balance -->
      </div>

      <div class="app-bar__title">
        <h1 class="app-bar__title-text">Paramètres</h1>
      </div>

      <div class="app-bar__trailing">
        <button class="icon-button" aria-label="Rechercher">
          <span class="material-symbols-outlined">search</span>
        </button>
        <button class="icon-button user-menu-button" aria-label="Menu utilisateur">
          <span class="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>

    <main class="settings-content" role="main">

      <section class="settings-section" aria-labelledby="appearance-settings-title">
        <div class="section-header">
          <h2 id="appearance-settings-title" class="section-title">Apparence</h2>
          <p class="section-description">
            Choisissez entre le mode clair et le mode sombre pour adapter l'interface à votre environnement.
          </p>
        </div>

        <article class="setting-card" aria-live="polite">
          <div class="setting-card__content">
            <h3 class="setting-card__title">Activer le mode sombre</h3>
            <p class="setting-card__description">
              Utilisez ce paramètre pour basculer l'application vers un thème sombre plus confortable dans les environnements peu lumineux.
            </p>
            <p class="setting-card__status" :class="{ 'is-enabled': isDarkModeEnabled }">
              {{ isDarkModeEnabled ? 'Activé' : 'Désactivé' }}
            </p>
          </div>

          <label class="md3-switch">
            <input
              id="dark-mode-switch"
              type="checkbox"
              role="switch"
              :checked="isDarkModeEnabled"
              :aria-checked="darkModeAriaChecked"
              aria-describedby="appearance-settings-title"
              @change="handleDarkModeToggle"
            />
            <span class="md3-switch__track">
              <span class="md3-switch__handle"></span>
            </span>
          </label>
        </article>
      </section>

      <section class="settings-section" aria-labelledby="console-settings-title">
        <div class="section-header">
          <h2 id="console-settings-title" class="section-title">Console</h2>
          <p class="section-description">
            Gérez l'affichage des éléments décoratifs présents dans les journaux de l'application.
          </p>
        </div>

        <article class="setting-card" aria-live="polite">
          <div class="setting-card__content">
            <h3 class="setting-card__title">Afficher les logos dans la console</h3>
            <p class="setting-card__description">
              Activez cette option pour conserver les icônes et les indicateurs visuels dans les messages de journalisation.
              Lorsqu'elle est désactivée, seuls les messages textuels sont affichés pour une lecture plus sobre.
            </p>
            <p class="setting-card__status" :class="{ 'is-enabled': isConsoleLogoEnabled }">
              {{ isConsoleLogoEnabled ? 'Activé' : 'Désactivé' }}
            </p>
          </div>

          <label class="md3-switch">
            <input
              id="console-logos-switch"
              type="checkbox"
              role="switch"
              :checked="isConsoleLogoEnabled"
              :aria-checked="consoleLogoAriaChecked"
              aria-describedby="console-settings-title"
              @change="handleConsoleLogoToggle"
            />
            <span class="md3-switch__track">
              <span class="md3-switch__handle"></span>
            </span>
          </label>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

// Scroll state for app bar elevation
const isScrolled = ref(false)

// Handle scroll events
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

// Set up scroll listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Check initial scroll position
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const { showConsoleLogos, setShowConsoleLogos, isDarkThemeEnabled, setThemePreference } = useSettingsStore()

const isConsoleLogoEnabled = computed(() => showConsoleLogos.value)
const isDarkModeEnabled = computed(() => isDarkThemeEnabled.value)

const consoleLogoAriaChecked = computed<'true' | 'false'>(() =>
  isConsoleLogoEnabled.value ? 'true' : 'false'
)

const darkModeAriaChecked = computed<'true' | 'false'>(() =>
  isDarkModeEnabled.value ? 'true' : 'false'
)

const handleDarkModeToggle = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }

  setThemePreference(target.checked ? 'dark' : 'light')
}

const handleConsoleLogoToggle = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }

  setShowConsoleLogos(target.checked)
}
</script>

<style scoped>
/* Page container */
.settings-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  /* Add top padding to account for fixed app bar */
  padding-top: 64px;
}

/* Material 3 Center-aligned App Bar */
.app-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 4px;
  /* Initially same color as background */
  background: transparent;
  color: var(--md-sys-color-on-surface);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  /* No initial shadow/border */
}

/* Elevated state on scroll - contrasting color and elevation */
.app-bar--elevated {
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level2,
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3)
  );
}

/* App bar sections */
.app-bar__leading {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 48px; /* Balance trailing section */
}

.app-bar__title {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

.app-bar__title-text {
  font-family: var(--md-sys-typescale-title-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-large-size, 22px);
  font-weight: var(--md-sys-typescale-title-large-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 28px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
  text-align: center;
}

.app-bar__trailing {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 0 4px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.icon-button:hover::before {
  opacity: 0.08;
}

.icon-button:focus {
  outline: none;
}

.icon-button:focus::before {
  opacity: 0.12;
}

.icon-button .material-symbols-outlined {
  font-size: 24px;
  z-index: 1;
}

/* User menu button styling */
.user-menu-button {
  color: var(--md-sys-color-primary, #6750a4);
}

.user-menu-button .material-symbols-outlined {
  font-size: 32px;
}

/* Responsive design */
@media (max-width: 599px) {
  .app-bar {
    padding: 0;
  }

  .app-bar__title-text {
    font-size: var(--md-sys-typescale-title-medium-size, 16px);
    line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  }

  .icon-button {
    width: 40px;
    height: 40px;
  }

  .icon-button .material-symbols-outlined {
    font-size: 20px;
  }

  .user-menu-button .material-symbols-outlined {
    font-size: 28px;
  }
}
.settings-content {
  flex: 1;
  padding: 32px 24px 24px;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.settings-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1b1c1c);
  margin: 0;
}

.settings-subtitle {
  font-size: 1rem;
  color: var(--md-sys-color-on-surface-variant, #3f4948);
  margin: 0;
  max-width: 720px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1b1c1c);
  margin: 0;
}

.section-description {
  font-size: 0.95rem;
  color: var(--md-sys-color-on-surface-variant, #3f4948);
  margin: 0;
  max-width: 720px;
}

.setting-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 28px 32px;
  border-radius: 24px;
  background: var(--md-sys-color-surface, #ffffff);
  box-shadow:
    0px 1px 3px rgba(0, 0, 0, 0.15),
    0px 1px 2px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--md-sys-color-outline-variant, #dbe4e4);
}

.setting-card__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.setting-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1b1c1c);
  margin: 0;
}

.setting-card__description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--md-sys-color-on-surface-variant, #3f4948);
  margin: 0;
}

.setting-card__status {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant, #3f4948);
  margin: 0;
}

.setting-card__status.is-enabled {
  color: var(--md-sys-color-primary, #006a6b);
}

.md3-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.md3-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.md3-switch__track {
  position: relative;
  width: 52px;
  height: 32px;
  background: color-mix(in srgb, var(--md-sys-color-surface-variant, #dbe4e4) 80%, transparent);
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  transition:
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-outline-variant, #bfc8c7) 60%, transparent);
}

.md3-switch__handle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--md-sys-color-surface);
  box-shadow:
    0px 1px 3px rgba(0, 0, 0, 0.15),
    0px 1px 2px rgba(0, 0, 0, 0.3);
  transform: translateX(0);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.md3-switch input:checked + .md3-switch__track {
  background: var(--md-sys-color-primary, #006a6b);
  box-shadow: none;
}

.md3-switch input:checked + .md3-switch__track .md3-switch__handle {
  transform: translateX(20px);
  background: var(--md-sys-color-on-primary);
}

.md3-switch input:focus-visible + .md3-switch__track {
  outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary, #006a6b) 40%, transparent);
  outline-offset: 4px;
}

.md3-switch input:disabled + .md3-switch__track {
  cursor: not-allowed;
  opacity: 0.38;
}

@media (max-width: 768px) {
  .settings-content {
    padding: 24px 16px 24px;
  }

  .setting-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .settings-content {
    padding: 24px 12px 24px;
  }

  .settings-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
