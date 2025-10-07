<template>
  <div class="radar-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartConfiguration
} from 'chart.js'

// Register Chart.js components
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface EvaluationScore {
  score: number
}

interface DomainData {
  name: string
  evaluations: EvaluationScore[]
}

interface EvaluationPeriod {
  id: string
  name: string
  color: string
}

interface Props {
  chartData: DomainData[]
  evaluationPeriods: EvaluationPeriod[]
}

const props = defineProps<Props>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Extract domain names for labels
  const labels = props.chartData.map(domain => domain.name)

  // Create datasets for each evaluation period
  const datasets = props.evaluationPeriods.map((evaluation, index) => {
    const data = props.chartData.map(domain => {
      const evaluationData = domain.evaluations[index]
      return evaluationData ? evaluationData.score : 0
    })

    return {
      label: evaluation.name,
      data: data,
      backgroundColor: `${evaluation.color}26`, // 15% opacity for better visibility
      borderColor: evaluation.color,
      borderWidth: 2.5,
      borderDash: [], // Solid line
      tension: 0.1, // Slight curve for smoother appearance
      fill: true,
      pointBackgroundColor: evaluation.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: evaluation.color,
      pointHoverBorderWidth: 3,
      pointHoverRadius: 7,
      pointStyle: 'circle'
    }
  })

  const config: ChartConfiguration<'radar'> = {
    type: 'radar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      },
      interaction: {
        mode: 'point',
        intersect: true
      },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 10,
          suggestedMin: 0,
          suggestedMax: 10,
          angleLines: {
            display: true,
            color: 'rgba(0, 0, 0, 0.15)',
            lineWidth: 1.5
          },
          ticks: {
            stepSize: 2,
            backdropColor: 'rgba(255, 255, 255, 0.9)',
            backdropPadding: 4,
            font: {
              family: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              size: 13,
              weight: 600
            },
            color: '#1c1b1f',
            showLabelBackdrop: true,
            z: 10,
            callback: (value) => {
              return value.toString()
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.2)',
            circular: true,
            lineWidth: 1.5
          },
          pointLabels: {
            font: {
              family: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              size: 13,
              weight: 500
            },
            color: 'var(--md-sys-color-on-surface, #1c1b1f)',
            padding: 8,
            callback: (label) => {
              // Wrap long labels
              const maxLength = 20
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
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          align: 'center',
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
            pointStyle: 'circle',
            generateLabels: (chart) => {
              const datasets = chart.data.datasets
              return datasets.map((dataset, i) => ({
                text: dataset.label || '',
                fillStyle: dataset.backgroundColor as string,
                strokeStyle: dataset.borderColor as string,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i,
                pointStyle: 'circle' as const
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
          mode: 'point',
          intersect: true,
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
              const value = context.parsed.r.toFixed(1)
              return ` ${label}: ${value}/10`
            },
            afterLabel: (context) => {
              const value = context.parsed.r
              let performance = ''
              if (value >= 8) performance = '(Excellent)'
              else if (value >= 6) performance = '(Bien)'
              else if (value >= 4) performance = '(Moyen)'
              else performance = '(À améliorer)'
              return performance
            }
          }
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
.radar-chart-container {
  position: relative;
  width: 100%;
  height: 550px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: transparent;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
}

@media (max-width: 1024px) {
  .radar-chart-container {
    height: 500px;
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .radar-chart-container {
    height: 450px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .radar-chart-container {
    height: 400px;
    padding: 8px;
  }
}
</style>
