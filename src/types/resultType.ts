/**
 * Types pour les configurations de résultats d'évaluation
 */
export interface ResultTypeValue {
  value: string
  label: string
  color?: string
  icon?: string
  pivot_value?: number | null
}

export interface ResultTypeConfig {
  id: string
  name: string
  description?: string
  config: {
    values: ResultTypeValue[]
  }
  isDefault?: boolean
  schoolYearId?: string
  createdAt?: string
  updatedAt?: string
}

export interface ResultType {
  id: string
  name: string
  description?: string
  config: {
    values: ResultTypeValue[]
  }
}
