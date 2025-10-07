<template>
  <div class="page-content">
    <!-- Domain Radar Chart -->
    <section class="charts-section">
      <ChartCard class="white-card">
        <template #title>
          <div class="chart-header">
            <div class="chart-title-text">Radar des notes par domaine</div>
          </div>
        </template>
        <div v-if="isDataLoading" class="chart-container">
          <div class="loading-state">Chargement des données...</div>
        </div>
        <div v-else-if="domainRadarData.length === 0" class="chart-container">
          <EmptyState
            title="Aucune donnée disponible"
            description="Aucune évaluation n'a été réalisée pour cette classe"
          />
        </div>
        <div v-else class="chart-container">
          <DomainRadarChart
            :chart-data="domainRadarData"
            :evaluation-periods="evaluationPeriods"
          />
        </div>
      </ChartCard>
    </section>

    <!-- Fields Radar Chart -->
    <section class="charts-section">
      <ChartCard class="white-card">
        <template #title>
          <div class="chart-header">
            <div class="chart-title-text">Radar des notes par champ</div>
          </div>
        </template>
        <div v-if="isDataLoading" class="chart-container">
          <div class="loading-state">Chargement des données...</div>
        </div>
        <div v-else-if="fieldRadarData.length === 0" class="chart-container">
          <EmptyState
            title="Aucune donnée disponible"
            description="Aucune évaluation n'a été réalisée pour cette classe"
          />
        </div>
        <div v-else class="chart-container">
          <DomainRadarChart
            :chart-data="fieldRadarData"
            :evaluation-periods="evaluationPeriods"
          />
        </div>
      </ChartCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { useEvaluationResultsStore } from '@/stores/evaluationResultsStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'
import { supabaseEvaluationResultsService } from '@/services/supabaseEvaluationResultsService'
import { supabaseStudentClassesService } from '@/services/supabaseStudentClassesService'
import { supabaseEvaluationClassesService } from '@/services/supabaseEvaluationClassesService'
import type { EvaluationResult, ResultTypeConfig, Student } from '@/types/evaluation'

import DomainRadarChart from '@/components/analysis/DomainRadarChart.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

interface Props {
  classId?: string
}

const props = withDefaults(defineProps<Props>(), {
  classId: undefined
})

// Use stores
const studentsStore = useStudentsStore()
const evaluationResultsStore = useEvaluationResultsStore()
const evaluationStore = useEvaluationStore()

// Services
const resultTypesService = new SupabaseResultTypesService()

// Result types configuration
const resultTypes = ref<ResultTypeConfig[]>([])

// All results from all evaluations for analysis
const allEvaluationResults = ref<EvaluationResult[]>([])

// Filtered evaluations (only those with results loaded)
const filteredEvaluations = ref<Array<{ id: string; name: string }>>([])

// Students list for the class (if classId is provided)
const classStudents = ref<Student[]>([])

// Students list - filter by classId if provided
const students = computed(() => {
  const studentsList = props.classId ? classStudents.value : studentsStore.allStudents
  return studentsList.map(student => ({
    id: student.id,
    name: `${student.firstName} ${student.lastName}`
  }))
})

// Evaluation periods - generate colors for evaluations
const colorPalette = [
  '#4A90A4', // Teal-blue principal
  '#E65100', // Orange vif
  '#2E7D32', // Vert foncé
  '#7B1FA2', // Violet
  '#D32F2F', // Rouge
  '#F57C00', // Orange doré
  '#1976D2', // Bleu
  '#5D4037', // Brun
  '#455A64', // Bleu-gris
  '#6A1B9A'  // Violet foncé
]

const evaluationPeriods = computed(() => {
  return filteredEvaluations.value.map((evaluation, index) => ({
    id: evaluation.id,
    name: evaluation.name,
    color: colorPalette[index % colorPalette.length]
  }))
})

