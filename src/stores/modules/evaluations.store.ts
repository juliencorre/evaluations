import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Evaluation, Class } from '@/types/evaluation'
import { serviceContainer } from '@/services/ServiceContainer'


/**
 * Store Pinia pour la gestion des évaluations
 * Gère les évaluations et leurs relations avec les classes
 */
const evaluationRepository = serviceContainer.evaluations
const evaluationClassRepository = serviceContainer.evaluationClasses

export const useEvaluationsStore = defineStore('evaluations', () => {
  // ==================== STATE ====================
  const evaluations = ref<Evaluation[]>([])
  const currentEvaluation = ref<Evaluation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const allEvaluations = computed(() => evaluations.value)
  const evaluationCount = computed(() => evaluations.value.length)
  const hasEvaluations = computed(() => evaluations.value.length > 0)

  /**
   * Retourne l'évaluation courante avec logging
   */
  const getCurrentEvaluation = computed(() => {
    const result = currentEvaluation.value
    if (result) {
      console.log(
        '[EvaluationsStore] getCurrentEvaluation computed:',
        result.name,
        'ID:',
        result.id
      )
    }
    return result
  })

  // ==================== ACTIONS ====================

  /**
   * Charger toutes les évaluations depuis Supabase
   */
  async function loadEvaluations() {
    isLoading.value = true
    error.value = null

    try {
      const data = await evaluationRepository.findAll()
      evaluations.value = data

      // Ne PAS définir automatiquement une évaluation courante
      // Cela doit être fait explicitement par le composant appelant
      // Pour éviter de changer l'évaluation sélectionnée lors de la navigation
    } catch (err) {
      console.error('[EvaluationsStore] Erreur lors du chargement des évaluations:', err)
      error.value = 'Impossible de charger les évaluations'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Ajouter une nouvelle évaluation
   */
  async function addEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'results'>) {
    try {
      const newEvaluation = await evaluationRepository.create(evaluation)
      if (newEvaluation) {
        evaluations.value.push(newEvaluation)
        currentEvaluation.value = newEvaluation
        return newEvaluation
      }
      return null
    } catch (err) {
      console.error('[EvaluationsStore] Erreur lors de la création de l\'évaluation:', err)
      error.value = "Impossible de créer l'évaluation"
      throw err
    }
  }
  /**
   * Charger une évaluation spécifique par son ID
   */
  async function loadEvaluationById(id: string) {
    const cached = evaluations.value.find((evaluation) => evaluation.id === id)
    if (cached) {
      return cached
    }

    try {
      const evaluation = await evaluationRepository.findById(id)
      if (evaluation) {
        evaluations.value.push(evaluation)
      }
      return evaluation
    } catch (err) {
      console.error("[EvaluationsStore] Erreur lors du chargement de l'évaluation:", err)
      error.value = "Impossible de charger l'évaluation demandée"
      throw err
    }
  }


  /**
   * Mettre à jour une évaluation
   */
  async function updateEvaluation(id: string, updates: Partial<Evaluation>) {
    try {
      const updatedEvaluation = await evaluationRepository.update(id, updates)
      if (updatedEvaluation) {
        const index = evaluations.value.findIndex((evaluation) => evaluation.id === id)
        if (index !== -1) {
          evaluations.value[index] = updatedEvaluation

          // Mettre à jour l'évaluation courante si c'est celle qui est modifiée
          if (currentEvaluation.value?.id === id) {
            currentEvaluation.value = updatedEvaluation
          }
        }
        return updatedEvaluation
      }
      return null
    } catch (err) {
      console.error('[EvaluationsStore] Erreur lors de la mise à jour de l\'évaluation:', err)
      error.value = "Impossible de mettre à jour l'évaluation"
      throw err
    }
  }

  /**
   * Supprimer une évaluation
   */
  async function deleteEvaluation(id: string) {
    try {
      const success = await evaluationRepository.delete(id)
      if (success) {
        const index = evaluations.value.findIndex((evaluation) => evaluation.id === id)
        if (index !== -1) {
          evaluations.value.splice(index, 1)

          // Si on supprime l'évaluation courante, basculer sur la première disponible
          if (currentEvaluation.value?.id === id) {
            currentEvaluation.value = evaluations.value[0] || null
          }
        }
        return true
      }
      return false
    } catch (err) {
      console.error('[EvaluationsStore] Erreur lors de la suppression de l\'évaluation:', err)
      error.value = "Impossible de supprimer l'évaluation"
      throw err
    }
  }

  /**
   * Définir l'évaluation courante
   */
  function setCurrentEvaluation(evaluation: Evaluation) {
    console.log(
      '[EvaluationsStore] setCurrentEvaluation appelé avec:',
      evaluation.name,
      'ID:',
      evaluation.id
    )
    currentEvaluation.value = evaluation
  }

  /**
   * Récupérer une évaluation par son ID
   */
  function getEvaluationById(id: string) {
    return evaluations.value.find((evaluation) => evaluation.id === id)
  }

  // ==================== CLASS RELATIONSHIP ACTIONS ====================

  /**
   * Récupérer les classes associées à une évaluation
   */
  async function getClassesForEvaluation(
    evaluationId: string,
    schoolYearId?: string
  ): Promise<Class[]> {
    try {
      return await evaluationClassRepository.getClassesForEvaluation(
        evaluationId,
        schoolYearId
      )
    } catch (err) {
      console.error(
        '[EvaluationsStore] Erreur lors de la récupération des classes pour l\'évaluation:',
        err
      )
      return []
    }
  }

  /**
   * Récupérer les évaluations d'une classe
   */
  async function getEvaluationsForClass(classId: string, schoolYearId?: string) {
    try {
      return await evaluationClassRepository.getEvaluationsForClass(classId, schoolYearId)
    } catch (err) {
      console.error(
        '[EvaluationsStore] Erreur lors de la récupération des évaluations pour la classe:',
        err
      )
      return []
    }
  }

  /**
   * Associer une évaluation à une ou plusieurs classes
   */
  async function addClassesToEvaluation(
    evaluationId: string,
    classIds: string[],
    schoolYearId?: string
  ) {
    try {
      if (classIds.length === 0) {
        console.warn('[EvaluationsStore] Aucune classe spécifiée pour l\'association')
        return []
      }

      if (classIds.length === 1) {
        const result = await evaluationClassRepository.addClassToEvaluation({
          evaluationId,
          classId: classIds[0],
          schoolYearId
        })
        return [result]
      } else {
        return await evaluationClassRepository.addClassesToEvaluation({
          evaluationId,
          classIds,
          schoolYearId
        })
      }
    } catch (err) {
      console.error(
        '[EvaluationsStore] Erreur lors de l\'association des classes à l\'évaluation:',
        err
      )
      throw err
    }
  }

  /**
   * Supprimer l'association entre une évaluation et une classe
   */
  async function removeClassFromEvaluation(
    evaluationId: string,
    classId: string,
    schoolYearId?: string
  ) {
    try {
      return await evaluationClassRepository.removeClassFromEvaluation(
        evaluationId,
        classId,
        schoolYearId
      )
    } catch (err) {
      console.error('[EvaluationsStore] Erreur lors de la suppression de l\'association:', err)
      throw err
    }
  }

  /**
   * Mettre à jour les classes associées à une évaluation
   * Remplace toutes les associations existantes par les nouvelles
   */
  async function updateEvaluationClasses(
    evaluationId: string,
    classIds: string[],
    schoolYearId?: string
  ) {
    try {
      return await evaluationClassRepository.updateEvaluationClasses({
        evaluationId,
        classIds,
        schoolYearId
      })
    } catch (err) {
      console.error(
        '[EvaluationsStore] Erreur lors de la mise à jour des classes de l\'évaluation:',
        err
      )
      throw err
    }
  }

  /**
   * Créer une évaluation avec des associations de classes
   */
  async function addEvaluationWithClasses(
    evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'results'>,
    classIds: string[],
    schoolYearId?: string
  ) {
    try {
      // Créer l'évaluation d'abord
      const newEvaluation = await evaluationRepository.create(evaluation)
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
    } catch (err) {
      console.error(
        '[EvaluationsStore] Erreur lors de la création de l\'évaluation avec classes:',
        err
      )
      throw err
    }
  }

  /**
   * Obtenir les statistiques d'une évaluation (nombre de classes associées)
   */
  async function getEvaluationStatistics(evaluationId: string, schoolYearId?: string) {
    try {
      return await evaluationClassRepository.getEvaluationStatistics(
        evaluationId,
        schoolYearId
      )
    } catch (err) {
      console.error('[EvaluationsStore] Erreur lors de la récupération des statistiques:', err)
      return { totalClasses: 0, classIds: [] }
    }
  }

  // ==================== RETURN ====================
  return {
    // State
    evaluations,
    currentEvaluation,
    isLoading,
    error,

    // Getters
    allEvaluations,
    evaluationCount,
    hasEvaluations,
    getCurrentEvaluation,

    // Basic actions
    loadEvaluations,
    loadEvaluationById,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    setCurrentEvaluation,
    getEvaluationById,

    // Class relationship actions
    getClassesForEvaluation,
    getEvaluationsForClass,
    addClassesToEvaluation,
    removeClassFromEvaluation,
    updateEvaluationClasses,
    addEvaluationWithClasses,
    getEvaluationStatistics
  }
})
