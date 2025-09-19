<template>
  <button
    v-if="visible"
    :class="[label ? 'extended-fab' : 'fab']"
    :aria-label="ariaLabel || label || `${icon} button`"
    @click="$emit('click')"
  >
    <span class="material-symbols-outlined fab-icon">{{ icon }}</span>
    <span v-if="label" class="fab-label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  label?: string
  visible?: boolean
  ariaLabel?: string
}

interface Emits {
  (e: 'click'): void
}

withDefaults(defineProps<Props>(), {
  visible: true
})

defineEmits<Emits>()
</script>

<style scoped>
/* Material 3 FAB (regular - no text) */
.fab {
  position: fixed;
  bottom: 120px; /* Above bottom navigation */
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 6px 10px 0px rgba(0, 0, 0, 0.14),
    0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.fab:hover {
  background: color-mix(in srgb, var(--md-sys-color-primary-container, #eaddff) 92%, var(--md-sys-color-on-primary-container, #21005d) 8%);
  box-shadow:
    0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14),
    0px 1px 10px 0px rgba(0, 0, 0, 0.12);
}

.fab:focus-visible {
  outline: 2px solid var(--md-sys-color-primary, #6750a4);
  outline-offset: 2px;
}

.fab:active {
  background: color-mix(in srgb, var(--md-sys-color-primary-container, #eaddff) 88%, var(--md-sys-color-on-primary-container, #21005d) 12%);
  box-shadow:
    0px 5px 5px -3px rgba(0, 0, 0, 0.2),
    0px 8px 10px 1px rgba(0, 0, 0, 0.14),
    0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}

/* Material 3 Extended FAB */
.extended-fab {
  position: fixed;
  bottom: 120px; /* Above bottom navigation */
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 16px 24px;
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 6px 10px 0px rgba(0, 0, 0, 0.14),
    0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.extended-fab:hover {
  background: color-mix(in srgb, var(--md-sys-color-primary-container, #eaddff) 92%, var(--md-sys-color-on-primary-container, #21005d) 8%);
  box-shadow:
    0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14),
    0px 1px 10px 0px rgba(0, 0, 0, 0.12);
}

.extended-fab:focus-visible {
  outline: 2px solid var(--md-sys-color-primary, #6750a4);
  outline-offset: 2px;
}

.extended-fab:active {
  background: color-mix(in srgb, var(--md-sys-color-primary-container, #eaddff) 88%, var(--md-sys-color-on-primary-container, #21005d) 12%);
  box-shadow:
    0px 5px 5px -3px rgba(0, 0, 0, 0.2),
    0px 8px 10px 1px rgba(0, 0, 0, 0.14),
    0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.fab-icon {
  font-size: 24px;
}

.fab-label {
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .fab {
    right: 16px;
    bottom: 104px;
  }

  .extended-fab {
    right: 16px;
    bottom: 104px;
  }
}

@media (min-width: 1440px) {
  .fab {
    bottom: 24px; /* No bottom navigation on desktop */
  }

  .extended-fab {
    bottom: 24px; /* No bottom navigation on desktop */
  }
}
</style>