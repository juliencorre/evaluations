<template>
  <div class="page-content">
    <!-- Student Selection and Filters -->
    <section class="controls-section">
      <StudentSelector
        v-model:selectedStudent="selectedStudent"
        v-model:selectedMetricType="selectedMetricType"
        :students="students"
        :metric-types="metricTypes"
      />
    </section>

    <!-- Student Analysis Chart -->
    <section v-if="selectedStudent" class="charts-section">
      <ChartCard
        :title="getSelectedStudentName()"
        :subtitle="getMetricTypeLabel() + ' - Résultats des évaluations de l\'année'"
      >
        <template #header-actions>
          <button
            class="export-button export-single"
            title="Exporter ce graphique en PDF"
            @click="$emit('export-student-chart')"
          >
            <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
              />
              <path d="M12,11L16,15H13V19H11V15H8L12,11Z" />
            </svg>
          </button>
        </template>

        <StudentChart
          :chart-data="getStudentData()"
          :evaluation-periods="evaluationPeriods"
        />
      </ChartCard>
    </section>

    <!-- No Student Selected State -->
    <section v-else class="charts-section">
      <ChartCard>
        <EmptyState
          title="Sélectionnez un élève"
          description="Choisissez un élève dans la liste pour voir ses résultats d'évaluation"
        />
      </ChartCard>
    </section>

    <!-- Export All Students Action -->
    <div v-if="selectedStudent" class="footer-actions">
      <button
        class="export-button export-all"
        title="Exporter tous les élèves en PDF"
        @click="$emit('export-all-students')"
      >
        <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
          />
          <path d="M12,11L16,15H13V19H11V15H8L12,11Z" />
        </svg>
        Exporter tous les élèves
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { useEvaluationResultsStore } from '@/stores/evaluationResultsStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'
import type { EvaluationResult, ResultTypeConfig } from '@/types/evaluation'

import StudentSelector from '@/components/analysis/StudentSelector.vue'
import StudentChart from '@/components/analysis/StudentChart.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

interface Emits {
  (e: 'export-student-chart'): void
  (e: 'export-all-students'): void
}

defineEmits<Emits>()

// Use stores
const studentsStore = useStudentsStore()
const evaluationResultsStore = useEvaluationResultsStore()
const evaluationStore = useEvaluationStore()

// Services
const resultTypesService = new SupabaseResultTypesService()

// Result types configuration
const resultTypes = ref<ResultTypeConfig[]>([])

// Student analysis data
const selectedStudent = ref('')
const selectedMetricType = ref('domains')

// Students list
const students = computed(() => {
  return studentsStore.allStudents.value.map(student => ({
    id: student.id,
    name: `${student.firstName} ${student.lastName}`
  }))
})

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

// Helper function to get result type config ID from specific competency ID
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

// Function to convert evaluation result value to score using pivot_value
const getScoreFromValue = (value: string, resultTypeConfigId?: string): number => {
  if (!value || !resultTypeConfigId) return 0

  const resultType = resultTypes.value.find(rt => rt.id === resultTypeConfigId)
  if (!resultType) return 0

  const configValue = resultType.config.values.find(v => v.value === value)
  if (!configValue) return 0

  return (configValue.pivot_value / 10) * 4
}

