import { ref, computed, type Ref } from 'vue'
import type { Evaluation } from '@/types/evaluation'

export interface EvaluationFilters {
  classId?: string
  frameworkId?: string
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
}

/**
 * Composable pour le filtrage d'évaluations
 */
export function useEvaluationFilters(evaluations: Ref<Evaluation[]>) {
  const filters = ref<EvaluationFilters>({})

  const filteredEvaluations = computed(() => {
    return evaluations.value.filter(evaluation => {
      // Filtre par classe
      if (filters.value.classId && evaluation.classId !== filters.value.classId) {
        return false
      }

      // Filtre par framework
      if (filters.value.frameworkId && evaluation.frameworkId !== filters.value.frameworkId) {
        return false
      }

      // Filtre par date de début
      if (filters.value.dateFrom) {
        const evalDate = new Date(evaluation.createdAt)
        const fromDate = new Date(filters.value.dateFrom)
        if (evalDate < fromDate) {
          return false
        }
      }

      // Filtre par date de fin
      if (filters.value.dateTo) {
        const evalDate = new Date(evaluation.createdAt)
        const toDate = new Date(filters.value.dateTo)
        if (evalDate > toDate) {
          return false
        }
      }

      // Filtre par recherche textuelle
      if (filters.value.searchQuery) {
        const query = filters.value.searchQuery.toLowerCase()
        const nameMatch = evaluation.name.toLowerCase().includes(query)
        const descMatch = evaluation.description?.toLowerCase().includes(query)
        if (!nameMatch && !descMatch) {
          return false
        }
      }

      return true
    })
  })

  const setClassFilter = (classId: string | undefined) => {
    filters.value.classId = classId
  }

  const setFrameworkFilter = (frameworkId: string | undefined) => {
    filters.value.frameworkId = frameworkId
  }

  const setDateRange = (from: string | undefined, to: string | undefined) => {
    filters.value.dateFrom = from
    filters.value.dateTo = to
  }

  const setSearchQuery = (query: string | undefined) => {
    filters.value.searchQuery = query
  }

  const reset = () => {
    filters.value = {}
  }

  return {
    filters,
    filteredEvaluations,
    setClassFilter,
    setFrameworkFilter,
    setDateRange,
    setSearchQuery,
    reset
  }
}
