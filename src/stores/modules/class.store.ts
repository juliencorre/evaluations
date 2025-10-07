import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Class, Student, Evaluation } from '@/types/evaluation'
import { serviceContainer } from '@/services/ServiceContainer'
import { useAuthStore } from '@/stores/authStore'
import { useSchoolYearStore } from '@/stores'

const classRepository = serviceContainer.classes
const studentClassRepository = serviceContainer.studentClasses
const evaluationRepository = serviceContainer.evaluations

export const useClassStore = defineStore('classes', () => {
  const classes = ref<Class[]>([])
  const selectedClassId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selectedClass = computed(() => {
    return selectedClassId.value
      ? classes.value.find(cls => cls.id === selectedClassId.value) ?? null
      : null
  })

  const userClasses = computed(() => classes.value)

  async function loadClasses() {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      await authStore.ensureInitialized()

      const userId = authStore.user?.id
      if (!userId) {
        classes.value = []
        return
      }

      const data = await classRepository.findByUser(userId)
      classes.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des classes'
      console.error('[ClassStore] loadClasses failed', err)
    } finally {
      loading.value = false
    }
  }

  async function ensureCurrentSchoolYear(): Promise<string | undefined> {
    const schoolYearStore = useSchoolYearStore()
    if (typeof schoolYearStore.ensureLoaded === 'function') {
      await schoolYearStore.ensureLoaded()
    }
    return schoolYearStore.currentSchoolYear?.id
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
      const currentUserId = authStore.user?.id

      if (!currentUserId) {
        throw new Error('Utilisateur non authentifié')
      }

      const schoolYearStore = useSchoolYearStore()
      if (typeof schoolYearStore.ensureLoaded === 'function') {
        await schoolYearStore.ensureLoaded()
      }
      const currentSchoolYear = schoolYearStore.currentSchoolYear?.name ?? '2024-2025'

      const created = await classRepository.create({
        name: classData.name,
        description: classData.description,
        schoolYear: classData.schoolYear || currentSchoolYear,
        level: classData.level,
        subject: classData.subject,
        active: true
      })

      await classRepository.addUser({
        userId: currentUserId,
        classId: created.id,
        role: 'teacher'
      })

      classes.value.push(created)
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la création de la classe'
      console.error('[ClassStore] createClass failed', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateClass(classId: string, updates: Partial<Class>) {
    loading.value = true
    error.value = null

    try {
      const updated = await classRepository.update(classId, {
        name: updates.name,
        description: updates.description,
        schoolYear: updates.schoolYear,
        level: updates.level,
        subject: updates.subject,
        active: updates.active
      })

      const index = classes.value.findIndex(cls => cls.id === classId)
      if (index !== -1) {
        classes.value[index] = updated
      }

      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la classe'
      console.error('[ClassStore] updateClass failed', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteClass(classId: string) {
    loading.value = true
    error.value = null

    try {
      await classRepository.delete(classId)

      classes.value = classes.value.filter(cls => cls.id !== classId)
      if (selectedClassId.value === classId) {
        selectedClassId.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression de la classe'
      console.error('[ClassStore] deleteClass failed', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function selectClass(classId: string | null) {
    selectedClassId.value = classId
    if (classId) {
      localStorage.setItem('selectedClassId', classId)
    } else {
      localStorage.removeItem('selectedClassId')
    }
  }

  async function getStudentsForSelectedClass(): Promise<Student[]> {
    if (!selectedClassId.value) return []

    try {
      const schoolYearId = await ensureCurrentSchoolYear()
      return await studentClassRepository.getStudentsForClass(
        selectedClassId.value,
        schoolYearId,
        'active'
      )
    } catch (err) {
      console.error('[ClassStore] getStudentsForSelectedClass failed', err)
      return []
    }
  }

  async function getEvaluationsForSelectedClass(): Promise<Evaluation[]> {
    if (!selectedClassId.value) return []

    try {
      const schoolYearId = await ensureCurrentSchoolYear()
      return await evaluationRepository.findByClass(selectedClassId.value, schoolYearId)
    } catch (err) {
      console.error('[ClassStore] getEvaluationsForSelectedClass failed', err)
      return []
    }
  }

  async function getStudentsForClass(classId: string, schoolYearId?: string): Promise<Student[]> {
    try {
      const resolvedSchoolYearId = schoolYearId ?? await ensureCurrentSchoolYear()
      return await studentClassRepository.getStudentsForClass(classId, resolvedSchoolYearId, 'active')
    } catch (err) {
      console.error('[ClassStore] getStudentsForClass failed', err)
      return []
    }
  }

  async function getEvaluationsForClass(classId: string, schoolYearId?: string): Promise<Evaluation[]> {
    try {
      const resolvedSchoolYearId = schoolYearId ?? await ensureCurrentSchoolYear()
      return await evaluationRepository.findByClass(classId, resolvedSchoolYearId)
    } catch (err) {
      console.error('[ClassStore] getEvaluationsForClass failed', err)
      return []
    }
  }

  function initialize() {
    const savedClassId = localStorage.getItem('selectedClassId')
    if (savedClassId) {
      selectedClassId.value = savedClassId
    }
    void loadClasses()
  }

  function getClassById(classId: string): Class | undefined {
    return classes.value.find(cls => cls.id === classId)
  }

  async function enrollStudentInClass(studentId: string, classId: string, schoolYearId?: string) {
    try {
      return await studentClassRepository.enrollStudent({
        studentId,
        classId,
        schoolYearId,
        status: 'active'
      })
    } catch (err) {
      console.error('[ClassStore] enrollStudentInClass failed', err)
      throw err
    }
  }

  async function unenrollStudentFromClass(
    studentId: string,
    classId: string,
    status: 'transferred' | 'graduated' | 'dropped' = 'transferred',
    schoolYearId?: string
  ) {
    try {
      return await studentClassRepository.removeEnrollment(studentId, classId, status, schoolYearId)
    } catch (err) {
      console.error('[ClassStore] unenrollStudentFromClass failed', err)
      throw err
    }
  }

  async function transferStudent(
    studentId: string,
    fromClassId: string,
    toClassId: string,
    schoolYearId?: string
  ) {
    try {
      return await studentClassRepository.transferStudent({
        studentId,
        fromClassId,
        toClassId,
        schoolYearId
      })
    } catch (err) {
      console.error('[ClassStore] transferStudent failed', err)
      throw err
    }
  }

  async function getClassStatistics(classId: string, schoolYearId?: string) {
    try {
      return await studentClassRepository.getStatistics(classId, schoolYearId)
    } catch (err) {
      console.error('[ClassStore] getClassStatistics failed', err)
      return {
        total: 0,
        active: 0,
        transferred: 0,
        graduated: 0,
        dropped: 0
      }
    }
  }

  async function getClassTeachers(classId: string) {
    try {
      return await classRepository.getTeachers(classId)
    } catch (err) {
      console.error('[ClassStore] getClassTeachers failed', err)
      return []
    }
  }

  async function addTeacherToClass(classId: string, email: string, role: 'teacher' | 'owner' | 'assistant' = 'teacher') {
    try {
      return await classRepository.addUserByEmail({
        email,
        classId,
        role
      })
    } catch (err) {
      console.error('[ClassStore] addTeacherToClass failed', err)
      throw err
    }
  }

  async function removeTeacherFromClass(classId: string, userId: string) {
    try {
      return await classRepository.removeUser(userId, classId)
    } catch (err) {
      console.error('[ClassStore] removeTeacherFromClass failed', err)
      throw err
    }
  }

  return {
    classes,
    selectedClassId,
    loading,
    error,
    selectedClass,
    userClasses,
    loadClasses,
    createClass,
    updateClass,
    deleteClass,
    selectClass,
    getStudentsForSelectedClass,
    getEvaluationsForSelectedClass,
    getStudentsForClass,
    getEvaluationsForClass,
    getClassById,
    enrollStudentInClass,
    unenrollStudentFromClass,
    transferStudent,
    getClassStatistics,
    getClassTeachers,
    addTeacherToClass,
    removeTeacherFromClass,
    initialize
  }
})

