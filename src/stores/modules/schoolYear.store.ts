import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { serviceContainer } from '@/services/ServiceContainer'
import type { SchoolYearEntity } from '@/services/repositories/SchoolYearRepository'
import type { Database } from '@/types/database.types'

type SchoolYearRow = Database['public']['Tables']['school_years']['Row']

interface LegacySchoolYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
  updated_at: string
}

interface CreateSchoolYearPayload {
  name: string
  start_date: string
  end_date: string
  is_current?: boolean
}

type UpdateSchoolYearPayload = Partial<LegacySchoolYear>

const repository = serviceContainer.schoolYears

const toLegacy = (entity: SchoolYearEntity): LegacySchoolYear => ({
  id: entity.id,
  name: entity.name,
  start_date: entity.startDate,
  end_date: entity.endDate,
  is_current: entity.isCurrent,
  created_at: entity.createdAt,
  updated_at: entity.updatedAt
})

const fromRow = (row: SchoolYearRow): LegacySchoolYear => ({
  id: row.id,
  name: row.name,
  start_date: row.start_date,
  end_date: row.end_date,
  is_current: row.is_current,
  created_at: row.created_at,
  updated_at: row.updated_at
})

export const useSchoolYearStore = defineStore('schoolYears', () => {
  const schoolYears = ref<LegacySchoolYear[]>([])
  const currentSchoolYear = ref<LegacySchoolYear | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const allSchoolYears = computed(() => schoolYears.value)

  const currentSchoolYearComputed = computed(() => {
    if (currentSchoolYear.value) return currentSchoolYear.value
    return schoolYears.value.find(year => year.is_current) ?? null
  })

  const sortedSchoolYears = computed(() =>
    [...schoolYears.value].sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )
  )

  const activeSchoolYears = computed(() => schoolYears.value)

  const getSchoolYearById = computed(() => (id: string) =>
    schoolYears.value.find(year => year.id === id) ?? null
  )

  const getSchoolYearByName = computed(() => (name: string) =>
    schoolYears.value.find(year => year.name === name) ?? null
  )

  async function loadSchoolYears() {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const data = await repository.findAll()
      schoolYears.value = data.map(toLegacy)
      currentSchoolYear.value = schoolYears.value.find(year => year.is_current) ?? null
    } catch (err) {
      console.error('[SchoolYearStore] loadSchoolYears failed', err)
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
    } finally {
      isLoading.value = false
    }
  }

  async function refreshCurrentSchoolYear() {
    try {
      const current = await repository.findCurrent()
      currentSchoolYear.value = current ? toLegacy(current) : null

      if (current) {
        const index = schoolYears.value.findIndex(year => year.id === current.id)
        if (index >= 0) {
          schoolYears.value[index] = toLegacy(current)
        } else {
          schoolYears.value.push(toLegacy(current))
        }
      }
    } catch (err) {
      console.error('[SchoolYearStore] refreshCurrentSchoolYear failed', err)
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
    }
  }

  async function createSchoolYear(payload: CreateSchoolYearPayload) {
    try {
      const created = await repository.create({
        name: payload.name,
        startDate: payload.start_date,
        endDate: payload.end_date,
        isCurrent: payload.is_current ?? false
      })

      const legacy = toLegacy(created)
      schoolYears.value.push(legacy)

      if (legacy.is_current) {
        currentSchoolYear.value = legacy
        schoolYears.value.forEach(year => {
          if (year.id !== legacy.id) {
            year.is_current = false
          }
        })
      }

      return legacy
    } catch (err) {
      console.error('[SchoolYearStore] createSchoolYear failed', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la création'
      throw err
    }
  }

  async function updateSchoolYear(id: string, updates: UpdateSchoolYearPayload) {
    try {
      const updated = await repository.update(id, {
        name: updates.name,
        startDate: updates.start_date,
        endDate: updates.end_date,
        isCurrent: updates.is_current
      })

      const legacy = toLegacy(updated)
      const index = schoolYears.value.findIndex(year => year.id === id)
      if (index >= 0) {
        schoolYears.value[index] = legacy
      }

      if (legacy.is_current) {
        currentSchoolYear.value = legacy
        schoolYears.value.forEach(year => {
          if (year.id !== legacy.id) {
            year.is_current = false
          }
        })
      }

      return legacy
    } catch (err) {
      console.error('[SchoolYearStore] updateSchoolYear failed', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      throw err
    }
  }

  async function deleteSchoolYear(id: string) {
    try {
      await repository.delete(id)

      const index = schoolYears.value.findIndex(year => year.id === id)
      if (index >= 0) {
        const deleted = schoolYears.value.splice(index, 1)[0]
        if (currentSchoolYear.value?.id === deleted.id) {
          currentSchoolYear.value = null
        }
      }
    } catch (err) {
      console.error('[SchoolYearStore] deleteSchoolYear failed', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      throw err
    }
  }

  async function setCurrentSchoolYear(id: string) {
    try {
      await repository.setCurrent(id)
      schoolYears.value.forEach(year => {
        year.is_current = year.id === id
        if (year.id === id) {
          currentSchoolYear.value = year
        }
      })
    } catch (err) {
      console.error('[SchoolYearStore] setCurrentSchoolYear failed', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de la définition'
      throw err
    }
  }

  function resetError() {
    error.value = null
  }

  async function ensureLoaded() {
    if (!schoolYears.value.length && !isLoading.value) {
      await loadSchoolYears()
    }
  }

  function validateSchoolYearName(name: string) {
    const pattern = /^\d{4}-\d{4}$/
    if (!pattern.test(name)) {
      return {
        valid: false,
        error: 'Format invalide. Utilisez YYYY-YYYY (ex: 2024-2025)'
      }
    }

    const [start, end] = name.split('-').map(Number)
    if (end !== start + 1) {
      return {
        valid: false,
        error: 'L\'année de fin doit être exactement un an après l\'année de début.'
      }
    }

    return { valid: true as const }
  }

  function getCurrentSchoolYearName() {
    const current = currentSchoolYearComputed.value
    if (current) return current.name

    const currentYear = new Date().getFullYear()
    return `${currentYear - 1}-${currentYear}`
  }

  function subscribeToChanges() {
    return repository.subscribeToChanges((payload: RealtimePostgresChangesPayload<SchoolYearRow>) => {
      switch (payload.eventType) {
        case 'INSERT': {
          const inserted = fromRow(payload.new)
          schoolYears.value.push(inserted)
          if (inserted.is_current) {
            currentSchoolYear.value = inserted
          }
          break
        }
        case 'UPDATE': {
          const updated = fromRow(payload.new)
          const index = schoolYears.value.findIndex(year => year.id === updated.id)
          if (index >= 0) {
            schoolYears.value[index] = updated
          }
          if (updated.is_current) {
            currentSchoolYear.value = updated
          }
          break
        }
        case 'DELETE': {
          const deletedId = payload.old.id
          schoolYears.value = schoolYears.value.filter(year => year.id !== deletedId)
          if (currentSchoolYear.value?.id === deletedId) {
            currentSchoolYear.value = null
          }
          break
        }
      }
    })
  }

  return {
    schoolYears: allSchoolYears,
    currentSchoolYear: currentSchoolYearComputed,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    sortedSchoolYears,
    activeSchoolYears,
    getSchoolYearById,
    getSchoolYearByName,
    loadSchoolYears,
    refreshCurrentSchoolYear,
    createSchoolYear,
    updateSchoolYear,
    deleteSchoolYear,
    setCurrentSchoolYear,
    resetError,
    ensureLoaded,
    validateSchoolYearName,
    getCurrentSchoolYearName,
    subscribeToChanges
  }
})
