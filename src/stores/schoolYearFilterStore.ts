import { ref, computed } from 'vue'
import { useSchoolYearStore } from './schoolYearStore'

/**
 * Store global pour gérer le filtre d'année scolaire à travers toute l'application
 */

// État global
const selectedYearId = ref<string | 'all' | null>(null)
const isAllYearsSelected = ref(false)

export function useSchoolYearFilterStore() {
  const schoolYearStore = useSchoolYearStore()

  // Computed properties
  const currentFilter = computed(() => {
    if (isAllYearsSelected.value) {
      return {
        type: 'all' as const,
        yearId: null,
        yearName: 'Toutes les années'
      }
    }

    if (selectedYearId.value) {
      const year = schoolYearStore.getSchoolYearById.value(selectedYearId.value)
      return {
        type: 'single' as const,
        yearId: selectedYearId.value,
        yearName: year?.name || 'Année inconnue'
      }
    }

    // Par défaut, utiliser l'année courante
    const currentYear = schoolYearStore.currentSchoolYear
    return {
      type: 'single' as const,
      yearId: currentYear.value?.id || null,
      yearName: currentYear.value?.name || 'Aucune année'
    }
  })

  const displayText = computed(() => {
    return currentFilter.value.yearName
  })

  const isFilteringAllYears = computed(() => {
    return isAllYearsSelected.value
  })

  const activeYearId = computed(() => {
    if (isAllYearsSelected.value) return null
    return selectedYearId.value || schoolYearStore.currentSchoolYear.value?.id || null
  })

  // Actions
  const setFilter = (options: { type: 'all' | 'single', yearId?: string }) => {
    if (options.type === 'all') {
      isAllYearsSelected.value = true
      selectedYearId.value = null
      localStorage.setItem('schoolYearFilter', JSON.stringify({ type: 'all' }))
    } else if (options.type === 'single' && options.yearId) {
      isAllYearsSelected.value = false
      selectedYearId.value = options.yearId
      localStorage.setItem('schoolYearFilter', JSON.stringify({
        type: 'single',
        yearId: options.yearId
      }))
    }
  }

  const setToCurrentYear = () => {
    const currentYear = schoolYearStore.currentSchoolYear
    if (currentYear.value) {
      setFilter({ type: 'single', yearId: currentYear.value.id })
    }
  }

  const setToAllYears = () => {
    setFilter({ type: 'all' })
  }

  const resetToDefault = () => {
    setToCurrentYear()
  }

  const restoreFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('schoolYearFilter')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.type === 'all') {
          setToAllYears()
        } else if (parsed.type === 'single' && parsed.yearId) {
          setFilter({ type: 'single', yearId: parsed.yearId })
        } else {
          setToCurrentYear()
        }
      } else {
        setToCurrentYear()
      }
    } catch (error) {
      console.error('Error restoring school year filter from localStorage:', error)
      setToCurrentYear()
    }
  }

  // Helper pour les requêtes de base de données
  const getFilterForQuery = () => {
    if (isAllYearsSelected.value) {
      return null // Pas de filtre, toutes les années
    }
    return activeYearId.value // ID de l'année spécifique
  }

  // Helper pour filtrer des données côté client
  const filterDataByYear = <T extends { schoolYearId?: string; school_year_id?: string; created_at?: string }>(
    data: T[]
  ): T[] => {
    if (isAllYearsSelected.value) {
      return data // Retourner toutes les données
    }

    const yearId = activeYearId.value
    if (!yearId) return []

    return data.filter(item => {
      // Essayer différents champs possibles pour l'année scolaire
      return item.schoolYearId === yearId ||
             item.school_year_id === yearId ||
             // Fallback: si pas d'année spécifiée, utiliser l'année courante basée sur created_at
             (!item.schoolYearId && !item.school_year_id && item.created_at)
    })
  }

  // Initialize
  const initialize = async () => {
    // Charger les années scolaires d'abord
    await schoolYearStore.ensureLoaded()
    // Puis restaurer le filtre
    restoreFromLocalStorage()
  }

  return {
    // State
    currentFilter,
    displayText,
    isFilteringAllYears,
    activeYearId,

    // Actions
    setFilter,
    setToCurrentYear,
    setToAllYears,
    resetToDefault,
    restoreFromLocalStorage,
    initialize,

    // Helpers
    getFilterForQuery,
    filterDataByYear
  }
}

// Export du store en singleton pour faciliter l'utilisation
let storeInstance: ReturnType<typeof useSchoolYearFilterStore> | null = null

export function getSchoolYearFilterStore() {
  if (!storeInstance) {
    storeInstance = useSchoolYearFilterStore()
  }
  return storeInstance
}