<template>
  <div class="evaluation-tabs-container">
    <div
      class="evaluation-tabs-bar"
      role="tablist"
      aria-label="Sélection de l'évaluation"
    >
      <button
        v-for="evaluation in evaluations"
        :key="evaluation.id"
        type="button"
        class="evaluation-tab"
        :class="{ active: modelValue === evaluation.id }"
        role="tab"
        :aria-selected="modelValue === evaluation.id"
        @click="$emit('update:modelValue', evaluation.id)"
      >
        <span class="evaluation-tab-label">{{ evaluation.name }}</span>
        <div class="evaluation-tab-indicator"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Evaluation } from '@/types/evaluation'

interface Props {
  evaluations: Evaluation[]
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', id: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.evaluation-tabs-container {
  margin: 16px 0 24px;
}

.evaluation-tabs-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.evaluation-tabs-bar::-webkit-scrollbar {
  display: none;
}

.evaluation-tab {
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

.evaluation-tab::before {
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

.evaluation-tab:hover::before {
  opacity: var(--md-text-button-hover-state-layer-opacity);
}

.evaluation-tab:focus::before {
  opacity: var(--md-text-button-focus-state-layer-opacity);
}

.evaluation-tab:active::before {
  opacity: var(--md-text-button-pressed-state-layer-opacity);
}

.evaluation-tab.active {
  color: var(--md-sys-color-primary);
}

.evaluation-tab-label {
  position: relative;
  z-index: 1;
}

.evaluation-tab-indicator {
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

.evaluation-tab.active .evaluation-tab-indicator {
  transform: scaleX(1);
}

@media (max-width: 768px) {
  .evaluation-tabs-container {
    margin: 12px 0 20px;
  }

  .evaluation-tab {
    min-width: 120px;
    padding: 12px 12px;
  }
}
</style>