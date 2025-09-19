// Base interfaces for competency framework
export interface BaseEntity {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Drag and drop interfaces
export interface DragDropState {
  isGhost?: boolean
  isDragging?: boolean
}

// Result type configuration
export interface ResultTypeConfigValue {
  label: string
  value: string
  pivot_value: number
}

export interface ResultTypeConfig extends BaseEntity {
  type?: 'scale' | 'boolean' | 'custom'
  config: {
    type?: 'scale' | 'boolean' | 'custom'
    values: ResultTypeConfigValue[]
  }
}

// Specific competency with evaluation type
export interface SpecificCompetency extends BaseEntity, DragDropState {
  resultTypeConfigId?: string
  competencyId: string
}

// Competency containing specific competencies
export interface Competency extends BaseEntity, DragDropState {
  fieldId: string
  specificCompetencies: SpecificCompetency[]
}

// Field containing competencies
export interface Field extends BaseEntity, DragDropState {
  domainId: string
  competencies: Competency[]
}

// Domain containing fields
export interface Domain extends BaseEntity, DragDropState {
  frameworkId: string
  fields: Field[]
}

// Complete competency framework
export interface CompetencyFramework extends BaseEntity {
  domains: Domain[]
}

// Tab interface for navigation
export interface TabItem {
  id: string
  label: string
  value: string
}

// Modal context for editing
export interface EditContext {
  type: 'domain' | 'field' | 'competency' | 'specificCompetency'
  domain?: Domain
  field?: Field
  competency?: Competency
  specificCompetency?: SpecificCompetency
}

// Event payloads for competency tree operations
export interface CompetencyTreeEvents {
  'add-field': { domain: Domain }
  'edit-domain': { domain: Domain }
  'delete-domain': { domain: Domain }
  'add-competency': { field: Field, domain: Domain }
  'edit-field': { field: Field, domain: Domain }
  'delete-field': { field: Field, domain: Domain }
  'edit-competency': { competency: Competency, field: Field, domain: Domain }
  'delete-competency': { competency: Competency, field: Field, domain: Domain }
  'add-specific-competency': { competency: Competency, field: Field, domain: Domain }
  'edit-specific-competency': {
    specificCompetency: SpecificCompetency
    competency: Competency
    field: Field
    domain: Domain
  }
  'delete-specific-competency': {
    specificCompetency: SpecificCompetency
    competency: Competency
    field: Field
    domain: Domain
  }
}

// Form data interfaces
export interface CompetencyFormData {
  name: string
  description: string
  resultTypeConfigId?: string
}

export interface ResultTypeFormData {
  name: string
  config: {
    values: ResultValue[]
  }
}

// Component props interfaces
export interface PageLayoutProps {
  title: string
  tabs?: TabItem[]
  activeTab?: string
  tabsAriaLabel?: string
}

export interface ExtendedFABProps {
  icon: string
  label: string
  visible?: boolean
  ariaLabel?: string
}

export interface ImportExportProps {
  importTitle?: string
  importDescription?: string
  exportTitle?: string
  exportDescription?: string
  exportButtonText?: string
  fileAccept?: string
  importing?: boolean
  exporting?: boolean
}