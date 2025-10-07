/**
 * Export centralisé de tous les composables
 * Permet des imports simplifiés: import { useDebounce, useSort } from '@/composables'
 */

// Analysis composables
export { useMetricCalculations } from './analysis/useMetricCalculations'
export { useRadarData } from './analysis/useRadarData'
export { useChartData } from './analysis/useChartData'
export { useComparisonAnalysis } from './analysis/useComparisonAnalysis'

// Chart composables
export { useChartColors } from './charts/useChartColors'
export { useChartConfig } from './charts/useChartConfig'
export { useChartExport } from './charts/useChartExport'

// Evaluation composables
export { useEvaluationFilters } from './evaluations/useEvaluationFilters'
export { useResultCalculations } from './evaluations/useResultCalculations'
export { useEvaluationExport } from './evaluations/useEvaluationExport'

// Student composables
export { useStudentSearch } from './students/useStudentSearch'
export { useStudentFilters } from './students/useStudentFilters'

// Shared composables
export { useDebounce, useDebounceFn } from './shared/useDebounce'
export { usePagination } from './shared/usePagination'
export { useSort } from './shared/useSort'
export { useLocalStorage, removeLocalStorage, clearLocalStorage } from './shared/useLocalStorage'

// Re-export types for convenience
export type { SortDirection } from './shared/useSort'
export type { StudentFilters } from './students/useStudentFilters'
export type { EvaluationFilters } from './evaluations/useEvaluationFilters'
export type { ChartColorPalette } from './charts/useChartColors'
export type { ExportData } from './evaluations/useEvaluationExport'
export type {
  RadarDataPoint,
  EvaluationDataPoint,
  EvaluationData
} from './analysis/useRadarData'
export type {
  ChartDataset,
  ChartData
} from './analysis/useChartData'
export type { ComparisonData } from './analysis/useComparisonAnalysis'
