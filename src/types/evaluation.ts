export interface Student {
  id: string
  firstName: string
  lastName: string
  displayName: string
}

export type ResultType = 'scale' | 'boolean' | 'custom'

export interface ResultTypeConfigValue {
  label: string
  value: string
  pivot_value: number  // Value on 0-10 scale for cross-type analysis
}

export interface ResultTypeConfig {
  id: string
  name: string
  type: ResultType
  config: {
    values: ResultTypeConfigValue[]
  }
}

export interface SpecificCompetency {
  id: string
  name: string
  description: string
  resultTypeConfigId?: string
  resultTypeConfig?: ResultTypeConfig
}

export interface Competency {
  id: string
  name: string
  description: string
  specificCompetencies: SpecificCompetency[]
}

export interface Field {
  id: string
  name: string
  description: string
  competencies: Competency[]
}

export interface Domain {
  id: string
  name: string
  description: string
  fields: Field[]
}

export interface CompetencyFramework {
  id: string
  name: string
  version: string
  domains: Domain[]
}

export type EvaluationLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A'
export type EvaluationValue = string // Now supports any string value based on result type

export interface EvaluationResult {
  studentId: string
  competencyId: string
  specificCompetencyId?: string
  level?: EvaluationLevel // Deprecated, kept for backward compatibility
  value?: EvaluationValue // New field supporting different result types
  comment?: string
  evaluatedAt: string
}

export interface Evaluation {
  id: string
  name: string
  description: string
  frameworkId: string
  classId: string
  createdAt: string
  results: EvaluationResult[]
}

export interface TreeNode {
  id: string
  name: string
  type: 'domain' | 'field' | 'competency' | 'specificCompetency'
  level: number
  parentId?: string
  isExpanded?: boolean
  children?: TreeNode[]
  originalItem: Domain | Field | Competency | SpecificCompetency
  hierarchyData?: {
    domain: string
    field: string
    competency: string
    specificCompetency: string
  }
}
