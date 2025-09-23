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

    <div class="horizontal-bar-chart">
      <div v-for="item in chartData" :key="item.id || item.name" class="bar-item">
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
                  backgroundColor: evaluationPeriods[index]?.color || 'var(--md-sys-color-primary, #4A90A4)'
                }"
              ></div>
            </div>
            <span class="bar-value">{{ evaluation.score }}/10</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface EvaluationResult {
  score: number
}

interface ChartDataItem {
  id?: string // Optional unique identifier
  name: string
  evaluations: EvaluationResult[]
}

interface EvaluationPeriod {
  id: string
  name: string
  color: string
}

interface Props {
  chartData: ChartDataItem[]
  evaluationPeriods: EvaluationPeriod[]
}

defineProps<Props>()
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
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
  margin-top: 8px;
}

.bar-label {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: var(--md-sys-color-surface-variant, #f0f0f0);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.bar-value {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.75rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  min-width: 40px;
  text-align: right;
}

@media (max-width: 768px) {
  .bar-info {
    min-width: 150px;
  }
}

@media (max-width: 480px) {
  .bar-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .bar-info {
    min-width: unset;
    margin-top: 0;
  }

  .bar-group {
    order: 1;
  }

  .chart-legend {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>