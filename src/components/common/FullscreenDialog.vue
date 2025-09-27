<template>
  <Transition name="fullscreen-dialog" appear>
    <div v-if="visible" class="fullscreen-dialog" @click.self="handleBackdropClick">
      <!-- App Bar -->
      <div class="fullscreen-app-bar">
        <div class="app-bar-leading">
          <button
            class="icon-btn"
            :disabled="isSaving"
            :aria-label="closeButtonLabel"
            @click="$emit('close')"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="icon">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
        <div class="app-bar-headline">
          <h1 class="app-bar-title">{{ title }}</h1>
          <p v-if="subtitle" class="app-bar-subtitle">{{ subtitle }}</p>
        </div>
        <div class="app-bar-trailing">
          <!-- Secondary Action Button (Optional) -->
          <button
            v-if="secondaryButtonText"
            class="text-button secondary-action"
            :disabled="isSaving || secondaryDisabled"
            @click="$emit('secondary-action')"
          >
            {{ secondaryButtonText }}
          </button>

          <!-- Primary Save Button -->
          <button
            class="text-button app-bar-action"
            :class="{ 'loading': isSaving }"
            :disabled="saveDisabled || isSaving"
            :aria-label="isSaving ? savingText : saveButtonText"
            @click="$emit('save')"
          >
            <div v-if="isSaving" class="loading-indicator">
              <svg class="spinner" viewBox="0 0 24 24">
                <circle
                  class="spinner-circle"
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <span class="loading-text">{{ savingText }}</span>
            </div>
            <span v-else>{{ saveButtonText }}</span>
          </button>
        </div>
      </div>

      <!-- Progress Bar (Optional) -->
      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>

      <!-- Content -->
      <div class="fullscreen-content">
        <div class="fullscreen-body" :class="{ 'compact': compact }">
          <!-- Header Slot (Optional) -->
          <header v-if="$slots.header" class="content-header">
            <slot name="header" />
          </header>

          <!-- Main Content -->
          <div class="content-main">
            <slot />
          </div>

          <!-- Footer Slot (Optional) -->
          <footer v-if="$slots.footer" class="content-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title: string
  subtitle?: string
  saveButtonText?: string
  savingText?: string
  saveDisabled?: boolean
  isSaving?: boolean
  secondaryButtonText?: string
  secondaryDisabled?: boolean
  closeButtonLabel?: string
  allowBackdropClose?: boolean
  showProgress?: boolean
  progress?: number
  compact?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save'): void
  (e: 'secondary-action'): void
}

const props = withDefaults(defineProps<Props>(), {
  saveButtonText: 'Enregistrer',
  savingText: 'Enregistrement...',
  saveDisabled: false,
  isSaving: false,
  secondaryDisabled: false,
  closeButtonLabel: 'Fermer',
  allowBackdropClose: false,
  showProgress: false,
  progress: 0,
  compact: false
})

const emit = defineEmits<Emits>()

const handleBackdropClick = () => {
  if (props.allowBackdropClose && !props.isSaving) {
    emit('close')
  }
}
</script>

<style scoped>
/* Transitions */
.fullscreen-dialog-enter-active,
.fullscreen-dialog-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fullscreen-dialog-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.fullscreen-dialog-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Full-screen Dialog */
.fullscreen-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: var(--md-sys-color-surface);
  display: flex;
  flex-direction: column;
  box-shadow:
    0px 24px 38px 3px rgba(0, 0, 0, 0.14),
    0px 9px 46px 8px rgba(0, 0, 0, 0.12),
    0px 11px 15px -7px rgba(0, 0, 0, 0.20);
}

/* App Bar */
.fullscreen-app-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 16px;
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  position: sticky;
  top: 0;
  z-index: 1;
}

.app-bar-leading {
  margin-right: 16px;
  flex-shrink: 0;
}

.app-bar-headline {
  flex: 1;
  min-width: 0;
}

.app-bar-title {
  font-family: var(--md-sys-typescale-title-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-large-size, 22px);
  font-weight: var(--md-sys-typescale-title-large-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 28px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-bar-subtitle {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-bar-trailing {
  margin-left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Buttons */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface);
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-btn:hover:not(:disabled) {
  background: var(--md-sys-color-surface-container-highest);
}

.icon-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.icon {
  width: 24px;
  height: 24px;
}

.text-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  color: var(--md-sys-color-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 40px;
  white-space: nowrap;
}

.text-button:hover:not(:disabled) {
  background: var(--md-sys-color-primary-container);
}

.text-button:disabled {
  color: rgba(var(--md-sys-color-on-surface-rgb, 29, 27, 32), 0.38);
  cursor: not-allowed;
}

.text-button:disabled:hover {
  background: none;
}

.app-bar-action {
  color: var(--md-sys-color-primary);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
}

.secondary-action {
  color: var(--md-sys-color-on-surface-variant);
}

/* Loading State */
.text-button.loading {
  pointer-events: none;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 31.416;
  stroke-dashoffset: 31.416;
  animation: dash 2s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.loading-text {
  font-size: inherit;
}

/* Progress Bar */
.progress-container {
  height: 4px;
  background: var(--md-sys-color-surface-container-highest);
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--md-sys-color-primary);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Content */
.fullscreen-content {
  flex: 1;
  overflow-y: auto;
  background: var(--md-sys-color-surface);
}

.fullscreen-body {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.fullscreen-body.compact {
  max-width: 600px;
  padding: 16px;
  gap: 16px;
}

.content-header {
  flex-shrink: 0;
}

.content-main {
  flex: 1;
}

.content-footer {
  flex-shrink: 0;
  margin-top: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .fullscreen-app-bar {
    padding: 0 8px;
    min-height: 56px;
  }

  .app-bar-leading {
    margin-right: 8px;
  }

  .app-bar-trailing {
    margin-left: 8px;
    gap: 4px;
  }

  .app-bar-title {
    font-size: 20px;
    line-height: 24px;
  }

  .fullscreen-body {
    padding: 16px;
    gap: 16px;
  }

  .fullscreen-body.compact {
    padding: 12px;
    gap: 12px;
  }

  .text-button {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .app-bar-trailing {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .text-button {
    min-height: 36px;
    padding: 6px 12px;
  }
}
</style>