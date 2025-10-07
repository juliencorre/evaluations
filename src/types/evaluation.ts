/**
 * Evaluation Types Barrel Export
 *
 * Phase 4.2: Type Organization
 * This file now serves as a barrel export for backward compatibility.
 * Types have been split into focused modules for better organization.
 *
 * @see student.types.ts - Student, Class, ClassTeacher
 * @see result.types.ts - Result types and configurations
 * @see competency.types.ts - Competency framework hierarchy
 * @see evaluation.types.ts - Evaluation entity
 */

// Re-export student types
export type { Student, Class, ClassTeacher } from './student.types'

// Re-export result types
export type {
  ResultType,
  ResultTypeConfigValue,
  ResultTypeConfig,
  EvaluationLevel,
  EvaluationValue,
  EvaluationResult
} from './result.types'

// Re-export competency types
export type {
  SpecificCompetency,
  Competency,
  Field,
  Domain,
  CompetencyFramework,
  TreeNode
} from './competency.types'

// Re-export evaluation types
export type { Evaluation } from './evaluation.types'
