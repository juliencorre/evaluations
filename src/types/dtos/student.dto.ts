/**
 * Data Transfer Objects (DTOs) for Student operations
 * Phase 4.3: Services Layer - Repository Pattern
 */

export interface CreateStudentDTO {
  firstName: string
  lastName: string
  gender?: 'M' | 'F' | 'Autre' | null
  birthDate?: string | null
}

export interface UpdateStudentDTO {
  firstName?: string
  lastName?: string
  gender?: 'M' | 'F' | 'Autre' | null
  birthDate?: string | null
}

export interface BulkImportStudentDTO {
  firstName: string
  lastName: string
}
