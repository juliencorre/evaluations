<template>
  <div class="dashboard-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement des données d'analyse...</p>
    </div>

    <!-- Main Card: Évaluation des compétences de la classe -->
    <ChartCard v-else class="competencies-card">
      <template #title>
        <div class="main-card-header">
          <h2 class="main-card-title">Évaluation des compétences de la classe</h2>
        </div>
      </template>

      <!-- Radar Charts Section -->
      <div class="radar-charts-grid">
        <!-- Domain Radar Chart -->
        <div class="radar-chart-section">
          <h3 class="section-title">Radar par domaine</h3>
          <div class="chart-container">
            <DomainRadarChart
              :chart-data="getDomainRadarData"
              :evaluation-periods="evaluationPeriods"
            />
          </div>
        </div>

        <!-- Fields Radar Chart -->
        <div class="radar-chart-section">
          <h3 class="section-title">Radar par champ</h3>
          <div class="chart-container">
            <DomainRadarChart
              :chart-data="getFieldRadarData"
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
            :chart-data="getDetailedAnalysisData"
            :evaluation-periods="evaluationPeriods"
          />
        </div>

        <div class="chart-actions">
          <button
            class="export-button chart-export"
            title="Exporter l'évaluation de la classe en PDF"
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
          <button
            class="share-button chart-share"
            title="Partager l'évaluation de la classe par email"
            @click="shareClassChart"
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
import {
  useStudentsStore,
  useCompetencyFrameworkStore,
  useEvaluationStore,
  useClassStore,
  useSchoolYearStore
} from '@/stores'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'
import { supabaseEvaluationResultsService } from '@/services/supabaseEvaluationResultsService'
import { supabaseEvaluationClassesService } from '@/services/supabaseEvaluationClassesService'
import type { EvaluationResult, ResultTypeConfig } from '@/types/evaluation'

import DomainRadarChart from '@/components/analysis/DomainRadarChart.vue'
import DetailedAnalysisChart from '@/components/analysis/DetailedAnalysisChart.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'
import ShareResultsDialog from '@/components/common/ShareResultsDialog.vue'

interface Props {
  classId?: string
}

const props = withDefaults(defineProps<Props>(), {
  classId: undefined
})

// Use stores
const studentsStore = useStudentsStore()
const evaluationStore = useEvaluationStore()
const classStore = useClassStore()
const schoolYearStore = useSchoolYearStore()
const frameworkStore = useCompetencyFrameworkStore()

// Services
const resultTypesService = new SupabaseResultTypesService()

// Filters state - initialize with classId if provided
const filters = ref({
  classIds: props.classId ? [props.classId] : [] as string[],
  yearIds: [] as string[]
})

// Available years (used internally for filtering logic)
const availableYears = computed(() => {
  return (schoolYearStore.schoolYears || []).map(y => ({
    id: y.id,
    name: y.name,
    is_current: y.is_current
  }))
})

// Loading state
const isLoading = ref(true)

// Result types configuration
const resultTypes = ref<ResultTypeConfig[]>([])

// All results from all evaluations for analysis
const allEvaluationResults = ref<EvaluationResult[]>([])

// Filtered evaluations (only those with results loaded)
const filteredEvaluations = ref<Array<{ id: string; name: string }>>([])

// Selected metric type
const selectedMetricType = ref('domains')

