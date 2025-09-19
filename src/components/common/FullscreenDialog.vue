<template>
  <div v-if="visible" class="fullscreen-dialog">
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
          {{ saveButtonText }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="fullscreen-content">
      <div class="fullscreen-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title: string
  saveButtonText?: string
  saveDisabled?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save'): void
}

withDefaults(defineProps<Props>(), {
  saveButtonText: 'Enregistrer',
  saveDisabled: false
})

defineEmits<Emits>()
</script>

<style scoped>
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
}

/* App Bar */
.fullscreen-app-bar {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 16px;
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  position: sticky;
  top: 0;
  z-index: 1;
}

.app-bar-leading {
  margin-right: 16px;
}

.app-bar-headline {
  flex: 1;
}

.app-bar-title {
  font-family: var(--md-sys-typescale-title-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-large-size, 22px);
  font-weight: var(--md-sys-typescale-title-large-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 28px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.app-bar-trailing {
  margin-left: 16px;
}

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

.icon-btn:hover {
  background: var(--md-sys-color-surface-container-highest);
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

.text-button:disabled {
  color: var(--md-sys-color-on-surface, rgba(29, 27, 32, 0.38));
  cursor: not-allowed;
}

.text-button:disabled:hover {
  background: none;
}

.app-bar-action {
  color: var(--md-sys-color-primary);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
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
}

/* Responsive */
@media (max-width: 768px) {
  .fullscreen-app-bar {
    padding: 0 8px;
  }

  .app-bar-leading {
    margin-right: 8px;
  }

  .app-bar-trailing {
    margin-left: 8px;
  }

  .fullscreen-body {
    padding: 16px;
  }
}
</style>