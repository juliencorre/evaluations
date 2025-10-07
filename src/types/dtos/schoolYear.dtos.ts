/**
 * School Year Data Transfer Objects (DTOs)
 * Used for API requests and repository operations
 */

/**
 * DTO for creating a new school year
 */
export interface CreateSchoolYearDTO {
  name: string
  startDate: string
  endDate: string
  isCurrent?: boolean
}

/**
 * DTO for updating a school year
 */
export interface UpdateSchoolYearDTO {
  name?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
}
