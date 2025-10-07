import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSchoolYearFilterStore } from '@/stores/modules/schoolYearFilter.store'

const mockSchoolYearStore = {
  currentSchoolYear: { id: 'y1', name: '2024-2025' },
  getSchoolYearById: vi.fn(),
  ensureLoaded: vi.fn()
}

vi.mock('@/stores', () => ({
  useSchoolYearStore: () => mockSchoolYearStore
}))

describe('useSchoolYearFilterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should set filter to all years', () => {
    const store = useSchoolYearFilterStore()

    store.setFilter({ type: 'all' })

    expect(store.isFilteringAllYears).toBe(true)
    expect(store.displayText).toBe('Toutes les années')
  })

  it('should filter data by year', () => {
    const store = useSchoolYearFilterStore()
    const data = [
      { id: '1', schoolYearId: 'y1' },
      { id: '2', schoolYearId: 'y2' }
    ]

    store.setFilter({ type: 'single', yearId: 'y1' })
    const result = store.filterDataByYear(data)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})
