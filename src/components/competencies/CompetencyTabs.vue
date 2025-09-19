<template>
  <div class="competency-tabs-container">
    <div
      class="competency-tabs-bar"
      role="tablist"
      aria-label="Sélection de la section de compétences"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="competency-tab"
        :class="{ active: modelValue === tab.value }"
        role="tab"
        :aria-selected="modelValue === tab.value"
        @click="$emit('update:modelValue', tab.value)"
      >
        <span class="competency-tab-label">{{ tab.label }}</span>
        <div class="competency-tab-indicator"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TabItem } from '@/types/competency'

interface Props {
  tabs: TabItem[]
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.competency-tabs-container {
  margin: 16px 0 24px;
}

.competency-tabs-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.competency-tabs-bar::-webkit-scrollbar {
  display: none;
}

.competency-tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--md-sys-typescale-title-small-font);
  font-size: var(--md-sys-typescale-title-small-size);
  font-weight: var(--md-sys-typescale-title-small-weight);
  line-height: var(--md-sys-typescale-title-small-line-height);
  letter-spacing: 0.1px;
  color: var(--md-sys-color-on-surface-variant);
  white-space: nowrap;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  outline: none;
  overflow: hidden;
}

.competency-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.competency-tab:hover::before {
  opacity: var(--md-text-button-hover-state-layer-opacity);
}

.competency-tab:focus::before {
  opacity: var(--md-text-button-focus-state-layer-opacity);
}

.competency-tab:active::before {
  opacity: var(--md-text-button-pressed-state-layer-opacity);
}

.competency-tab.active {
  color: var(--md-sys-color-primary);
}

.competency-tab-label {
  position: relative;
  z-index: 1;
}

.competency-tab-indicator {
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 3px;
  background: var(--md-sys-color-primary);
  border-radius: 3px 3px 0 0;
  transform: scaleX(0);
  transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
}

.competency-tab.active .competency-tab-indicator {
  transform: scaleX(1);
}

@media (max-width: 768px) {
  .competency-tabs-container {
    margin: 12px 0 20px;
  }

  .competency-tab {
    min-width: 120px;
    padding: 12px 12px;
  }
}
</style>