import type { ResultTypeConfig, EvaluationResult } from '@/types/evaluation'

export interface NormalizedEvaluationResult {
  studentId: string
  competencyId: string
  specificCompetencyId?: string
  originalValue: string
  pivotValue: number
  comment?: string
  evaluatedAt: string
}

export class PivotAnalysisService {
  /**
   * Converts an evaluation result to normalized 0-10 scale using result type configuration
   */
  static normalizeEvaluationResult(
    result: EvaluationResult,
    resultTypeConfig: ResultTypeConfig
  ): NormalizedEvaluationResult | null {
    const value = result.value || result.level // Backward compatibility
    if (!value) return null

    let pivotValue = 0

    if (resultTypeConfig.type === 'numeric') {
      // Handle numeric type - calculate pivot value based on range
      const numericValue = parseFloat(value)
      if (isNaN(numericValue)) {
        console.warn(`Invalid numeric value: ${value}`)
        return null
      }

      const minValue = resultTypeConfig.config.minValue ?? 0
      const maxValue = resultTypeConfig.config.maxValue ?? 10

      // Calculate pivot value: proportional between min and max, capped at 10
      if (numericValue <= minValue) {
        pivotValue = 0
      } else if (numericValue >= maxValue) {
        pivotValue = 10
      } else {
        // Linear interpolation between min and max
        pivotValue = ((numericValue - minValue) / (maxValue - minValue)) * 10
      }
    } else {
      // Handle other types - find the corresponding pivot value in the configuration
      const configValue = resultTypeConfig.config.values.find(v =>
        (typeof v === 'object' && v.value === value) || (typeof v === 'string' && v === value)
      )

      if (!configValue) {
        console.warn(`No pivot value found for result value: ${value}`)
        return null
      }

      pivotValue = typeof configValue === 'object' ? configValue.pivot_value : 5 // Default to middle value
    }

    return {
      studentId: result.studentId,
      competencyId: result.competencyId,
      specificCompetencyId: result.specificCompetencyId,
      originalValue: value,
      pivotValue: pivotValue,
      comment: result.comment,
      evaluatedAt: result.evaluatedAt
    }
  }

  /**
   * Converts multiple evaluation results to normalized 0-10 scale
   */
  static normalizeEvaluationResults(
    results: EvaluationResult[],
    resultTypeConfigs: Map<string, ResultTypeConfig>
  ): NormalizedEvaluationResult[] {
    const normalized: NormalizedEvaluationResult[] = []

    for (const result of results) {
      // Try to find the result type config for this specific competency
      // This would require additional data about which competency uses which result type
      // For now, we'll need to implement this when we have the competency-to-result-type mapping

      // Fallback: try to infer from value format
      let resultTypeConfig: ResultTypeConfig | undefined

      for (const config of resultTypeConfigs.values()) {
        const hasMatchingValue = config.config.values.some(v => {
          const configValue = typeof v === 'object' ? v.value : v
          return configValue === (result.value || result.level)
        })
        if (hasMatchingValue) {
          resultTypeConfig = config
          break
        }
      }

      if (resultTypeConfig) {
        const normalizedResult = this.normalizeEvaluationResult(result, resultTypeConfig)
        if (normalizedResult) {
          normalized.push(normalizedResult)
        }
      }
    }

    return normalized
  }

  /**
   * Calculates statistics for normalized results
   */
  static calculateStatistics(normalizedResults: NormalizedEvaluationResult[]) {
    if (normalizedResults.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        distribution: {}
      }
    }

    const values = normalizedResults.map(r => r.pivotValue)
    const sum = values.reduce((acc, val) => acc + val, 0)
    const average = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    // Create distribution by rounding to nearest 0.5
    const distribution: Record<string, number> = {}
    for (const value of values) {
      const rounded = Math.round(value * 2) / 2
      const key = rounded.toString()
      distribution[key] = (distribution[key] || 0) + 1
    }

    return {
      average: Math.round(average * 100) / 100,
      min,
      max,
      count: values.length,
      distribution
    }
  }

  /**
   * Groups normalized results by competency
   */
  static groupByCompetency(normalizedResults: NormalizedEvaluationResult[]) {
    const grouped: Record<string, NormalizedEvaluationResult[]> = {}

    for (const result of normalizedResults) {
      const key = result.specificCompetencyId || result.competencyId
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(result)
    }

    return grouped
  }

  /**
   * Groups normalized results by student
   */
  static groupByStudent(normalizedResults: NormalizedEvaluationResult[]) {
    const grouped: Record<string, NormalizedEvaluationResult[]> = {}

    for (const result of normalizedResults) {
      if (!grouped[result.studentId]) {
        grouped[result.studentId] = []
      }
      grouped[result.studentId].push(result)
    }

    return grouped
  }

  /**
   * Converts a pivot value back to a specific result type scale
   */
  static denormalizePivotValue(
    pivotValue: number,
    targetResultTypeConfig: ResultTypeConfig
  ): string | null {
    // Find the closest value in the target result type
    let closestValue: string | { label: string; value: string; pivot_value: number } | null = null
    let closestDistance = Infinity

    for (const configValue of targetResultTypeConfig.config.values) {
      const targetPivotValue = typeof configValue === 'object' ? configValue.pivot_value : 5
      const distance = Math.abs(targetPivotValue - pivotValue)

      if (distance < closestDistance) {
        closestDistance = distance
        closestValue = configValue
      }
    }

    if (closestValue) {
      return typeof closestValue === 'object' ? closestValue.value : closestValue
    }

    return null
  }
}

export const pivotAnalysisService = new PivotAnalysisService()