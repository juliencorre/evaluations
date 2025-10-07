/**
 * Evaluation Types Module
 *
 * Contains type definitions related to evaluations
 * Part of Phase 4.2 type organization
 */

import type { EvaluationResult } from './result.types'

/**
 * Evaluation entity
 * Represents an evaluation session for a class using a specific competency framework
 */
export interface Evaluation {
  id: string
  name: string
  description: string
  classId: string
  frameworkId: string
  createdAt: string
  results: EvaluationResult[]
}
