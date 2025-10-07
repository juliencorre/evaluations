<template>
  <div class="dashboard-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement des données d'analyse...</p>
    </div>

    <!-- Main Card -->
    <ChartCard v-else class="competencies-card">
      <template #title>
        <div class="main-card-header">
          <h2 class="main-card-title">Évaluation des compétences de la classe</h2>
        </div>
      </template>

      <!-- Radar Charts Section -->
      <DashboardRadarSection
        :domain-radar-data="getDomainRadarData"
        :field-radar-data="getFieldRadarData"
        :evaluation-periods="evaluationPeriods"
      />

      <!-- Divider -->
      <div class="section-divider"></div>

      <!-- Detailed Analysis Section -->
      <DashboardDetailedSection
        v-model="selectedMetricType"
        :chart-data="getDetailedAnalysisData"
        :evaluation-periods="evaluationPeriods"
        @export="exportClassChart"
        @share="shareClassChart"
      />
    </ChartCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChartCard from '@/components/analysis/ChartCard.vue'
import DashboardRadarSection from './DashboardRadarSection.vue'
import DashboardDetailedSection from './DashboardDetailedSection.vue'
import { useDashboardData } from './hooks/useDashboardData'
import { useDashboardCalculations } from './hooks/useDashboardCalculations'
import { useDashboardCharts } from './hooks/useDashboardCharts'

// Dashboard container orchestrating all dashboard components

// State
const selectedMetricType = ref('domains')

// Data loading and filtering
const {
  isLoading,
  resultTypes,
  allEvaluationResults,
  filteredEvaluations,
  evaluationPeriods,
  framework
} = useDashboardData()

// Calculations
const { calculateClassAveragesByLevel } = useDashboardCalculations(
  framework,
  resultTypes,
  allEvaluationResults,
  filteredEvaluations
)

// Chart data
const {
  getDomainRadarData,
  getFieldRadarData,
  getDetailedAnalysisData: getDetailedData
} = useDashboardCharts(framework, calculateClassAveragesByLevel, isLoading)

const getDetailedAnalysisData = getDetailedData(selectedMetricType)

// Actions
const exportClassChart = () => {
  console.log('Export class chart')
  // TODO: Implement export logic
}

const shareClassChart = () => {
  console.log('Share class chart')
  // TODO: Implement share logic
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--md-sys-color-surface-variant, #e0e0e0);
  border-top-color: var(--md-sys-color-primary, #2196f3);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.competencies-card {
  background: var(--md-sys-color-surface, white);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1d1d1d);
  margin: 0;
}

.section-divider {
  height: 1px;
  background: var(--md-sys-color-outline-variant, #e0e0e0);
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .competencies-card {
    padding: 1rem;
  }
}
</style>
