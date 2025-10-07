import type { ChartOptions } from 'chart.js'

/**
 * Composable pour la configuration des graphiques Chart.js
 * Fournit des configurations par défaut cohérentes
 */
export function useChartConfig() {
  /**
   * Configuration de base pour tous les graphiques
   */
  const baseConfig: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false
      }
    }
  }

  /**
   * Configuration pour les graphiques radar
   */
  const radarConfig: ChartOptions<'radar'> = {
    ...baseConfig,
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      }
    }
  }

  /**
   * Configuration pour les graphiques en barres
   */
  const barConfig: ChartOptions<'bar'> = {
    ...baseConfig,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    }
  }

  /**
   * Configuration pour les graphiques linéaires
   */
  const lineConfig: ChartOptions<'line'> = {
    ...baseConfig,
    scales: {
      y: {
        beginAtZero: true
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    }
  }

  /**
   * Configuration pour les diagrammes circulaires
   */
  const pieConfig: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const
      },
      tooltip: {
        enabled: true
      }
    }
  }

  /**
   * Crée une configuration personnalisée en fusionnant avec la base
   */
  const createCustomConfig = (
    chartType: 'radar' | 'bar' | 'line' | 'pie',
    customOptions: Partial<ChartOptions>
  ): ChartOptions => {
    const baseConfigMap = {
      radar: radarConfig,
      bar: barConfig,
      line: lineConfig,
      pie: pieConfig
    }

    return {
      ...baseConfigMap[chartType],
      ...customOptions,
      plugins: {
        ...baseConfigMap[chartType].plugins,
        ...customOptions.plugins
      }
    }
  }

  return {
    baseConfig,
    radarConfig,
    barConfig,
    lineConfig,
    pieConfig,
    createCustomConfig
  }
}