// Metric types
const metricTypes = ref([
  { value: 'domains', label: 'Domaines' },
  { value: 'fields', label: 'Champs' },
  { value: 'competencies', label: 'Compétences' }
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


// Export function
const exportClassChart = async () => {
  try {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    console.log('Exporting class competencies card')

    // Capture toute la card "Évaluation des compétences"
    const cardElement = document.querySelector('.competencies-card')
    if (!cardElement) {
      window.alert('Impossible de trouver la carte d\'évaluation à exporter')
      return
    }

    // Générer le canvas avec options optimisées pour PDF
    const canvas = await html2canvas(cardElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: cardElement.scrollWidth,
      windowHeight: cardElement.scrollHeight,
      width: cardElement.scrollWidth,
      height: cardElement.scrollHeight
    })

    // Créer le PDF avec format A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Dimensions du PDF
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const maxWidth = pageWidth - (margin * 2)

    // Calculer les dimensions de l'image
    let imgWidth = maxWidth
    let imgHeight = (canvas.height * imgWidth) / canvas.width

    // Si l'image est trop haute pour une seule page, l'ajuster
    const maxHeightPerPage = pageHeight - (margin * 2)

    const imgData = canvas.toDataURL('image/png')

    if (imgHeight <= maxHeightPerPage) {
      // L'image tient sur une seule page
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight)
    } else {
      // L'image nécessite plusieurs pages
      let remainingHeight = imgHeight
      let sourceY = 0
      let pageNumber = 0

      while (remainingHeight > 0) {
        if (pageNumber > 0) {
          pdf.addPage()
        }

        const heightForThisPage = Math.min(remainingHeight, maxHeightPerPage)
        const sourceHeight = (heightForThisPage / imgHeight) * canvas.height

        // Créer un canvas temporaire pour cette section
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = sourceHeight
        const tempCtx = tempCanvas.getContext('2d')

        if (tempCtx) {
          tempCtx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          )

          const tempImgData = tempCanvas.toDataURL('image/png')
          pdf.addImage(tempImgData, 'PNG', margin, margin, imgWidth, heightForThisPage)
        }

        sourceY += sourceHeight
        remainingHeight -= heightForThisPage
        pageNumber++
      }
    }

    // Télécharger le PDF
    const fileName = `evaluation-classe-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    console.log('✅ PDF exported successfully:', fileName)

  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error)
    window.alert('Erreur lors de l\'export de l\'évaluation')
  }
}

// Share functionality
const showShareDialog = ref(false)

const shareEvaluationInfo = computed(() => ({
  name: 'Analyse des moyennes de classe',
  description: `Analyse des moyennes de classe par ${metricTypes.value.find(type => type.value === selectedMetricType.value)?.label || 'domaines'}`,
  studentsCount: studentsStore.allStudents.length,
  competenciesCount: frameworkStore.framework.domains.reduce((total, domain) =>
    total + domain.fields.reduce((fieldTotal, field) =>
      fieldTotal + field.competencies.reduce((compTotal, comp) =>
        compTotal + comp.specificCompetencies.length, 0), 0), 0)
}))

const shareClassChart = () => {
  console.log('📧 [DashboardView] Opening share dialog for class chart')
  showShareDialog.value = true
}

const handleSendEmail = async (data: { emails: string[]; message: string }) => {
  console.log('📧 [DashboardView] Sending class chart via email', {
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

    // Générer le canvas avec options optimisées
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(chartElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: chartElement.scrollWidth,
      windowHeight: chartElement.scrollHeight,
      width: chartElement.scrollWidth,
      height: chartElement.scrollHeight
    })

    // Créer le PDF pour le partage
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    const maxWidth = pageWidth - (margin * 2)
    const maxHeight = pageHeight - 60

    // Calculer les dimensions optimales
    let imgWidth = maxWidth
    let imgHeight = (canvas.height * imgWidth) / canvas.width

    // Ajuster si trop haut
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight
      imgWidth = (canvas.width * imgHeight) / canvas.height
    }

    // Centrer l'image si nécessaire
    const xPosition = margin + (maxWidth - imgWidth) / 2

    // Ajouter le titre
    pdf.setFontSize(16)
    pdf.text('Moyennes de la classe', margin, 20)

    // Ajouter la date
    pdf.setFontSize(10)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 30)

    // Ajouter le type de métrique
    const metricTypeLabel = metricTypes.value.find(type => type.value === selectedMetricType.value)?.label || ''
    pdf.text(`Type d'analyse: ${metricTypeLabel}`, margin, 40)

    // Ajouter l'image du graphique
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', xPosition, 50, imgWidth, imgHeight)

    // Préparer les données pour le service de partage
    const evaluationData = {
      evaluation: {
        id: 'class-analysis',
        name: 'Analyse des moyennes de classe',
        description: `Analyse des moyennes de classe par ${metricTypeLabel}`,
        date: new Date().toLocaleDateString('fr-FR'),
        className: '',
        schoolYearFilter: ''
      },
      students: studentsStore.allStudents.map(student => ({
        id: student.id,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim()
      })),
      results: [],
      summary: {
        totalStudents: studentsStore.allStudents.length,
        totalCompetencies: useCompetencyFrameworkStore().framework.domains.reduce((total, domain) =>
          total + domain.fields.reduce((fieldTotal, field) =>
            fieldTotal + field.competencies.reduce((compTotal, comp) =>
              compTotal + comp.specificCompetencies.length, 0), 0), 0),
        exportDate: new Date().toISOString()
      },
      competencies: [] // Analyse chart doesn't have individual competency data
    }

    // Importer et utiliser le service de partage
    const { shareResultsService } = await import('@/services/shareResultsService')
    const result = await shareResultsService.shareEvaluationResults(
      evaluationData,
      data.emails,
      data.message
    )

    if (result.success) {
      console.log('✅ [DashboardView] Class chart shared successfully')
      alert(`✅ ${result.message}`)
      showShareDialog.value = false
    } else {
      console.error('❌ [DashboardView] Failed to share class chart:', result.message)
      alert(`❌ ${result.message}`)
    }
  } catch (error) {
    console.error('❌ [DashboardView] Error sharing class chart:', error)
    alert('Erreur lors du partage du graphique. Veuillez réessayer.')
  }
}

