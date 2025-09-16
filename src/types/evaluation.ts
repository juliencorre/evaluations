export interface Student {
  id: string
  firstName: string
  lastName: string
  displayName: string
}

export interface SpecificCompetency {
  id: string
  name: string
  description: string
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

export interface EvaluationResult {
  studentId: string
  competencyId: string
  specificCompetencyId?: string
  level: EvaluationLevel
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
