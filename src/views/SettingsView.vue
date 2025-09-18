<template>
  <main class="settings-page" role="main">
    <section class="settings-header">
      <h1 class="settings-title">Paramètres</h1>
      <p class="settings-subtitle">
        Personnalisez votre expérience et contrôlez les options de l'application.
      </p>
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
            :aria-checked="String(isConsoleLogoEnabled)"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

const { showConsoleLogos, setShowConsoleLogos } = useSettingsStore()

const isConsoleLogoEnabled = computed(() => showConsoleLogos.value)

const handleConsoleLogoToggle = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }

  setShowConsoleLogos(target.checked)
}
</script>

<style scoped>
.settings-page {
  padding: 104px 24px 120px;
  max-width: 960px;
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
  background: #ffffff;
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
  background: #ffffff;
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
  .settings-page {
    padding: 88px 16px 112px;
  }

  .setting-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .settings-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
