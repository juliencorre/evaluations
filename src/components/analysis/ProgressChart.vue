<template>
  <div class="timeline-chart">
    <div class="chart-area">
      <svg class="progress-chart" viewBox="0 0 400 200">
        <!-- Grille -->
        <defs>
          <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 25"
              fill="none"
              stroke="var(--md-sys-color-outline-variant, #c4c7c5)"
              stroke-width="1"
            />
          </pattern>
        </defs>
        <rect width="400" height="200" fill="url(#grid)" />

        <!-- Courbe de progression -->
        <path
          :d="progressPath"
          fill="none"
          stroke="var(--md-sys-color-primary, #6750a4)"
          stroke-width="3"
        />

        <!-- Points de données -->
        <circle
          v-for="(point, index) in dataPoints"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="4"
          fill="var(--md-sys-color-primary, #6750a4)"
        />
      </svg>
    </div>
    <div class="chart-labels">
      <span v-for="label in labels" :key="label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DataPoint {
  value: number
  label: string
}

interface Props {
  data: DataPoint[]
}

const props = defineProps<Props>()

const labels = computed(() => props.data.map(point => point.label))

const dataPoints = computed(() => {
  const width = 400
  const height = 200
  const padding = 50
  const chartWidth = width - 2 * padding
  const chartHeight = height - 50

  return props.data.map((point, index) => {
    const x = padding + (index * chartWidth) / Math.max(1, props.data.length - 1)
    // Inverser Y pour SVG (0 en haut)
    const normalizedValue = point.value / 4 // Normaliser sur 0-1 (assumant valeur max = 4)
    const y = height - 50 - (normalizedValue * chartHeight)

    return { x, y }
  })
})

const progressPath = computed(() => {
  if (dataPoints.value.length === 0) return ''

  const firstPoint = dataPoints.value[0]
  let path = `M ${firstPoint.x} ${firstPoint.y}`

  for (let i = 1; i < dataPoints.value.length; i++) {
    const point = dataPoints.value[i]
    path += ` L ${point.x} ${point.y}`
  }

  return path
})
</script>

<style scoped>
.timeline-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-area {
  width: 100%;
  height: 200px;
}

.progress-chart {
  width: 100%;
  height: 100%;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 50px;
  font-size: 0.75rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

@media (max-width: 480px) {
  .chart-labels {
    padding: 0 20px;
  }
}
</style>