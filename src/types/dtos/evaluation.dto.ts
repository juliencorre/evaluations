/**
 * Data Transfer Objects (DTOs) for Evaluation operations
 * Phase 4.3: Services Layer - Repository Pattern
 */

export interface CreateEvaluationDTO {
  name: string
  description: string
  frameworkId: string
  classId?: string
  schoolYearId?: string
}

export interface UpdateEvaluationDTO {
  name?: string
  description?: string
  frameworkId?: string
  schoolYearId?: string
}
