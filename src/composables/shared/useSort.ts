import { ref, computed, type Ref } from 'vue'

export type SortDirection = 'asc' | 'desc' | null

/**
 * Composable pour le tri de listes
 */
export function useSort<T extends Record<string, any>>(items: Ref<T[]>) {
  const sortKey = ref<keyof T | null>(null)
  const sortDirection = ref<SortDirection>(null)

  const sortedItems = computed(() => {
    if (!sortKey.value || !sortDirection.value) {
      return items.value
    }

    return [...items.value].sort((a, b) => {
      const key = sortKey.value as keyof T
      const aVal = a[key]
      const bVal = b[key]

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sortDirection.value === 'asc' ? 1 : -1
      if (bVal == null) return sortDirection.value === 'asc' ? -1 : 1

      // Compare values
      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }

      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  })

  const toggleSort = (key: keyof T) => {
    if (sortKey.value === key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection.value === 'asc') {
        sortDirection.value = 'desc'
      } else if (sortDirection.value === 'desc') {
        sortDirection.value = null
        sortKey.value = null
      }
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const reset = () => {
    sortKey.value = null
    sortDirection.value = null
  }

  return {
    sortKey,
    sortDirection,
    sortedItems,
    toggleSort,
    reset
  }
}
