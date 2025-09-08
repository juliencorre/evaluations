// Database Types for Evaluations Platform
// Generated from database schema

export interface ApiResponse<T = any> {
  data?: T
  error?: string
}

// Core entity interfaces based on actual schema
export interface Teacher {
  teacher_id: string
  user_id: string
  first_name: string
  last_name: string
  email?: string
  active?: boolean
  created_at: string
}

export interface School {
  school_id: string
  name: string
  uai?: string
  city?: string
  created_at: string
}

export interface SchoolYear {
  school_year_id: string
  label: string
  starts_on: string
  ends_on: string
  created_at: string
}

export interface Class {
  class_id: string
  school_id?: string
  school_year_id: string
  label: string
  level?: string
  primary_teacher_id: string
  created_at: string
}

export interface ClassTeacher {
  class_id: string
  teacher_id: string
  role: 'main' | 'co' | 'avs' | 'intervenant' | 'remplacant' | 'autre'
  is_primary: boolean
  starts_on: string
  ends_on?: string
  created_at: string
}

export interface Student {
  student_id: string
  first_name: string
  last_name: string
  birth_date?: string
  external_ref?: string
  created_at: string
}

export interface Enrolment {
  enrolment_id: string
  student_id: string
  class_id: string
  enrolled_at: string
  created_at: string
}

export interface CompetenceFramework {
  framework_id: string
  name: string
  locale?: string
  version?: string
  effective_from?: string
  effective_to?: string
  created_at: string
}

export interface Domain {
  domain_id: string
  framework_id: string
  code?: string
  label: string
  sort_order?: number
  created_at: string
}

export interface Field {
  field_id: string
  framework_id: string
  domain_id: string
  code?: string
  label: string
  sort_order?: number
  created_at: string
}

export interface Competence {
  competence_id: string
  framework_id: string
  field_id: string
  code?: string
  label: string
  description?: string
  sort_order?: number
  created_at: string
}

export interface SpecificCompetence {
  specific_competence_id: string
  framework_id: string
  competence_id: string
  code?: string
  label: string
  description?: string
  sort_order?: number
  created_at: string
}

export interface Rubric {
  rubric_id: string
  name: string
  kind: 'ordinal' | 'numeric' | 'hybrid'
  description?: string
  created_by_teacher_id: string
  created_at: string
}

export interface RubricLevel {
  rubric_level_id: string
  rubric_id: string
  code: string
  label: string
  ordinal: number
  min_score?: number
  max_score?: number
  color?: string
  created_at: string
}

export interface EvalTemplate {
  template_id: string
  framework_id: string
  name: string
  description?: string
  created_by_teacher_id: string
  created_at: string
}

export interface EvalTemplateLine {
  template_line_id: string
  template_id: string
  competence_id?: string
  specific_competence_id?: string
  rubric_id: string
  weight?: number
  sort_order?: number
  created_at: string
}

export interface EvalSession {
  session_id: string
  class_id: string
  template_id: string
  label: string
  session_date: string
  notes?: string
  created_by_teacher_id?: string
  created_at: string
}

export interface Evaluation {
  evaluation_id: string
  session_id: string
  student_id: string
  status: 'in_progress' | 'submitted' | 'finalized'
  started_at?: string
  submitted_at?: string
  evaluator_teacher_id?: string
}

export interface EvalResult {
  eval_result_id: string
  evaluation_id: string
  template_line_id: string
  rubric_level_id?: string
  numeric_score?: number
  comment?: string
  teacher_id?: string
  updated_by_teacher_id?: string
  created_at: string
  updated_at?: string
}

// Form interfaces for creating/updating entities
export interface CreateSchoolForm {
  name: string
  uai?: string
  city?: string
}

export interface CreateSchoolYearForm {
  label: string
  starts_on: string
  ends_on: string
}

export interface CreateClassForm {
  label: string
  level?: string
  school_year_id: string
  school_id?: string
  primary_teacher_id?: string
}

export interface CreateStudentForm {
  first_name: string
  last_name: string
  birth_date?: string
  external_ref?: string
}

