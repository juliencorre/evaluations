<template>
  <div class="year-comparison-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface SchoolYear {
  id: string
  name: string
  color: string
}

interface ChartDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  tension: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

interface Props {
  chartData: ChartData
  schoolYears: SchoolYear[]
}

const props = defineProps<Props>()

const chartCanvas = ref<HTMLCanvasElement | null>(null) as any
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: props.chartData.labels,
      datasets: props.chartData.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: false,
            padding: 15,
            font: {
              size: 12,
              family: "'Roboto', sans-serif"
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14,
            family: "'Roboto', sans-serif"
          },
          bodyFont: {
            size: 13,
            family: "'Roboto', sans-serif"
          },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context: { dataset: { label?: string }; parsed: { y: number } }) {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              return `${label}: ${value.toFixed(2)}/10`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 1,
            font: {
              size: 11,
              family: "'Roboto', sans-serif"
            },
            callback: function(value: number | string) {
              return value + '/10'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 11,
              family: "'Roboto', sans-serif"
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            display: false
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  }

  chartInstance = new Chart(ctx, config)
}

onMounted(() => {
  createChart()
})

watch(
  () => [props.chartData, props.schoolYears],
  () => {
    createChart()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.year-comparison-chart {
  width: 100%;
  height: 500px;
  position: relative;
}

canvas {
  max-width: 100%;
  max-height: 100%;
}

@media (max-width: 768px) {
  .year-comparison-chart {
    height: 400px;
  }
}
</style>