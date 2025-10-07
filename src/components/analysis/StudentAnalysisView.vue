<template>
  <div class="student-analysis-container">
    <!-- Student Selector (outside card) -->
    <div class="student-selector-wrapper">
      <label for="student-select" class="selector-label">Sélectionner un élève</label>
      <select
        id="student-select"
        v-model="selectedStudent"
        class="student-select"
        @change="updateStudent"
      >
        <option value="">Choisir un élève...</option>
        <option v-for="student in students" :key="student.id" :value="student.id">
          {{ student.name }}
        </option>
      </select>
    </div>

    <!-- Main Card: Evaluation des compétences -->
    <ChartCard v-if="selectedStudent" class="competencies-card">
      <template #title>
        <div class="main-card-header">
          <h2 class="main-card-title">
            Évaluation des compétences de {{ students.find(s => s.id === selectedStudent)?.name || 'l\'élève' }}
          </h2>
        </div>
      </template>

      <!-- Radar Charts Section -->
      <div class="radar-charts-grid">
        <!-- Domain Radar Chart -->
        <div class="radar-chart-section">
          <h3 class="section-title">Radar par domaine</h3>
          <div class="chart-container">
            <DomainRadarChart
              :chart-data="getDomainRadarData()"
              :evaluation-periods="evaluationPeriods"
            />
          </div>
        </div>

        <!-- Fields Radar Chart -->
        <div class="radar-chart-section">
          <h3 class="section-title">Radar par champ</h3>
          <div class="chart-container">
            <DomainRadarChart
              :chart-data="getFieldRadarData()"
              :evaluation-periods="evaluationPeriods"
            />
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="section-divider"></div>

      <!-- Detailed Analysis Section -->
      <div class="detailed-analysis-section">
        <div class="analysis-header">
          <h3 class="section-title">Analyse détaillée</h3>
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

        <div class="chart-container">
          <DetailedAnalysisChart
            :chart-data="getStudentData()"
            :evaluation-periods="evaluationPeriods"
          />
        </div>

        <div class="chart-actions">
          <button
            class="export-button chart-export"
            title="Exporter les résultats de l'élève en PDF"
            @click="$emit('export-student-chart')"
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
            title="Partager les résultats de l'élève par email"
            @click="shareStudentChart"
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
    </ChartCard>

    <!-- Empty State when no student selected -->
    <div v-else class="empty-state-card">
      <EmptyState
        title="Sélectionnez un élève"
        description="Choisissez un élève dans la liste ci-dessus pour voir ses résultats d'évaluation"
      />
    </div>

    <!-- Share Results Dialog -->
    <ShareResultsDialog
      :visible="showShareDialog"
      :evaluation-info="shareEvaluationInfo"
      @close="showShareDialog = false"
      @send-email="handleSendEmail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { useEvaluationResultsStore } from '@/stores/evaluationResultsStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'
import { supabaseEvaluationResultsService } from '@/services/supabaseEvaluationResultsService'
import { supabaseStudentClassesService } from '@/services/supabaseStudentClassesService'
import { supabaseEvaluationClassesService } from '@/services/supabaseEvaluationClassesService'
import type { EvaluationResult, ResultTypeConfig, Student } from '@/types/evaluation'

import DetailedAnalysisChart from '@/components/analysis/DetailedAnalysisChart.vue'
import DomainRadarChart from '@/components/analysis/DomainRadarChart.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ShareResultsDialog from '@/components/common/ShareResultsDialog.vue'

interface Props {
  classId?: string
}

const props = withDefaults(defineProps<Props>(), {
  classId: undefined
})

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

// All results from all evaluations for analysis
const allEvaluationResults = ref<EvaluationResult[]>([])

// Filtered evaluations (only those with results loaded)
const filteredEvaluations = ref<Array<{ id: string; name: string }>>([])

// Student analysis data
const selectedStudent = ref('')
const selectedMetricType = ref('domains')

// Students list for the class (if classId is provided)
const classStudents = ref<Student[]>([])

// Students list - filter by classId if provided
const students = computed(() => {
  // If classId is provided, use class-specific students
  const studentsList = props.classId ? classStudents.value : studentsStore.allStudents

  return studentsList.map(student => ({
    id: student.id,
    name: `${student.firstName} ${student.lastName}`
  }))
})

