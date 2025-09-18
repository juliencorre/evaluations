import { ref, computed } from 'vue'
import type { Evaluation } from '@/types/evaluation'
import { SAMPLE_EVALUATION } from '@/data/staticData'
import { supabaseEvaluationsService } from '@/services/supabaseEvaluationsService'

const evaluations = ref<Evaluation[]>([])
const currentEvaluation = ref<Evaluation | null>(null)
const isLoading = ref(false)

export function useEvaluationStore() {
  // Computed properties
  const allEvaluations = computed(() => {
    // If no evaluations loaded yet, show sample as fallback
    return evaluations.value.length > 0 ? evaluations.value : [SAMPLE_EVALUATION]
  })
  const getCurrentEvaluation = computed(() => {
    return currentEvaluation.value || SAMPLE_EVALUATION
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
    currentEvaluation.value = evaluation
  }

  const getEvaluationById = (id: string) => {
    return evaluations.value.find(evaluation => evaluation.id === id)
  }

  return {
    // State
    allEvaluations,
    currentEvaluation: getCurrentEvaluation,
    isLoading: computed(() => isLoading.value),

    // Actions
    loadEvaluations,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    setCurrentEvaluation,
    getEvaluationById
  }
}