export interface CreateCompetenceFrameworkForm {
  name: string
  locale?: string
  version?: string
  effective_from?: string
  effective_to?: string
}

export interface CreateDomainForm {
  framework_id: string
  code?: string
  label: string
  sort_order?: number
}

export interface CreateFieldForm {
  framework_id: string
  domain_id: string
  code?: string
  label: string
  sort_order?: number
}

export interface CreateCompetenceForm {
  framework_id: string
  field_id: string
  code?: string
  label: string
  description?: string
  sort_order?: number
}

export interface CreateSpecificCompetenceForm {
  framework_id: string
  competence_id: string
  code?: string
  label: string
  description?: string
  sort_order?: number
}

export interface CreateEvaluationSessionForm {
  class_id: string
  template_id: string
  label: string
  session_date: string
  notes?: string
}

export interface CreateRubricForm {
  name: string
  kind: 'ordinal' | 'numeric' | 'hybrid'
  description?: string
  levels: Omit<RubricLevel, 'rubric_level_id' | 'rubric_id' | 'created_at'>[]
}

// Extended interfaces with relationships
export interface SchoolWithDetails extends School {
  class?: ClassWithDetails[]
  class_count?: number
  student_count?: number
}

export interface SchoolYearWithDetails extends SchoolYear {
  class?: ClassWithDetails[]
  class_count?: number
  student_count?: number
}

export interface ClassWithDetails extends Class {
  school?: School
  school_year: SchoolYear
  primary_teacher: Teacher
  teachers?: (ClassTeacher & { teacher: Teacher })[]
  students?: (Student & { enrolment_date?: string })[]
  student_count?: number
}

export interface StudentWithDetails extends Student {
  current_class?: ClassWithDetails
  enrolments?: (Enrolment & { class: ClassWithDetails })[]
}

export interface DomainWithDetails extends Domain {
  teacher: Teacher
  fields?: FieldWithDetails[]
  field_count?: number
  competence_count?: number
}

export interface FieldWithDetails extends Field {
  domain: DomainWithDetails
  competences?: CompetenceWithDetails[]
  competence_count?: number
}

export interface CompetenceWithDetails extends Competence {
  field: FieldWithDetails
  specific_competences?: SpecificCompetenceWithDetails[]
  specific_competence_count?: number
}

export interface SpecificCompetenceWithDetails extends SpecificCompetence {
  competence: CompetenceWithDetails
  evaluations?: Evaluation[]
}

export interface EvalSessionWithDetails extends EvalSession {
  class: ClassWithDetails
  template: EvalTemplate
  evaluations?: (Evaluation & { 
    student: Student
    specific_competence: SpecificCompetenceWithDetails
    rubric_level?: RubricLevel
  })[]
  evaluation_count?: number
}

// Utility types
export type UserRole = 'teacher' | 'admin' | 'student'
export type ClassTeacherRole = 'primary' | 'secondary'
export type EvaluationStatus = 'draft' | 'in_progress' | 'completed'

// Filter and search types
export interface BaseFilter {
  search?: string
  limit?: number
  offset?: number
}

export interface ClassFilter extends BaseFilter {
  school_year_id?: string
  school_id?: string
  teacher_id?: string
}

export interface StudentFilter extends BaseFilter {
  class_id?: string
  school_year_id?: string
}

export interface SchoolFilter extends BaseFilter {
  city?: string
}

export interface SchoolYearFilter extends BaseFilter {
  status?: 'all' | 'current' | 'past' | 'future'
}

export interface DomainFilter extends BaseFilter {
  teacher_id?: string
}

export interface FieldFilter extends BaseFilter {
  domain_id?: string
}

export interface CompetenceFilter extends BaseFilter {
  field_id?: string
  domain_id?: string
}

export interface SpecificCompetenceFilter extends BaseFilter {
  competence_id?: string
  field_id?: string
  domain_id?: string
}

export interface EvalSessionFilter extends BaseFilter {
  class_id?: string
  template_id?: string
  session_date?: string
}