import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Student } from '@/types/evaluation'
import { supabaseStudentsService } from '@/services/supabaseStudentsService'
import { supabaseStudentClassesService } from '@/services/supabaseStudentClassesService'
import { useSchoolYearStore } from '@/stores/schoolYearStore'

/**
 * Store Pinia pour la gestion des élèves
 * Gère les opérations CRUD et les relations avec les classes
 */
export const useStudentsStore = defineStore('students', () => {
  // ==================== STATE ====================
  const students = ref<Student[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const useSupabase = ref(true) // Flag pour activer/désactiver Supabase

  // ==================== GETTERS ====================
  const allStudents = computed(() => students.value)
  const studentCount = computed(() => students.value.length)

  /**
   * Filtre les élèves actifs
   * TODO: Filtrer basé sur les inscriptions actives de l'année scolaire courante
   */
  const activeStudents = computed(() => {
    return students.value
  })

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Génère le nom d'affichage d'un élève
   */
  function generateDisplayName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName.charAt(0)}.`
  }

  // ==================== ACTIONS ====================

  /**
   * Charger tous les élèves depuis Supabase
   */
  async function loadStudents() {
    if (!useSupabase.value) {
      console.warn('[StudentsStore] Supabase is disabled, no students loaded')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const supabaseStudents = await supabaseStudentsService.getAllStudents()
      students.value = supabaseStudents
    } catch (err) {
      console.error('[StudentsStore] Error loading students from Supabase:', err)
      error.value =
        'Impossible de charger les élèves depuis la base de données. Veuillez vérifier votre connexion.'
      useSupabase.value = false
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Rafraîchir les élèves depuis Supabase
   */
  async function refreshFromSupabase() {
    await loadStudents()
  }

  /**
   * Réinitialiser la liste des élèves
   */
  function resetStudents() {
    students.value = []
    error.value = null
    console.log('[StudentsStore] All students cleared. Please reload from Supabase if needed.')
  }

  /**
   * Ajouter un nouvel élève
   */
  async function addStudent(studentData: {
    firstName: string
    lastName: string
    gender?: 'M' | 'F' | 'Autre' | null
    birthDate?: string | null
  }) {
    // Si Supabase est désactivé, utiliser le mode local
    if (!useSupabase.value) {
      const newId = `STU${String(students.value.length + 1).padStart(3, '0')}`
      const newStudent: Student = {
        id: newId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        displayName: generateDisplayName(studentData.firstName, studentData.lastName),
        gender: studentData.gender,
        birthDate: studentData.birthDate
      }
      students.value.push(newStudent)
      return newStudent
    }

    // Créer l'élève dans Supabase
    try {
      const newStudent = await supabaseStudentsService.createStudent(
        studentData.firstName,
        studentData.lastName,
        studentData.gender,
        studentData.birthDate
      )
      students.value.push(newStudent)
      return newStudent
    } catch (err) {
      console.error('[StudentsStore] Error creating student in Supabase:', err)
      error.value = "Impossible de créer l'élève. Veuillez vérifier votre connexion."
      useSupabase.value = false
      throw err
    }
  }

  /**
   * Mettre à jour un élève
   */
  async function updateStudent(
    studentId: string,
    updates: {
      firstName?: string
      lastName?: string
      gender?: 'M' | 'F' | 'Autre' | null
      birthDate?: string | null
    }
  ) {
    // Si Supabase est désactivé, utiliser le mode local
    if (!useSupabase.value) {
      const index = students.value.findIndex((s) => s.id === studentId)
      if (index !== -1) {
        const updatedStudent = {
          ...students.value[index],
          ...updates
        }
        // Regénérer le displayName si firstName ou lastName a changé
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

    // Mettre à jour dans Supabase
    try {
      const updatedStudent = await supabaseStudentsService.updateStudent(studentId, updates)
      if (updatedStudent) {
        const index = students.value.findIndex((s) => s.id === studentId)
        if (index !== -1) {
          students.value[index] = updatedStudent
        }
        return updatedStudent
      }
      return null
    } catch (err) {
      console.error('[StudentsStore] Error updating student in Supabase:', err)
      error.value = "Impossible de mettre à jour l'élève. Veuillez vérifier votre connexion."
      useSupabase.value = false
      throw err
    }
  }

  /**
   * Supprimer un élève
   */
  async function deleteStudent(studentId: string) {
    const studentToDelete = students.value.find((s) => s.id === studentId)
    if (!studentToDelete) return null

    // Si Supabase est désactivé, utiliser le mode local
    if (!useSupabase.value) {
      students.value = students.value.filter((s) => s.id !== studentId)
      return studentToDelete
    }

    // Supprimer dans Supabase
    try {
      await supabaseStudentsService.deleteStudent(studentId)
      students.value = students.value.filter((s) => s.id !== studentId)
      return studentToDelete
    } catch (err) {
      console.error('[StudentsStore] Error deleting student in Supabase:', err)
      error.value = "Impossible de supprimer l'élève. Veuillez vérifier votre connexion."
      useSupabase.value = false
      throw err
    }
  }

  /**
   * Récupérer un élève par son ID
   */
  function getStudentById(studentId: string) {
    return students.value.find((s) => s.id === studentId) || null
  }

  // ==================== CLASS RELATIONSHIP ACTIONS ====================

  /**
   * Récupérer les classes d'un élève
   */
  async function getStudentClasses(studentId: string, schoolYearId?: string) {
    try {
      if (!schoolYearId) {
        const schoolYearStore = useSchoolYearStore()
        await schoolYearStore.ensureLoaded()
        schoolYearId = schoolYearStore.currentSchoolYear.value?.id
      }

      return await supabaseStudentClassesService.getClassesForStudent(
        studentId,
        schoolYearId,
        'active'
      )
    } catch (err) {
      console.error('[StudentsStore] Error getting student classes:', err)
      return []
    }
  }

  /**
   * Inscrire un élève dans une classe
   */
  async function enrollStudentInClass(studentId: string, classId: string, schoolYearId?: string) {
    try {
      return await supabaseStudentClassesService.enrollStudentInClass({
        student_id: studentId,
        class_id: classId,
        school_year_id: schoolYearId,
        status: 'active'
      })
    } catch (err) {
      console.error('[StudentsStore] Error enrolling student:', err)
      throw err
    }
  }

  /**
   * Désinscrire un élève d'une classe
   */
  async function unenrollStudentFromClass(
    studentId: string,
    classId: string,
    status: 'transferred' | 'graduated' | 'dropped' = 'transferred',
    schoolYearId?: string
  ) {
    try {
      return await supabaseStudentClassesService.unenrollStudentFromClass(
        studentId,
        classId,
        status,
        schoolYearId
      )
    } catch (err) {
      console.error('[StudentsStore] Error unenrolling student:', err)
      throw err
    }
  }

  /**
   * Transférer un élève d'une classe à une autre
   */
  async function transferStudentToClass(
    studentId: string,
    fromClassId: string,
    toClassId: string,
    schoolYearId?: string
  ) {
    try {
      return await supabaseStudentClassesService.transferStudent(
        studentId,
        fromClassId,
        toClassId,
        schoolYearId
      )
    } catch (err) {
      console.error('[StudentsStore] Error transferring student:', err)
      throw err
    }
  }

  /**
   * Récupérer les élèves d'une classe
   */
  async function getStudentsForClass(classId: string, schoolYearId?: string) {
    try {
      if (!schoolYearId) {
        const schoolYearStore = useSchoolYearStore()
        await schoolYearStore.ensureLoaded()
        schoolYearId = schoolYearStore.currentSchoolYear.value?.id
      }

      return await supabaseStudentClassesService.getStudentsForClass(
        classId,
        schoolYearId,
        'active'
      )
    } catch (err) {
      console.error('[StudentsStore] Error getting students for class:', err)
      return []
    }
  }

  // ==================== RETURN ====================
  return {
    // State
    students,
    isLoading,
    error,
    useSupabase,

    // Getters
    allStudents,
    activeStudents,
    studentCount,

    // Student CRUD actions
    loadStudents,
    refreshFromSupabase,
    resetStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,

    // Class relationship actions
    getStudentClasses,
    enrollStudentInClass,
    unenrollStudentFromClass,
    transferStudentToClass,
    getStudentsForClass
  }
})
