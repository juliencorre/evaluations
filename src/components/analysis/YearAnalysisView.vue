<template>
  <div class="charts-section">
    <!-- Filters -->
    <AnalysisFilters
      v-model="filters"
      :available-classes="availableClasses"
      :available-years="availableYears"
      @apply="loadYearData"
    />

    <!-- Year Comparison Chart -->
    <section class="charts-section">
      <ChartCard class="white-card">
        <template #title>
          <div class="chart-header">
            <div class="chart-title-with-selector">
              <h3 class="class-title">Comparaison des années scolaires</h3>
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

        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <svg viewBox="0 0 24 24" fill="currentColor" class="spinner">
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
            </svg>
          </div>
          <p>Chargement des données...</p>
        </div>

        <div v-else-if="yearChartData.labels.length === 0" class="empty-state">
          <p>Aucune donnée disponible pour la comparaison des années</p>
        </div>

        <div v-else class="chart-container">
          <YearComparisonChart
            :chart-data="yearChartData"
            :school-years="schoolYears"
          />
        </div>

        <div class="chart-actions">
          <button
            class="export-button chart-export"
            title="Exporter la comparaison des années en PDF"
            @click="exportYearChart"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useSchoolYearStore } from '@/stores/schoolYearStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { useClassStore } from '@/stores/classStore'
import { useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { supabaseEvaluationResultsService } from '@/services/supabaseEvaluationResultsService'
import { supabaseEvaluationClassesService } from '@/services/supabaseEvaluationClassesService'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'
import type { EvaluationResult, ResultTypeConfig } from '@/types/evaluation'

import YearComparisonChart from '@/components/analysis/YearComparisonChart.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'
import AnalysisFilters from '@/components/analysis/AnalysisFilters.vue'

// Stores
const schoolYearStore = useSchoolYearStore()
const evaluationStore = useEvaluationStore()
const classStore = useClassStore()
const frameworkStore = useCompetencyFrameworkStore()

// Services
const resultTypesService = new SupabaseResultTypesService()

// Filters state
const filters = ref({
  classIds: [] as string[],
  yearIds: [] as string[]
})

// Available data for filters
const availableClasses = computed(() => {
  return (classStore.classes || []).map(c => ({
    id: c.id,
    name: c.name
  }))
})

const availableYears = computed(() => {
  return (schoolYearStore.schoolYears?.value || []).map(y => ({
    id: y.id,
    name: y.name,
    is_current: y.is_current
  }))
})

// State
const isLoading = ref(true)
const selectedMetricType = ref('domains')
const resultTypes = ref<ResultTypeConfig[]>([])
const yearResults = ref<Map<string, EvaluationResult[]>>(new Map())

// Metric types
const metricTypes = ref([
  { value: 'domains', label: 'Domaines' },
  { value: 'fields', label: 'Champs' },
  { value: 'competencies', label: 'Compétences' }
])

// Color palette for years
const colorPalette = [
  '#4A90A4', // Teal-blue
  '#E65100', // Orange
  '#2E7D32', // Green
  '#7B1FA2', // Purple
  '#D32F2F', // Red
  '#F57C00', // Gold
  '#1976D2', // Blue
  '#5D4037', // Brown
  '#455A64', // Blue-grey
  '#6A1B9A'  // Deep purple
]

// School years with colors
const schoolYears = computed(() => {
  return schoolYearStore.schoolYears.value.map((year, index) => ({
    id: year.id,
    name: year.name,
    color: colorPalette[index % colorPalette.length]
  }))
})

// Get chart data based on selected metric type
const yearChartData = computed(() => {
  const framework = frameworkStore.framework.value
  if (!framework) {
    return { labels: [], datasets: [] }
  }

  const labels: string[] = []
  const datasets: any[] = []

  // Build labels based on metric type
  if (selectedMetricType.value === 'domains') {
    framework.domains.forEach(domain => {
      labels.push(domain.name)
    })
  } else if (selectedMetricType.value === 'fields') {
    framework.domains.forEach(domain => {
      domain.fields.forEach(field => {
        labels.push(`${domain.name} - ${field.name}`)
      })
    })
  } else if (selectedMetricType.value === 'competencies') {
    framework.domains.forEach(domain => {
      domain.fields.forEach(field => {
        field.competencies.forEach(competency => {
          labels.push(`${field.name} - ${competency.name}`)
        })
      })
    })
  }

  // Build datasets only for years that have data
  schoolYears.value.forEach((year, yearIndex) => {
    // Only include years that have results loaded
    if (!yearResults.value.has(year.id)) {
      console.log(`⚠️ [YearAnalysisView] Skipping year ${year.name} - no results loaded`)
      return
    }

    const results = yearResults.value.get(year.id) || []
    console.log(`📊 [YearAnalysisView] Building dataset for ${year.name} with ${results.length} results`)

    const data: number[] = []

    if (selectedMetricType.value === 'domains') {
      framework.domains.forEach(domain => {
        const avg = calculateDomainAverage(results, domain.id)
        console.log(`  Domain ${domain.name}: ${avg.toFixed(2)}`)
        data.push(avg)
      })
    } else if (selectedMetricType.value === 'fields') {
      framework.domains.forEach(domain => {
        domain.fields.forEach(field => {
          const avg = calculateFieldAverage(results, field.id)
          data.push(avg)
        })
      })
    } else if (selectedMetricType.value === 'competencies') {
      framework.domains.forEach(domain => {
        domain.fields.forEach(field => {
          field.competencies.forEach(competency => {
            const avg = calculateCompetencyAverage(results, competency.id)
            data.push(avg)
          })
        })
      })
    }

    datasets.push({
      label: year.name,
      data: data,
      backgroundColor: year.color + 'CC', // 80% opacity for bars
      borderColor: year.color,
      borderWidth: 1,
      borderRadius: 4,
      hoverBackgroundColor: year.color,
      hoverBorderColor: year.color,
      hoverBorderWidth: 2
    })
  })

  console.log('📊 [YearAnalysisView] Chart data generated:', { labels: labels.length, datasets: datasets.length })

  return { labels, datasets }
})

// Calculate averages
const calculateDomainAverage = (results: EvaluationResult[], domainId: string): number => {
  const framework = frameworkStore.framework.value
  if (!framework) return 0

  const domain = framework.domains.find(d => d.id === domainId)
  if (!domain) return 0

  // Get all specific competency IDs in this domain
  const specificCompetencyIds: string[] = []
  domain.fields.forEach(field => {
    field.competencies.forEach(comp => {
      comp.specificCompetencies.forEach(specific => {
        specificCompetencyIds.push(specific.id)
      })
    })
  })

  // Filter results by specificCompetencyId (not competencyId)
  const relevantResults = results.filter(r => {
    const effectiveId = r.specificCompetencyId || r.competencyId
    return specificCompetencyIds.includes(effectiveId)
  })

  if (relevantResults.length === 0) {
    console.log(`⚠️ No results found for domain ${domain.name}`)
    return 0
  }

  const sum = relevantResults.reduce((acc, result) => {
    const effectiveId = result.specificCompetencyId || result.competencyId
    const value = convertToPivotValue(result.value || '', effectiveId, result.resultTypeConfigId)
    return acc + value
  }, 0)

  return sum / relevantResults.length
}

const calculateFieldAverage = (results: EvaluationResult[], fieldId: string): number => {
  const framework = frameworkStore.framework.value
  if (!framework) return 0

  let field: any = null
  for (const domain of framework.domains) {
    const foundField = domain.fields.find(f => f.id === fieldId)
    if (foundField) {
      field = foundField
      break
    }
  }

  if (!field) return 0

  // Get all specific competency IDs in this field
  const specificCompetencyIds: string[] = []
  field.competencies.forEach((comp: any) => {
    comp.specificCompetencies.forEach((specific: any) => {
      specificCompetencyIds.push(specific.id)
    })
  })

  const relevantResults = results.filter(r => {
    const effectiveId = r.specificCompetencyId || r.competencyId
    return specificCompetencyIds.includes(effectiveId)
  })

  if (relevantResults.length === 0) return 0

  const sum = relevantResults.reduce((acc, result) => {
    const effectiveId = result.specificCompetencyId || result.competencyId
    const value = convertToPivotValue(result.value || '', effectiveId, result.resultTypeConfigId)
    return acc + value
  }, 0)

  return sum / relevantResults.length
}

const calculateCompetencyAverage = (results: EvaluationResult[], competencyId: string): number => {
  const framework = frameworkStore.framework.value
  if (!framework) return 0

  // Find the competency and get its specific competency IDs
  let specificCompetencyIds: string[] = []

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      const comp = field.competencies.find(c => c.id === competencyId)
      if (comp) {
        specificCompetencyIds = comp.specificCompetencies.map(sc => sc.id)
        break
      }
    }
    if (specificCompetencyIds.length > 0) break
  }

  const relevantResults = results.filter(r => {
    const effectiveId = r.specificCompetencyId || r.competencyId
    return specificCompetencyIds.includes(effectiveId) || r.competencyId === competencyId
  })

  if (relevantResults.length === 0) return 0

  const sum = relevantResults.reduce((acc, result) => {
    const effectiveId = result.specificCompetencyId || result.competencyId
    const value = convertToPivotValue(result.value || '', effectiveId, result.resultTypeConfigId)
    return acc + value
  }, 0)

  return sum / relevantResults.length
}

// Convert result value to pivot value (0-10 scale)
const convertToPivotValue = (value: string, competencyId: string, resultTypeConfigId?: string): number => {
  if (!value || value === 'N/A' || value === 'Non évalué') return 0

  // Use the result type from the loaded result types
  const resultTypeConfig = resultTypes.value.find(rt => {
    // Try to match by ID if provided
    if (resultTypeConfigId && rt.id === resultTypeConfigId) return true

    // Otherwise try to find if this value exists in any result type
    return rt.config.values.some(v => v.value === value)
  })

  if (!resultTypeConfig) {
    console.warn(`⚠️ No result type config found for value: ${value}`)
    return 0
  }

  // Find the pivot value for this result
  const configValue = resultTypeConfig.config.values.find(v => v.value === value)
  const pivotValue = configValue?.pivot_value ?? 0

  return pivotValue
}