// Get domain radar data
const getDomainRadarData = computed(() => {
  // Don't calculate if still loading or framework not ready
  if (isLoading.value || !frameworkStore.framework || !frameworkStore.framework.domains) {
    return []
  }

  const data = calculateClassAveragesByLevel('domains')

  // Transform to match DomainRadarChart expected format
  // DomainRadarChart expects: { name: string, evaluations: [{score: number}] }[]
  if (!data || data.length === 0) {
    console.log('⚠️ [getDomainRadarData] No data available')
    return []
  }

  console.log('📊 [getDomainRadarData] Processing data:', data.length, 'evaluations')

  // Get all unique domain names
  const allDomains = new Map<string, { name: string, evaluations: {score: number}[] }>()

  data.forEach(evaluationData => {
    evaluationData.data.forEach(item => {
      if (!allDomains.has(item.name)) {
        allDomains.set(item.name, {
          name: item.name,
          evaluations: []
        })
      }
    })
  })

  // Fill in evaluation scores for each domain
  data.forEach(evaluationData => {
    const evaluationIndex = data.indexOf(evaluationData)

    allDomains.forEach((domain, domainName) => {
      const domainData = evaluationData.data.find(d => d.name === domainName)
      // Ensure we have the right number of evaluation slots
      while (domain.evaluations.length <= evaluationIndex) {
        domain.evaluations.push({ score: 0 })
      }
      domain.evaluations[evaluationIndex] = {
        score: domainData ? domainData.value : 0
      }
    })
  })

  return Array.from(allDomains.values())
})

