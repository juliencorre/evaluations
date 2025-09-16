import { ref, computed } from 'vue'
import type { Evaluation, EvaluationResult, EvaluationLevel } from '@/types/evaluation'
import { evaluationResultsService } from '@/services/evaluationResultsService'

// Store réactif global pour les résultats d'évaluation
const currentEvaluation = ref<Evaluation | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

/**
 * Store pour la gestion des résultats d'évaluation
 * Gère l'état réactif et la persistance temporaire locale
 */
export const useEvaluationResultsStore = () => {
  // Getters
  const evaluation = computed(() => currentEvaluation.value)
  const results = computed(() => currentEvaluation.value?.results || [])
  const hasResults = computed(() => results.value.length > 0)
  const evaluationStats = computed(() => {
    if (!currentEvaluation.value) return null

    const totalResults = results.value.length
    const levelCounts = results.value.reduce((acc, result) => {
      acc[result.level] = (acc[result.level] || 0) + 1
      return acc
    }, {} as Record<EvaluationLevel, number>)

    return {
      totalResults,
      levelCounts,
      lastUpdated: results.value.length > 0
        ? Math.max(...results.value.map(r => new Date(r.evaluatedAt).getTime()))
        : null
    }
  })

  // Actions
  const initializeEvaluation = async (evaluationData: Omit<Evaluation, 'results'>) => {
    console.log('🚀 [EvaluationResultsStore] Initialisation de l\'évaluation:', evaluationData.id)

    isLoading.value = true
    error.value = null

    try {
      const evaluation = evaluationResultsService.getOrCreateEvaluation(evaluationData)
      currentEvaluation.value = evaluation

      console.log('✅ [EvaluationResultsStore] Évaluation initialisée:', {
        id: evaluation.id,
        name: evaluation.name,
        resultCount: evaluation.results.length
      })
    } catch (err) {
      console.error('❌ [EvaluationResultsStore] Erreur lors de l\'initialisation:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'initialisation'
    } finally {
      isLoading.value = false
    }
  }

  const saveResult = async (
    studentId: string,
    competencyId: string,
    level: EvaluationLevel,
    comment?: string
  ): Promise<EvaluationResult | null> => {
    if (!currentEvaluation.value) {
      console.error('❌ [EvaluationResultsStore] Aucune évaluation active')
      error.value = 'Aucune évaluation active'
      return null
    }

    console.log('💾 [EvaluationResultsStore] Sauvegarde du résultat:', {
      studentId,
      competencyId,
      level,
      comment
    })

    try {
      const result = evaluationResultsService.saveResult(
        currentEvaluation.value.id,
        studentId,
        competencyId,
        level,
        comment
      )

      // Mettre à jour le store local
      const existingIndex = currentEvaluation.value.results.findIndex(
        r => r.studentId === studentId && r.competencyId === competencyId
      )

      if (existingIndex !== -1) {
        currentEvaluation.value.results[existingIndex] = result
      } else {
        currentEvaluation.value.results.push(result)
      }

      console.log('✅ [EvaluationResultsStore] Résultat sauvegardé')
      return result
    } catch (err) {
      console.error('❌ [EvaluationResultsStore] Erreur lors de la sauvegarde:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      return null
    }
  }

  const getResult = (studentId: string, competencyId: string): EvaluationResult | null => {
    if (!currentEvaluation.value) return null

    return currentEvaluation.value.results.find(
      r => r.studentId === studentId && r.competencyId === competencyId
    ) || null
  }

  const deleteResult = async (studentId: string, competencyId: string): Promise<boolean> => {
    if (!currentEvaluation.value) {
      console.error('❌ [EvaluationResultsStore] Aucune évaluation active')
      return false
    }

    console.log('🗑️ [EvaluationResultsStore] Suppression du résultat:', { studentId, competencyId })

    try {
      const success = evaluationResultsService.deleteResult(
        currentEvaluation.value.id,
        studentId,
        competencyId
      )

      if (success) {
        // Mettre à jour le store local
        currentEvaluation.value.results = currentEvaluation.value.results.filter(
          r => !(r.studentId === studentId && r.competencyId === competencyId)
        )
        console.log('✅ [EvaluationResultsStore] Résultat supprimé du store')
      }

      return success
    } catch (err) {
      console.error('❌ [EvaluationResultsStore] Erreur lors de la suppression:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      return false
    }
  }

  const bulkSaveResults = async (
    results: Omit<EvaluationResult, 'evaluatedAt'>[]
  ): Promise<EvaluationResult[]> => {
    if (!currentEvaluation.value) {
      console.error('❌ [EvaluationResultsStore] Aucune évaluation active')
      return []
    }

    console.log('📦 [EvaluationResultsStore] Sauvegarde en lot:', results.length)

    try {
      const savedResults = evaluationResultsService.bulkSaveResults(
        currentEvaluation.value.id,
        results
      )

      // Recharger l'évaluation complète pour s'assurer de la cohérence
      const updatedEvaluation = evaluationResultsService.getOrCreateEvaluation(currentEvaluation.value)
      currentEvaluation.value = updatedEvaluation

      console.log('✅ [EvaluationResultsStore] Sauvegarde en lot terminée')
      return savedResults
    } catch (err) {
      console.error('❌ [EvaluationResultsStore] Erreur lors de la sauvegarde en lot:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde en lot'
      return []
    }
  }

  const resetEvaluation = async (): Promise<boolean> => {
    if (!currentEvaluation.value) {
      console.error('❌ [EvaluationResultsStore] Aucune évaluation active')
      return false
    }

    console.log('🔄 [EvaluationResultsStore] Réinitialisation de l\'évaluation')

    try {
      const success = evaluationResultsService.resetEvaluation(currentEvaluation.value.id)

      if (success) {
        currentEvaluation.value.results = []
        console.log('✅ [EvaluationResultsStore] Évaluation réinitialisée')
      }

      return success
    } catch (err) {
      console.error('❌ [EvaluationResultsStore] Erreur lors de la réinitialisation:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation'
      return false
    }
  }

  const refreshEvaluation = async (): Promise<void> => {
    if (!currentEvaluation.value) return

    console.log('🔄 [EvaluationResultsStore] Actualisation de l\'évaluation')

    try {
      isLoading.value = true
      const refreshedEvaluation = evaluationResultsService.getOrCreateEvaluation(currentEvaluation.value)
      currentEvaluation.value = refreshedEvaluation
      console.log('✅ [EvaluationResultsStore] Évaluation actualisée')
    } catch (err) {
      console.error('❌ [EvaluationResultsStore] Erreur lors de l\'actualisation:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'actualisation'
    } finally {
      isLoading.value = false
    }
  }

  const getResultsByStudent = (studentId: string): EvaluationResult[] => {
    if (!currentEvaluation.value) return []
    return currentEvaluation.value.results.filter(r => r.studentId === studentId)
  }

  const getResultsByCompetency = (competencyId: string): EvaluationResult[] => {
    if (!currentEvaluation.value) return []
    return currentEvaluation.value.results.filter(r => r.competencyId === competencyId)
  }

  const getStudentProgress = (studentId: string) => {
    const studentResults = getResultsByStudent(studentId)

    if (studentResults.length === 0) return null

    const levelCounts = studentResults.reduce((acc, result) => {
      acc[result.level] = (acc[result.level] || 0) + 1
      return acc
    }, {} as Record<EvaluationLevel, number>)

    const totalResults = studentResults.length
    const averageScore = calculateAverageScore(studentResults)

    return {
      totalResults,
      levelCounts,
      averageScore,
      lastEvaluated: studentResults.length > 0
        ? Math.max(...studentResults.map(r => new Date(r.evaluatedAt).getTime()))
        : null
    }
  }

  const exportData = () => {
    console.log('📤 [EvaluationResultsStore] Export des données')
    return evaluationResultsService.exportAllData()
  }

  const getServiceStats = () => {
    return evaluationResultsService.getStats()
  }

  // Fonction utilitaire pour calculer une note moyenne
  const calculateAverageScore = (results: EvaluationResult[]): number => {
    if (results.length === 0) return 0

    const scoreMap: Record<EvaluationLevel, number> = {
      'A': 5,
      'B': 4,
      'C': 3,
      'D': 2,
      'E': 1,
      'N/A': 0
    }

    const totalScore = results.reduce((sum, result) => sum + scoreMap[result.level], 0)
    return totalScore / results.length
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // Getters
    evaluation,
    results,
    hasResults,
    evaluationStats,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Actions
    initializeEvaluation,
    saveResult,
    getResult,
    deleteResult,
    bulkSaveResults,
    resetEvaluation,
    refreshEvaluation,

    // Getters spécialisés
    getResultsByStudent,
    getResultsByCompetency,
    getStudentProgress,

    // Utilitaires
    exportData,
    getServiceStats,
    clearError
  }
}