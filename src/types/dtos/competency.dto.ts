/**
 * Data Transfer Objects (DTOs) for Competency operations
 * Phase 4.3: Services Layer - Repository Pattern
 */

export interface CreateDomainDTO {
  name: string
  description: string
}

export interface UpdateDomainDTO {
  name?: string
  description?: string
}

export interface CreateFieldDTO {
  domainId: string
  name: string
  description: string
}

export interface UpdateFieldDTO {
  name?: string
  description?: string
}

export interface CreateCompetencyDTO {
  fieldId: string
  name: string
  description: string
}

export interface UpdateCompetencyDTO {
  name?: string
  description?: string
}

export interface CreateSpecificCompetencyDTO {
  competencyId: string
  name: string
  description: string
  resultTypeConfigId?: string
}

export interface UpdateSpecificCompetencyDTO {
  name?: string
  description?: string
  resultTypeConfigId?: string
}
