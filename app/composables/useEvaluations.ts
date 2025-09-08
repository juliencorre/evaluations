/**
 * Evaluation Management Composable
 * Provides reactive state management for evaluation sessions, templates, and results
 */

import type { 
  EvalSession,
  EvalTemplate,
  Evaluation,
  EvalResult,
  Rubric,
  RubricLevel,
  EvalSessionWithDetails,
  EvaluationWithDetails,
  CreateRubricForm,
  CreateEvalTemplateForm,
  CreateEvalSessionForm,
  EvalSessionFilter
} from '~/types/database'

export const useEvaluations = () => {
  const db = useDatabase()

  // Reactive state
  const evalSessions = ref<EvalSessionWithDetails[]>([])
  const evalTemplates = ref<EvalTemplate[]>([])
  const rubrics = ref<Rubric[]>([])
  const selectedSession = ref<EvalSessionWithDetails | null>(null)
  const selectedTemplate = ref<EvalTemplate | null>(null)
  const selectedEvaluation = ref<EvaluationWithDetails | null>(null)
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const filters = ref<EvalSessionFilter>({
    class_id: undefined,
    template_id: undefined,
    date_from: undefined,
    date_to: undefined,
    status: undefined
  })

  // Computed values
  const filteredSessions = computed(() => {
    let result = evalSessions.value

    if (filters.value.class_id) {
      result = result.filter(session => session.class_id === filters.value.class_id)
    }

    if (filters.value.template_id) {
      result = result.filter(session => session.template_id === filters.value.template_id)
    }

    if (filters.value.date_from) {
      result = result.filter(session => session.session_date >= filters.value.date_from!)
    }

    if (filters.value.date_to) {
      result = result.filter(session => session.session_date <= filters.value.date_to!)
    }

    return result.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
  })

  const sessionStats = computed(() => {
    const sessions = filteredSessions.value
    
    return {
      total: sessions.length,
      completed: sessions.filter(s => 
        s.evaluations.every(e => e.status === 'finalized')
      ).length,
      inProgress: sessions.filter(s => 
        s.evaluations.some(e => e.status === 'in_progress')
      ).length,
      notStarted: sessions.filter(s => 
        s.evaluations.length === 0 || s.evaluations.every(e => e.status === 'in_progress' && !e.started_at)
      ).length
    }
  })

  // Session operations
  const fetchSessions = async (filter?: EvalSessionFilter) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.evalSessions.getAll(filter)
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      evalSessions.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des sessions d\'évaluation'
      console.error('Error fetching eval sessions:', err)
    } finally {
      loading.value = false
    }
  }

  const createSession = async (sessionData: CreateEvalSessionForm) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.evalSessions.create(sessionData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      // Refresh sessions to get full data with relations
      await fetchSessions(filters.value)
      
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création de la session d\'évaluation'
      console.error('Error creating eval session:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Template operations
  const fetchTemplates = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await db.evalTemplates.getAll()
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      evalTemplates.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des modèles d\'évaluation'
      console.error('Error fetching eval templates:', err)
    } finally {
      loading.value = false
    }
  }

  // Rubric operations
  const fetchRubrics = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await db.rubrics.getAll()
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      rubrics.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des barèmes'
      console.error('Error fetching rubrics:', err)
    } finally {
      loading.value = false
    }
  }

  const createRubric = async (rubricData: CreateRubricForm) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.rubrics.create(rubricData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      // Refresh rubrics to get full data with levels
      await fetchRubrics()
      
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création du barème'
      console.error('Error creating rubric:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Evaluation operations
  const startEvaluation = async (evaluationId: string) => {
    loading.value = true
    error.value = null

    try {
      const supabase = useSupabase()
      
      const { data, error: updateError } = await supabase
        .from('evaluation')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('evaluation_id', evaluationId)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      // Update local state
      const session = evalSessions.value.find(s => 
        s.evaluations.some(e => e.evaluation_id === evaluationId)
      )
      
      if (session) {
        const evaluation = session.evaluations.find(e => e.evaluation_id === evaluationId)
        if (evaluation) {
          evaluation.status = 'in_progress'
          evaluation.started_at = data.started_at
        }
      }

      return data
    } catch (err) {
      error.value = 'Erreur lors du démarrage de l\'évaluation'
      console.error('Error starting evaluation:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const submitEvaluation = async (evaluationId: string) => {
    loading.value = true
    error.value = null

    try {
      const supabase = useSupabase()
      
      const { data, error: updateError } = await supabase
        .from('evaluation')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('evaluation_id', evaluationId)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      // Update local state
      const session = evalSessions.value.find(s => 
        s.evaluations.some(e => e.evaluation_id === evaluationId)
      )
      
      if (session) {
        const evaluation = session.evaluations.find(e => e.evaluation_id === evaluationId)
        if (evaluation) {
          evaluation.status = 'submitted'
          evaluation.submitted_at = data.submitted_at
        }
      }

      return data
    } catch (err) {
      error.value = 'Erreur lors de la soumission de l\'évaluation'
      console.error('Error submitting evaluation:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const finalizeEvaluation = async (evaluationId: string) => {
    loading.value = true
    error.value = null

    try {
      const supabase = useSupabase()
      
      const { data, error: updateError } = await supabase
        .from('evaluation')
        .update({ status: 'finalized' })
        .eq('evaluation_id', evaluationId)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      // Update local state
      const session = evalSessions.value.find(s => 
        s.evaluations.some(e => e.evaluation_id === evaluationId)
      )
      
      if (session) {
        const evaluation = session.evaluations.find(e => e.evaluation_id === evaluationId)
        if (evaluation) {
          evaluation.status = 'finalized'
        }
      }

      return data
    } catch (err) {
      error.value = 'Erreur lors de la finalisation de l\'évaluation'
      console.error('Error finalizing evaluation:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Result operations
  const saveResult = async (
    evaluationId: string, 
    templateLineId: string, 
    rubricLevelId?: string, 
    numericScore?: number, 
    comment?: string
  ) => {
    loading.value = true
    error.value = null

    try {
      const supabase = useSupabase()
      
      const { data, error: upsertError } = await supabase
        .from('eval_result')
        .upsert({
          evaluation_id: evaluationId,
          template_line_id: templateLineId,
          rubric_level_id: rubricLevelId,
          numeric_score: numericScore,
          comment: comment,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'evaluation_id,template_line_id'
        })
        .select()
        .single()

      if (upsertError) {
        error.value = upsertError.message
        return null
      }

      return data
    } catch (err) {
      error.value = 'Erreur lors de la sauvegarde du résultat'
      console.error('Error saving result:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Filter methods
  const setClassFilter = (classId: string | undefined) => {
    filters.value.class_id = classId
  }

  const setTemplateFilter = (templateId: string | undefined) => {
    filters.value.template_id = templateId
  }

  const setDateFilter = (dateFrom?: string, dateTo?: string) => {
    filters.value.date_from = dateFrom
    filters.value.date_to = dateTo
  }

  const setStatusFilter = (status: string | undefined) => {
    filters.value.status = status
  }

  const clearFilters = () => {
    filters.value = {
      class_id: undefined,
      template_id: undefined,
      date_from: undefined,
      date_to: undefined,
      status: undefined
    }
  }

  // Utility methods
  const getSessionProgress = (session: EvalSessionWithDetails) => {
    if (session.evaluations.length === 0) return 0
    
    const completed = session.evaluations.filter(e => e.status === 'finalized').length
    return Math.round((completed / session.evaluations.length) * 100)
  }

  const getEvaluationProgress = (evaluation: EvaluationWithDetails) => {
    if (!evaluation.results || evaluation.results.length === 0) return 0
    
    const totalLines = evaluation.session.template.lines?.length || 0
    if (totalLines === 0) return 0
    
    const completedResults = evaluation.results.filter(r => 
      r.rubric_level_id !== null || r.numeric_score !== null
    ).length
    
    return Math.round((completedResults / totalLines) * 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalized':
        return 'text-green-600 bg-green-100'
      case 'submitted':
        return 'text-blue-600 bg-blue-100'
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'finalized':
        return 'Finalisée'
      case 'submitted':
        return 'Soumise'
      case 'in_progress':
        return 'En cours'
      default:
        return 'Non démarrée'
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Initialize
  const initialize = async () => {
    await Promise.all([
      fetchSessions(),
      fetchTemplates(),
      fetchRubrics()
    ])
  }

  return {
    // State
    evalSessions: readonly(evalSessions),
    evalTemplates: readonly(evalTemplates),
    rubrics: readonly(rubrics),
    selectedSession: readonly(selectedSession),
    selectedTemplate: readonly(selectedTemplate),
    selectedEvaluation: readonly(selectedEvaluation),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),

    // Computed
    filteredSessions,
    sessionStats,

    // Actions
    fetchSessions,
    createSession,
    fetchTemplates,
    fetchRubrics,
    createRubric,
    startEvaluation,
    submitEvaluation,
    finalizeEvaluation,
    saveResult,

    // Filters
    setClassFilter,
    setTemplateFilter,
    setDateFilter,
    setStatusFilter,
    clearFilters,

    // Utilities
    getSessionProgress,
    getEvaluationProgress,
    formatDate,
    getStatusColor,
    getStatusLabel,
    clearError,
    initialize
  }
}