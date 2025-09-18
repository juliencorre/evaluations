<template>
  <div v-if="modelValue" class="fullscreen-dialog">
    <!-- App Bar -->
    <div class="fullscreen-app-bar">
      <div class="app-bar-leading">
        <button class="icon-btn" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="app-bar-headline">
        <h1 class="app-bar-title">{{ title }}</h1>
      </div>
      <div class="app-bar-trailing">
        <button
          class="text-button app-bar-action"
          :disabled="saveDisabled"
          @click="$emit('save')"
        >
          <span v-if="!isSaving">{{ saveButtonText }}</span>
          <span v-else>{{ savingText }}</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="fullscreen-content">
      <div class="fullscreen-body">
        <slot />
      </div>
    </div>

    <!-- Bottom Handle Bar -->
    <div class="fullscreen-handle-bar"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  saveButtonText?: string
  savingText?: string
  saveDisabled?: boolean
  isSaving?: boolean
}

withDefaults(defineProps<Props>(), {
  saveButtonText: 'Enregistrer',
  savingText: 'Enregistrement...',
  saveDisabled: false,
  isSaving: false
})

defineEmits<{
  close: []
  save: []
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
/* Full-screen Dialog Styles */
.fullscreen-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-surface, #fef7ff);
  z-index: 1100; /* Au-dessus du menu bottom (z-index: 1000) */
  display: flex;
  flex-direction: column;
  animation: fullscreenSlideIn 0.3s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes fullscreenSlideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* App Bar */
.fullscreen-app-bar {
  height: 64px;
  background: var(--md-sys-color-surface, #fef7ff);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  display: flex;
  align-items: center;
  padding: 0 4px;
  flex-shrink: 0;
}

.app-bar-leading {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.app-bar-headline {
  flex: 1;
  margin-left: 8px;
}

.app-bar-title {
  font-family: 'Roboto', sans-serif;
  font-size: 22px;
  font-weight: 400;
  line-height: 28px;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.app-bar-trailing {
  display: flex;
  align-items: center;
  margin-left: 16px;
  margin-right: 12px;
}

.app-bar-action {
  margin: 0;
}

.app-bar-action:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

/* Content */
.fullscreen-content {
  flex: 1;
  overflow-y: auto;
  background: var(--md-sys-color-surface);
}

.fullscreen-body {
  max-width: 840px;
  margin: 0 auto;
  padding: 24px;
}

/* Icon Button */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  color: var(--md-sys-color-on-surface-variant);
  position: relative;
}

.icon-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border-radius: 50%;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.icon-btn:hover::before {
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0.08;
}

.icon-btn:focus::before {
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0.12;
}

.icon-btn:active::before {
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0.12;
}

.icon-btn .material-symbols-outlined {
  font-size: 20px;
}

/* Text Button */
.text-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--md-sys-color-primary);
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
  min-height: 40px;
}

.text-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-primary);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-button:hover::before {
  opacity: 0.08;
}

.text-button:focus::before {
  opacity: 0.12;
}

.text-button:active::before {
  opacity: 0.12;
}

.text-button:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

/* Bottom Handle Bar */
.fullscreen-handle-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 4px;
  background: var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 2px;
  flex-shrink: 0;
}

/* Large Screen with Navigation Rail */
@media (min-width: 1440px) {
  .fullscreen-dialog {
    left: 0; /* Recouvre entièrement l'écran, y compris la navigation rail */
  }
}

/* Responsive */
@media (max-width: 840px) {
  .fullscreen-body {
    padding: 16px;
  }

  .app-bar-title {
    font-size: 20px;
  }

  .fullscreen-handle-bar {
    width: 240px; /* Plus petit sur mobile */
  }
}
</style>