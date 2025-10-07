import { ref, computed, type Ref } from 'vue'

/**
 * Composable pour la pagination de listes
 */
export function usePagination<T>(items: Ref<T[]>, itemsPerPage = 10) {
  const currentPage = ref(1)
  const pageSize = ref(itemsPerPage)

  const totalPages = computed(() =>
    Math.ceil(items.value.length / pageSize.value)
  )

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return items.value.slice(start, end)
  })

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPreviousPage = computed(() => currentPage.value > 1)

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const previousPage = () => {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const reset = () => {
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    reset
  }
}
