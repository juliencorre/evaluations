import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSchoolYearStore } from '@/stores'

type FilterType = 'all' | 'single'

const STORAGE_KEY = 'schoolYearFilter'

export const useSchoolYearFilterStore = defineStore('schoolYearFilter', () => {
  const selectedYearId = ref<string | null>(null)
  const isAllYearsSelected = ref(false)

  const schoolYearStore = useSchoolYearStore()

  const currentFilter = computed(() => {
    if (isAllYearsSelected.value) {
      return {
        type: 'all' as const,
        yearId: null,
        yearName: 'Toutes les années'
      }
    }

    if (selectedYearId.value) {
      const year = schoolYearStore.getSchoolYearById(selectedYearId.value)
      return {
        type: 'single' as const,
        yearId: selectedYearId.value,
        yearName: year?.name ?? 'Année inconnue'
      }
    }

    const currentYear = schoolYearStore.currentSchoolYear
    return {
      type: 'single' as const,
      yearId: currentYear?.id ?? null,
      yearName: currentYear?.name ?? 'Aucune année'
    }
  })

  const displayText = computed(() => currentFilter.value.yearName)
  const isFilteringAllYears = computed(() => isAllYearsSelected.value)
  const activeYearId = computed(() => {
    if (isAllYearsSelected.value) return null
    return selectedYearId.value ?? schoolYearStore.currentSchoolYear?.id ?? null
  })

  const persistFilter = (filter: { type: FilterType; yearId?: string | null }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filter))
    } catch {
      // ignore
    }
  }

  const setFilter = (options: { type: FilterType; yearId?: string }) => {
    if (options.type === 'all') {
      isAllYearsSelected.value = true
      selectedYearId.value = null
      persistFilter({ type: 'all' })
    } else if (options.type === 'single' && options.yearId) {
      isAllYearsSelected.value = false
      selectedYearId.value = options.yearId
      persistFilter({ type: 'single', yearId: options.yearId })
    }
  }

  const setToCurrentYear = () => {
    const currentYear = schoolYearStore.currentSchoolYear
    if (currentYear) {
      setFilter({ type: 'single', yearId: currentYear.id })
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
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        setToCurrentYear()
        return
      }
      const parsed = JSON.parse(saved)
      if (parsed.type === 'all') {
        setToAllYears()
      } else if (parsed.type === 'single' && parsed.yearId) {
        setFilter({ type: 'single', yearId: parsed.yearId })
      } else {
        setToCurrentYear()
      }
    } catch {
      setToCurrentYear()
    }
  }

  const getFilterForQuery = () => {
    if (isAllYearsSelected.value) return null
    return activeYearId.value
  }

  const filterDataByYear = <T extends { schoolYearId?: string; school_year_id?: string; created_at?: string }>(data: T[]): T[] => {
    if (isAllYearsSelected.value) return data
    const yearId = activeYearId.value
    if (!yearId) return []

    return data.filter(item => {
      return item.schoolYearId === yearId ||
        item.school_year_id === yearId ||
        (!item.schoolYearId && !item.school_year_id && Boolean(item.created_at))
    })
  }

  const initialize = async () => {
    await schoolYearStore.ensureLoaded()
    restoreFromLocalStorage()
  }

  return {
    currentFilter,
    displayText,
    isFilteringAllYears,
    activeYearId,
    setFilter,
    setToCurrentYear,
    setToAllYears,
    resetToDefault,
    restoreFromLocalStorage,
    initialize,
    getFilterForQuery,
    filterDataByYear
  }
})

