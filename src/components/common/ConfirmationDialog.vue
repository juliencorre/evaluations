<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-scrim" @click="$emit('close')">
      <div class="dialog-container alert-dialog" @click.stop>
        <div class="dialog-header">
          <span class="dialog-icon alert-icon">
            <span class="material-symbols-outlined">warning</span>
          </span>
          <h2 class="dialog-headline">{{ title }}</h2>
        </div>

        <div class="dialog-content">
          <p class="dialog-supporting-text">{{ message }}</p>
          <p v-if="warningText" class="dialog-warning-text">{{ warningText }}</p>
        </div>

        <div class="dialog-actions">
          <button class="text-button" @click="$emit('close')">
            {{ cancelText }}
          </button>
          <button class="text-button destructive-action" @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title: string
  message: string
  warningText?: string
  confirmText?: string
  cancelText?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Supprimer',
  cancelText: 'Annuler',
  warningText: ''
})

defineEmits<Emits>()
</script>

<style scoped>
/* Dialog Scrim */
.dialog-scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2100;
  background: rgba(0, 0, 0, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  /* Ensure backdrop doesn't affect dialog content */
  backdrop-filter: none;
}

/* Dialog Container */
.dialog-container {
  background: #ffffff;
  border-radius: 28px;
  min-width: 280px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow:
    0px 8px 10px -5px rgba(0, 0, 0, 0.2),
    0px 16px 24px 2px rgba(0, 0, 0, 0.14),
    0px 6px 30px 5px rgba(0, 0, 0, 0.12);
  /* Force light theme for confirmation dialogs to ensure readability */
  color: #1d1b20;
}

/* Remove color inheritance from parent themes */
.dialog-container * {
  color: inherit;
}

.alert-dialog {
  max-width: 360px;
}

/* Dialog Header */
.dialog-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 16px;
  text-align: center;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.alert-icon {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-error);
}

.dialog-icon .material-symbols-outlined {
  font-size: 24px;
}

.dialog-headline {
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

/* Dialog Content */
.dialog-content {
  padding: 0 24px 16px;
  text-align: center;
}

.dialog-supporting-text {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 12px 0;
}

.dialog-warning-text {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-error);
  margin: 8px 0 0 0;
  font-style: italic;
}

/* Dialog Actions */
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px 24px;
}

.text-button {
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.text-button:hover {
  background: var(--md-sys-color-primary-container);
}

.destructive-action {
  color: var(--md-sys-color-error);
}

.destructive-action:hover {
  background: var(--md-sys-color-error-container);
}

/* Responsive */
@media (max-width: 480px) {
  .dialog-scrim {
    padding: 8px;
  }

  .dialog-container {
    min-width: 280px;
  }

  .dialog-header {
    padding: 20px 20px 12px;
  }

  .dialog-content {
    padding: 0 20px 12px;
  }

  .dialog-actions {
    padding: 12px 20px 20px;
    flex-direction: column-reverse;
  }

  .text-button {
    width: 100%;
  }
}
</style>