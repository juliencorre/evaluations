<template>
  <div class="chart-card">
    <div class="card-header">
      <div v-if="hasHeaderSlot || title || subtitle" class="card-header-content">
        <div class="card-title-group">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
        <slot name="header-actions"></slot>
      </div>
    </div>
    <div class="chart-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined
})

const slots = useSlots()

const hasHeaderSlot = computed(() => {
  return !!slots['header-actions']
})
</script>

<style scoped>
.chart-card {
  background: var(--md-sys-color-surface-container-low, #ffffff);
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 12px;
  padding: 24px 16px;
  margin-bottom: 8px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.chart-card:hover {
  box-shadow:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.card-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #f0f0f0);
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.card-title-group {
  flex: 1;
}

.card-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.75rem;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0 0 8px 0;
}

.card-subtitle {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0;
}

.chart-content {
  /* Content styling handled by child components */
}

@media (max-width: 768px) {
  .chart-card {
    padding: 16px;
  }

  .card-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>