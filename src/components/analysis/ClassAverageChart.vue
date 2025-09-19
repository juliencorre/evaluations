<template>
  <div>
    <!-- Legend -->
    <div class="chart-legend">
      <div
        v-for="evaluation in evaluationPeriods"
        :key="evaluation.id"
        class="legend-item"
      >
        <div class="legend-color" :style="{ backgroundColor: evaluation.color }"></div>
        <span class="legend-label">{{ evaluation.name }}</span>
      </div>
    </div>

    <div v-if="processedChartData.length > 0" class="horizontal-bar-chart">
      <div v-for="item in processedChartData" :key="item.name" class="bar-item">
        <div class="bar-info">
          <span class="bar-label">{{ item.name }}</span>
        </div>
        <div class="bar-group">
          <div
            v-for="(evaluation, index) in item.evaluations"
            :key="index"
            class="bar-row"
          >
            <div class="bar-container">
              <div
                class="bar-fill"
                :style="{
                  width: (evaluation.score / 10) * 100 + '%',
                  backgroundColor: evaluation.color
                }"
              ></div>
            </div>
            <span class="bar-value">{{ evaluation.score }}/10</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Aucune donnée disponible pour les moyennes de classe</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface EvaluationResult {
  score: number
  color: string
}

interface ChartDataItem {
  name: string
  evaluations: EvaluationResult[]
}

interface EvaluationPeriod {
  id: string
  name: string
  color: string
}

interface ClassDataItem {
  evaluation: string
  evaluationId: string
  color: string
  data: Array<{ name: string; value: number }>
}

interface Props {
  chartData: ClassDataItem[]
  evaluationPeriods: EvaluationPeriod[]
}

const props = defineProps<Props>()

// Process the data to match the chart format
const processedChartData = computed<ChartDataItem[]>(() => {
  console.log('📊 [ClassAverageChart] Processing chart data:', props.chartData)

  if (!props.chartData || props.chartData.length === 0) {
    return []
  }

  // Extract all unique category names across all evaluations
  const allCategories = new Set<string>()
  props.chartData.forEach(evaluation => {
    evaluation.data.forEach(item => {
      allCategories.add(item.name)
    })
  })

  console.log('📊 [ClassAverageChart] Found categories:', Array.from(allCategories))

  // Transform to chart format
  const chartItems: ChartDataItem[] = Array.from(allCategories).map(categoryName => {
    const evaluations: EvaluationResult[] = props.chartData.map(evaluation => {
      const categoryData = evaluation.data.find(item => item.name === categoryName)
      return {
        score: categoryData ? Math.round(categoryData.value * 100) / 100 : 0,
        color: evaluation.color
      }
    })

    return {
      name: categoryName,
      evaluations
    }
  })

  console.log('📊 [ClassAverageChart] Processed chart data:', chartItems)
  return chartItems
})
</script>

<style scoped>
.chart-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--md-sys-color-surface-container-low, #f8f9fa);
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}

.horizontal-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.bar-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.bar-info {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  padding-top: 8px;
}

.bar-label {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  line-height: 1.2;
  word-wrap: break-word;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 24px;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: var(--md-sys-color-surface-container-highest, #e6e0e9);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
  min-width: 4px;
}

.bar-value {
  flex: 0 0 60px;
  font-family: 'Roboto Mono', 'Roboto', monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  text-align: right;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-legend {
    flex-wrap: wrap;
    gap: 12px;
  }

  .bar-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .bar-info {
    flex: none;
    align-items: flex-start;
    text-align: left;
    padding-top: 0;
  }

  .bar-value {
    flex: 0 0 auto;
    text-align: left;
  }
}
</style>