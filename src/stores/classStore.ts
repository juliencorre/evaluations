import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Class, Student, Evaluation } from '@/types/evaluation'
import { supabaseClassesService } from '@/services/supabaseClassesService'
import { supabaseEvaluationsService } from '@/services/supabaseEvaluationsService'
import { supabaseStudentClassesService } from '@/services/supabaseStudentClassesService'
import { useSchoolYearStore } from '@/stores/schoolYearStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export const useClassStore = defineStore('classes', () => {
  // State
  const classes = ref<Class[]>([])
  const selectedClassId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const selectedClass = computed(() => {
    return selectedClassId.value
      ? classes.value.find(c => c.id === selectedClassId.value)
      : null
  })

  const userClasses = computed(() => {
    // Return only the classes that belong to the current user (loaded via user_classes)
    return classes.value
  })

  // Actions
  async function loadClasses() {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      await authStore.ensureInitialized()

      const currentUserId = authStore.user.value?.id

      if (currentUserId) {
        // Load only classes that belong to the current user via user_classes
        classes.value = await supabaseClassesService.getClassesForUser(currentUserId)
      } else {
        // If no user is authenticated, clear classes
        classes.value = []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des classes'
      console.error('Error loading classes:', err)
    } finally {
      loading.value = false
    }
  }

  async function createClass(classData: {
    name: string
    description?: string
    schoolYear?: string
    level?: string
    subject?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      await authStore.ensureInitialized()

      const currentUserId = authStore.user.value?.id
      if (!currentUserId) {
        throw new Error('Utilisateur non authentifié')
      }

      const schoolYearStore = useSchoolYearStore()
      await schoolYearStore.ensureLoaded()

      const currentSchoolYear = schoolYearStore.currentSchoolYear
      const schoolYearName = classData.schoolYear || currentSchoolYear.value?.name || '2024-2025'

      // Create the class
      const newClass = await supabaseClassesService.createClass({
        name: classData.name,
        description: classData.description,
        school_year: schoolYearName,
        level: classData.level,
        subject: classData.subject
      })

      // Associate the current user with the new class as a teacher
      await supabaseClassesService.addUserToClass(currentUserId, newClass.id, 'teacher')

      classes.value.push(newClass)
      return newClass
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la création de la classe'
      console.error('Error creating class:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateClass(classId: string, updates: Partial<Class>) {
    loading.value = true
    error.value = null

    try {
      const updatedClass = await supabaseClassesService.updateClass(classId, {
        name: updates.name,
        description: updates.description,
        school_year: updates.schoolYear,
        level: updates.level,
        subject: updates.subject,
        active: updates.active
      })

      const index = classes.value.findIndex(c => c.id === classId)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }

      return updatedClass
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la classe'
      console.error('Error updating class:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteClass(classId: string) {
    loading.value = true
    error.value = null

    try {
      await supabaseClassesService.deleteClass(classId)

      const index = classes.value.findIndex(c => c.id === classId)
      if (index !== -1) {
        classes.value.splice(index, 1)
      }

      // If the deleted class was selected, clear selection
      if (selectedClassId.value === classId) {
        selectedClassId.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression de la classe'
      console.error('Error deleting class:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function selectClass(classId: string | null) {
    selectedClassId.value = classId
    // Store selection in localStorage for persistence
    if (classId) {
      localStorage.setItem('selectedClassId', classId)
    } else {
      localStorage.removeItem('selectedClassId')
    }
  }


  // Helper methods to get class-specific data
  async function getStudentsForSelectedClass(): Promise<Student[]> {
    if (!selectedClassId.value) return []

    try {
      const schoolYearStore = useSchoolYearStore()
      await schoolYearStore.ensureLoaded()
      const currentSchoolYear = schoolYearStore.currentSchoolYear

      return await supabaseStudentClassesService.getStudentsForClass(
        selectedClassId.value,
        currentSchoolYear.value?.id,
        'active'
      )
    } catch (err) {
      console.error('Error loading students for class:', err)
      return []
    }
  }

  async function getEvaluationsForSelectedClass(): Promise<Evaluation[]> {
    if (!selectedClassId.value) return []

    try {
      // Obtenir l'année scolaire courante depuis le store
      const { useSchoolYearStore } = await import('@/stores/schoolYearStore')
      const schoolYearStore = useSchoolYearStore()
      await schoolYearStore.ensureLoaded()
      const currentSchoolYear = schoolYearStore.currentSchoolYear

      return await supabaseEvaluationsService.getEvaluationsByClass(
        selectedClassId.value,
        currentSchoolYear.value?.id
      )
    } catch (err) {
      console.error('Error loading evaluations for class:', err)
      return []
    }
  }

  async function getStudentsForClass(classId: string, schoolYearId?: string): Promise<Student[]> {
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
      console.error('Error loading students for class:', err)
      return []
    }
  }

  async function getEvaluationsForClass(classId: string, schoolYearId?: string): Promise<Evaluation[]> {
    try {
      // Si pas d'année scolaire fournie, utiliser l'année courante
      let effectiveSchoolYearId = schoolYearId
      if (!effectiveSchoolYearId) {
        const { useSchoolYearStore } = await import('@/stores/schoolYearStore')
        const schoolYearStore = useSchoolYearStore()
        await schoolYearStore.ensureLoaded()
        effectiveSchoolYearId = schoolYearStore.currentSchoolYear.value?.id
      }

      return await supabaseEvaluationsService.getEvaluationsByClass(classId, effectiveSchoolYearId)
    } catch (err) {
      console.error('Error loading evaluations for class:', err)
      return []
    }
  }

  // Initialize store
  function initialize() {
    // Restore selected class from localStorage
    const savedClassId = localStorage.getItem('selectedClassId')
    if (savedClassId) {
      selectedClassId.value = savedClassId
    }

    // Load classes
    loadClasses()
  }

  function getClassById(classId: string): Class | undefined {
    return classes.value.find(c => c.id === classId)
  }

  // Public API
  return {
    // State
    classes,
    selectedClassId,
    loading,
    error,

    // Computed
    selectedClass,
    userClasses,

    // Actions
    loadClasses,
    createClass,
    updateClass,
    deleteClass,
    selectClass,
    getStudentsForSelectedClass,
    getEvaluationsForSelectedClass,
    getStudentsForClass,
    getClassById,

    // Student management methods
    async enrollStudentInClass(studentId: string, classId: string, schoolYearId?: string) {
      try {
        return await supabaseStudentClassesService.enrollStudentInClass({
          student_id: studentId,
          class_id: classId,
          school_year_id: schoolYearId,
          status: 'active'
        })
      } catch (err) {
        console.error('Error enrolling student:', err)
        throw err
      }
    },

    async unenrollStudentFromClass(studentId: string, classId: string, status: 'transferred' | 'graduated' | 'dropped' = 'transferred', schoolYearId?: string) {
      try {
        return await supabaseStudentClassesService.unenrollStudentFromClass(
          studentId,
          classId,
          status,
          schoolYearId
        )
      } catch (err) {
        console.error('Error unenrolling student:', err)
        throw err
      }
    },

    async transferStudent(studentId: string, fromClassId: string, toClassId: string, schoolYearId?: string) {
      try {
        return await supabaseStudentClassesService.transferStudent(
          studentId,
          fromClassId,
          toClassId,
          schoolYearId
        )
      } catch (err) {
        console.error('Error transferring student:', err)
        throw err
      }
    },

    async getClassStatistics(classId: string, schoolYearId?: string) {
      try {
        return await supabaseStudentClassesService.getClassStatistics(classId, schoolYearId)
      } catch (err) {
        console.error('Error getting class statistics:', err)
        return {
          total: 0,
          active: 0,
          transferred: 0,
          graduated: 0,
          dropped: 0
        }
      }
    },
    getEvaluationsForClass,

    async getClassTeachers(classId: string) {
      try {
        return await supabaseClassesService.getClassTeachers(classId)
      } catch (err) {
        console.error('Error getting class teachers:', err)
        return []
      }
    },

    async addTeacherToClass(classId: string, email: string, role: string = 'teacher') {
      try {
        // First, find the user by email using auth admin API
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

        if (userError) {
          throw new Error('Erreur lors de la récupération des utilisateurs')
        }

        const user = users?.find(u => u.email === email)
        if (!user) {
          throw new Error('Utilisateur non trouvé avec cet email')
        }

        return await supabaseClassesService.addUserToClass(user.id, classId, role)
      } catch (err) {
        console.error('Error adding teacher to class:', err)
        throw err
      }
    },

    async removeTeacherFromClass(classId: string, userId: string) {
      try {
        return await supabaseClassesService.removeUserFromClass(userId, classId)
      } catch (err) {
        console.error('Error removing teacher from class:', err)
        throw err
      }
    },

    initialize
  }
})