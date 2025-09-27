import { ref, computed } from 'vue'
import type { Evaluation, Class } from '@/types/evaluation'
import { supabaseEvaluationsService } from '@/services/supabaseEvaluationsService'
import { supabaseEvaluationClassesService } from '@/services/supabaseEvaluationClassesService'

const evaluations = ref<Evaluation[]>([])
const currentEvaluation = ref<Evaluation | null>(null)
const isLoading = ref(false)

export function useEvaluationStore() {
  // Computed properties
  const allEvaluations = computed(() => {
    // Return actual evaluations from database, empty array if none
    return evaluations.value
  })
  const getCurrentEvaluation = computed(() => {
    const result = currentEvaluation.value
    if (result) {
      console.log('🔍 [EvaluationStore] getCurrentEvaluation computed:', result.name, 'ID:', result.id)
    }
    return result
  })

  // Actions
  const loadEvaluations = async () => {
    isLoading.value = true
    try {
      const data = await supabaseEvaluationsService.getEvaluations()
      evaluations.value = data
      // Set first evaluation as current if none is set
      if (data.length > 0 && !currentEvaluation.value) {
        currentEvaluation.value = data[0]
      }
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations:', error)
    } finally {
      isLoading.value = false
    }
  }
  const addEvaluation = async (evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'results'>) => {
    try {
      const newEvaluation = await supabaseEvaluationsService.createEvaluation(evaluation)
      if (newEvaluation) {
        evaluations.value.push(newEvaluation)
        currentEvaluation.value = newEvaluation
        return newEvaluation
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error)
    }
    return null
  }

  const updateEvaluation = async (id: string, updates: Partial<Evaluation>) => {
    try {
      const updatedEvaluation = await supabaseEvaluationsService.updateEvaluation(id, updates)
      if (updatedEvaluation) {
        const index = evaluations.value.findIndex(evaluation => evaluation.id === id)
        if (index !== -1) {
          evaluations.value[index] = updatedEvaluation

          // Update current evaluation if it's the one being updated
          if (currentEvaluation.value?.id === id) {
            currentEvaluation.value = updatedEvaluation
          }
        }
        return updatedEvaluation
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', error)
    }
    return null
  }

  const deleteEvaluation = async (id: string) => {
    try {
      const success = await supabaseEvaluationsService.deleteEvaluation(id)
      if (success) {
        const index = evaluations.value.findIndex(evaluation => evaluation.id === id)
        if (index !== -1) {
          evaluations.value.splice(index, 1)

          // If we deleted the current evaluation, switch to the first available one
          if (currentEvaluation.value?.id === id) {
            currentEvaluation.value = evaluations.value[0] || null
          }
        }
        return true
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'évaluation:', error)
    }
    return false
  }

  const setCurrentEvaluation = (evaluation: Evaluation) => {
    console.log('🗂️ [EvaluationStore] setCurrentEvaluation appelé avec:', evaluation.name, 'ID:', evaluation.id)
    currentEvaluation.value = evaluation
  }

  const getEvaluationById = (id: string) => {
    return evaluations.value.find(evaluation => evaluation.id === id)
  }

  // === NOUVELLES FONCTIONS POUR LES RELATIONS EVALUATION-CLASSES ===

  /**
   * Récupère les classes associées à une évaluation
   */
  const getClassesForEvaluation = async (evaluationId: string, schoolYearId?: string): Promise<Class[]> => {
    try {
      return await supabaseEvaluationClassesService.getClassesForEvaluation(evaluationId, schoolYearId)
    } catch (error) {
      console.error('Erreur lors de la récupération des classes pour l\'évaluation:', error)
      return []
    }
  }

  /**
   * Récupère les évaluations d'une classe
   */
  const getEvaluationsForClass = async (classId: string, schoolYearId?: string) => {
    try {
      return await supabaseEvaluationClassesService.getEvaluationsForClass(classId, schoolYearId)
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations pour la classe:', error)
      return []
    }
  }

  /**
   * Associe une évaluation à une ou plusieurs classes
   */
  const addClassesToEvaluation = async (evaluationId: string, classIds: string[], schoolYearId?: string) => {
    try {
      if (classIds.length === 0) {
        console.warn('Aucune classe spécifiée pour l\'association')
        return []
      }

      if (classIds.length === 1) {
        const result = await supabaseEvaluationClassesService.addClassToEvaluation({
          evaluation_id: evaluationId,
          class_id: classIds[0],
          school_year_id: schoolYearId
        })
        return [result]
      } else {
        return await supabaseEvaluationClassesService.addClassesToEvaluation(evaluationId, classIds, schoolYearId)
      }
    } catch (error) {
      console.error('Erreur lors de l\'association des classes à l\'évaluation:', error)
      throw error
    }
  }

  /**
   * Supprime l'association entre une évaluation et une classe
   */
  const removeClassFromEvaluation = async (evaluationId: string, classId: string, schoolYearId?: string) => {
    try {
      return await supabaseEvaluationClassesService.removeClassFromEvaluation(evaluationId, classId, schoolYearId)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'association:', error)
      throw error
    }
  }

  /**
   * Met à jour les classes associées à une évaluation
   * Remplace toutes les associations existantes par les nouvelles
   */
  const updateEvaluationClasses = async (evaluationId: string, classIds: string[], schoolYearId?: string) => {
    try {
      return await supabaseEvaluationClassesService.updateEvaluationClasses(evaluationId, classIds, schoolYearId)
    } catch (error) {
      console.error('Erreur lors de la mise à jour des classes de l\'évaluation:', error)
      throw error
    }
  }

  /**
   * Crée une évaluation avec des associations de classes
   */
  const addEvaluationWithClasses = async (
    evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'results'>,
    classIds: string[],
    schoolYearId?: string
  ) => {
    try {
      // Créer l'évaluation d'abord
      const newEvaluation = await supabaseEvaluationsService.createEvaluation(evaluation)
      if (!newEvaluation) {
        throw new Error('Échec de la création de l\'évaluation')
      }

      // Associer les classes à l'évaluation
      if (classIds.length > 0) {
        await addClassesToEvaluation(newEvaluation.id, classIds, schoolYearId)
      }

      // Ajouter à la liste locale
      evaluations.value.push(newEvaluation)
      currentEvaluation.value = newEvaluation

      return newEvaluation
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation avec classes:', error)
      throw error
    }
  }

  /**
   * Obtient les statistiques d'une évaluation (nombre de classes associées)
   */
  const getEvaluationStatistics = async (evaluationId: string, schoolYearId?: string) => {
    try {
      return await supabaseEvaluationClassesService.getEvaluationStatistics(evaluationId, schoolYearId)
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return { totalClasses: 0, classIds: [] }
    }
  }

  return {
    // State
    allEvaluations,
    currentEvaluation: getCurrentEvaluation,
    isLoading: computed(() => isLoading.value),

    // Actions de base
    loadEvaluations,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    setCurrentEvaluation,
    getEvaluationById,

    // Actions pour les relations evaluation-classes
    getClassesForEvaluation,
    getEvaluationsForClass,
    addClassesToEvaluation,
    removeClassFromEvaluation,
    updateEvaluationClasses,
    addEvaluationWithClasses,
    getEvaluationStatistics
  }
}