// Load data for all years with filters
const loadYearData = async () => {
  isLoading.value = true

  try {
    console.log('📊 [YearAnalysisView] Loading year data with filters:', filters.value)

    // Load result types
    resultTypes.value = await resultTypesService.getResultTypes()

    // Determine which years to load
    const yearsToLoad = filters.value.yearIds.length > 0
      ? schoolYears.value.filter(y => filters.value.yearIds.includes(y.id))
      : schoolYears.value

    const hasClassFilter = filters.value.classIds.length > 0

    // Load evaluations and results for each year
    for (const year of yearsToLoad) {
      // Get evaluation_classes for this year
      const evaluationClasses = await supabaseEvaluationClassesService.getEvaluationClasses({
        school_year_id: year.id,
        include_details: true
      })

      // Filter by classes if needed
      const filteredEvaluationClasses = hasClassFilter
        ? evaluationClasses.filter(ec => filters.value.classIds.includes(ec.class_id || ''))
        : evaluationClasses

      // Get all results for these evaluations
      const allResults: EvaluationResult[] = []
      for (const evalClass of filteredEvaluationClasses) {
        if (evalClass.evaluation_id) {
          const results = await supabaseEvaluationResultsService.getAllResults(evalClass.evaluation_id)
          allResults.push(...results)
        }
      }

      yearResults.value.set(year.id, allResults)
      console.log(`📊 [YearAnalysisView] Loaded ${allResults.length} results for year ${year.name}`)
    }
  } catch (error) {
    console.error('Error loading year data:', error)
  } finally {
    isLoading.value = false
  }
}

// Export function
const exportYearChart = async () => {
  try {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    console.log('Exporting year comparison chart')

    const chartElement = document.querySelector('.chart-container')
    if (!chartElement) {
      window.alert('Impossible de trouver le graphique à exporter')
      return
    }

    const canvas = await html2canvas(chartElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    })

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    const maxWidth = pageWidth - (margin * 2)
    const maxHeight = pageHeight - 50

    const imgWidth = maxWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const imgData = canvas.toDataURL('image/png')

    // Add title
    pdf.setFontSize(16)
    pdf.text('Comparaison des années scolaires', margin, margin)

    // Add date
    pdf.setFontSize(10)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, margin + 7)

    // Add chart
    pdf.addImage(imgData, 'PNG', margin, margin + 15, imgWidth, Math.min(imgHeight, maxHeight))

    pdf.save(`comparaison-annees-${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error('Error exporting year chart:', error)
    window.alert('Erreur lors de l\'export du graphique')
  }
}

// Lifecycle
onMounted(async () => {
  await classStore.loadClasses()
  await schoolYearStore.ensureLoaded()
  await evaluationStore.loadEvaluations()
  // Framework is already available from the store, no need to load
  await loadYearData()
})

// Watch for metric type changes
watch(selectedMetricType, () => {
  // Chart will reactively update
})
</script>

<style scoped>
.charts-section {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.white-card {
  background: var(--neuro-bg-base);
  border-radius: var(--neuro-radius-large);
  box-shadow: var(--neuro-shadow-raised);
  padding: 24px;
}

.chart-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-title-with-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.class-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--neuro-text-primary);
  margin: 0;
}

.metric-type-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-type-buttons {
  display: flex;
  gap: 8px;
  background: var(--neuro-bg-base);
  padding: 4px;
  border-radius: var(--neuro-radius-medium);
  box-shadow: var(--neuro-shadow-inset);
}

.metric-type-button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: var(--neuro-radius-small);
  font-size: 14px;
  font-weight: 500;
  color: var(--neuro-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.metric-type-button:hover {
  color: var(--neuro-text-primary);
}

.metric-type-button.active {
  background: var(--neuro-bg-base);
  color: var(--neuro-accent-primary);
  box-shadow: var(--neuro-shadow-raised);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--neuro-text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: var(--neuro-accent-primary);
}

.spinner {
  width: 100%;
  height: 100%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.chart-container {
  min-height: 400px;
  padding: 16px;
}

.chart-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--neuro-bg-dark);
}

.export-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--neuro-bg-base);
  border: none;
  border-radius: var(--neuro-radius-medium);
  box-shadow: var(--neuro-shadow-raised);
  color: var(--neuro-text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-button:hover {
  box-shadow: var(--neuro-shadow-floating);
  transform: translateY(-2px);
}

.export-button:active {
  box-shadow: var(--neuro-shadow-inset);
  transform: translateY(0);
}

.export-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .charts-section {
    padding: 16px;
  }

  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }

  .metric-type-buttons {
    flex-wrap: wrap;
  }

  .chart-actions {
    flex-direction: column;
  }

  .export-button {
    width: 100%;
    justify-content: center;
  }
}
</style>