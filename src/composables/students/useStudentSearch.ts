import { ref, computed, type Ref } from 'vue'
import type { Student } from '@/types/student'

/**
 * Composable pour la recherche d'étudiants
 */
export function useStudentSearch(students: Ref<Student[]>) {
  const searchQuery = ref('')

  const filteredStudents = computed(() => {
    if (!searchQuery.value.trim()) {
      return students.value
    }

    const query = searchQuery.value.toLowerCase().trim()

    return students.value.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
      const reverseName = `${student.lastName} ${student.firstName}`.toLowerCase()

      return (
        fullName.includes(query) ||
        reverseName.includes(query) ||
        student.firstName?.toLowerCase().includes(query) ||
        student.lastName?.toLowerCase().includes(query)
      )
    })
  })

  const reset = () => {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    filteredStudents,
    reset
  }
}