// Metric types
const metricTypes = ref([
  { value: 'domains', label: 'Domaines' },
  { value: 'fields', label: 'Champs' },
  { value: 'competencies', label: 'Compétences' },
  { value: 'specific-competencies', label: 'Sous-compétences' }
])

// Evaluation periods - generate colors for evaluations
const colorPalette = [
  '#4A90A4', // Teal-blue principal (couleur site)
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

// Helper function to get field name by ID
const getFieldNameById = (fieldId: string): string => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework

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
  const framework = frameworkStore.framework

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

// Helper function to get specific competency name by ID
const getSpecificCompetencyNameById = (specificCompetencyId: string): string => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      for (const competency of field.competencies) {
        const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
        if (specificComp) {
          return specificComp.name
        }
      }
    }
  }
  return `Sous-compétence ${specificCompetencyId.slice(-8)}`
}

// Helper function to get domain ID from specific competency ID
const getDomainIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework

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
  const framework = frameworkStore.framework

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
  const framework = frameworkStore.framework

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
  const framework = frameworkStore.framework

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
  const framework = frameworkStore.framework

  const domain = framework.domains.find(d => d.id === domainId)
  return domain ? domain.name : `Domaine ${domainId.slice(-8)}`
}

// Function to convert evaluation result value to score using pivot_value
// Returns null for N/A values to exclude them from calculations
const getScoreFromValue = (value: string, resultTypeConfigId?: string): number | null => {
  if (!value || !resultTypeConfigId) {
    console.log('🔢 [getScoreFromValue] Missing value or config:', { value, resultTypeConfigId })
    return null
  }

  // Return null for N/A values to exclude them from calculations
  if (value === 'N/A' || value === 'Non évalué') {
    console.log('🔢 [getScoreFromValue] N/A value, excluding from calculation')
    return null
  }

  const resultType = resultTypes.value.find(rt => rt.id === resultTypeConfigId)
  if (!resultType) {
    console.log('🔢 [getScoreFromValue] Result type not found:', resultTypeConfigId)
    return null
  }

  let finalScore = 0

  if (resultType.type === 'numeric') {
    // Handle numeric type - calculate score based on range
    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      console.log('🔢 [getScoreFromValue] Invalid numeric value:', value)
      return 0
    }

    const minValue = resultType.config.minValue ?? 0
    const maxValue = resultType.config.maxValue ?? 10

    // Calculate score: proportional between min and max, capped at 10
    if (numericValue <= minValue) {
      finalScore = 0
    } else if (numericValue >= maxValue) {
      finalScore = 10
    } else {
      // Linear interpolation between min and max
      finalScore = ((numericValue - minValue) / (maxValue - minValue)) * 10
    }

    console.log('🔢 [getScoreFromValue] Numeric conversion:', {
      value,
      numericValue,
      minValue,
      maxValue,
      resultType: resultType.name,
      finalScore: finalScore.toFixed(1)
    })
  } else {
    // Handle other types - find the corresponding pivot value
    const configValue = resultType.config.values.find(v => v.value === value)
    if (!configValue) {
      console.log('🔢 [getScoreFromValue] Config value not found:', { value, availableValues: resultType.config.values })
      return null
    }

    // Check if this is a N/A value (pivot_value might be null or 0 for N/A)
    if (configValue.pivot_value === null || configValue.pivot_value === undefined) {
      console.log('🔢 [getScoreFromValue] N/A pivot value detected, excluding from calculation')
      return null
    }

    finalScore = configValue.pivot_value // Direct pivot_value (sur 10)
    console.log('🔢 [getScoreFromValue] Conversion:', {
      value,
      resultType: resultType.name,
      pivotValue: configValue.pivot_value,
      finalScore: finalScore.toFixed(1)
    })
  }

  return finalScore
}

