import { computed, type Ref } from 'vue'
import type { EvaluationResult } from '@/types/evaluation'
import type { CompetencyFramework } from '@/types/competency'

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

/**
 * Composable pour la préparation de données pour les graphiques
 */
export function useChartData(
  results: Ref<EvaluationResult[]>,
  framework: Ref<CompetencyFramework>
) {
  /**
   * Prépare les données pour un graphique en barres par domaine
   */
  const prepareDomainBarData = computed((): ChartData => {
    const domains = framework.value.domains || []
    const labels = domains.map(d => d.name)
    const data = domains.map(() => {
      // Placeholder - à implémenter selon la structure exacte
      return 0
    })

    return {
      labels,
      datasets: [
        {
          label: 'Nombre d\'évaluations',
          data,
          backgroundColor: 'rgba(33, 150, 243, 0.6)'
        }
      ]
    }
  })

  /**
   * Prépare les données pour la distribution des valeurs
   */
  const prepareValueDistributionData = computed((): ChartData => {
    const valueCount: Record<string, number> = {}

    results.value.forEach(result => {
      const value = result.value || 'N/A'
      valueCount[value] = (valueCount[value] || 0) + 1
    })

    const labels = Object.keys(valueCount).sort()
    const data = labels.map(label => valueCount[label])

    return {
      labels,
      datasets: [
        {
          label: 'Distribution des résultats',
          data,
          backgroundColor: [
            'rgba(76, 175, 80, 0.6)',
            'rgba(33, 150, 243, 0.6)',
            'rgba(255, 152, 0, 0.6)',
            'rgba(244, 67, 54, 0.6)',
            'rgba(158, 158, 158, 0.6)'
          ]
        }
      ]
    }
  })

  /**
   * Prépare les données pour un graphique temporel
   */
  const prepareTimeSeriesData = (
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): ChartData => {
    const timeGroups: Record<string, number> = {}

    results.value.forEach(result => {
      if (!result.evaluatedAt) return

      const date = new Date(result.evaluatedAt)
      let key: string

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week': {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        }
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      timeGroups[key] = (timeGroups[key] || 0) + 1
    })

    const labels = Object.keys(timeGroups).sort()
    const data = labels.map(label => timeGroups[label])

    return {
      labels,
      datasets: [
        {
          label: 'Nombre d\'évaluations',
          data,
          borderColor: 'rgba(33, 150, 243, 1)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)'
        }
      ]
    }
  }

  /**
   * Prépare les données pour un graphique de comparaison
   */
  const prepareComparisonData = (
    categories: string[],
    datasets: Array<{ label: string; values: number[] }>
  ): ChartData => {
    return {
      labels: categories,
      datasets: datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.values,
        backgroundColor: `rgba(${33 + index * 50}, ${150 - index * 30}, ${243 - index * 40}, 0.6)`
      }))
    }
  }

  return {
    prepareDomainBarData,
    prepareValueDistributionData,
    prepareTimeSeriesData,
    prepareComparisonData
  }
}
