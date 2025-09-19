<template>
  <div class="page-content">
    <!-- Class Average Chart -->
    <section class="charts-section">
      <ChartCard class="white-card">
        <template #title>
          <div class="chart-header">
            <div class="chart-title-with-selector">
              <h3 class="class-title">Moyenne de la classe</h3>
            </div>
            <div class="metric-type-selector">
              <div class="metric-type-buttons">
                <button
                  v-for="type in metricTypes"
                  :key="type.value"
                  class="metric-type-button"
                  :class="{ active: selectedMetricType === type.value }"
                  @click="selectedMetricType = type.value"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>
          </div>
        </template>

        <div class="chart-container">
          <ClassAverageChart
            :chart-data="getClassData()"
            :evaluation-periods="evaluationPeriods"
          />
        </div>

        <div class="chart-actions">
          <button
            class="export-button chart-export"
            title="Exporter les moyennes de classe en PDF"
            @click="exportClassChart"
          >
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
              />
              <path d="M12,11L16,15H13V19H11V15H8L12,11Z" />
            </svg>
            Exporter
          </button>
        </div>
      </ChartCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'
import { supabaseEvaluationResultsService } from '@/services/supabaseEvaluationResultsService'
import type { EvaluationResult, ResultTypeConfig } from '@/types/evaluation'

import ClassAverageChart from '@/components/analysis/ClassAverageChart.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'

// Use stores
const studentsStore = useStudentsStore()
const evaluationStore = useEvaluationStore()

// Services
const resultTypesService = new SupabaseResultTypesService()

// Result types configuration
const resultTypes = ref<ResultTypeConfig[]>([])

// All results from all evaluations for analysis
const allEvaluationResults = ref<EvaluationResult[]>([])

// Selected metric type
const selectedMetricType = ref('domains')

// Metric types
const metricTypes = ref([
  { value: 'domains', label: 'Domaines' },
  { value: 'fields', label: 'Champs' },
  { value: 'competencies', label: 'Compétences' }
])

// Evaluation periods - generate colors for evaluations
const colorPalette = ['#6750a4', '#0F62FE', '#198038', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

const evaluationPeriods = computed(() => {
  return evaluationStore.allEvaluations.value.map((evaluation, index) => ({
    id: evaluation.id,
    name: evaluation.name,
    color: colorPalette[index % colorPalette.length]
  }))
})


// Export function
const exportClassChart = () => {
  console.log('Exporting class chart')
  window.alert('Export en cours pour les moyennes de classe')
}

// Class data calculation
const getClassData = () => {
  console.log('📊 [getClassData] Starting class average calculation')
  return calculateClassAveragesByLevel(selectedMetricType.value)
}

// Helper functions (simplified versions from StudentAnalysisView)
const getResultTypeConfigId = (specificCompetencyId?: string): string | undefined => {
  if (!specificCompetencyId) return undefined

  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      for (const competency of field.competencies) {
        const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
        if (specificComp) {
          return specificComp.resultTypeConfigId
        }
      }
    }
  }
  return undefined
}

const getDomainIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      for (const competency of field.competencies) {
        const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
        if (specificComp) {
          return domain.id
        }
      }
    }
  }
  return undefined
}

const getFieldIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      for (const competency of field.competencies) {
        const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
        if (specificComp) {
          return field.id
        }
      }
    }
  }
  return undefined
}

const getCompetencyIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      for (const competency of field.competencies) {
        const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
        if (specificComp) {
          return competency.id
        }
      }
    }
  }
  return undefined
}

const getDomainNameById = (domainId: string): string => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  const domain = framework.domains.find(d => d.id === domainId)
  return domain ? domain.name : `Domaine ${domainId.slice(-8)}`
}

const getFieldNameById = (fieldId: string): string => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  for (const domain of framework.domains) {
    const field = domain.fields.find(f => f.id === fieldId)
    if (field) {
      return field.name
    }
  }
  return `Champ ${fieldId.slice(-8)}`
}

const getCompetencyNameById = (competencyId: string): string => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      const competency = field.competencies.find(c => c.id === competencyId)
      if (competency) {
        return competency.name
      }
    }
  }
  return `Compétence ${competencyId.slice(-8)}`
}

