import { computed, type Ref } from 'vue'
import { useRadarData } from '@/composables'
import type { CompetencyFramework } from '@/types/evaluation'

/**
 * Hook pour préparer les données des graphiques du dashboard
 */
export function useDashboardCharts(
  framework: Ref<CompetencyFramework | null>,
  calculateClassAveragesByLevel: (metricType: string) => any[],
  isLoading: Ref<boolean>
) {
  const { transformToRadarFormat } = useRadarData()

  /**
   * Données pour le graphique radar des domaines
   */
  const getDomainRadarData = computed(() => {
    if (isLoading.value || !framework.value || !framework.value.domains) {
      return []
    }

    const data = calculateClassAveragesByLevel('domains')

    if (!data || data.length === 0) {
      console.log('⚠️ [getDomainRadarData] No data available')
      return []
    }

    console.log('📊 [getDomainRadarData] Processing data:', data.length, 'evaluations')
    return transformToRadarFormat(data)
  })

  /**
   * Données pour le graphique radar des champs
   */
  const getFieldRadarData = computed(() => {
    if (isLoading.value || !framework.value || !framework.value.domains) {
      return []
    }

    const data = calculateClassAveragesByLevel('fields')

    if (!data || data.length === 0) {
      return []
    }

    return transformToRadarFormat(data)
  })

  /**
   * Données pour l'analyse détaillée (sélection par type de métrique)
   */
  const getDetailedAnalysisData = (selectedMetricType: Ref<string>) => {
    return computed(() => {
      const data = calculateClassAveragesByLevel(selectedMetricType.value)

      if (!data || data.length === 0) {
        return []
      }

      // Transformer pour le graphique d'analyse détaillée
      return data.map(evaluationData => ({
        evaluationId: evaluationData.evaluationId,
        evaluationName: evaluationData.evaluationName,
        categories: evaluationData.data.map((item: any) => ({
          label: item.name,
          value: item.value,
          count: item.count
        }))
      }))
    })
  }

  return {
    getDomainRadarData,
    getFieldRadarData,
    getDetailedAnalysisData
  }
}
