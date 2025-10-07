<template>
  <div class="radar-charts-grid">
    <!-- Domain Radar Chart -->
    <div class="radar-chart-section">
      <h3 class="section-title">Radar par domaine</h3>
      <div class="chart-container">
        <DomainRadarChart
          :chart-data="domainRadarData"
          :evaluation-periods="evaluationPeriods"
        />
      </div>
    </div>

    <!-- Fields Radar Chart -->
    <div class="radar-chart-section">
      <h3 class="section-title">Radar par champ</h3>
      <div class="chart-container">
        <DomainRadarChart
          :chart-data="fieldRadarData"
          :evaluation-periods="evaluationPeriods"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DomainRadarChart from '@/components/analysis/DomainRadarChart.vue'

interface EvaluationPeriod {
  id: string
  name: string
  color: string
}

defineProps<{
  domainRadarData: any[]
  fieldRadarData: any[]
  evaluationPeriods: EvaluationPeriod[]
}>()
</script>

<style scoped>
.radar-charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.radar-chart-section {
  background: var(--md-sys-color-surface-variant, #f5f5f5);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--md-sys-color-on-surface, #1d1d1d);
}

.chart-container {
  min-height: 300px;
  position: relative;
}
</style>
