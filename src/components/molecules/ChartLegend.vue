<template>
  <div :class="legendClasses">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="legend-item"
      :class="{ 'legend-item--disabled': item.hidden }"
      @click="handleItemClick(item, index)"
    >
      <div
        class="legend-marker"
        :style="{ backgroundColor: item.color }"
      ></div>
      <span class="legend-label">{{ item.label }}</span>
      <span v-if="showValues && item.value !== undefined" class="legend-value">
        {{ formatValue(item.value) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface LegendItem {
  label: string
  color: string
  value?: number
  hidden?: boolean
}

interface Props {
  items: LegendItem[]
  orientation?: 'horizontal' | 'vertical'
  position?: 'top' | 'bottom' | 'left' | 'right'
  showValues?: boolean
  interactive?: boolean
  valueFormat?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  position: 'bottom',
  showValues: false,
  interactive: false,
  valueFormat: (value: number) => value.toString()
})

const emit = defineEmits<{
  (e: 'item-click', item: LegendItem, index: number): void
}>()

const legendClasses = computed(() => [
  'chart-legend',
  `chart-legend--${props.orientation}`,
  `chart-legend--${props.position}`,
  {
    'chart-legend--interactive': props.interactive
  }
])

const formatValue = (value: number) => {
  return props.valueFormat(value)
}

const handleItemClick = (item: LegendItem, index: number) => {
  if (props.interactive) {
    emit('item-click', item, index)
  }
}
</script>

<style scoped>
.chart-legend {
  display: flex;
  gap: 16px;
  padding: 8px;
}

.chart-legend--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

.chart-legend--vertical {
  flex-direction: column;
  align-items: flex-start;
}

.chart-legend--interactive .legend-item {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.chart-legend--interactive .legend-item:hover {
  opacity: 0.8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--md-sys-color-on-surface, #1d1d1d);
}

.legend-item--disabled {
  opacity: 0.4;
}

.legend-marker {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-label {
  font-weight: 500;
}

.legend-value {
  color: var(--md-sys-color-on-surface-variant, #666);
  margin-left: 4px;
}
</style>