// Get field radar data
const getFieldRadarData = computed(() => {
  // Don't calculate if still loading or framework not ready
  if (isLoading.value || !frameworkStore.framework || !frameworkStore.framework.domains) {
    return []
  }

  const data = calculateClassAveragesByLevel('fields')

  // Transform to match DomainRadarChart expected format
  if (!data || data.length === 0) return []

  // Get all unique field names
  const allFields = new Map<string, { name: string, evaluations: {score: number}[] }>()

  data.forEach(evaluationData => {
    evaluationData.data.forEach(item => {
      if (!allFields.has(item.name)) {
        allFields.set(item.name, {
          name: item.name,
          evaluations: []
        })
      }
    })
  })

  // Fill in evaluation scores for each field
  data.forEach(evaluationData => {
    const evaluationIndex = data.indexOf(evaluationData)

    allFields.forEach((field, fieldName) => {
      const fieldData = evaluationData.data.find(d => d.name === fieldName)
      // Ensure we have the right number of evaluation slots
      while (field.evaluations.length <= evaluationIndex) {
        field.evaluations.push({ score: 0 })
      }
      field.evaluations[evaluationIndex] = {
        score: fieldData ? fieldData.value : 0
      }
    })
  })

  return Array.from(allFields.values())
})

// Get detailed analysis data based on selected metric type
const getDetailedAnalysisData = computed(() => {
  const data = calculateClassAveragesByLevel(selectedMetricType.value)

  // Transform the data format for DetailedAnalysisChart
  // The chart expects: { name: string, evaluations: [{score: number}] }[]
  if (!data || data.length === 0) return []

  // Get all unique level names (domains/fields/competencies)
  const allLevels = new Map<string, { name: string, evaluations: {score: number}[] }>()

  data.forEach(evaluationData => {
    evaluationData.data.forEach(item => {
      if (!allLevels.has(item.name)) {
        allLevels.set(item.name, {
          name: item.name,
          evaluations: []
        })
      }
    })
  })

  // Fill in evaluation scores for each level
  data.forEach(evaluationData => {
    const evaluationIndex = data.indexOf(evaluationData)

    allLevels.forEach((level, levelName) => {
      const levelData = evaluationData.data.find(d => d.name === levelName)
      // Ensure we have the right number of evaluation slots
      while (level.evaluations.length <= evaluationIndex) {
        level.evaluations.push({ score: 0 })
      }
      level.evaluations[evaluationIndex] = {
        score: levelData ? levelData.value : 0
      }
    })
  })

  return Array.from(allLevels.values())
})

// Load all data on mount without class filtering

// Helper functions (simplified versions from StudentAnalysisView)
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

const getDomainIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework

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


// Function to convert evaluation result value to score using pivot_value
// Returns null for N/A values to exclude them from calculations
const getScoreFromValue = (value: string, resultTypeConfigId?: string): number | null => {
  if (!value || !resultTypeConfigId) {
    return null
  }

  // Return null for N/A values to exclude them from calculations
  if (value === 'N/A' || value === 'Non évalué') {
    return null
  }

  const resultType = resultTypes.value.find(rt => rt.id === resultTypeConfigId)
  if (!resultType) {
    return null
  }

  const configValue = resultType.config.values.find(v => v.value === value)
  if (!configValue) {
    return null
  }

  // Check if this is a N/A value (pivot_value might be null or undefined for N/A)
  if (configValue.pivot_value === null || configValue.pivot_value === undefined) {
    return null
  }

  return configValue.pivot_value
}