// Function to calculate averages by level (domains, fields, competencies) across multiple evaluations
const calculateAveragesByLevel = (studentId: string, metricType: string) => {
  const results = evaluationResultsStore.results.value
  const evaluations = evaluationStore.allEvaluations.value

  if (!Array.isArray(results) || results.length === 0 || evaluations.length === 0) {
    return []
  }

  const studentResults = results.filter(result => result.studentId === studentId)
  if (studentResults.length === 0) return []

  const resultsByEvaluation = studentResults.reduce((acc, result) => {
    const evaluationId = result.evaluatedAt ?
      evaluations.find(evaluation => new Date(evaluation.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
      evaluationResultsStore.evaluation.value?.id || 'current'

    const safeEvaluationId = evaluationId || 'unknown'
    if (!acc[safeEvaluationId]) {
      acc[safeEvaluationId] = []
    }
    acc[safeEvaluationId].push(result)
    return acc
  }, {} as Record<string, EvaluationResult[]>)

  const calculateByMetricType = (allResults: EvaluationResult[]) => {
    switch (metricType) {
      case 'domains':
        return [{
          name: 'Moyenne générale',
          evaluations: evaluations.map(evaluation => {
            const evalResults = resultsByEvaluation[evaluation.id] || []
            if (evalResults.length === 0) return { score: 0 }

            const scores = evalResults.map(result => {
              const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              return score
            })

            const totalScore = scores.reduce((sum, score) => sum + score, 0)
            const avgScore = totalScore / evalResults.length
            return { score: avgScore }
          })
        }]

      case 'fields':
        return [{
          name: 'Moyenne par champ',
          evaluations: evaluations.map(evaluation => {
            const evalResults = resultsByEvaluation[evaluation.id] || []
            if (evalResults.length === 0) return { score: 0 }

            const totalScore = evalResults.reduce((sum, result) => {
              const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              return sum + score
            }, 0)

            return { score: totalScore / evalResults.length }
          })
        }]

      case 'competencies': {
        const competencyGroups = allResults.reduce((acc, result) => {
          const key = result.competencyId || 'unknown'
          if (!acc[key]) {
            acc[key] = []
          }
          acc[key].push(result)
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        return Object.entries(competencyGroups).map(([competencyId, competencyResults]) => ({
          name: `Compétence ${competencyId.slice(-8)}`,
          evaluations: evaluations.map(evaluation => {
            const evalCompetencyResults = competencyResults.filter(result => {
              const resultEvaluationId = result.evaluatedAt ?
                evaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                evaluationResultsStore.evaluation.value?.id || 'current'
              return resultEvaluationId === evaluation.id
            })

            if (evalCompetencyResults.length === 0) return { score: 0 }

            const totalScore = evalCompetencyResults.reduce((sum, result) => {
              const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              return sum + score
            }, 0)

            return { score: totalScore / evalCompetencyResults.length }
          })
        }))
      }

      default:
        return []
    }
  }

  return calculateByMetricType(studentResults)
}

// Temporary fallback with static data if no real data is available
const fallbackStudentData = {
  student1: {
    domains: [
      { name: 'Français', evaluations: [{ score: 2.8 }, { score: 3.1 }, { score: 3.2 }] },
      { name: 'Mathématiques', evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }] },
      { name: 'Histoire-Géographie', evaluations: [{ score: 3.2 }, { score: 3.4 }, { score: 3.5 }] },
      { name: 'Sciences', evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }] },
      { name: 'Arts', evaluations: [{ score: 3.5 }, { score: 3.7 }, { score: 3.8 }] }
    ],
    fields: [
      { name: 'Lecture', evaluations: [{ score: 2.9 }, { score: 3.0 }, { score: 3.1 }] },
      { name: 'Écriture', evaluations: [{ score: 3.0 }, { score: 3.2 }, { score: 3.3 }] },
      { name: 'Calcul', evaluations: [{ score: 2.4 }, { score: 2.6 }, { score: 2.7 }] },
      { name: 'Géométrie', evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }] },
      { name: 'Mesures', evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }] }
    ],
    competencies: [
      { name: 'Comprendre un texte', evaluations: [{ score: 2.7 }, { score: 2.9 }, { score: 3.0 }] },
      { name: 'Rédiger un paragraphe', evaluations: [{ score: 2.9 }, { score: 3.1 }, { score: 3.2 }] },
      { name: 'Résoudre un problème', evaluations: [{ score: 2.3 }, { score: 2.5 }, { score: 2.6 }] },
      { name: 'Calculer mentalement', evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }] },
      { name: "Se repérer dans l'espace", evaluations: [{ score: 3.0 }, { score: 3.2 }, { score: 3.3 }] }
    ]
  },
  student2: {
    domains: [
      { name: 'Français', evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }] },
      { name: 'Mathématiques', evaluations: [{ score: 2.8 }, { score: 3.0 }, { score: 3.1 }] },
      { name: 'Histoire-Géographie', evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }] },
      { name: 'Sciences', evaluations: [{ score: 3.0 }, { score: 3.2 }, { score: 3.3 }] },
      { name: 'Arts', evaluations: [{ score: 2.9 }, { score: 3.1 }, { score: 3.2 }] }
    ],
    fields: [
      { name: 'Lecture', evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }] },
      { name: 'Écriture', evaluations: [{ score: 2.4 }, { score: 2.6 }, { score: 2.7 }] },
      { name: 'Calcul', evaluations: [{ score: 2.9 }, { score: 3.1 }, { score: 3.2 }] },
      { name: 'Géométrie', evaluations: [{ score: 2.7 }, { score: 2.9 }, { score: 3.0 }] },
      { name: 'Mesures', evaluations: [{ score: 2.8 }, { score: 3.0 }, { score: 3.1 }] }
    ],
    competencies: [
      { name: 'Comprendre un texte', evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }] },
      { name: 'Rédiger un paragraphe', evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }] },
      { name: 'Résoudre un problème', evaluations: [{ score: 2.8 }, { score: 3.0 }, { score: 3.1 }] },
      { name: 'Calculer mentalement', evaluations: [{ score: 3.0 }, { score: 3.2 }, { score: 3.3 }] },
      { name: "Se repérer dans l'espace", evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }] }
    ]
  }
}

