/**
 * Centralized Chart.js Setup Library
 *
 * Global configuration and plugin registration for Chart.js
 * Ensures all components use the same Chart.js setup without redundant imports
 *
 * @module lib/chartSetup
 */

import {
  Chart,
  // Controllers
  BarController,
  LineController,
  RadarController,
  PieController,
  DoughnutController,
  // Scales
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  // Elements
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  // Plugins
  Tooltip,
  Legend,
  Title,
  Filler,
  type ChartConfiguration,
  type ChartOptions,
  type ChartData,
  type Plugin
} from 'chart.js'

/**
 * Register all Chart.js components globally
 * This is done ONCE at application startup
 */
Chart.register(
  // Controllers
  BarController,
  LineController,
  RadarController,
  PieController,
  DoughnutController,
  // Scales
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  // Elements
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  // Plugins
  Tooltip,
  Legend,
  Title,
  Filler
)

/**
 * Material Design 3 Color Palette for Charts
 * Maps semantic colors to Material Design tokens
 */
export const MD_CHART_COLORS = {
  primary: '#2196f3',
  primaryContainer: '#e3f2fd',
  secondary: '#9c27b0',
  secondaryContainer: '#f3e5f5',
  tertiary: '#ff9800',
  tertiaryContainer: '#fff3e0',
  error: '#f44336',
  errorContainer: '#ffebee',
  success: '#4caf50',
  successContainer: '#e8f5e9',
  warning: '#ff9800',
  warningContainer: '#fff3e0',
  info: '#2196f3',
  infoContainer: '#e3f2fd',
  neutral: '#9e9e9e',
  neutralContainer: '#f5f5f5',
} as const

/**
 * Predefined color palettes for multi-dataset charts
 */
export const CHART_PALETTES = {
  material: [
    MD_CHART_COLORS.primary,
    MD_CHART_COLORS.secondary,
    MD_CHART_COLORS.tertiary,
    MD_CHART_COLORS.success,
    MD_CHART_COLORS.warning,
    MD_CHART_COLORS.error,
  ],
  pastel: [
    '#90caf9',
    '#ce93d8',
    '#ffcc80',
    '#a5d6a7',
    '#fff59d',
    '#ef9a9a',
  ],
  vibrant: [
    '#1976d2',
    '#7b1fa2',
    '#f57c00',
    '#388e3c',
    '#fbc02d',
    '#d32f2f',
  ],
} as const

/**
 * Material Design typography settings for charts
 */
export const MD_CHART_FONTS = {
  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  title: {
    size: 16,
    weight: 500,
    lineHeight: 1.5,
  },
  label: {
    size: 14,
    weight: 'normal' as const,
    lineHeight: 1.4,
  },
  body: {
    size: 12,
    weight: 'normal' as const,
    lineHeight: 1.3,
  },
} as const

/**
 * Global Chart.js defaults with Material Design styling
 */
Chart.defaults.font.family = MD_CHART_FONTS.family
Chart.defaults.font.size = MD_CHART_FONTS.body.size
Chart.defaults.color = '#1d1b20' // MD on-surface
Chart.defaults.borderColor = '#c4c6d0' // MD outline-variant

/**
 * Custom plugin to add Material Design elevation shadows to charts
 */
export const materialElevationPlugin: Plugin = {
  id: 'materialElevation',
  beforeDraw: (chart) => {
    const { ctx } = chart
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
  },
  afterDraw: (chart) => {
    chart.ctx.restore()
  },
}

/**
 * Helper to add transparency to hex colors
 * @param color - Hex color string
 * @param opacity - Opacity value (0-1)
 * @returns Hex color with alpha channel
 */
export function withOpacity(color: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return `${color}${alpha}`
}

/**
 * Get a color from a palette by index
 * Wraps around if index exceeds palette length
 */
export function getPaletteColor(
  palette: readonly string[],
  index: number
): string {
  return palette[index % palette.length]
}

// Export Chart and types for use in components
export { Chart }
export type {
  ChartConfiguration,
  ChartOptions,
  ChartData,
  Plugin,
}
