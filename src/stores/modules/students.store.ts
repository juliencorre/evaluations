import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Student } from '@/types/evaluation'
import { serviceContainer } from '@/services/ServiceContainer'
import { useSchoolYearStore } from '@/stores'

/**
 * Students Store - Pinia
 * Phase 4.3: Store/Module/Repository Pattern
 *
 * Manages student data and operations through the Repository pattern.
 * Uses ServiceContainer for dependency injection of StudentRepository.
 *
 * @example
 * ```typescript
 * const studentsStore = useStudentsStore()
 *
 * // Load all students
 * await studentsStore.loadStudents()
 *
 * // Get active students
 * const active = studentsStore.activeStudents
 *
 * // Create new student
 * await studentsStore.createStudent({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   gender: 'M'
 * })
 * ```
 *
 * @remarks
 * - All state is reactive via Vue 3 refs
 * - Computed properties return unwrapped values (no .value needed)
 * - Repository operations are async and handle errors internally
 */
export const useStudentsStore = defineStore('students', () => {
  // ==================== REPOSITORIES ====================
  const studentsRepository = serviceContainer.students
  const studentClassesRepository = serviceContainer.studentClasses

  // ==================== STATE ====================
  const students = ref<Student[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const useSupabase = ref(true) // Flag pour activer/désactiver Supabase

  // ==================== GETTERS ====================
  const allStudents = computed(() => students.value)
  const studentCount = computed(() => students.value.length)

  /**
   * Filtre les élèves actifs pour l'année scolaire courante
   * Vérifie les inscriptions actives via la table student_classes
   */
  const activeStudents = computed(() => {
    const schoolYearStore = useSchoolYearStore()
    const currentSchoolYear = schoolYearStore.currentSchoolYear

    if (!currentSchoolYear) {
      // Si pas d'année scolaire courante, retourner tous les élèves
      return students.value
    }

    // Filtrer les élèves ayant une inscription active pour l'année courante
    // Note: Cette logique nécessite que les relations student_classes soient chargées
    // Pour l'instant, on retourne tous les élèves (à améliorer avec chargement des relations)
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
      const supabaseStudents = await studentsRepository.findAll()
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
      const newStudent = await studentsRepository.create({
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        gender: studentData.gender ?? null,
        birthDate: studentData.birthDate ?? null
      })
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
      const updatedStudent = await studentsRepository.update(studentId, updates)
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
      await studentsRepository.delete(studentId)
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
        schoolYearId = schoolYearStore.currentSchoolYear?.id
      }

      return await studentClassesRepository.getClassesForStudent(
        studentId,
        schoolYearId
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
      return await studentClassesRepository.enrollStudent({
        studentId,
        classId,
        schoolYearId,
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
      return await studentClassesRepository.removeEnrollment(
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
      return await studentClassesRepository.transferStudent({
        studentId,
        fromClassId,
        toClassId,
        schoolYearId
      })
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
        schoolYearId = schoolYearStore.currentSchoolYear?.id
      }

      return await studentClassesRepository.getStudentsForClass(
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
