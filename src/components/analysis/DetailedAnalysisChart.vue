<template>
  <div class="detailed-chart-container" :style="{ height: containerHeight }">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartConfiguration
} from 'chart.js'

// Register Chart.js components
Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)

interface EvaluationResult {
  score: number
}

interface ChartDataItem {
  id?: string
  name: string
  evaluations: EvaluationResult[]
}

interface EvaluationPeriod {
  id: string
  name: string
  color: string
}

interface Props {
  chartData: ChartDataItem[]
  evaluationPeriods: EvaluationPeriod[]
}

const props = defineProps<Props>()

const chartCanvas = ref<InstanceType<typeof HTMLCanvasElement> | null>(null)
let chartInstance: Chart | null = null

// Calculate dynamic container height based on number of items
const containerHeight = computed(() => {
  const itemCount = props.chartData.length

  // Minimum 400px for small datasets
  if (itemCount <= 5) {
    return '400px'
  }

  // Calculate height: 50px per item + 200px for legend, axis, padding
  // For datasets with many items, use more space per item for readability
  let heightPerItem = 50
  if (itemCount > 20) {
    heightPerItem = 60 // More space for large datasets
  } else if (itemCount > 10) {
    heightPerItem = 55 // Medium space for medium datasets
  }

  const basePadding = 200 // Space for legend, axis labels, padding
  const calculatedHeight = itemCount * heightPerItem + basePadding

  return `${calculatedHeight}px`
})

const createChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Extract labels (competency names)
  const labels = props.chartData.map(item => item.name)

  // Create datasets for each evaluation period
  const datasets = props.evaluationPeriods.map((evaluation, index) => {
    const data = props.chartData.map(item => {
      const evaluationData = item.evaluations[index]
      return evaluationData ? evaluationData.score : 0
    })

    return {
      label: evaluation.name,
      data: data,
      backgroundColor: evaluation.color,
      borderColor: evaluation.color,
      borderWidth: 0,
      borderRadius: 4,
      barThickness: 'flex' as const,
      maxBarThickness: 40,
      minBarLength: 2
    }
  })

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      indexAxis: 'y', // Horizontal bars
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          beginAtZero: true,
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            font: {
              family: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              size: 11,
              weight: 400
            },
            color: 'var(--md-sys-color-on-surface-variant, #49454f)',
            callback: (value) => {
              return value.toString()
            }
          },
          grid: {
            color: 'var(--md-sys-color-outline-variant, #c4c7c5)',
            lineWidth: 1
          },
          border: {
            display: false
          },
          title: {
            display: true,
            text: 'Note sur 10',
            font: {
              family: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              size: 12,
              weight: 500
            },
            color: 'var(--md-sys-color-on-surface, #1c1b1f)',
            padding: { top: 10, bottom: 0 }
          }
        },
        y: {
          ticks: {
            font: {
              family: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              size: 12,
              weight: 500
            },
            color: 'var(--md-sys-color-on-surface, #1c1b1f)',
            autoSkip: false,
            callback: function(_value, index) {
              const label = this.getLabelForValue(index)
              // Wrap long labels
              const maxLength = 30
              if (label.length > maxLength) {
                const words = label.split(' ')
                const lines: string[] = []
                let currentLine = ''

                words.forEach(word => {
                  if ((currentLine + ' ' + word).length <= maxLength) {
                    currentLine += (currentLine ? ' ' : '') + word
                  } else {
                    if (currentLine) lines.push(currentLine)
                    currentLine = word
                  }
                })
                if (currentLine) lines.push(currentLine)

                return lines
              }
              return label
            }
          },
          grid: {
            display: false
          },
          border: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            font: {
              family: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              size: 12,
              weight: 500
            },
            color: 'var(--md-sys-color-on-surface, #1c1b1f)',
            padding: 16,
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: 'rectRounded',
            generateLabels: (chart) => {
              const datasets = chart.data.datasets
              return datasets.map((dataset, i) => ({
                text: dataset.label || '',
                fillStyle: dataset.backgroundColor as string,
                strokeStyle: dataset.borderColor as string,
                lineWidth: 0,
                hidden: !chart.isDatasetVisible(i),
                index: i,
                pointStyle: 'rectRounded' as const
              }))
            }
          },
          onClick: (_e, legendItem, legend) => {
            const index = legendItem.index ?? 0
            const chart = legend.chart
            const meta = chart.getDatasetMeta(index)

            if (meta.hidden === null) {
              meta.hidden = !chart.data.datasets[index].hidden
            } else {
              meta.hidden = null as unknown as boolean
            }
            chart.update()
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: 'var(--md-sys-color-on-surface, #1c1b1f)',
          bodyColor: 'var(--md-sys-color-on-surface-variant, #49454f)',
          borderColor: 'var(--md-sys-color-outline, #79747e)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          titleFont: {
            family: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            size: 14,
            weight: 500
          },
          bodyFont: {
            family: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            size: 13,
            weight: 400
          },
          boxWidth: 10,
          boxHeight: 10,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            title: (tooltipItems) => {
              return tooltipItems[0].label || ''
            },
            label: (context) => {
              const label = context.dataset.label || ''
              const value = context.parsed.x.toFixed(1)
              return ` ${label}: ${value}/10`
            },
            afterLabel: (context) => {
              const value = context.parsed.x
              let performance = ''
              if (value >= 8) performance = '(Excellent)'
              else if (value >= 6) performance = '(Bien)'
              else if (value >= 4) performance = '(Moyen)'
              else performance = '(À améliorer)'
              return performance
            }
          }
        }
      },
      layout: {
        padding: {
          left: 10,
          right: 20,
          top: 10,
          bottom: 10
        }
      }
    }
  }

  chartInstance = new Chart(chartCanvas.value, config)
}

onMounted(() => {
  createChart()
})

// Watch for data changes and recreate chart
watch(() => [props.chartData, props.evaluationPeriods], () => {
  createChart()
}, { deep: true })

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.detailed-chart-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  background: transparent;
}

canvas {
  max-width: 100%;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.05));
}

/* Responsive padding adjustments */
@media (max-width: 768px) {
  .detailed-chart-container {
    padding: 16px 8px;
  }
}

@media (max-width: 480px) {
  .detailed-chart-container {
    padding: 12px 4px;
  }
}
</style>
