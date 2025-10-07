/**
 * Data Transfer Objects (DTOs) for Class operations
 * Phase 4.3: Services Layer - Repository Pattern
 */

export interface CreateClassDTO {
  name: string
  description?: string
  schoolYear: string
  level?: string
  subject?: string
  active?: boolean
}

export interface UpdateClassDTO {
  name?: string
  description?: string
  schoolYear?: string
  level?: string
  subject?: string
  active?: boolean
}

export interface AddUserToClassDTO {
  userId: string
  classId: string
  role?: 'teacher' | 'owner' | 'assistant'
}
