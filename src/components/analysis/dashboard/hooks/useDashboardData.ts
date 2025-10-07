import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'
import { useCompetencyFrameworkStore } from '@/stores'
import { useEvaluationsStore } from '@/stores'
import { useStudentsStore } from '@/stores'
import { useClassStore } from '@/stores'
import { useSchoolYearStore } from '@/stores'
import { supabaseResultTypesService } from '@/services/supabaseResultTypesService'
import type { EvaluationResult, CompetencyFramework } from '@/types/evaluation'
import type { ResultTypeConfig } from '@/types/resultType'

interface EvaluationPeriod {
  id: string
  name: string
  color: string
}

/**
 * Hook pour gérer les données du dashboard
 * Charge et filtre les données nécessaires pour l'analyse
 */
export function useDashboardData(): {
  isLoading: Ref<boolean>
  resultTypes: Ref<ResultTypeConfig[]>
  allEvaluationResults: Ref<EvaluationResult[]>
  filters: Ref<{
    schoolYear: string | null
    class: string | null
    evaluations: string[]
  }>
  filteredEvaluations: Ref<Array<{ id: string; name: string }>>
  evaluationPeriods: ComputedRef<EvaluationPeriod[]>
  framework: ComputedRef<CompetencyFramework | null>
  loadData: () => Promise<void>
  loadFilteredData: () => Promise<void>
} {
  const frameworkStore = useCompetencyFrameworkStore()
  const evaluationStore = useEvaluationsStore()
  const studentsStore = useStudentsStore()
  const classStore = useClassStore()
  const schoolYearStore = useSchoolYearStore()

  const isLoading = ref(true)
  const resultTypes = ref<ResultTypeConfig[]>([])
  const allEvaluationResults = ref<EvaluationResult[]>([])

  // Filtres
  const filters = ref({
    schoolYear: null as string | null,
    class: null as string | null,
    evaluations: [] as string[]
  })

  // Évaluations filtrées
  const filteredEvaluations = ref<Array<{ id: string; name: string }>>([])

  /**
   * Charge toutes les données nécessaires
   */
  const loadData = async () => {
    isLoading.value = true
    try {
      await Promise.all([
        classStore.loadClasses(),
        schoolYearStore.ensureLoaded(),
        studentsStore.refreshFromSupabase(),
        evaluationStore.loadEvaluations(),
        frameworkStore.refreshFromSupabase()
      ])

      resultTypes.value = await supabaseResultTypesService.getResultTypes()
      await loadFilteredData()

      if (!frameworkStore.framework || !frameworkStore.framework.domains) {
        throw new Error('Framework not loaded properly')
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Charge les données filtrées selon les filtres actifs
   */
  const loadFilteredData = async () => {
    // Implémenter la logique de filtrage
    // Cette fonction sera appelée quand les filtres changent
    filteredEvaluations.value = evaluationStore.allEvaluations.map(e => ({
      id: e.id,
      name: e.name
    }))
  }

  /**
   * Périodes d'évaluation pour les graphiques
   */
  const evaluationPeriods: ComputedRef<EvaluationPeriod[]> = computed(() => {
    return filteredEvaluations.value.map((e, index) => ({
      id: e.id,
      name: e.name,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    }))
  })

  // Charger les données au montage
  onMounted(() => {
    loadData()
  })

  return {
    // État
    isLoading,
    resultTypes,
    allEvaluationResults,
    filters,
    filteredEvaluations,

    // Computed
    evaluationPeriods,
    framework: computed(() => frameworkStore.framework),

    // Méthodes
    loadData,
    loadFilteredData
  }
}