// Helper function to get result type config ID from specific competency ID
const getResultTypeConfigId = (specificCompetencyId?: string): string | undefined => {
  if (!specificCompetencyId) return undefined

  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework

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

// Function to calculate class averages by level (domains, fields)
const calculateClassAveragesByLevel = (metricType: string) => {
  console.log('📊 [calculateClassAveragesByLevel] Starting calculation:', { metricType })

  const results = allEvaluationResults.value
  const evaluations = filteredEvaluations.value

  console.log('📊 [calculateClassAveragesByLevel] Data sources:', {
    totalResults: results?.length || 0,
    filteredEvaluationsCount: evaluations?.length || 0,
    studentsCount: students.value.length
  })

  if (!Array.isArray(results) || results.length === 0 || evaluations.length === 0 || students.value.length === 0) {
    console.log('📊 [calculateClassAveragesByLevel] No data available')
    return []
  }

  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework

  // Map to store aggregated data by level
  const levelMap = new Map<string, {
    name: string;
    evaluations: Map<string, { sum: number; count: number }>
  }>()

  // Initialize level map based on metric type
  if (metricType === 'domains') {
    framework.domains.forEach(domain => {
      levelMap.set(domain.id, {
        name: domain.name,
        evaluations: new Map()
      })
    })
  } else if (metricType === 'fields') {
    framework.domains.forEach(domain => {
      domain.fields.forEach(field => {
        levelMap.set(field.id, {
          name: field.name,
          evaluations: new Map()
        })
      })
    })
  }

  // Process all results for all students in the class
  results.forEach(result => {
    // Skip if result doesn't belong to a student in the class
    if (!students.value.some(s => s.id === result.studentId)) {
      return
    }

    const evaluationId = (result as EvaluationResult & { evaluationId?: string }).evaluationId ||
      (result.evaluatedAt ?
        evaluationStore.allEvaluations.find(evaluation_item =>
          new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime()
        )?.id :
        evaluationResultsStore.evaluation.value?.id || 'current')

    const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId)
    const resultTypeConfig = resultTypes.value.find(rt => rt.id === resultTypeConfigId)

    if (!resultTypeConfig) {
      console.log('⚠️ No result type config found for:', {
        resultTypeConfigId,
        specificCompetencyId: result.specificCompetencyId
      })
      return
    }

    let normalizedScore = 0

    // Find the matching value in the result type config to get its pivot_value
    if (result.value) {
      const configValue = resultTypeConfig.config.values.find(v => v.value === result.value)
      if (configValue && configValue.pivot_value !== null) {
        normalizedScore = configValue.pivot_value
      } else if (resultTypeConfig.type === 'numeric') {
        // For numeric types, calculate based on scale
        const numericValue = parseFloat(result.value)
        const maxValue = resultTypeConfig.config.maxValue || 10
        if (!isNaN(numericValue)) {
          normalizedScore = (numericValue / maxValue) * 10
        }
      }
    }

    if (isNaN(normalizedScore) || normalizedScore === 0) {
      console.log('⚠️ Invalid or zero score:', result.value)
      return
    }

    // Find the level ID based on metric type
    let levelId = ''
    if (metricType === 'domains') {
      // Find domain by specific competency
      for (const domain of framework.domains) {
        for (const field of domain.fields) {
          for (const competency of field.competencies) {
            if (competency.specificCompetencies.some(sc => sc.id === result.specificCompetencyId)) {
              levelId = domain.id
              break
            }
          }
          if (levelId) break
        }
        if (levelId) break
      }
    } else if (metricType === 'fields') {
      // Find field by specific competency
      for (const domain of framework.domains) {
        for (const field of domain.fields) {
          for (const competency of field.competencies) {
            if (competency.specificCompetencies.some(sc => sc.id === result.specificCompetencyId)) {
              levelId = field.id
              break
            }
          }
          if (levelId) break
        }
        if (levelId) break
      }
    }

    if (!levelId) {
      console.log('⚠️ Level not found for specific competency:', result.specificCompetencyId)
      return
    }

    const level = levelMap.get(levelId)
    if (!level) return

    if (evaluationId) {
      if (!level.evaluations.has(evaluationId)) {
        level.evaluations.set(evaluationId, { sum: 0, count: 0 })
      }

      const evalData = level.evaluations.get(evaluationId)!
      evalData.sum += normalizedScore
      evalData.count++
    }
  })

  // Convert to chart data format with averages
  const chartData: Array<{ name: string; evaluations: Array<{ score: number }> }> = []

  levelMap.forEach((level) => {
    const evaluationScores = evaluations.map(evaluation => {
      const evalData = level.evaluations.get(evaluation.id)
      if (evalData && evalData.count > 0) {
        return { score: evalData.sum / evalData.count }
      }
      return { score: 0 }
    })

    chartData.push({
      name: level.name,
      evaluations: evaluationScores
    })
  })

  console.log('📊 [calculateClassAveragesByLevel] Chart data prepared:', {
    metricType,
    levelsCount: chartData.length,
    evaluationsCount: evaluations.length
  })

  return chartData
}

