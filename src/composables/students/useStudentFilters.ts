import { ref, computed, type Ref } from 'vue'
import type { Student } from '@/types/student'

export interface StudentFilters {
  classId?: string
  gender?: string
  status?: 'active' | 'dropped' | 'all'
}

/**
 * Composable pour le filtrage d'étudiants
 */
export function useStudentFilters(students: Ref<Student[]>) {
  const filters = ref<StudentFilters>({
    status: 'active'
  })

  const filteredStudents = computed(() => {
    return students.value.filter(student => {
      // Filtre par classe
      if (filters.value.classId && student.classId !== filters.value.classId) {
        return false
      }

      // Filtre par genre
      if (filters.value.gender && student.gender !== filters.value.gender) {
        return false
      }

      // Filtre par statut
      if (filters.value.status === 'active' && student.status === 'dropped') {
        return false
      }
      if (filters.value.status === 'dropped' && student.status !== 'dropped') {
        return false
      }

      return true
    })
  })

  const setClassFilter = (classId: string | undefined) => {
    filters.value.classId = classId
  }

  const setGenderFilter = (gender: string | undefined) => {
    filters.value.gender = gender
  }

  const setStatusFilter = (status: 'active' | 'dropped' | 'all') => {
    filters.value.status = status
  }

  const reset = () => {
    filters.value = {
      status: 'active'
    }
  }

  return {
    filters,
    filteredStudents,
    setClassFilter,
    setGenderFilter,
    setStatusFilter,
    reset
  }
}
