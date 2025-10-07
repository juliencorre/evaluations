/**
 * Competency Types Module
 *
 * Contains all type definitions related to competency frameworks and their hierarchy
 * Part of Phase 4.2 type organization
 */

import type { ResultTypeConfig } from './result.types'

/**
 * Specific Competency
 * The most granular level of a competency - this is what gets evaluated
 */
export interface SpecificCompetency {
  id: string
  name: string
  description: string
  resultTypeConfigId?: string
  resultTypeConfig?: ResultTypeConfig
}

/**
 * Competency
 * A group of related specific competencies
 */
export interface Competency {
  id: string
  name: string
  description: string
  specificCompetencies: SpecificCompetency[]
}

/**
 * Field
 * A domain subdivision containing related competencies
 */
export interface Field {
  id: string
  name: string
  description: string
  competencies: Competency[]
}

/**
 * Domain
 * The top-level grouping of competencies
 */
export interface Domain {
  id: string
  name: string
  description: string
  fields: Field[]
}

/**
 * Competency Framework
 * The complete hierarchical structure of competencies
 */
export interface CompetencyFramework {
  id: string
  name: string
  version: string
  domains: Domain[]
}

/**
 * Tree Node
 * Represents a node in the competency tree view
 * Used for UI rendering of the hierarchical structure
 */
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
