<template>
  <div class="settings-dialog">
    <!-- Dialog Header -->
    <header class="dialog-header">
      <button
        class="dialog-close-button"
        aria-label="Fermer les paramètres"
        @click="handleClose"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <h1 class="dialog-title">Paramètres</h1>

      <div class="dialog-spacer"></div>
    </header>

    <!-- Dialog Content -->
    <main class="dialog-content" role="main">
      <SettingsSection
        id="appearance-settings"
        title="Apparence"
      >
        <ul class="md3-list" role="list">
          <li class="md3-list-item" role="listitem">
            <div class="md3-list-item__content">
              <div class="md3-list-item__headline">Mode sombre</div>
            </div>
            <div class="md3-list-item__trailing">
              <SettingsSwitch
                id="dark-mode-switch"
                v-model="darkModeModel"
                aria-describedby="appearance-settings-title"
              />
            </div>
          </li>
        </ul>
      </SettingsSection>

      <SettingsSection
        id="console-settings"
        title="Console"
      >
        <ul class="md3-list" role="list">
          <li class="md3-list-item" role="listitem">
            <div class="md3-list-item__content">
              <div class="md3-list-item__headline">Afficher les logos</div>
            </div>
            <div class="md3-list-item__trailing">
              <SettingsSwitch
                id="console-logos-switch"
                v-model="consoleLogoModel"
                aria-describedby="console-settings-title"
              />
            </div>
          </li>
        </ul>
      </SettingsSection>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settingsStore'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import SettingsSwitch from '@/components/settings/SettingsSwitch.vue'

const router = useRouter()
const { showConsoleLogos, setShowConsoleLogos, isDarkThemeEnabled, setThemePreference } = useSettingsStore()

const isConsoleLogoEnabled = computed(() => showConsoleLogos.value)
const isDarkModeEnabled = computed(() => isDarkThemeEnabled.value)

const darkModeModel = computed({
  get: () => isDarkModeEnabled.value,
  set: (value: boolean) => setThemePreference(value ? 'dark' : 'light')
})

const consoleLogoModel = computed({
  get: () => isConsoleLogoEnabled.value,
  set: (value: boolean) => setShowConsoleLogos(value)
})

// Event handlers
const handleClose = () => {
  router.back()
}
</script>

<style scoped>
/* Full Dialog Container */
.settings-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  background: var(--md-sys-color-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Dialog Header */
.dialog-header {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 4px;
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  flex-shrink: 0;
}

.dialog-close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  margin: 8px;
}

.dialog-close-button:hover {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  color: var(--md-sys-color-on-surface);
}

.dialog-close-button:focus {
  outline: none;
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}

.dialog-close-button .material-symbols-outlined {
  font-size: 24px;
}

.dialog-title {
  flex: 1;
  text-align: center;
  font-family: var(--md-sys-typescale-title-large-font);
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  line-height: var(--md-sys-typescale-title-large-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.dialog-spacer {
  width: 48px;
  height: 48px;
  margin: 8px;
}

/* Dialog Content */
.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 24px 80px;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

@media (max-width: 768px) {
  .dialog-content {
    padding: 24px 16px 80px;
  }
}

@media (max-width: 480px) {
  .dialog-content {
    padding: 24px 12px 80px;
  }

  .dialog-title {
    font-size: var(--md-sys-typescale-title-medium-size);
    line-height: var(--md-sys-typescale-title-medium-line-height);
  }
}

/* Material Design 3 Lists */
.md3-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--md-sys-color-surface);
}

.md3-list-item {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 8px 16px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.md3-list-item:hover {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.md3-list-item:focus {
  outline: none;
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}

.md3-list-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding-right: 16px;
}

.md3-list-item__headline {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
}

.md3-list-item__trailing {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>