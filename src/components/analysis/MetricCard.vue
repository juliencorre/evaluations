<template>
  <div class="metric-card">
    <div class="metric-header">
      <svg class="metric-icon" viewBox="0 0 24 24" fill="currentColor">
        <path :d="iconPath" />
      </svg>
      <div class="metric-info">
        <span class="metric-label">{{ label }}</span>
        <span class="metric-value">{{ value }}</span>
      </div>
    </div>
    <div v-if="trend" class="metric-trend" :class="trendClass">
      <svg class="trend-icon" viewBox="0 0 24 24" fill="currentColor">
        <path :d="trendIconPath" />
      </svg>
      <span>{{ trend }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  iconPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: undefined,
  trendType: 'neutral',
  iconPath: 'M9,11H7v6h2V11zm4-4h-2v10h2V7zm4-3h-2v13h2V4z'
})

const trendClass = computed(() => {
  if (!props.trend) return ''
  return props.trendType
})

const trendIconPath = computed(() => {
  switch (props.trendType) {
    case 'positive':
      return 'M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z'
    case 'negative':
      return 'M16,18L18.29,15.71L13.41,10.83L9.41,14.83L2,7.41L3.41,6L9.41,12L13.41,8L19.71,14.29L22,12V18H16Z'
    default:
      return 'M7,10L12,15L17,10H7Z'
  }
})
</script>

<style scoped>
.metric-card {
  background: var(--md-sys-color-surface-container-low, #ffffff);
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 12px;
  padding: 24px 16px;
  margin-bottom: 8px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.metric-card:hover {
  box-shadow:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.metric-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.metric-icon {
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-primary, #6750a4);
  flex-shrink: 0;
  margin-top: 4px;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.metric-label {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.metric-value {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 2rem;
  font-weight: 400;
  line-height: 2.5rem;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.metric-trend.positive {
  color: var(--md-sys-color-success, #2d5a3d);
}

.metric-trend.negative {
  color: var(--md-sys-color-error, #8a3030);
}

.metric-trend.neutral {
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.trend-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 480px) {
  .metric-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .metric-icon {
    margin-top: 0;
  }
}
</style>