// Function to calculate class averages by level (domains, fields, competencies) across all students
const calculateClassAveragesByLevel = (metricType: string) => {
  // Use filtered results and evaluations
  const results = allEvaluationResults.value
  const evaluations = filteredEvaluations.value

  if (!Array.isArray(results) || results.length === 0 || evaluations.length === 0) {
    return []
  }

  const resultsByEvaluation = results.reduce((acc, result) => {
    const evaluationId = (result as EvaluationResult & { evaluationId?: string }).evaluationId ||
      (result.evaluatedAt ?
        evaluationStore.allEvaluations.find(evaluation => new Date(evaluation.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
        'current')

    const safeEvaluationId = evaluationId || 'unknown'
    if (!acc[safeEvaluationId]) {
      acc[safeEvaluationId] = []
    }
    acc[safeEvaluationId].push(result)
    return acc
  }, {} as Record<string, EvaluationResult[]>)

  const calculateByMetricType = (allResults: EvaluationResult[]) => {
    const frameworkStore = useCompetencyFrameworkStore()
    const framework = frameworkStore.framework

    switch (metricType) {
      case 'domains': {
        // Get ALL domains from framework
        const allDomains = framework.domains || []

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

        // Include ALL domains, even those without results
        return allDomains.map(domain => {
          const groupResults = domainGroups[domain.id] || []

          if (groupResults.length === 0) {
            // No results for this domain
            return {
              name: domain.name,
              value: 0
            }
          }

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
              .filter(score => score !== null && score !== undefined) as number[]  // Filter out N/A values

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
            name: domain.name,
            value: Math.round(classAverage * 100) / 100
          }
        })
      }

      case 'fields': {
        // Get ALL fields from framework
        const allFields = framework.domains?.flatMap(domain => domain.fields || []) || []

        // Group results by field
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

        // Include ALL fields, even those without results
        return allFields.map(field => {
          const groupResults = fieldGroups[field.id] || []

          if (groupResults.length === 0) {
            // No results for this field
            return {
              name: field.name,
              value: 0
            }
          }

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
              .filter(score => score !== null && score !== undefined) as number[]  // Filter out N/A values

            if (scores.length > 0) {
              const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
              studentAverages.push(average)
            }
          })

          const classAverage = studentAverages.length > 0
            ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length
            : 0

          return {
            name: field.name,
            value: Math.round(classAverage * 100) / 100
          }
        })
      }

      case 'competencies': {
        // Get ALL competencies from framework
        const allCompetencies = framework.domains?.flatMap(domain =>
          domain.fields?.flatMap(field => field.competencies || []) || []
        ) || []

        // Group results by competency
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

        // Include ALL competencies, even those without results
        return allCompetencies.map(competency => {
          const groupResults = competencyGroups[competency.id] || []

          if (groupResults.length === 0) {
            // No results for this competency
            return {
              name: competency.name,
              value: 0
            }
          }

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
              .filter(score => score !== null && score !== undefined) as number[]  // Filter out N/A values

            if (scores.length > 0) {
              const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
              studentAverages.push(average)
            }
          })

          const classAverage = studentAverages.length > 0
            ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length
            : 0

          return {
            name: competency.name,
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

// Load filtered data based on selected classes and years
const loadFilteredData = async () => {
  try {
    const allEvaluations = evaluationStore.allEvaluations
    const allResults: EvaluationResult[] = []
    const loadedEvaluations: Array<{ id: string; name: string }> = []

    // If no filters selected, load all data
    const hasClassFilter = filters.value.classIds.length > 0
    const hasYearFilter = filters.value.yearIds.length > 0

    for (const evaluation of allEvaluations) {
      try {
        // Get evaluation-class relationships
        const evaluationClasses = await supabaseEvaluationClassesService.getClassesForEvaluation(
          evaluation.id,
          hasYearFilter ? undefined : undefined
        )

        // Skip if filters are active and this evaluation doesn't match
        if (hasClassFilter) {
          // evaluationClasses is Class[], so we use the id directly
          const evaluationClassIds = evaluationClasses.map(ec => ec.id)
          const hasMatchingClass = filters.value.classIds.some(classId =>
            evaluationClassIds.includes(classId)
          )
          if (!hasMatchingClass) continue
        }

        if (hasYearFilter) {
          // Check if evaluation belongs to selected years via evaluation_classes
          const evalClassesData = await supabaseEvaluationClassesService.getEvaluationClasses({
            evaluation_id: evaluation.id,
            include_details: true
          })

          // Check by school_year_id first (primary approach)
          let hasMatchingYear = evalClassesData.some(ec =>
            filters.value.yearIds.includes(ec.school_year_id || '')
          )

          // Fallback: check by class.schoolYear name if no match found
          if (!hasMatchingYear) {
            const selectedYearNames = availableYears.value
              .filter(y => filters.value.yearIds.includes(y.id))
              .map(y => y.name)

            hasMatchingYear = evalClassesData.some(ec =>
              ec.class?.schoolYear && selectedYearNames.includes(ec.class.schoolYear)
            )
          }

          if (!hasMatchingYear) continue
        }

        // Load results for this evaluation
        const fullEvaluation = await supabaseEvaluationResultsService.getOrCreateEvaluation(evaluation)

        const resultsWithEvaluationId = fullEvaluation.results.map(result => ({
          ...result,
          evaluationId: evaluation.id
        }))

        // Note: No need to filter by students since the evaluation is already filtered by class
        // All students in an evaluation belong to the associated class(es)
        // Include evaluation even if it has no results (will show as 0 in charts)
        allResults.push(...resultsWithEvaluationId)
        loadedEvaluations.push({ id: evaluation.id, name: evaluation.name })
      } catch (error) {
        console.error('📊 [DashboardView] Error loading results for evaluation', evaluation.name, ':', error)
      }
    }

    allEvaluationResults.value = allResults
    filteredEvaluations.value = loadedEvaluations
  } catch (error) {
    console.error('Error loading filtered dashboard data:', error)
  }
}

onMounted(async () => {
  try {
    // Load initial data in parallel
    await Promise.all([
      classStore.loadClasses(),
      schoolYearStore.ensureLoaded(),
      studentsStore.refreshFromSupabase(),
      evaluationStore.loadEvaluations(),
      frameworkStore.refreshFromSupabase() // Load competency framework
    ])

    // Load result types
    resultTypes.value = await resultTypesService.getResultTypes()

    // Load all evaluation results (depends on evaluations being loaded)
    await loadFilteredData()

    // Verify framework is loaded before allowing render
    if (!frameworkStore.framework || !frameworkStore.framework.domains) {
      throw new Error('Framework not loaded properly')
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    // Set loading to false once all data is loaded
    isLoading.value = false
  }
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--md-sys-color-surface-variant, #e7e0ec);
  border-top: 4px solid var(--md-sys-color-primary, #6750a4);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0;
}

/* Main card styling */
.competencies-card {
  background: var(--md-sys-color-surface-container-low, #ffffff) !important;
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
}

.main-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.main-card-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 2rem;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0;
}

/* Radar charts grid - vertical layout */
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

.section-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0;
}

.chart-container {
  min-height: 400px;
}

/* Section divider */
.section-divider {
  width: 100%;
  height: 1px;
  background: var(--md-sys-color-outline-variant, #c4c7c5);
  margin: 32px 0;
}

/* Detailed analysis section */
.detailed-analysis-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analysis-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

/* Chart actions */
.chart-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0;
  border-top: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  margin-top: 16px;
  flex-wrap: wrap;
}

.chart-export,
.chart-share {
  display: flex;
  align-items: center;
  gap: 8px;
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

.chart-export {
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
}

.chart-export:hover {
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  box-shadow:
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.chart-share {
  background: var(--md-sys-color-secondary, #625b71);
  color: var(--md-sys-color-on-secondary, #ffffff);
}

.chart-share:hover {
  background: var(--md-sys-color-secondary-container, #e8def8);
  color: var(--md-sys-color-on-secondary-container, #1d192b);
  box-shadow:
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.export-icon,
.share-icon {
  width: 16px;
  height: 16px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-card-title {
    font-size: 1.375rem;
  }

  .radar-charts-grid {
    gap: 24px;
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .main-card-title {
    font-size: 1.25rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .radar-charts-grid {
    gap: 20px;
    margin-bottom: 20px;
  }

  .section-divider {
    margin: 24px 0;
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
    gap: 8px;
  }

  .chart-export,
  .chart-share {
    padding: 10px 14px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .main-card-title {
    font-size: 1.125rem;
  }

  .radar-charts-grid {
    gap: 16px;
    margin-bottom: 16px;
  }

  .chart-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-export,
  .chart-share {
    width: 100%;
    justify-content: center;
  }
}
</style>