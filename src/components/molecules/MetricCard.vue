<template>
  <Card :variant="variant" :hoverable="hoverable" class="metric-card">
    <div class="metric-header">
      <Icon v-if="icon" :icon="icon" :color="iconColor" size="large" />
      <h3 class="metric-title">{{ title }}</h3>
    </div>

    <div class="metric-value">
      <span class="metric-number">{{ formattedValue }}</span>
      <span v-if="unit" class="metric-unit">{{ unit }}</span>
    </div>

    <div v-if="change !== undefined" class="metric-change" :class="changeClass">
      <Icon :icon="changeIcon" size="small" />
      <span>{{ changeText }}</span>
    </div>

    <p v-if="description" class="metric-description">{{ description }}</p>

    <div v-if="$slots.actions" class="metric-actions">
      <slot name="actions" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '../atoms/Card.vue'
import Icon from '../atoms/Icon.vue'

interface Props {
  title: string
  value: number
  unit?: string
  icon?: string
  iconColor?: string
  description?: string
  change?: number
  variant?: 'elevated' | 'filled' | 'outlined'
  hoverable?: boolean
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'elevated',
  hoverable: false,
  decimals: 0
})

const formattedValue = computed(() => {
  return props.value.toFixed(props.decimals)
})

const changeClass = computed(() => {
  if (props.change === undefined) return ''
  return props.change >= 0 ? 'metric-change--positive' : 'metric-change--negative'
})

const changeIcon = computed(() => {
  if (props.change === undefined) return ''
  return props.change >= 0 ? '↑' : '↓'
})

const changeText = computed(() => {
  if (props.change === undefined) return ''
  const absChange = Math.abs(props.change)
  return `${absChange.toFixed(1)}%`
})
</script>

<style scoped>
.metric-card {
  min-width: 200px;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant, #666);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.metric-number {
  font-size: 32px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1d1d1d);
  line-height: 1;
}

.metric-unit {
  font-size: 16px;
  color: var(--md-sys-color-on-surface-variant, #666);
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.metric-change--positive {
  color: #2e7d32;
}

.metric-change--negative {
  color: #c62828;
}

.metric-description {
  font-size: 13px;
  color: var(--md-sys-color-on-surface-variant, #666);
  margin: 0;
  line-height: 1.4;
}

.metric-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}
</style>