// Data loading state
const isDataLoading = ref(true)

// Get domain data for radar chart - computed for reactivity
const domainRadarData = computed(() => {
  console.log('📊 [domainRadarData] Computing domain data for class')

  try {
    const domainData = calculateClassAveragesByLevel('domains')

    if (domainData.length > 0) {
      console.log('📊 [domainRadarData] Domain data:', domainData)
      return domainData
    }

    console.log('📊 [domainRadarData] No domain data found')
    return []
  } catch (error) {
    console.error('❌ [domainRadarData] Error getting domain data:', error)
    return []
  }
})

// Get field data for radar chart - computed for reactivity
const fieldRadarData = computed(() => {
  console.log('📊 [fieldRadarData] Computing field data for class')

  try {
    const fieldData = calculateClassAveragesByLevel('fields')

    if (fieldData.length > 0) {
      console.log('📊 [fieldRadarData] Field data:', fieldData)
      return fieldData
    }

    console.log('📊 [fieldRadarData] No field data found')
    return []
  } catch (error) {
    console.error('❌ [fieldRadarData] Error getting field data:', error)
    return []
  }
})

// Load data function - can be called on mount and when props change
const loadData = async () => {
  console.log('📊 [ClassAnalysisView] Loading data with classId:', props.classId)
  isDataLoading.value = true

  try {
    // Load result types
    try {
      resultTypes.value = await resultTypesService.getResultTypes()
      console.log('✅ Result types loaded:', resultTypes.value.length)
    } catch (error) {
      console.error('❌ Error loading result types:', error)
    }

    // Load students for the class if classId is provided
    if (props.classId) {
      try {
        const studentClasses = await supabaseStudentClassesService.getStudentClasses({
          class_id: props.classId,
          include_details: true
        })
        const studentIds = studentClasses.map((sc: { student_id: string }) => sc.student_id)
        classStudents.value = studentsStore.allStudents.filter(s => studentIds.includes(s.id))
        console.log('✅ Class students loaded:', classStudents.value.length)
      } catch (error) {
        console.error('❌ Error loading class students:', error)
      }

      // Load evaluations for the class
      try {
        const evaluationClasses = await supabaseEvaluationClassesService.getEvaluationClasses({
          class_id: props.classId,
          include_details: true
        })
        const evaluationIds = evaluationClasses.map((ec: { evaluation_id: string }) => ec.evaluation_id)
        filteredEvaluations.value = evaluationStore.allEvaluations
          .filter(e => evaluationIds.includes(e.id))
          .map(e => ({ id: e.id, name: e.name }))
        console.log('✅ Class evaluations loaded:', filteredEvaluations.value.length)
      } catch (error) {
        console.error('❌ Error loading class evaluations:', error)
      }
    } else {
      // No class filter - use all evaluations
      filteredEvaluations.value = evaluationStore.allEvaluations.map(e => ({ id: e.id, name: e.name }))
      console.log('✅ All evaluations loaded:', filteredEvaluations.value.length)
    }

    // Load all evaluation results
    try {
      const evaluationIds = filteredEvaluations.value.map(e => e.id)
      const allResults: EvaluationResult[] = []

      for (const evaluationId of evaluationIds) {
        const results = await supabaseEvaluationResultsService.getAllResults(evaluationId)
        allResults.push(...results)
      }

      allEvaluationResults.value = allResults
      console.log('✅ All evaluation results loaded:', allEvaluationResults.value.length)
    } catch (error) {
      console.error('❌ Error loading evaluation results:', error)
    }
  } finally {
    isDataLoading.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadData()
})

// Watch for classId changes and reload data
watch(() => props.classId, () => {
  console.log('📊 [ClassAnalysisView] ClassId changed, reloading data')
  loadData()
})
</script>

<style scoped>
/* Page Content */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Charts Section */
.charts-section {
  display: block;
}

.white-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title-text {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}

.chart-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-content {
    gap: 16px;
  }

  .white-card {
    padding: 16px;
  }

  .chart-container {
    min-height: 300px;
  }
}
</style>
