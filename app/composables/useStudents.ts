/**
 * Student Management Composable
 * Provides reactive state management and operations for students
 */

import type { 
  Student, 
  StudentWithDetails,
  CreateStudentForm, 
  StudentFilter 
} from '~/types/database'

export const useStudents = () => {
  const db = useDatabase()

  // Reactive state
  const students = ref<StudentWithDetails[]>([])
  const selectedStudent = ref<StudentWithDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const filters = ref<StudentFilter>({
    search: '',
    class_id: undefined,
    active_only: true
  })

  // Computed values
  const filteredStudents = computed(() => {
    let result = students.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(student => 
        student.first_name.toLowerCase().includes(search) ||
        student.last_name.toLowerCase().includes(search)
      )
    }

    if (filters.value.class_id) {
      result = result.filter(student => 
        student.enrolments?.some(enr => enr.class_id === filters.value.class_id)
      )
    }

    return result.sort((a, b) => 
      `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
    )
  })

  const studentsCount = computed(() => filteredStudents.value.length)

  // Actions
  const fetchStudents = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await db.students.getAll(filters.value)
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      students.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des élèves'
      console.error('Error fetching students:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchStudentById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.students.getById(id)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      selectedStudent.value = response.data
      return response.data
    } catch (err) {
      error.value = 'Erreur lors du chargement de l\'élève'
      console.error('Error fetching student:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createStudent = async (studentData: CreateStudentForm) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.students.create(studentData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      // Add to local state
      students.value.push(response.data)
      
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création de l\'élève'
      console.error('Error creating student:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateStudent = async (id: string, studentData: Partial<CreateStudentForm>) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.students.update(id, studentData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      // Update local state
      const index = students.value.findIndex(s => s.student_id === id)
      if (index !== -1) {
        students.value[index] = { ...students.value[index], ...response.data }
      }

      // Update selected student if it's the one being updated
      if (selectedStudent.value?.student_id === id) {
        selectedStudent.value = { ...selectedStudent.value, ...response.data }
      }
      
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la modification de l\'élève'
      console.error('Error updating student:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteStudent = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.students.delete(id)
      
      if (response.error) {
        error.value = response.error.message
        return false
      }

      // Remove from local state
      students.value = students.value.filter(s => s.student_id !== id)
      
      // Clear selected student if it's the one being deleted
      if (selectedStudent.value?.student_id === id) {
        selectedStudent.value = null
      }
      
      return true
    } catch (err) {
      error.value = 'Erreur lors de la suppression de l\'élève'
      console.error('Error deleting student:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const enrollStudentInClass = async (studentId: string, classId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.students.enrollInClass(studentId, classId)
      
      if (response.error) {
        error.value = response.error.message
        return false
      }

      // Refresh student data to get updated class information
      await fetchStudentById(studentId)
      
      return true
    } catch (err) {
      error.value = 'Erreur lors de l\'inscription de l\'élève'
      console.error('Error enrolling student:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Search and filter methods
  const setSearchFilter = (search: string) => {
    filters.value.search = search
  }

  const setClassFilter = (classId: string | undefined) => {
    filters.value.class_id = classId
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      class_id: undefined,
      active_only: true
    }
  }

  // Utility methods
  const getStudentFullName = (student: Student) => {
    return `${student.first_name} ${student.last_name}`
  }

  const getStudentAge = (student: Student) => {
    if (!student.birth_date) return null
    
    const birthDate = new Date(student.birth_date)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getStudentCurrentClass = (student: StudentWithDetails) => {
    // Return the current class if available
    if (student.current_class) return student.current_class
    
    // Otherwise find the most recent enrollment
    if (!student.enrolments || student.enrolments.length === 0) return null
    
    // Sort by enrollment date and return the most recent
    const sortedEnrolments = [...student.enrolments].sort((a, b) => 
      new Date(b.enrolled_at || 0).getTime() - new Date(a.enrolled_at || 0).getTime()
    )
    
    return sortedEnrolments[0]?.class
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Initialize
  const initialize = async () => {
    await fetchStudents()
  }

  return {
    // State
    students: readonly(students),
    selectedStudent: readonly(selectedStudent),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),

    // Computed
    filteredStudents,
    studentsCount,

    // Actions
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    enrollStudentInClass,

    // Filters
    setSearchFilter,
    setClassFilter,
    clearFilters,

    // Utilities
    getStudentFullName,
    getStudentAge,
    getStudentCurrentClass,
    clearError,
    initialize
  }
}