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

// Helper function to get field name by ID
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

// Helper function to get competency name by ID
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

// Helper function to get domain ID from specific competency ID
const getDomainIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  console.log('🔍 [getDomainIdFromSpecificCompetencyId] Searching for specificCompetencyId:', specificCompetencyId)

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      for (const competency of field.competencies) {
        const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
        if (specificComp) {
          console.log('🔍 [getDomainIdFromSpecificCompetencyId] Found:', specificComp.name, 'in domain:', domain.name)
          return domain.id
        }
      }
    }
  }
  console.log('🔍 [getDomainIdFromSpecificCompetencyId] Not found:', specificCompetencyId)
  return undefined
}

// Helper function to get field ID from specific competency ID
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

// Helper function to get competency ID from specific competency ID
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


// Helper function to get domain ID from field ID
const getDomainIdFromFieldId = (fieldId: string): string | undefined => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  for (const domain of framework.domains) {
    const field = domain.fields.find(f => f.id === fieldId)
    if (field) {
      return domain.id
    }
  }
  return undefined
}

// Helper function to get domain name by ID
const getDomainNameById = (domainId: string): string => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  const domain = framework.domains.find(d => d.id === domainId)
  return domain ? domain.name : `Domaine ${domainId.slice(-8)}`
}

// Function to convert evaluation result value to score using pivot_value
const getScoreFromValue = (value: string, resultTypeConfigId?: string): number => {
  if (!value || !resultTypeConfigId) {
    console.log('🔢 [getScoreFromValue] Missing value or config:', { value, resultTypeConfigId })
    return 0
  }

  const resultType = resultTypes.value.find(rt => rt.id === resultTypeConfigId)
  if (!resultType) {
    console.log('🔢 [getScoreFromValue] Result type not found:', resultTypeConfigId)
    return 0
  }

  const configValue = resultType.config.values.find(v => v.value === value)
  if (!configValue) {
    console.log('🔢 [getScoreFromValue] Config value not found:', { value, availableValues: resultType.config.values })
    return 0
  }

  const finalScore = configValue.pivot_value // Direct pivot_value (sur 10)
  console.log('🔢 [getScoreFromValue] Conversion:', {
    value,
    resultType: resultType.name,
    pivotValue: configValue.pivot_value,
    finalScore: finalScore.toFixed(1)
  })

  return finalScore
}

