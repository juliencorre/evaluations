<template>
  <div class="settings-page">
    <SettingsAppBar title="Paramètres" />

    <main class="settings-content" role="main">
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
import { useSettingsStore } from '@/stores/settingsStore'
import SettingsAppBar from '@/components/settings/SettingsAppBar.vue'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import SettingsSwitch from '@/components/settings/SettingsSwitch.vue'

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

@media (max-width: 768px) {
  .settings-content {
    padding: 24px 16px 24px;
  }
}

@media (max-width: 480px) {
  .settings-content {
    padding: 24px 12px 24px;
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