// Function to convert evaluation result value to score using pivot_value
const getScoreFromValue = (value: string, resultTypeConfigId?: string): number => {
  if (!value || !resultTypeConfigId) {
    return 0
  }

  const resultType = resultTypes.value.find(rt => rt.id === resultTypeConfigId)
  if (!resultType) {
    return 0
  }

  const configValue = resultType.config.values.find(v => v.value === value)
  if (!configValue) {
    return 0
  }

  return configValue.pivot_value
}

// Function to calculate class averages by level (domains, fields, competencies) across all students
const calculateClassAveragesByLevel = (metricType: string) => {
  console.log('📊 [calculateClassAveragesByLevel] Starting calculation:', { metricType })

  const results = allEvaluationResults.value
  const evaluations = evaluationStore.allEvaluations.value
  const students = studentsStore.allStudents.value

  if (!Array.isArray(results) || results.length === 0 || evaluations.length === 0 || students.length === 0) {
    console.log('📊 [calculateClassAveragesByLevel] No data available')
    return []
  }

  const resultsByEvaluation = results.reduce((acc, result) => {
    const evaluationId = (result as any).evaluationId ||
      (result.evaluatedAt ?
        evaluations.find(evaluation => new Date(evaluation.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
        'current')

    const safeEvaluationId = evaluationId || 'unknown'
    if (!acc[safeEvaluationId]) {
      acc[safeEvaluationId] = []
    }
    acc[safeEvaluationId].push(result)
    return acc
  }, {} as Record<string, EvaluationResult[]>)

  const calculateByMetricType = (allResults: EvaluationResult[]) => {
    switch (metricType) {
      case 'domains': {
        // Group results by domain
        const domainGroups = allResults.reduce((acc, result) => {
          const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
          const domainId = getDomainIdFromSpecificCompetencyId(effectiveSpecificCompetencyId)

          if (domainId) {
            if (!acc[domainId]) {
              acc[domainId] = []
            }
            acc[domainId].push(result)
          }
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        return Object.entries(domainGroups).map(([domainId, groupResults]) => {
          // Calculate average across ALL students for this domain
          const studentAverages: number[] = []

          // Group by student
          const resultsByStudent = groupResults.reduce((acc, result) => {
            if (!acc[result.studentId]) {
              acc[result.studentId] = []
            }
            acc[result.studentId].push(result)
            return acc
          }, {} as Record<string, EvaluationResult[]>)

          // Calculate average for each student
          Object.values(resultsByStudent).forEach(studentResults => {
            const scores = studentResults
              .map(result => {
                const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId || result.competencyId)
                return getScoreFromValue(result.value || '', resultTypeConfigId)
              })
              .filter(score => score > 0)

            if (scores.length > 0) {
              const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
              studentAverages.push(average)
            }
          })

          // Calculate class average
          const classAverage = studentAverages.length > 0
            ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length
            : 0

          return {
            name: getDomainNameById(domainId),
            value: Math.round(classAverage * 100) / 100
          }
        })
      }

      case 'fields': {
        // Similar logic for fields
        const fieldGroups = allResults.reduce((acc, result) => {
          const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
          const fieldId = getFieldIdFromSpecificCompetencyId(effectiveSpecificCompetencyId)

          if (fieldId) {
            if (!acc[fieldId]) {
              acc[fieldId] = []
            }
            acc[fieldId].push(result)
          }
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        return Object.entries(fieldGroups).map(([fieldId, groupResults]) => {
          const studentAverages: number[] = []

          const resultsByStudent = groupResults.reduce((acc, result) => {
            if (!acc[result.studentId]) {
              acc[result.studentId] = []
            }
            acc[result.studentId].push(result)
            return acc
          }, {} as Record<string, EvaluationResult[]>)

          Object.values(resultsByStudent).forEach(studentResults => {
            const scores = studentResults
              .map(result => {
                const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId || result.competencyId)
                return getScoreFromValue(result.value || '', resultTypeConfigId)
              })
              .filter(score => score > 0)

            if (scores.length > 0) {
              const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
              studentAverages.push(average)
            }
          })

          const classAverage = studentAverages.length > 0
            ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length
            : 0

          return {
            name: getFieldNameById(fieldId),
            value: Math.round(classAverage * 100) / 100
          }
        })
      }

      case 'competencies': {
        // Similar logic for competencies
        const competencyGroups = allResults.reduce((acc, result) => {
          const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
          const competencyId = getCompetencyIdFromSpecificCompetencyId(effectiveSpecificCompetencyId)

          if (competencyId) {
            if (!acc[competencyId]) {
              acc[competencyId] = []
            }
            acc[competencyId].push(result)
          }
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        return Object.entries(competencyGroups).map(([competencyId, groupResults]) => {
          const studentAverages: number[] = []

          const resultsByStudent = groupResults.reduce((acc, result) => {
            if (!acc[result.studentId]) {
              acc[result.studentId] = []
            }
            acc[result.studentId].push(result)
            return acc
          }, {} as Record<string, EvaluationResult[]>)

          Object.values(resultsByStudent).forEach(studentResults => {
            const scores = studentResults
              .map(result => {
                const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId || result.competencyId)
                return getScoreFromValue(result.value || '', resultTypeConfigId)
              })
              .filter(score => score > 0)

            if (scores.length > 0) {
              const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
              studentAverages.push(average)
            }
          })

          const classAverage = studentAverages.length > 0
            ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length
            : 0

          return {
            name: getCompetencyNameById(competencyId),
            value: Math.round(classAverage * 100) / 100
          }
        })
      }

      default:
        return []
    }
  }

  // Calculate class averages for each evaluation
  return Object.entries(resultsByEvaluation).map(([evaluationId, evalResults]) => {
    const evaluation = evaluations.find(e => e.id === evaluationId)
    const averages = calculateByMetricType(evalResults)

    return {
      evaluation: evaluation?.name || 'Évaluation inconnue',
      evaluationId,
      color: evaluationPeriods.value.find(ep => ep.id === evaluationId)?.color || '#6750a4',
      data: averages
    }
  })
}

onMounted(async () => {
  try {
    // Load result types
    resultTypes.value = await resultTypesService.getResultTypes()
    console.log('📊 [DashboardView] Result types loaded:', resultTypes.value.length)

    // Load all evaluation results with evaluation IDs
    const allEvaluations = evaluationStore.allEvaluations.value
    const allResults: EvaluationResult[] = []

    for (const evaluation of allEvaluations) {
      try {
        // Use getOrCreateEvaluation to ensure proper ID mapping
        const fullEvaluation = await supabaseEvaluationResultsService.getOrCreateEvaluation(evaluation)
        const resultsWithEvaluationId = fullEvaluation.results.map(result => ({
          ...result,
          evaluationId: evaluation.id // Use the original evaluation ID
        }))
        allResults.push(...resultsWithEvaluationId)
        console.log('📊 [DashboardView] Loaded', resultsWithEvaluationId.length, 'results for', evaluation.name)
      } catch (error) {
        console.error('📊 [DashboardView] Error loading results for evaluation', evaluation.name, ':', error)
        // Continue with next evaluation instead of breaking completely
      }
    }

    allEvaluationResults.value = allResults
    console.log('📊 [DashboardView] All evaluation results loaded:', allResults.length)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>

<style scoped>
.page-content {
  padding: 24px;
}

.charts-section {
  margin-bottom: 24px;
}

/* White card background */
.white-card {
  background: var(--md-sys-color-surface-container-low, #ffffff) !important;
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
}

/* Chart header organization */
.chart-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.chart-title-with-selector {
  display: flex;
  align-items: center;
}

.class-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.75rem;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0;
}

.metric-type-selector {
  margin-top: 8px;
}

.metric-type-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.metric-type-button {
  padding: 8px 16px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-low, #ffffff);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.metric-type-button:hover {
  background: var(--md-sys-color-surface-container-high, #f3edf7);
}

.metric-type-button.active {
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
  border-color: var(--md-sys-color-primary, #6750a4);
}

.chart-container {
  min-height: 400px;
}

.chart-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
  border-top: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  margin-top: 16px;
}

.chart-export {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  white-space: nowrap;
  box-shadow:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.chart-export:hover {
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  box-shadow:
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.chart-export:active {
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
  box-shadow:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.export-icon {
  width: 16px;
  height: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-header {
    gap: 12px;
  }

  .class-title {
    font-size: 1.1rem;
  }

  .metric-type-buttons {
    gap: 6px;
  }

  .metric-type-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .chart-actions {
    padding: 12px 0 0;
    margin-top: 12px;
  }

  .chart-export {
    padding: 10px 14px;
    font-size: 0.8rem;
  }
}
</style>