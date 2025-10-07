/**
 * Result Types Module
 *
 * Contains all type definitions related to evaluation results and result type configurations
 * Part of Phase 4.2 type organization
 */

/**
 * Result type enumeration
 * Defines the different types of evaluation results supported
 */
export type ResultType = 'scale' | 'boolean' | 'custom' | 'numeric'

/**
 * Result type configuration value
 * Represents a single possible value in a result type configuration
 */
export interface ResultTypeConfigValue {
  label: string
  value: string
  pivot_value: number | null  // Value on 0-10 scale for cross-type analysis, null for N/A
  isFixed?: boolean  // For N/A values that cannot be deleted
}

/**
 * Result type configuration
 * Defines how evaluation results are represented (scales, booleans, numeric, etc.)
 */
export interface ResultTypeConfig {
  id: string
  name: string
  type: ResultType
  config: {
    values: ResultTypeConfigValue[]
    // Numeric type specific configuration
    minValue?: number
    maxValue?: number
  }
}

/**
 * Evaluation level (deprecated)
 * @deprecated Use EvaluationValue with ResultTypeConfig instead
 * Legacy type for A-E scale evaluations
 */
export type EvaluationLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A'

/**
 * Evaluation value
 * Generic value type supporting any string based on configured result type
 */
export type EvaluationValue = string

/**
 * Evaluation result
 * Represents a single student's result for a specific competency
 */
export interface EvaluationResult {
  studentId: string
  competencyId: string
  specificCompetencyId?: string
  resultTypeConfigId?: string
  level?: EvaluationLevel // Deprecated, kept for backward compatibility
  value?: EvaluationValue // New field supporting different result types
  comment?: string
  evaluatedAt: string
}
