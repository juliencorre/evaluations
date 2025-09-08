/**
 * Database Service Composable
 * Provides unified database operations for all evaluation platform entities
 */

import type { 
  Student, 
  Class, 
  Domain, 
  Field, 
  Competence, 
  SpecificCompetence,
  Teacher,
  SchoolYear,
  School,
  CompetenceFramework,
  Rubric,
  RubricLevel,
  EvalTemplate,
  EvalTemplateLine,
  EvalSession,
  Evaluation,
  EvalResult,
  Enrolment,
  ApiResponse,
  PaginatedResponse,
  StudentFilter,
  CompetenceFilter,
  EvalSessionFilter,
  CreateStudentForm,
  CreateClassForm,
  CreateDomainForm,
  CreateFieldForm,
  CreateCompetenceForm,
  CreateSpecificCompetenceForm,
  CreateRubricForm,
  CreateEvalTemplateForm,
  CreateEvalSessionForm
} from '~/types/database'

export const useDatabase = () => {
  const supabase = useSupabase()

  // Helper function to get current teacher ID
  const getCurrentTeacherId = async (): Promise<string | null> => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return null
      
      const { data: teacherData, error } = await supabase
        .from('teacher')
        .select('teacher_id')
        .eq('user_id', user.user.id)
        .single()
        
      if (error) {
        console.error('Error getting teacher by user_id:', error)
        return null
      }
      
      return teacherData?.teacher_id || null
    } catch (error) {
      console.error('Error getting current teacher ID:', error)
      return null
    }
  }

  // Error handler
  const handleError = (error: any, operation: string): ApiResponse<null> => {
    console.error(`Database error in ${operation}:`, error)
    return {
      error: {
        message: error.message || `Erreur lors de ${operation}`,
        code: error.code
      }
    }
  }

  // Success handler
  const handleSuccess = <T>(data: T): ApiResponse<T> => {
    return { data }
  }

  // ===== STUDENT MANAGEMENT =====
  const students = {
    // Get all students with optional filtering
    async getAll(filter?: StudentFilter): Promise<ApiResponse<Student[]>> {
      try {
        let query = supabase
          .from('student')
          .select(`
            *,
            enrolments:enrolment(
              *,
              class:class(
                *,
                school:school(*)
              )
            )
          `)

        if (filter?.class_id) {
          query = query.eq('enrolment.class_id', filter.class_id)
        }

        if (filter?.search) {
          query = query.or(`first_name.ilike.%${filter.search}%,last_name.ilike.%${filter.search}%`)
        }

        const { data, error } = await query.order('last_name', { ascending: true })

        if (error) return handleError(error, 'récupération des élèves')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des élèves')
      }
    },

    // Get student by ID
    async getById(id: string): Promise<ApiResponse<Student | null>> {
      try {
        const { data, error } = await supabase
          .from('student')
          .select(`
            *,
            enrolments:enrolment(
              *,
              class:class(
                *,
                school:school(*)
              )
            )
          `)
          .eq('student_id', id)
          .single()

        if (error) return handleError(error, 'récupération de l\'élève')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'récupération de l\'élève')
      }
    },

    // Create student
    async create(studentData: CreateStudentForm): Promise<ApiResponse<Student>> {
      try {
        const { data, error } = await supabase
          .from('student')
          .insert(studentData)
          .select()
          .single()

        if (error) return handleError(error, 'création de l\'élève')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'création de l\'élève')
      }
    },

    // Update student
    async update(id: string, studentData: Partial<CreateStudentForm>): Promise<ApiResponse<Student>> {
      try {
        const { data, error } = await supabase
          .from('student')
          .update(studentData)
          .eq('student_id', id)
          .select()
          .single()

        if (error) return handleError(error, 'modification de l\'élève')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'modification de l\'élève')
      }
    },

    // Delete student
    async delete(id: string): Promise<ApiResponse<null>> {
      try {
        const { error } = await supabase
          .from('student')
          .delete()
          .eq('student_id', id)

        if (error) return handleError(error, 'suppression de l\'élève')
        return handleSuccess(null)
      } catch (error) {
        return handleError(error, 'suppression de l\'élève')
      }
    },

    // Enroll student in class
    async enrollInClass(studentId: string, classId: string): Promise<ApiResponse<Enrolment>> {
      try {
        const { data, error } = await supabase
          .from('enrolment')
          .insert({
            student_id: studentId,
            class_id: classId,
            enrolled_at: new Date().toISOString().split('T')[0]
          })
          .select()
          .single()

        if (error) return handleError(error, 'inscription de l\'élève')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'inscription de l\'élève')
      }
    }
  }

  // ===== CLASS MANAGEMENT =====
  const classes = {
    // Get all classes
    async getAll(): Promise<ApiResponse<Class[]>> {
      try {
        const { data, error } = await supabase
          .from('class')
          .select(`
            *,
            school:school(*),
            school_year:school_year(*),
            primary_teacher:teacher!primary_teacher_id(*)
          `)
          .order('label', { ascending: true })

        if (error) return handleError(error, 'récupération des classes')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des classes')
      }
    },

    // Get class by ID
    async getById(id: string): Promise<ApiResponse<Class | null>> {
      try {
        const { data, error } = await supabase
          .from('class')
          .select(`
            *,
            school:school(*),
            school_year:school_year(*),
            primary_teacher:teacher!primary_teacher_id(*),
            students:enrolment(
              *,
              student:student(*)
            )
          `)
          .eq('class_id', id)
          .single()

        if (error) return handleError(error, 'récupération de la classe')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'récupération de la classe')
      }
    },

    // Create class
    async create(classData: CreateClassForm): Promise<ApiResponse<Class>> {
      try {
        const { data, error } = await supabase
          .from('class')
          .insert({
            ...classData,
            primary_teacher_id: await getCurrentTeacherId()
          })
          .select()
          .single()

        if (error) return handleError(error, 'création de la classe')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'création de la classe')
      }
    }
  }

  // ===== COMPETENCE FRAMEWORK MANAGEMENT =====
  const frameworks = {
    // Get all frameworks
    async getAll(): Promise<ApiResponse<CompetenceFramework[]>> {
      try {
        const { data, error } = await supabase
          .from('competence_framework')
          .select('*')
          .order('name', { ascending: true })

        if (error) return handleError(error, 'récupération des référentiels')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des référentiels')
      }
    }
  }

  // ===== DOMAIN MANAGEMENT =====
  const domains = {
    // Get all domains
    async getAll(frameworkId?: string): Promise<ApiResponse<Domain[]>> {
      try {
        let query = supabase
          .from('domain')
          .select(`
            *,
            framework:competence_framework(*)
          `)

        if (frameworkId) {
          query = query.eq('framework_id', frameworkId)
        }

        const { data, error } = await query.order('sort_order', { ascending: true })

        if (error) return handleError(error, 'récupération des domaines')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des domaines')
      }
    },

    // Create domain
    async create(domainData: CreateDomainForm): Promise<ApiResponse<Domain>> {
      try {
        const { data, error } = await supabase
          .from('domain')
          .insert(domainData)
          .select()
          .single()

        if (error) return handleError(error, 'création du domaine')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'création du domaine')
      }
    },

    // Update domain
    async update(id: string, domainData: Partial<CreateDomainForm>): Promise<ApiResponse<Domain>> {
      try {
        const { data, error } = await supabase
          .from('domain')
          .update(domainData)
          .eq('domain_id', id)
          .select()
          .single()

        if (error) return handleError(error, 'modification du domaine')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'modification du domaine')
      }
    },

    // Delete domain
    async delete(id: string): Promise<ApiResponse<null>> {
      try {
        const { error } = await supabase
          .from('domain')
          .delete()
          .eq('domain_id', id)

        if (error) return handleError(error, 'suppression du domaine')
        return handleSuccess(null)
      } catch (error) {
        return handleError(error, 'suppression du domaine')
      }
    }
  }

  // ===== FIELD MANAGEMENT =====
  const fields = {
    // Get all fields
    async getAll(domainId?: string): Promise<ApiResponse<Field[]>> {
      try {
        let query = supabase
          .from('field')
          .select(`
            *,
            domain:domain(*),
            framework:competence_framework(*)
          `)

        if (domainId) {
          query = query.eq('domain_id', domainId)
        }

        const { data, error } = await query.order('sort_order', { ascending: true })

        if (error) return handleError(error, 'récupération des champs')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des champs')
      }
    },

    // Create field
    async create(fieldData: CreateFieldForm): Promise<ApiResponse<Field>> {
      try {
        const { data, error } = await supabase
          .from('field')
          .insert(fieldData)
          .select()
          .single()

        if (error) return handleError(error, 'création du champ')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'création du champ')
      }
    },

    // Update field
    async update(id: string, fieldData: Partial<CreateFieldForm>): Promise<ApiResponse<Field>> {
      try {
        const { data, error } = await supabase
          .from('field')
          .update(fieldData)
          .eq('field_id', id)
          .select()
          .single()

        if (error) return handleError(error, 'modification du champ')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'modification du champ')
      }
    },

    // Delete field
    async delete(id: string): Promise<ApiResponse<null>> {
      try {
        const { error } = await supabase
          .from('field')
          .delete()
          .eq('field_id', id)

        if (error) return handleError(error, 'suppression du champ')
        return handleSuccess(null)
      } catch (error) {
        return handleError(error, 'suppression du champ')
      }
    }
  }

  // ===== COMPETENCE MANAGEMENT =====
  const competences = {
    // Get all competences
    async getAll(filter?: CompetenceFilter): Promise<ApiResponse<Competence[]>> {
      try {
        let query = supabase
          .from('competence')
          .select(`
            *,
            field:field(
              *,
              domain:domain(*)
            ),
            framework:competence_framework(*),
            specific_competences:specific_competence(*)
          `)

        if (filter?.framework_id) {
          query = query.eq('framework_id', filter.framework_id)
        }
        if (filter?.field_id) {
          query = query.eq('field_id', filter.field_id)
        }
        if (filter?.search) {
          query = query.or(`label.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
        }

        const { data, error } = await query.order('sort_order', { ascending: true })

        if (error) return handleError(error, 'récupération des compétences')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des compétences')
      }
    },

    // Create competence
    async create(competenceData: CreateCompetenceForm): Promise<ApiResponse<Competence>> {
      try {
        const { data, error } = await supabase
          .from('competence')
          .insert(competenceData)
          .select()
          .single()

        if (error) return handleError(error, 'création de la compétence')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'création de la compétence')
      }
    },

    // Update competence
    async update(id: string, competenceData: Partial<CreateCompetenceForm>): Promise<ApiResponse<Competence>> {
      try {
        const { data, error } = await supabase
          .from('competence')
          .update(competenceData)
          .eq('competence_id', id)
          .select()
          .single()

        if (error) return handleError(error, 'modification de la compétence')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'modification de la compétence')
      }
    },

    // Delete competence
    async delete(id: string): Promise<ApiResponse<null>> {
      try {
        const { error } = await supabase
          .from('competence')
          .delete()
          .eq('competence_id', id)

        if (error) return handleError(error, 'suppression de la compétence')
        return handleSuccess(null)
      } catch (error) {
        return handleError(error, 'suppression de la compétence')
      }
    }
  }

  // ===== SPECIFIC COMPETENCE MANAGEMENT =====
  const specificCompetences = {
    // Get all specific competences
    async getAll(competenceId?: string): Promise<ApiResponse<SpecificCompetence[]>> {
      try {
        let query = supabase
          .from('specific_competence')
          .select(`
            *,
            competence:competence(*),
            framework:competence_framework(*)
          `)

        if (competenceId) {
          query = query.eq('competence_id', competenceId)
        }

        const { data, error } = await query.order('sort_order', { ascending: true })

        if (error) return handleError(error, 'récupération des compétences spécifiques')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des compétences spécifiques')
      }
    },

    // Create specific competence
    async create(specificCompetenceData: CreateSpecificCompetenceForm): Promise<ApiResponse<SpecificCompetence>> {
      try {
        const { data, error } = await supabase
          .from('specific_competence')
          .insert(specificCompetenceData)
          .select()
          .single()

        if (error) return handleError(error, 'création de la compétence spécifique')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'création de la compétence spécifique')
      }
    },

    // Update specific competence
    async update(id: string, specificCompetenceData: Partial<CreateSpecificCompetenceForm>): Promise<ApiResponse<SpecificCompetence>> {
      try {
        const { data, error } = await supabase
          .from('specific_competence')
          .update(specificCompetenceData)
          .eq('specific_competence_id', id)
          .select()
          .single()

        if (error) return handleError(error, 'modification de la compétence spécifique')
        return handleSuccess(data)
      } catch (error) {
        return handleError(error, 'modification de la compétence spécifique')
      }
    },

    // Delete specific competence
    async delete(id: string): Promise<ApiResponse<null>> {
      try {
        const { error } = await supabase
          .from('specific_competence')
          .delete()
          .eq('specific_competence_id', id)

        if (error) return handleError(error, 'suppression de la compétence spécifique')
        return handleSuccess(null)
      } catch (error) {
        return handleError(error, 'suppression de la compétence spécifique')
      }
    }
  }

  // ===== RUBRIC MANAGEMENT =====
  const rubrics = {
    // Get all rubrics
    async getAll(): Promise<ApiResponse<Rubric[]>> {
      try {
        const { data, error } = await supabase
          .from('rubric')
          .select(`
            *,
            levels:rubric_level(*),
            created_by:teacher!created_by_teacher_id(*)
          `)
          .order('name', { ascending: true })

        if (error) return handleError(error, 'récupération des barèmes')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des barèmes')
      }
    },

    // Create rubric with levels
    async create(rubricData: CreateRubricForm): Promise<ApiResponse<Rubric>> {
      try {
        const { data: rubric, error: rubricError } = await supabase
          .from('rubric')
          .insert({
            name: rubricData.name,
            kind: rubricData.kind,
            description: rubricData.description
          })
          .select()
          .single()

        if (rubricError) return handleError(rubricError, 'création du barème')

        // Create levels
        const levelsToInsert = rubricData.levels.map(level => ({
          ...level,
          rubric_id: rubric.rubric_id
        }))

        const { error: levelsError } = await supabase
          .from('rubric_level')
          .insert(levelsToInsert)

        if (levelsError) return handleError(levelsError, 'création des niveaux du barème')

        return handleSuccess(rubric)
      } catch (error) {
        return handleError(error, 'création du barème')
      }
    }
  }

  // ===== EVALUATION TEMPLATE MANAGEMENT =====
  const evalTemplates = {
    // Get all templates
    async getAll(): Promise<ApiResponse<EvalTemplate[]>> {
      try {
        const { data, error } = await supabase
          .from('eval_template')
          .select(`
            *,
            framework:competence_framework(*),
            lines:eval_template_line(
              *,
              competence:competence(*),
              specific_competence:specific_competence(*),
              rubric:rubric(*)
            ),
            created_by:teacher!created_by_teacher_id(*)
          `)
          .order('name', { ascending: true })

        if (error) return handleError(error, 'récupération des modèles d\'évaluation')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des modèles d\'évaluation')
      }
    }
  }

  // ===== EVALUATION SESSION MANAGEMENT =====
  const evalSessions = {
    // Get all sessions
    async getAll(filter?: EvalSessionFilter): Promise<ApiResponse<EvalSession[]>> {
      try {
        let query = supabase
          .from('eval_session')
          .select(`
            *,
            class:class(*),
            template:eval_template(
              *,
              framework:competence_framework(*)
            ),
            evaluations:evaluation(
              *,
              student:student(*)
            ),
            created_by:teacher!created_by_teacher_id(*)
          `)

        if (filter?.class_id) {
          query = query.eq('class_id', filter.class_id)
        }

        const { data, error } = await query.order('session_date', { ascending: false })

        if (error) return handleError(error, 'récupération des sessions d\'évaluation')
        return handleSuccess(data || [])
      } catch (error) {
        return handleError(error, 'récupération des sessions d\'évaluation')
      }
    },

    // Create evaluation session
    async create(sessionData: CreateEvalSessionForm): Promise<ApiResponse<EvalSession>> {
      try {
        const { data: session, error: sessionError } = await supabase
          .from('eval_session')
          .insert({
            class_id: sessionData.class_id,
            template_id: sessionData.template_id,
            label: sessionData.label,
            session_date: sessionData.session_date,
            notes: sessionData.notes
          })
          .select()
          .single()

        if (sessionError) return handleError(sessionError, 'création de la session d\'évaluation')

        // Create evaluations for selected students
        const evaluationsToInsert = sessionData.student_ids.map(studentId => ({
          session_id: session.session_id,
          student_id: studentId,
          status: 'in_progress' as const
        }))

        const { error: evaluationsError } = await supabase
          .from('evaluation')
          .insert(evaluationsToInsert)

        if (evaluationsError) return handleError(evaluationsError, 'création des évaluations')

        return handleSuccess(session)
      } catch (error) {
        return handleError(error, 'création de la session d\'évaluation')
      }
    }
  }

  return {
    students,
    classes,
    frameworks,
    domains,
    fields,
    competences,
    specificCompetences,
    rubrics,
    evalTemplates,
    evalSessions
  }
}