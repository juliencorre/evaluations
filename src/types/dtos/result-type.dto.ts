/**
 * Data Transfer Objects (DTOs) for ResultType operations
 * Phase 4.3: Services Layer - Repository Pattern
 */

import type { ResultType, ResultTypeConfigValue } from '../result.types'

export interface CreateResultTypeDTO {
  name: string
  type: ResultType
  config: {
    values: ResultTypeConfigValue[]
    minValue?: number
    maxValue?: number
  }
}

export interface UpdateResultTypeDTO {
  name?: string
  type?: ResultType
  config?: {
    values?: ResultTypeConfigValue[]
    minValue?: number
    maxValue?: number
  }
}