// Function to calculate averages by level (domains, fields, competencies) across multiple evaluations
const calculateAveragesByLevel = (studentId: string, metricType: string) => {
  console.log('📊 [calculateAveragesByLevel] Starting calculation:', { studentId, metricType })

  const results = evaluationResultsStore.results.value
  const evaluations = evaluationStore.allEvaluations.value

  console.log('📊 [calculateAveragesByLevel] Data sources:', {
    totalResults: results?.length || 0,
    totalEvaluations: evaluations?.length || 0
  })

  if (!Array.isArray(results) || results.length === 0 || evaluations.length === 0) {
    console.log('📊 [calculateAveragesByLevel] No data available')
    return []
  }

  const studentResults = results.filter(result => result.studentId === studentId)
  console.log('📊 [calculateAveragesByLevel] Student results:', {
    studentId,
    studentResultsCount: studentResults.length,
    sampleResults: studentResults.slice(0, 3).map(r => ({
      competencyId: r.competencyId,
      specificCompetencyId: r.specificCompetencyId,
      value: r.value,
      evaluatedAt: r.evaluatedAt,
      fullResult: r // Show complete result structure
    })),
    allResultIds: studentResults.map(r => ({
      competencyId: r.competencyId,
      specificCompetencyId: r.specificCompetencyId
    }))
  })

  // Check if competencyId actually contains specificCompetencyId values
  console.log('🔍 [calculateAveragesByLevel] Checking if competencyId contains specific competency IDs:')
  studentResults.slice(0, 3).forEach((result, index) => {
    console.log(`🔍 Result ${index + 1}:`, {
      competencyId: result.competencyId,
      specificCompetencyId: result.specificCompetencyId,
      isCompetencyIdActuallySpecific: !!getDomainIdFromSpecificCompetencyId(result.competencyId || '')
    })
  })

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

  console.log('📊 [calculateAveragesByLevel] Results grouped by evaluation:',
    Object.entries(resultsByEvaluation).map(([evalId, results]) => ({
      evaluationId: evalId,
      resultCount: results.length,
      evaluationName: evaluations.find(e => e.id === evalId)?.name || 'Unknown'
    }))
  )

  const calculateByMetricType = (allResults: EvaluationResult[]) => {
    switch (metricType) {
      case 'domains': {
        console.log('📊 [domains] Starting domain calculation')
        // Group results by domain using specificCompetencyId (fallback to competencyId if empty)
        const domainGroups = allResults.reduce((acc, result) => {
          const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
          console.log('📊 [domains] Processing result with effectiveSpecificCompetencyId:', effectiveSpecificCompetencyId,
            '(from', result.specificCompetencyId ? 'specificCompetencyId' : 'competencyId fallback', ')')

          const domainId = getDomainIdFromSpecificCompetencyId(effectiveSpecificCompetencyId)
          console.log('📊 [domains] Mapped to domainId:', domainId)

          if (domainId) {
            if (!acc[domainId]) {
              acc[domainId] = []
            }
            acc[domainId].push(result)
          } else {
            console.log('📊 [domains] No domain found for effectiveSpecificCompetencyId:', effectiveSpecificCompetencyId)
          }
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        console.log('📊 [domains] Domain groups:',
          Object.entries(domainGroups).map(([domainId, results]) => ({
            domainId,
            domainName: getDomainNameById(domainId),
            resultCount: results.length
          }))
        )

        return Object.entries(domainGroups).map(([domainId, domainResults]) => {
          const domainName = getDomainNameById(domainId)
          console.log(`📊 [domains] Processing domain: ${domainName} (${domainResults.length} results)`)

          const evaluationScores = evaluations.map(evaluation => {
            const evalDomainResults = domainResults.filter(result => {
              const resultEvaluationId = result.evaluatedAt ?
                evaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                evaluationResultsStore.evaluation.value?.id || 'current'
              return resultEvaluationId === evaluation.id
            })

            console.log(`📊 [domains] ${domainName} - ${evaluation.name}: ${evalDomainResults.length} results`)

            if (evalDomainResults.length === 0) return { score: 0 }

            const scores = evalDomainResults.map(result => {
              const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
              const resultTypeConfigId = getResultTypeConfigId(effectiveSpecificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              return score
            })

            const totalScore = scores.reduce((sum, score) => sum + score, 0)
            const averageScore = Math.round((totalScore / evalDomainResults.length) * 10) / 10

            console.log(`📊 [domains] ${domainName} - ${evaluation.name} calculation:`, {
              individualScores: scores.map(s => s.toFixed(2)),
              totalScore: totalScore.toFixed(2),
              count: evalDomainResults.length,
              averageScore: averageScore.toFixed(1)
            })

            return { score: averageScore }
          })

          return {
            id: domainId, // Add unique domain ID
            name: domainName,
            evaluations: evaluationScores
          }
        })
      }

      case 'fields': {
        console.log('📊 [fields] Starting field calculation')
        // Group results by field using specificCompetencyId (fallback to competencyId if empty)
        const fieldGroups = allResults.reduce((acc, result) => {
          const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
          console.log('📊 [fields] Processing result with effectiveSpecificCompetencyId:', effectiveSpecificCompetencyId,
            '(from', result.specificCompetencyId ? 'specificCompetencyId' : 'competencyId fallback', ')')

          const fieldId = getFieldIdFromSpecificCompetencyId(effectiveSpecificCompetencyId)
          console.log('📊 [fields] Mapped to fieldId:', fieldId)

          if (fieldId) {
            if (!acc[fieldId]) {
              acc[fieldId] = []
            }
            acc[fieldId].push(result)
          } else {
            console.log('📊 [fields] No field found for effectiveSpecificCompetencyId:', effectiveSpecificCompetencyId)
          }
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        console.log('📊 [fields] Field groups:',
          Object.entries(fieldGroups).map(([fieldId, results]) => ({
            fieldId,
            fieldName: getFieldNameById(fieldId),
            resultCount: results.length
          }))
        )

        return Object.entries(fieldGroups).map(([fieldId, fieldResults]) => {
          const fieldName = getFieldNameById(fieldId)

          // Get domain name for this field
          const domainId = getDomainIdFromFieldId(fieldId)
          const domainName = domainId ? getDomainNameById(domainId) : 'Domaine inconnu'
          const displayName = `${domainName} - ${fieldName}`

          console.log(`📊 [fields] Processing field: ${displayName} (${fieldResults.length} results)`)

          const evaluationScores = evaluations.map(evaluation => {
            const evalFieldResults = fieldResults.filter(result => {
              const resultEvaluationId = result.evaluatedAt ?
                evaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                evaluationResultsStore.evaluation.value?.id || 'current'
              return resultEvaluationId === evaluation.id
            })

            console.log(`📊 [fields] ${displayName} - ${evaluation.name}: ${evalFieldResults.length} results`)

            if (evalFieldResults.length === 0) return { score: 0 }

            const scores = evalFieldResults.map(result => {
              const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
              const resultTypeConfigId = getResultTypeConfigId(effectiveSpecificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              return score
            })

            const totalScore = scores.reduce((sum, score) => sum + score, 0)
            const averageScore = Math.round((totalScore / evalFieldResults.length) * 10) / 10

            console.log(`📊 [fields] ${displayName} - ${evaluation.name} calculation:`, {
              individualScores: scores.map(s => s.toFixed(2)),
              totalScore: totalScore.toFixed(2),
              count: evalFieldResults.length,
              averageScore: averageScore.toFixed(1)
            })

            return { score: averageScore }
          })

          return {
            id: fieldId, // Add unique field ID
            name: displayName, // Use "Domain - Field" format
            evaluations: evaluationScores
          }
        })
      }

      case 'competencies': {
        console.log('📊 [competencies] Starting competency calculation')
        // Group results by competency using specificCompetencyId to find parent competency (fallback to competencyId if empty)
        const competencyGroups = allResults.reduce((acc, result) => {
          const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
          console.log('📊 [competencies] Processing result with effectiveSpecificCompetencyId:', effectiveSpecificCompetencyId,
            '(from', result.specificCompetencyId ? 'specificCompetencyId' : 'competencyId fallback', ')')

          const competencyId = getCompetencyIdFromSpecificCompetencyId(effectiveSpecificCompetencyId)
          console.log('📊 [competencies] Mapped to competencyId:', competencyId)

          if (competencyId) {
            if (!acc[competencyId]) {
              acc[competencyId] = []
            }
            acc[competencyId].push(result)
          } else {
            console.log('📊 [competencies] No competency found for effectiveSpecificCompetencyId:', effectiveSpecificCompetencyId)
          }
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        console.log('📊 [competencies] Competency groups:',
          Object.entries(competencyGroups).map(([competencyId, results]) => ({
            competencyId,
            competencyName: getCompetencyNameById(competencyId),
            resultCount: results.length
          }))
        )

        return Object.entries(competencyGroups).map(([competencyId, competencyResults]) => {
          const competencyName = getCompetencyNameById(competencyId)
          console.log(`📊 [competencies] Processing competency: ${competencyName} (${competencyResults.length} results)`)

          const evaluationScores = evaluations.map(evaluation => {
            const evalCompetencyResults = competencyResults.filter(result => {
              const resultEvaluationId = result.evaluatedAt ?
                evaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                evaluationResultsStore.evaluation.value?.id || 'current'
              return resultEvaluationId === evaluation.id
            })

            console.log(`📊 [competencies] ${competencyName} - ${evaluation.name}: ${evalCompetencyResults.length} results`)

            if (evalCompetencyResults.length === 0) return { score: 0 }

            const scores = evalCompetencyResults.map(result => {
              const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
              const resultTypeConfigId = getResultTypeConfigId(effectiveSpecificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              return score
            })

            const totalScore = scores.reduce((sum, score) => sum + score, 0)
            const averageScore = Math.round((totalScore / evalCompetencyResults.length) * 10) / 10

            console.log(`📊 [competencies] ${competencyName} - ${evaluation.name} calculation:`, {
              individualScores: scores.map(s => s.toFixed(2)),
              totalScore: totalScore.toFixed(2),
              count: evalCompetencyResults.length,
              averageScore: averageScore.toFixed(1)
            })

            return { score: averageScore }
          })

          return {
            id: competencyId, // Add unique competency ID
            name: competencyName,
            evaluations: evaluationScores
          }
        })
      }

      default:
        console.log('📊 [calculateAveragesByLevel] Unknown metric type:', metricType)
        return []
    }
  }

  const finalResult = calculateByMetricType(studentResults)

  console.log('📊 [calculateAveragesByLevel] Final result:', {
    metricType,
    studentId,
    resultCount: finalResult.length,
    summary: finalResult.map(item => ({
      name: item.name,
      evaluationCount: item.evaluations.length,
      scores: item.evaluations.map(e => e.score.toFixed(1))
    }))
  })

  return finalResult
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
  if (!selectedStudent.value) {
    console.log('📊 [getStudentData] No student selected')
    return []
  }

  console.log('📊 [getStudentData] Getting data for:', {
    studentId: selectedStudent.value,
    metricType: selectedMetricType.value
  })

  try {
    const dynamicData = calculateAveragesByLevel(selectedStudent.value, selectedMetricType.value)

    if (dynamicData.length > 0) {
      console.log('📊 [getStudentData] Using dynamic data:', dynamicData.length, 'items')
      return dynamicData
    }

    console.log('📊 [getStudentData] No dynamic data found, trying fallback data')
    const fallbackData = fallbackStudentData?.[selectedStudent.value as keyof typeof fallbackStudentData]

    if (fallbackData) {
      const result = (fallbackData as Record<string, Array<{ name: string; evaluations: Array<{ score: number }> }>>)[selectedMetricType.value] || []
      console.log('📊 [getStudentData] Using fallback data:', result.length, 'items for metric type:', selectedMetricType.value)
      return result
    }

    console.log('📊 [getStudentData] No fallback data available')
    return []
  } catch (error) {
    console.error('❌ [getStudentData] Error getting student data:', error)
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