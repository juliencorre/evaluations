<template>
  <div class="detailed-analysis-section">
    <div class="analysis-header">
      <h3 class="section-title">Analyse détaillée</h3>
      <div class="metric-type-selector">
        <div class="metric-type-buttons">
          <button
            v-for="type in metricTypes"
            :key="type.value"
            class="metric-type-button"
            :class="{ active: modelValue === type.value }"
            @click="$emit('update:modelValue', type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <DetailedAnalysisChart
        :chart-data="chartData"
        :evaluation-periods="evaluationPeriods"
      />
    </div>

    <div class="chart-actions">
      <button
        class="export-button chart-export"
        title="Exporter l'évaluation de la classe en PDF"
        @click="$emit('export')"
      >
        <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
          />
          <path d="M12,11L16,15H13V19H11V15H8L12,11Z" />
        </svg>
        Exporter
      </button>
      <button
        class="share-button chart-share"
        title="Partager l'évaluation de la classe par email"
        @click="$emit('share')"
      >
        <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"
          />
        </svg>
        Partager
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import DetailedAnalysisChart from '@/components/analysis/DetailedAnalysisChart.vue'

interface EvaluationPeriod {
  id: string
  name: string
  color: string
}

defineProps<{
  modelValue: string
  chartData: any[]
  evaluationPeriods: EvaluationPeriod[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'export'): void
  (e: 'share'): void
}>()

const metricTypes = [
  { value: 'domains', label: 'Domaines' },
  { value: 'fields', label: 'Champs' },
  { value: 'competencies', label: 'Compétences' }
]
</script>

<style scoped>
.detailed-analysis-section {
  margin-top: 2rem;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1d1d1d);
}

.metric-type-selector {
  display: flex;
  gap: 0.5rem;
}

.metric-type-buttons {
  display: flex;
  gap: 0.5rem;
  background: var(--md-sys-color-surface-variant, #f5f5f5);
  padding: 0.25rem;
  border-radius: 8px;
}

.metric-type-button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  color: var(--md-sys-color-on-surface-variant, #666);
}

.metric-type-button.active {
  background: var(--md-sys-color-primary, #2196f3);
  color: var(--md-sys-color-on-primary, white);
}

.metric-type-button:hover:not(.active) {
  background: rgba(0, 0, 0, 0.05);
}

.chart-container {
  min-height: 400px;
  background: var(--md-sys-color-surface-variant, #f5f5f5);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.export-button,
.share-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.export-button {
  background: var(--md-sys-color-primary, #2196f3);
  color: var(--md-sys-color-on-primary, white);
}

.export-button:hover {
  background: var(--md-sys-color-primary-container, #1976d2);
}

.share-button {
  background: var(--md-sys-color-secondary, #9c27b0);
  color: var(--md-sys-color-on-secondary, white);
}

.share-button:hover {
  background: var(--md-sys-color-secondary-container, #7b1fa2);
}

.export-icon,
.share-icon {
  width: 20px;
  height: 20px;
}
</style>