// Student analysis helper functions
const getSelectedStudentName = () => {
  const student = students.value.find((s: { id: string; name: string }) => s.id === selectedStudent.value)
  return student ? student.name : ''
}

const getMetricTypeLabel = () => {
  const type = metricTypes.value.find((t: { value: string; label: string }) => t.value === selectedMetricType.value)
  return type ? type.label : ''
}

const getStudentData = () => {
  if (!selectedStudent.value) return []

  try {
    const dynamicData = calculateAveragesByLevel(selectedStudent.value, selectedMetricType.value)

    if (dynamicData.length > 0) {
      return dynamicData
    }

    const fallbackData = fallbackStudentData?.[selectedStudent.value as keyof typeof fallbackStudentData]

    if (fallbackData) {
      const result = (fallbackData as Record<string, Array<{ name: string; evaluations: Array<{ score: number }> }>>)[selectedMetricType.value] || []
      return result
    }

    return []
  } catch (error) {
    console.error('❌ Error getting student data:', error)
    return []
  }
}

// Initialize data on component mount
onMounted(async () => {
  try {
    if (studentsStore.allStudents.value.length === 0) {
      await studentsStore.refreshFromSupabase()
    }

    await evaluationStore.loadEvaluations()

    resultTypes.value = await resultTypesService.getResultTypes()

    if (evaluationStore.allEvaluations.value.length > 0) {
      const firstEvaluation = evaluationStore.allEvaluations.value[0]

      await evaluationResultsStore.initializeEvaluation({
        id: firstEvaluation.id,
        name: firstEvaluation.name,
        description: firstEvaluation.description,
        frameworkId: firstEvaluation.frameworkId,
        classId: firstEvaluation.classId,
        createdAt: firstEvaluation.createdAt
      })
    }
  } catch (error) {
    console.error('❌ Error loading analysis data:', error)
  }
})
</script>

<style scoped>
/* Page Content */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Controls Section */
.controls-section {
  margin-bottom: 32px;
}

/* Charts Section */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

/* Export Buttons */
.export-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.export-button:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-primary);
}

.export-button:active {
  background: var(--md-sys-color-primary-container);
}

.export-single {
  padding: 8px;
  border-radius: var(--md-sys-shape-corner-full);
  min-width: 40px;
  min-height: 40px;
}

.export-icon {
  width: 20px;
  height: 20px;
}

.export-all .export-icon {
  width: 16px;
  height: 16px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .footer-actions {
    justify-content: center;
  }

  .export-all {
    width: 100%;
    justify-content: center;
  }

  .charts-grid {
    gap: 16px;
  }

  .export-single {
    align-self: flex-end;
  }
}
</style>