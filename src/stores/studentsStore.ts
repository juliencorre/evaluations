import { ref, computed } from 'vue'
import type { Student } from '@/types/evaluation'
import { STUDENTS } from '@/data/staticData'

// Store réactif global pour les élèves
const students = ref<Student[]>([...STUDENTS])

// Actions pour manipuler les élèves
export const useStudentsStore = () => {
  
  // Getters
  const allStudents = computed(() => students.value)
  const studentCount = computed(() => students.value.length)
  
  // Utility function to generate displayName
  const generateDisplayName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName.charAt(0)}.`
  }
  
  // Actions
  const addStudent = (studentData: { firstName: string; lastName: string }) => {
    const newId = `STU${String(students.value.length + 1).padStart(3, '0')}`
    const newStudent: Student = {
      id: newId,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      displayName: generateDisplayName(studentData.firstName, studentData.lastName)
    }
    students.value.push(newStudent)
    return newStudent
  }
  
  const updateStudent = (studentId: string, updates: { firstName?: string; lastName?: string }) => {
    const index = students.value.findIndex(s => s.id === studentId)
    if (index !== -1) {
      const updatedStudent = {
        ...students.value[index],
        ...updates
      }
      // Regenerate displayName if firstName or lastName changed
      if (updates.firstName || updates.lastName) {
        updatedStudent.displayName = generateDisplayName(
          updatedStudent.firstName,
          updatedStudent.lastName
        )
      }
      students.value[index] = updatedStudent
      return updatedStudent
    }
    return null
  }
  
  const deleteStudent = (studentId: string) => {
    const index = students.value.findIndex(s => s.id === studentId)
    if (index !== -1) {
      const deletedStudent = students.value[index]
      students.value.splice(index, 1)
      return deletedStudent
    }
    return null
  }
  
  const getStudentById = (studentId: string) => {
    return students.value.find(s => s.id === studentId) || null
  }
  
  const resetStudents = () => {
    students.value = [...STUDENTS]
  }
  
  return {
    // Getters
    allStudents,
    studentCount,
    
    // Actions
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    resetStudents
  }
}