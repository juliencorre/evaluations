import { ref, computed } from 'vue'
import { supabaseSchoolYearsService, type SchoolYear, type CreateSchoolYearRequest } from '@/services/supabaseSchoolYearsService'

// État global du store
const schoolYears = ref<SchoolYear[]>([])
const currentSchoolYear = ref<SchoolYear | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

/**
 * Store pour gérer les années scolaires
 */
export function useSchoolYearStore() {
  // Computed properties
  const allSchoolYears = computed(() => schoolYears.value)

  const getCurrentSchoolYear = computed(() => {
    if (currentSchoolYear.value) {
      return currentSchoolYear.value
    }
    // Fallback: chercher l'année marquée comme courante dans la liste
    return schoolYears.value.find(sy => sy.is_current) || null
  })

  const getSchoolYearById = computed(() => {
    return (id: string) => schoolYears.value.find(sy => sy.id === id) || null
  })

  const getSchoolYearByName = computed(() => {
    return (name: string) => schoolYears.value.find(sy => sy.name === name) || null
  })

  const sortedSchoolYears = computed(() => {
    return [...schoolYears.value].sort((a, b) => {
      // Trier par date de début, plus récent en premier
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    })
  })

  const activeSchoolYears = computed(() => {
    // Pour l'instant, toutes les années sont "actives"
    // Peut être étendu avec une logique plus complexe
    return schoolYears.value
  })

  // Actions
  const loadSchoolYears = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      console.log('🔄 [SchoolYearStore] Chargement des années scolaires')
      const data = await supabaseSchoolYearsService.getSchoolYears()
      schoolYears.value = data

      // Charger l'année courante
      const current = data.find(sy => sy.is_current) || null
      currentSchoolYear.value = current

      console.log(`✅ [SchoolYearStore] ${data.length} années scolaires chargées`)
      if (current) {
        console.log(`📅 [SchoolYearStore] Année courante: ${current.name}`)
      }
    } catch (err) {
      console.error('❌ [SchoolYearStore] Erreur lors du chargement:', err)
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
    } finally {
      isLoading.value = false
    }
  }

  const refreshCurrentSchoolYear = async () => {
    try {
      console.log('🔄 [SchoolYearStore] Actualisation de l\'année courante')
      const current = await supabaseSchoolYearsService.getCurrentSchoolYear()
      currentSchoolYear.value = current

      // Mettre à jour aussi dans la liste
      if (current) {
        const index = schoolYears.value.findIndex(sy => sy.id === current.id)
        if (index >= 0) {
          schoolYears.value[index] = current
        } else {
          schoolYears.value.push(current)
        }
      }

      console.log(`✅ [SchoolYearStore] Année courante actualisée: ${current?.name || 'Aucune'}`)
    } catch (err) {
      console.error('❌ [SchoolYearStore] Erreur lors de l\'actualisation:', err)
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
    }
  }

  const createSchoolYear = async (schoolYear: CreateSchoolYearRequest) => {
    try {
      console.log(`➕ [SchoolYearStore] Création de l'année scolaire: ${schoolYear.name}`)
      const newSchoolYear = await supabaseSchoolYearsService.createSchoolYear(schoolYear)

      schoolYears.value.push(newSchoolYear)

      // Si c'est la nouvelle année courante, mettre à jour
      if (newSchoolYear.is_current) {
        currentSchoolYear.value = newSchoolYear
        // Désactiver les autres années courantes dans le store local
        schoolYears.value.forEach(sy => {
          if (sy.id !== newSchoolYear.id) {
            sy.is_current = false
          }
        })
      }

      console.log(`✅ [SchoolYearStore] Année scolaire créée: ${newSchoolYear.name}`)
      return newSchoolYear
    } catch (err) {
      console.error('❌ [SchoolYearStore] Erreur lors de la création:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la création'
      throw err
    }
  }

  const updateSchoolYear = async (id: string, updates: Partial<SchoolYear>) => {
    try {
      console.log(`📝 [SchoolYearStore] Mise à jour de l'année scolaire: ${id}`)
      const updatedSchoolYear = await supabaseSchoolYearsService.updateSchoolYear(id, updates)

      const index = schoolYears.value.findIndex(sy => sy.id === id)
      if (index >= 0) {
        schoolYears.value[index] = updatedSchoolYear
      }

      // Si c'est la nouvelle année courante, mettre à jour
      if (updatedSchoolYear.is_current) {
        currentSchoolYear.value = updatedSchoolYear
        // Désactiver les autres années courantes
        schoolYears.value.forEach(sy => {
          if (sy.id !== updatedSchoolYear.id) {
            sy.is_current = false
          }
        })
      }

      console.log(`✅ [SchoolYearStore] Année scolaire mise à jour: ${updatedSchoolYear.name}`)
      return updatedSchoolYear
    } catch (err) {
      console.error('❌ [SchoolYearStore] Erreur lors de la mise à jour:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      throw err
    }
  }

  const deleteSchoolYear = async (id: string) => {
    try {
      console.log(`🗑️ [SchoolYearStore] Suppression de l'année scolaire: ${id}`)
      await supabaseSchoolYearsService.deleteSchoolYear(id)

      const index = schoolYears.value.findIndex(sy => sy.id === id)
      if (index >= 0) {
        const deletedSchoolYear = schoolYears.value[index]
        schoolYears.value.splice(index, 1)

        // Si on supprime l'année courante, la réinitialiser
        if (currentSchoolYear.value?.id === id) {
          currentSchoolYear.value = null
        }

        console.log(`✅ [SchoolYearStore] Année scolaire supprimée: ${deletedSchoolYear.name}`)
      }
    } catch (err) {
      console.error('❌ [SchoolYearStore] Erreur lors de la suppression:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      throw err
    }
  }

  const setCurrentSchoolYear = async (id: string) => {
    try {
      console.log(`🎯 [SchoolYearStore] Définition de l'année courante: ${id}`)
      await supabaseSchoolYearsService.setCurrentSchoolYear(id)

      // Mettre à jour le store local
      schoolYears.value.forEach(sy => {
        sy.is_current = sy.id === id
        if (sy.id === id) {
          currentSchoolYear.value = sy
        }
      })

      console.log(`✅ [SchoolYearStore] Année courante définie`)
    } catch (err) {
      console.error('❌ [SchoolYearStore] Erreur lors de la définition:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la définition'
      throw err
    }
  }

  const resetError = () => {
    error.value = null
  }

  // Utilitaires
  const validateSchoolYearName = (name: string) => {
    return supabaseSchoolYearsService.validateSchoolYearName(name)
  }

  const getCurrentSchoolYearName = () => {
    return supabaseSchoolYearsService.getCurrentSchoolYearName()
  }

  // Initialisation automatique si nécessaire
  const ensureLoaded = async () => {
    if (schoolYears.value.length === 0 && !isLoading.value) {
      await loadSchoolYears()
    }
  }

  // Subscription aux changements temps réel
  const subscribeToChanges = () => {
    return supabaseSchoolYearsService.subscribeToSchoolYears((payload) => {
      console.log('🔔 [SchoolYearStore] Changement détecté:', payload)

      switch (payload.eventType) {
        case 'INSERT':
          schoolYears.value.push(payload.new)
          if (payload.new.is_current) {
            currentSchoolYear.value = payload.new
          }
          break

        case 'UPDATE': {
          const index = schoolYears.value.findIndex(sy => sy.id === payload.new.id)
          if (index >= 0) {
            schoolYears.value[index] = payload.new
            if (payload.new.is_current) {
              currentSchoolYear.value = payload.new
            }
          }
          break
        }

        case 'DELETE': {
          const deleteIndex = schoolYears.value.findIndex(sy => sy.id === payload.old.id)
          if (deleteIndex >= 0) {
            schoolYears.value.splice(deleteIndex, 1)
            if (currentSchoolYear.value?.id === payload.old.id) {
              currentSchoolYear.value = null
            }
          }
          break
        }
      }
    })
  }

  return {
    // État
    schoolYears: allSchoolYears,
    currentSchoolYear: getCurrentSchoolYear,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Computed
    sortedSchoolYears,
    activeSchoolYears,
    getSchoolYearById,
    getSchoolYearByName,

    // Actions
    loadSchoolYears,
    refreshCurrentSchoolYear,
    createSchoolYear,
    updateSchoolYear,
    deleteSchoolYear,
    setCurrentSchoolYear,
    resetError,
    ensureLoaded,

    // Utilitaires
    validateSchoolYearName,
    getCurrentSchoolYearName,
    subscribeToChanges
  }
}