import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Evaluation, EvaluationResult, EvaluationLevel, EvaluationValue } from '@/types/evaluation'
import { evaluationResultsService } from '@/services/evaluationResultsService'
import { serviceContainer } from '@/services/ServiceContainer'
import { useCompetencyFrameworkStore } from '@/stores'

type EvaluationMetadata = Omit<Evaluation, 'results'>

const toEvaluationMetadata = (evaluationLike: Evaluation | EvaluationMetadata): EvaluationMetadata => {
  if (!('results' in evaluationLike)) {
    return evaluationLike
  }
  const { id, name, description, frameworkId, classId, createdAt } = evaluationLike
  return { id, name, description, frameworkId, classId, createdAt }
}

const evaluationResultsRepository = serviceContainer.evaluationResults

export const useEvaluationResultsStore = defineStore('evaluationResults', () => {
  const currentEvaluation = ref<Evaluation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const useSupabase = ref(true)

  const evaluation = computed(() => currentEvaluation.value)
  const results = computed(() => currentEvaluation.value?.results ?? [])
  const hasResults = computed(() => results.value.length > 0)
  const evaluationStats = computed(() => {
    if (!currentEvaluation.value) return null

    const totalResults = results.value.length
    const valueCounts = results.value.reduce((acc: Record<string, number>, result: EvaluationResult) => {
      const resultValue = result.value || result.level || 'N/A'
      acc[resultValue] = (acc[resultValue] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalResults,
      valueCounts,
      levelCounts: valueCounts,
      lastUpdated: results.value.length > 0
        ? Math.max(...results.value.map(r => new Date(r.evaluatedAt).getTime()))
        : null
    }
  })

  const initializeEvaluation = async (evaluationData: EvaluationMetadata) => {
    console.log('[EvaluationResultsStore] initializeEvaluation called with ID:', evaluationData.id)
    console.log('[EvaluationResultsStore] Initializing new evaluation:', evaluationData.id)

    isLoading.value = true
    error.value = null

    try {
      let evaluationRecord: Evaluation
      let processed = toEvaluationMetadata(evaluationData)

      if (useSupabase.value && evaluationData.frameworkId === 'framework-fr-primary') {
        const frameworkStore = useCompetencyFrameworkStore()
        const realFrameworkId = frameworkStore.framework.id
        if (realFrameworkId && realFrameworkId !== 'temp') {
          processed.frameworkId = realFrameworkId
        }
      }

      if (useSupabase.value) {
        try {
          evaluationRecord = await evaluationResultsRepository.getOrCreateEvaluation(processed)
        } catch (supabaseError) {
          console.error('[EvaluationResultsStore] Supabase error, falling back to local storage:', supabaseError)
          useSupabase.value = false
          evaluationRecord = evaluationResultsService.getOrCreateEvaluation(processed)
        }
      } else {
        evaluationRecord = evaluationResultsService.getOrCreateEvaluation(processed)
      }

      currentEvaluation.value = evaluationRecord

      try {
        evaluationResultsService.getOrCreateEvaluation(evaluationRecord)
      } catch (backupError) {
        console.warn('[EvaluationResultsStore] Unable to initialize local backup:', backupError)
      }
    } catch (err) {
      console.error('[EvaluationResultsStore] Failed to initialize evaluation:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'initialisation'
    } finally {
      isLoading.value = false
    }
  }

  const saveResult = async (
    studentId: string,
    competencyId: string,
    value: EvaluationValue,
    comment?: string
  ): Promise<EvaluationResult | null> => {
    if (!currentEvaluation.value) {
      error.value = 'Aucune �valuation active'
      return null
    }

    try {
      let result: EvaluationResult

      if (useSupabase.value) {
        try {
          result = await evaluationResultsRepository.saveResult(
            currentEvaluation.value.id,
            studentId,
            competencyId,
            value,
            comment
          )

          try {
            evaluationResultsService.saveResult(
              currentEvaluation.value.id,
              studentId,
              competencyId,
              value,
              comment
            )
          } catch (backupError) {
            console.warn('[EvaluationResultsStore] Local backup save failed:', backupError)
          }
        } catch (supabaseError) {
          console.error('[EvaluationResultsStore] Supabase save failed, switching to local:', supabaseError)
          useSupabase.value = false
          result = evaluationResultsService.saveResult(
            currentEvaluation.value.id,
            studentId,
            competencyId,
            value,
            comment
          )
        }
      } else {
        result = evaluationResultsService.saveResult(
          currentEvaluation.value.id,
          studentId,
          competencyId,
          value,
          comment
        )
      }

      const existingIndex = currentEvaluation.value.results.findIndex(
        r => r.studentId === studentId && r.competencyId === competencyId
      )

      if (existingIndex !== -1) {
        currentEvaluation.value.results[existingIndex] = result
      } else {
        currentEvaluation.value.results.push(result)
      }

      return result
    } catch (err) {
      console.error('[EvaluationResultsStore] Failed to save result:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      return null
    }
  }

  const getResult = (studentId: string, competencyId: string): EvaluationResult | null => {
    if (!currentEvaluation.value) return null
    return currentEvaluation.value.results.find(
      r => r.studentId === studentId && r.competencyId === competencyId
    ) ?? null
  }

  const deleteResult = async (studentId: string, competencyId: string): Promise<boolean> => {
    if (!currentEvaluation.value) return false

    try {
      if (useSupabase.value) {
        try {
          const success = await evaluationResultsRepository.deleteResult(
            currentEvaluation.value.id,
            studentId,
            competencyId
          )
          if (success) {
            evaluationResultsService.deleteResult(
              currentEvaluation.value.id,
              studentId,
              competencyId
            )
          }
        } catch (supabaseError) {
          console.error('[EvaluationResultsStore] Supabase delete failed, switching to local:', supabaseError)
          useSupabase.value = false
        }
      }

      const success = evaluationResultsService.deleteResult(
        currentEvaluation.value.id,
        studentId,
        competencyId
      )

      if (success) {
        currentEvaluation.value.results = currentEvaluation.value.results.filter(
          r => !(r.studentId === studentId && r.competencyId === competencyId)
        )
      }

      return success
    } catch (err) {
      console.error('[EvaluationResultsStore] Failed to delete result:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      return false
    }
  }

  const bulkSaveResults = async (
    resultsPayload: Omit<EvaluationResult, 'evaluatedAt'>[]
  ): Promise<EvaluationResult[]> => {
    if (!currentEvaluation.value) return []

    try {
      const savedResults = evaluationResultsService.bulkSaveResults(
        currentEvaluation.value.id,
        resultsPayload
      )

      const updatedEvaluation = evaluationResultsService.getOrCreateEvaluation(currentEvaluation.value)
      currentEvaluation.value = updatedEvaluation

      return savedResults
    } catch (err) {
      console.error('[EvaluationResultsStore] Bulk save failed:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde en lot'
      return []
    }
  }

  const resetEvaluation = async (): Promise<boolean> => {
    if (!currentEvaluation.value) return false

    try {
      const success = evaluationResultsService.resetEvaluation(currentEvaluation.value.id)
      if (success) {
        currentEvaluation.value.results = []
      }
      return success
    } catch (err) {
      console.error('[EvaluationResultsStore] Reset failed:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la r�initialisation'
      return false
    }
  }

  const refreshEvaluation = async (): Promise<void> => {
    if (!currentEvaluation.value) return

    try {
      isLoading.value = true
      const refreshedEvaluation = evaluationResultsService.getOrCreateEvaluation(currentEvaluation.value)
      currentEvaluation.value = refreshedEvaluation
    } catch (err) {
      console.error('[EvaluationResultsStore] Refresh failed:', err)
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

  const calculateAverageScore = (evalResults: EvaluationResult[]): number => {
    if (evalResults.length === 0) return 0

    const scoreMap: Record<EvaluationLevel, number> = {
      'A': 5,
      'B': 4,
      'C': 3,
      'D': 2,
      'E': 1,
      'N/A': 0
    }

    const validResults = evalResults.filter(result => {
      const level = (result.level || result.value) as EvaluationLevel
      return level && level !== 'N/A'
    })

    if (validResults.length === 0) return 0

    const totalScore = validResults.reduce((sum, result) => {
      const level = (result.level || result.value) as EvaluationLevel
      return sum + (level && scoreMap[level] ? scoreMap[level] : 0)
    }, 0)

    return totalScore / validResults.length
  }

  const getStudentProgress = (studentId: string) => {
    const studentResults = getResultsByStudent(studentId)
    if (studentResults.length === 0) return null

    const levelCounts = studentResults.reduce((acc, result) => {
      const level = (result.level || result.value) as EvaluationLevel
      if (level) {
        acc[level] = (acc[level] || 0) + 1
      }
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

  const exportData = () => evaluationResultsService.exportAllData()
  const getServiceStats = () => evaluationResultsService.getStats()
  const clearError = () => { error.value = null }

  return {
    evaluation,
    results,
    hasResults,
    evaluationStats,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    useSupabase: computed(() => useSupabase.value),
    initializeEvaluation,
    saveResult,
    getResult,
    deleteResult,
    bulkSaveResults,
    resetEvaluation,
    refreshEvaluation,
    getResultsByStudent,
    getResultsByCompetency,
    getStudentProgress,
    exportData,
    getServiceStats,
    clearError
  }
})