// Function to calculate averages by level (domains, fields, competencies) across multiple evaluations
const calculateAveragesByLevel = (studentId: string, metricType: string) => {
  console.log('📊 [calculateAveragesByLevel] Starting calculation:', { studentId, metricType })

  const results = allEvaluationResults.value
  // Use filteredEvaluations to only show evaluations from the current class
  const evaluations = filteredEvaluations.value

  console.log('📊 [calculateAveragesByLevel] Data sources:', {
    totalResults: results?.length || 0,
    filteredEvaluationsCount: evaluations?.length || 0
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
    // Use the evaluationId we added to each result, fallback to old logic if not available
    const evaluationId = (result as EvaluationResult & { evaluationId?: string }).evaluationId ||
      (result.evaluatedAt ?
        evaluationStore.allEvaluations.find(evaluation => new Date(evaluation.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
        evaluationResultsStore.evaluation.value?.id || 'current')

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
    const frameworkStore = useCompetencyFrameworkStore()
    const framework = frameworkStore.framework

    switch (metricType) {
      case 'domains': {
        console.log('📊 [domains] Starting domain calculation')

        // Get ALL domains from framework
        const allDomains = framework.domains || []

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

        // Include ALL domains, even those without results
        return allDomains.map(domain => {
          const domainResults = domainGroups[domain.id] || []
          console.log(`📊 [domains] Processing domain: ${domain.name} (${domainResults.length} results)`)

          const evaluationScores = evaluations.map(evaluation => {
            const evalDomainResults = domainResults.filter(result => {
              const resultEvaluationId = (result as EvaluationResult & { evaluationId?: string }).evaluationId ||
                (result.evaluatedAt ?
                  evaluationStore.allEvaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                  evaluationResultsStore.evaluation.value?.id || 'current')
              return resultEvaluationId === evaluation.id
            })

            console.log(`📊 [domains] ${domain.name} - ${evaluation.name}: ${evalDomainResults.length} results`)

            if (evalDomainResults.length === 0) return { score: 0 }

            const scores = evalDomainResults.map(result => {
              const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
              const resultTypeConfigId = getResultTypeConfigId(effectiveSpecificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : null
              return score
            }).filter(score => score !== null) as number[] // Filter out N/A values

            // Only calculate average if we have valid scores
            const averageScore = scores.length > 0
              ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
              : 0

            console.log(`📊 [domains] ${domain.name} - ${evaluation.name} calculation:`, {
              individualScores: scores.map(s => s.toFixed(2)),
              validScoresCount: scores.length,
              totalResults: evalDomainResults.length,
              count: evalDomainResults.length,
              averageScore: averageScore.toFixed(1)
            })

            return { score: averageScore }
          })

          return {
            id: domain.id, // Add unique domain ID
            name: domain.name,
            evaluations: evaluationScores
          }
        })
      }

      case 'fields': {
        console.log('📊 [fields] Starting field calculation')

        // Get ALL fields from framework
        const allFields = framework.domains?.flatMap(domain => domain.fields || []) || []

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

        // Include ALL fields, even those without results
        return allFields.map(field => {
          const fieldResults = fieldGroups[field.id] || []

          // Get domain name for this field
          const domainId = getDomainIdFromFieldId(field.id)
          const domainName = domainId ? getDomainNameById(domainId) : 'Domaine inconnu'
          const displayName = `${domainName} - ${field.name}`

          console.log(`📊 [fields] Processing field: ${displayName} (${fieldResults.length} results)`)

          const evaluationScores = evaluations.map(evaluation => {
            const evalFieldResults = fieldResults.filter(result => {
              const resultEvaluationId = (result as EvaluationResult & { evaluationId?: string }).evaluationId ||
                (result.evaluatedAt ?
                  evaluationStore.allEvaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                  evaluationResultsStore.evaluation.value?.id || 'current')
              return resultEvaluationId === evaluation.id
            })

            console.log(`📊 [fields] ${displayName} - ${evaluation.name}: ${evalFieldResults.length} results`)

            if (evalFieldResults.length === 0) return { score: 0 }

            const scores = evalFieldResults.map(result => {
              const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
              const resultTypeConfigId = getResultTypeConfigId(effectiveSpecificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : null
              return score
            }).filter(score => score !== null) as number[] // Filter out N/A values

            // Only calculate average if we have valid scores
            const averageScore = scores.length > 0
              ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
              : 0

            console.log(`📊 [fields] ${displayName} - ${evaluation.name} calculation:`, {
              individualScores: scores.map(s => s.toFixed(2)),
              validScoresCount: scores.length,
              totalResults: evalFieldResults.length,
              count: evalFieldResults.length,
              averageScore: averageScore.toFixed(1)
            })

            return { score: averageScore }
          })

          return {
            id: field.id, // Add unique field ID
            name: displayName, // Use "Domain - Field" format
            evaluations: evaluationScores
          }
        })
      }

      case 'competencies': {
        console.log('📊 [competencies] Starting competency calculation')

        // Get ALL competencies from framework
        const allCompetencies = framework.domains?.flatMap(domain =>
          domain.fields?.flatMap(field => field.competencies || []) || []
        ) || []

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

        // Include ALL competencies, even those without results
        return allCompetencies.map(competency => {
          const competencyResults = competencyGroups[competency.id] || []
          console.log(`📊 [competencies] Processing competency: ${competency.name} (${competencyResults.length} results)`)

          const evaluationScores = evaluations.map(evaluation => {
            const evalCompetencyResults = competencyResults.filter(result => {
              const resultEvaluationId = (result as EvaluationResult & { evaluationId?: string }).evaluationId ||
                (result.evaluatedAt ?
                  evaluationStore.allEvaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                  evaluationResultsStore.evaluation.value?.id || 'current')
              return resultEvaluationId === evaluation.id
            })

            console.log(`📊 [competencies] ${competency.name} - ${evaluation.name}: ${evalCompetencyResults.length} results`)

            if (evalCompetencyResults.length === 0) return { score: 0 }

            const scores = evalCompetencyResults.map(result => {
              const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
              const resultTypeConfigId = getResultTypeConfigId(effectiveSpecificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : null
              return score
            }).filter(score => score !== null) as number[] // Filter out N/A values

            // Only calculate average if we have valid scores
            const averageScore = scores.length > 0
              ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
              : 0

            console.log(`📊 [competencies] ${competency.name} - ${evaluation.name} calculation:`, {
              individualScores: scores.map(s => s.toFixed(2)),
              validScoresCount: scores.length,
              totalResults: evalCompetencyResults.length,
              count: evalCompetencyResults.length,
              averageScore: averageScore.toFixed(1)
            })

            return { score: averageScore }
          })

          return {
            id: competency.id, // Add unique competency ID
            name: competency.name,
            evaluations: evaluationScores
          }
        })
      }

      case 'specific-competencies': {
        console.log('📊 [specific-competencies] Starting specific competency calculation')

        // Get ALL specific competencies from framework
        const allSpecificCompetencies = framework.domains?.flatMap(domain =>
          domain.fields?.flatMap(field =>
            field.competencies?.flatMap(competency =>
              competency.specificCompetencies || []
            ) || []
          ) || []
        ) || []

        console.log('📊 [specific-competencies] Found specific competencies:', allSpecificCompetencies.length)

        // Group results by specific competency ID
        const specificCompetencyGroups = allResults.reduce((acc, result) => {
          const specificCompetencyId = result.specificCompetencyId || result.competencyId || ''
          console.log('📊 [specific-competencies] Processing result with specificCompetencyId:', specificCompetencyId)

          if (specificCompetencyId) {
            if (!acc[specificCompetencyId]) {
              acc[specificCompetencyId] = []
            }
            acc[specificCompetencyId].push(result)
          }
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        console.log('📊 [specific-competencies] Specific competency groups:',
          Object.entries(specificCompetencyGroups).map(([specificCompId, results]) => ({
            specificCompetencyId: specificCompId,
            specificCompetencyName: getSpecificCompetencyNameById(specificCompId),
            resultCount: results.length
          }))
        )

        // Include ALL specific competencies, even those without results
        return allSpecificCompetencies.map(specificCompetency => {
          const specificCompResults = specificCompetencyGroups[specificCompetency.id] || []

          // Get parent competency for display name
          const competencyId = getCompetencyIdFromSpecificCompetencyId(specificCompetency.id)
          const competencyName = competencyId ? getCompetencyNameById(competencyId) : 'Compétence inconnue'
          const displayName = `${competencyName} - ${specificCompetency.name}`

          console.log(`📊 [specific-competencies] Processing: ${displayName} (${specificCompResults.length} results)`)

          const evaluationScores = evaluations.map(evaluation => {
            const evalSpecificResults = specificCompResults.filter(result => {
              const resultEvaluationId = (result as EvaluationResult & { evaluationId?: string }).evaluationId ||
                (result.evaluatedAt ?
                  evaluationStore.allEvaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                  evaluationResultsStore.evaluation.value?.id || 'current')
              return resultEvaluationId === evaluation.id
            })

            console.log(`📊 [specific-competencies] ${displayName} - ${evaluation.name}: ${evalSpecificResults.length} results`)

            if (evalSpecificResults.length === 0) return { score: 0 }

            const scores = evalSpecificResults.map(result => {
              const resultTypeConfigId = getResultTypeConfigId(specificCompetency.id)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : null
              return score
            }).filter(score => score !== null) as number[]

            // Calculate average score (no averaging needed since it's the actual score)
            const averageScore = scores.length > 0
              ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
              : 0

            console.log(`📊 [specific-competencies] ${displayName} - ${evaluation.name} score:`, {
              scores: scores.map(s => s.toFixed(2)),
              validScoresCount: scores.length,
              averageScore: averageScore.toFixed(1)
            })

            return { score: averageScore }
          })

          return {
            id: specificCompetency.id,
            name: displayName,
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

// Student analysis helper functions

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

    console.log('📊 [getStudentData] No data found for student')
    return []
  } catch (error) {
    console.error('❌ [getStudentData] Error getting student data:', error)
    return []
  }
}

const updateStudent = () => {
  // La mise à jour se fait automatiquement via v-model
}

// Get domain data for radar chart
const getDomainRadarData = () => {
  if (!selectedStudent.value) {
    console.log('📊 [getDomainRadarData] No student selected')
    return []
  }

  console.log('📊 [getDomainRadarData] Getting domain data for student:', selectedStudent.value)

  try {
    // Always use 'domains' metric type for radar chart
    const domainData = calculateAveragesByLevel(selectedStudent.value, 'domains')

    if (domainData.length > 0) {
      console.log('📊 [getDomainRadarData] Domain data:', domainData)
      return domainData
    }

    console.log('📊 [getDomainRadarData] No domain data found')
    return []
  } catch (error) {
    console.error('❌ [getDomainRadarData] Error getting domain data:', error)
    return []
  }
}

// Get field data for radar chart
const getFieldRadarData = () => {
  if (!selectedStudent.value) {
    console.log('📊 [getFieldRadarData] No student selected')
    return []
  }

  console.log('📊 [getFieldRadarData] Getting field data for student:', selectedStudent.value)

  try {
    // Use 'fields' metric type for radar chart
    const fieldData = calculateAveragesByLevel(selectedStudent.value, 'fields')

    if (fieldData.length > 0) {
      console.log('📊 [getFieldRadarData] Field data:', fieldData)
      return fieldData
    }

    console.log('📊 [getFieldRadarData] No field data found')
    return []
  } catch (error) {
    console.error('❌ [getFieldRadarData] Error getting field data:', error)
    return []
  }
}

// Initialize data on component mount
onMounted(async () => {
  try {
    if (studentsStore.allStudents.length === 0) {
      await studentsStore.refreshFromSupabase()
    }

    // If classId is provided, load students for that specific class
    if (props.classId) {
      classStudents.value = await supabaseStudentClassesService.getStudentsForClass(props.classId)
    }

    await evaluationStore.loadEvaluations()

    resultTypes.value = await resultTypesService.getResultTypes()

    // Load results from evaluations (filtered by class if classId is provided)
    const allEvaluations = evaluationStore.allEvaluations

    if (allEvaluations.length > 0) {
      console.log('📊 [StudentAnalysisView] Loading results from evaluations:', allEvaluations.length)

      // Load results from evaluations and aggregate them
      const allResults: EvaluationResult[] = []
      const loadedEvaluations: Array<{ id: string; name: string }> = []

      for (const evaluation of allEvaluations) {
        try {
          // If classId is provided, check if this evaluation belongs to the class
          if (props.classId) {
            const evaluationClasses = await supabaseEvaluationClassesService.getClassesForEvaluation(evaluation.id)
            const evaluationClassIds = evaluationClasses.map(ec => ec.id)

            // Skip this evaluation if it doesn't belong to the current class
            if (!evaluationClassIds.includes(props.classId)) {
              console.log('📊 [StudentAnalysisView] Skipping evaluation (not in class):', evaluation.name)
              continue
            }
          }

          console.log('📊 [StudentAnalysisView] Loading results for evaluation:', evaluation.name)
          const evaluationResults = await supabaseEvaluationResultsService.getAllResults(evaluation.id)
          console.log('📊 [StudentAnalysisView] Loaded', evaluationResults.length, 'results for', evaluation.name)

          // Add evaluation ID to each result for proper grouping
          const resultsWithEvaluationId = evaluationResults.map(result => ({
            ...result,
            evaluationId: evaluation.id
          }))

          allResults.push(...resultsWithEvaluationId)
          loadedEvaluations.push({ id: evaluation.id, name: evaluation.name })
        } catch (error) {
          console.error('❌ [StudentAnalysisView] Error loading results for', evaluation.name, ':', error)
        }
      }

      allEvaluationResults.value = allResults
      filteredEvaluations.value = loadedEvaluations
      console.log('📊 [StudentAnalysisView] Total results loaded:', allResults.length)
      console.log('📊 [StudentAnalysisView] Filtered evaluations:', loadedEvaluations.map(e => e.name).join(', '))

      // Still initialize the store with the first evaluation for compatibility
      const firstEvaluation = evaluationStore.allEvaluations[0]
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

// Share functionality
const showShareDialog = ref(false)

const shareEvaluationInfo = computed(() => {
  const selectedStudentName = students.value.find(s => s.id === selectedStudent.value)?.name || 'Aucun élève sélectionné'
  return {
    name: `Analyse individuelle - ${selectedStudentName}`,
    description: `Analyse individuelle de l'élève ${selectedStudentName} par ${metricTypes.value.find(type => type.value === selectedMetricType.value)?.label || 'domaines'}`,
    studentsCount: 1,
    competenciesCount: useCompetencyFrameworkStore().framework.domains.reduce((total, domain) => 
      total + domain.fields.reduce((fieldTotal, field) => 
        fieldTotal + field.competencies.reduce((compTotal, comp) => 
          compTotal + comp.specificCompetencies.length, 0), 0), 0)
  }
})

const shareStudentChart = () => {
  if (!selectedStudent.value) {
    alert('Veuillez sélectionner un élève avant de partager')
    return
  }
  console.log('📧 [StudentAnalysisView] Opening share dialog for student chart')
  showShareDialog.value = true
}

const handleSendEmail = async (data: { emails: string[]; message: string }) => {
  console.log('📧 [StudentAnalysisView] Sending student chart via email', {
    recipients: data.emails.length,
    messageLength: data.message.length
  })

  try {
    // Capture le graphique pour le partage
    const chartElement = document.querySelector('.chart-container')
    if (!chartElement) {
      alert('Impossible de trouver le graphique à partager')
      return
    }

    // Générer le canvas
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(chartElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    })

    // Créer le PDF pour le partage
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15
    const imgWidth = pageWidth - (margin * 2)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Ajouter le titre
    pdf.setFontSize(16)
    const selectedStudentName = students.value.find(s => s.id === selectedStudent.value)?.name || 'Élève'
    pdf.text(`Analyse individuelle - ${selectedStudentName}`, margin, 20)

    // Ajouter la date
    pdf.setFontSize(10)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 30)

    // Ajouter le type de métrique
    const metricTypeLabel = metricTypes.value.find(type => type.value === selectedMetricType.value)?.label || ''
    pdf.text(`Type d'analyse: ${metricTypeLabel}`, margin, 40)

    // Ajouter l'image du graphique
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', margin, 50, imgWidth, imgHeight)

    // Préparer les données pour le service de partage
    const studentInfo = students.value.find(s => s.id === selectedStudent.value)
    const evaluationData = {
      evaluation: {
        id: 'student-analysis',
        name: `Analyse individuelle - ${selectedStudentName}`,
        description: `Analyse individuelle de l'élève ${selectedStudentName} par ${metricTypeLabel}`,
        date: new Date().toLocaleDateString('fr-FR'),
        className: '',
        schoolYearFilter: ''
      },
      students: studentInfo ? [{
        id: selectedStudent.value,
        firstName: studentInfo.name.split(' ')[0] || '',
        lastName: studentInfo.name.split(' ').slice(1).join(' ') || '',
        fullName: studentInfo.name
      }] : [],
      results: [],
      summary: {
        totalStudents: 1,
        totalCompetencies: useCompetencyFrameworkStore().framework.domains.reduce((total, domain) =>
          total + domain.fields.reduce((fieldTotal, field) =>
            fieldTotal + field.competencies.reduce((compTotal, comp) =>
              compTotal + comp.specificCompetencies.length, 0), 0), 0),
        exportDate: new Date().toISOString()
      },
      competencies: [] // Individual analysis doesn't have detailed competency data
    }

    // Importer et utiliser le service de partage
    const { shareResultsService } = await import('@/services/shareResultsService')
    const result = await shareResultsService.shareEvaluationResults(
      evaluationData,
      data.emails,
      data.message
    )

    if (result.success) {
      console.log('✅ [StudentAnalysisView] Student chart shared successfully')
      alert(`✅ ${result.message}`)
      showShareDialog.value = false
    } else {
      console.error('❌ [StudentAnalysisView] Failed to share student chart:', result.message)
      alert(`❌ ${result.message}`)
    }
  } catch (error) {
    console.error('❌ [StudentAnalysisView] Error sharing student chart:', error)
    alert('Erreur lors du partage du graphique. Veuillez réessayer.')
  }
}
</script>

<style scoped>
/* Main Container */
.student-analysis-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
}

/* Student Selector (outside card) */
.student-selector-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-label {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  letter-spacing: 0.1px;
}

.student-select {
  padding: 12px 16px;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  background-color: var(--md-sys-color-surface-container, #f3edf7);
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 400px;
}

.student-select:hover {
  background-color: var(--md-sys-color-surface-container-high, #ece6f0);
  border-color: var(--md-sys-color-primary, #6750a4);
}

.student-select:focus {
  outline: none;
  border-color: var(--md-sys-color-primary, #6750a4);
  box-shadow: 0 0 0 2px rgba(103, 80, 164, 0.1);
}

/* Main Competencies Card */
.competencies-card {
  background: var(--md-sys-color-surface);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.main-card-header {
  margin-bottom: 24px;
}

.main-card-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0;
}

/* Radar Charts Grid */
.radar-charts-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 32px;
}

.radar-chart-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Section Title */
.section-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0;
}

/* Section Divider */
.section-divider {
  height: 1px;
  background-color: var(--md-sys-color-outline-variant, #c4c7c5);
  margin: 32px 0;
}

/* Detailed Analysis Section */
.detailed-analysis-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

/* Empty State Card */
.empty-state-card {
  background: var(--md-sys-color-surface);
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* Page Content */
.charts-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
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

.chart-title-text {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
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

/* Charts Section */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
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

/* Student selector in chart title */
.chart-title-with-selector {
  display: flex;
  align-items: center;
}

.student-select-in-title {
  padding: 8px 12px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 8px;
  background: var(--md-sys-color-surface-container, #f0f4f3);
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  cursor: pointer;
  min-width: 200px;
  width: 100%;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.student-select-in-title:focus {
  outline: none;
  border-color: var(--md-sys-color-primary, #6750a4);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 20%, transparent);
}

.student-select-in-title:hover {
  background: var(--md-sys-color-surface-container-high, #f3edf7);
  border-color: var(--md-sys-color-primary, #6750a4);
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
  width: 16px;
  height: 16px;
}

.export-all .export-icon {
  width: 16px;
  height: 16px;
}

/* Chart actions */
.chart-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Share button styles */
.chart-share {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--md-sys-color-secondary, #625b71);
  color: var(--md-sys-color-on-secondary, #ffffff);
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

.chart-share:hover {
  background: var(--md-sys-color-secondary-container, #e8def8);
  color: var(--md-sys-color-on-secondary-container, #1d192b);
  box-shadow:
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.chart-share:active {
  background: var(--md-sys-color-secondary, #625b71);
  color: var(--md-sys-color-on-secondary, #ffffff);
  box-shadow:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.share-icon {
  width: 16px;
  height: 16px;
}


/* Responsive Design */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .chart-header {
    gap: 12px;
  }

  .student-select-in-title {
    font-size: 1rem;
    min-width: 160px;
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

  .chart-share {
    padding: 10px 14px;
    font-size: 0.8rem;
  }

  .chart-actions {
    gap: 8px;
  }


  .charts-grid {
    gap: 16px;
  }
}
</style>