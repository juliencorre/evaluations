/**
 * Class Management Composable
 * Provides reactive state management for classes
 */

import type { 
  Class,
  ClassWithDetails,
  ClassTeacher,
  Student,
  SchoolYear,
  School,
  Teacher,
  CreateClassForm,
  ApiResponse
} from '~/types/database'


export interface ClassFilter {
  school_year_id?: string
  school_id?: string
  search?: string
  teacher_id?: string
}

export const useClasses = () => {
  const db = useDatabase()
  const supabase = useSupabase()

  // Reactive state
  const classes = ref<ClassWithDetails[]>([])
  const selectedClass = ref<ClassWithDetails | null>(null)
  const schoolYears = ref<SchoolYear[]>([])
  const schools = ref<School[]>([])
  const teachers = ref<Teacher[]>([])
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const filters = ref<ClassFilter>({
    search: '',
    school_year_id: undefined,
    school_id: undefined,
    teacher_id: undefined
  })

  // Computed values
  const filteredClasses = computed(() => {
    let result = classes.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(cls => 
        cls.label.toLowerCase().includes(search) ||
        cls.level?.toLowerCase().includes(search) ||
        cls.primary_teacher?.first_name?.toLowerCase().includes(search) ||
        cls.primary_teacher?.last_name?.toLowerCase().includes(search)
      )
    }

    if (filters.value.school_year_id) {
      result = result.filter(cls => cls.school_year_id === filters.value.school_year_id)
    }

    if (filters.value.school_id) {
      result = result.filter(cls => cls.school_id === filters.value.school_id)
    }

    if (filters.value.teacher_id) {
      result = result.filter(cls => 
        cls.primary_teacher_id === filters.value.teacher_id ||
        cls.teachers?.some(ct => ct.teacher_id === filters.value.teacher_id)
      )
    }

    return result.sort((a, b) => {
      // Sort by school year (most recent first), then by label
      const yearCompare = b.school_year.starts_on.localeCompare(a.school_year.starts_on)
      if (yearCompare !== 0) return yearCompare
      return a.label.localeCompare(b.label)
    })
  })

  const classesCount = computed(() => filteredClasses.value.length)

  const currentYearClasses = computed(() => {
    const currentYear = new Date().getFullYear()
    return classes.value.filter(cls => {
      const yearLabel = cls.school_year.label
      return yearLabel.includes(currentYear.toString()) || 
             yearLabel.includes((currentYear + 1).toString())
    })
  })

  // Actions
  const fetchClasses = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('class')
        .select(`
          *,
          school:school(*),
          school_year:school_year(*),
          primary_teacher:teacher!primary_teacher_id(*),
          teachers:class_teacher(
            *,
            teacher:teacher(*)
          ),
          students:enrolment(
            enrolled_at,
            student:student(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      // Transform data to include student count
      classes.value = (data || []).map(cls => ({
        ...cls,
        student_count: cls.students?.length || 0,
        students: cls.students?.map(enr => ({
          ...enr.student,
          enrolment_date: enr.enrolled_at
        })) || []
      }))

    } catch (err) {
      error.value = 'Erreur lors du chargement des classes'
      console.error('Error fetching classes:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchClassById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('class')
        .select(`
          *,
          school:school(*),
          school_year:school_year(*),
          primary_teacher:teacher!primary_teacher_id(*),
          teachers:class_teacher(
            *,
            teacher:teacher(*)
          ),
          students:enrolment(
            *,
            student:student(*)
          )
        `)
        .eq('class_id', id)
        .single()

      if (fetchError) {
        error.value = fetchError.message
        return null
      }

      const classWithDetails = {
        ...data,
        student_count: data.students?.length || 0,
        students: data.students?.map(enr => ({
          ...enr.student,
          enrolment_date: enr.enrolled_at
        })) || []
      }

      selectedClass.value = classWithDetails
      return classWithDetails

    } catch (err) {
      error.value = 'Erreur lors du chargement de la classe'
      console.error('Error fetching class:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createClass = async (classData: CreateClassForm & { primary_teacher_id?: string }) => {
    loading.value = true
    error.value = null

    try {
      // Get current teacher ID if not provided
      const teacherId = classData.primary_teacher_id || await getCurrentTeacherId()
      
      if (!teacherId) {
        error.value = 'Impossible de déterminer l\'enseignant actuel'
        return null
      }

      const { data, error: createError } = await supabase
        .from('class')
        .insert({
          school_id: classData.school_id || null,
          school_year_id: classData.school_year_id,
          label: classData.label,
          level: classData.level || null,
          primary_teacher_id: teacherId
        })
        .select()
        .single()

      if (createError) {
        error.value = createError.message
        return null
      }

      // Add to local state
      await fetchClasses() // Refresh to get full data with relations
      
      return data
    } catch (err) {
      error.value = 'Erreur lors de la création de la classe'
      console.error('Error creating class:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateClass = async (id: string, classData: Partial<CreateClassForm>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('class')
        .update({
          school_id: classData.school_id || null,
          school_year_id: classData.school_year_id,
          label: classData.label,
          level: classData.level || null
        })
        .eq('class_id', id)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      // Update local state
      await fetchClasses() // Refresh to get updated data
      
      return data
    } catch (err) {
      error.value = 'Erreur lors de la modification de la classe'
      console.error('Error updating class:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteClass = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('class')
        .delete()
        .eq('class_id', id)

      if (deleteError) {
        error.value = deleteError.message
        return false
      }

      // Remove from local state
      classes.value = classes.value.filter(cls => cls.class_id !== id)
      
      // Clear selected class if it's the one being deleted
      if (selectedClass.value?.class_id === id) {
        selectedClass.value = null
      }
      
      return true
    } catch (err) {
      error.value = 'Erreur lors de la suppression de la classe'
      console.error('Error deleting class:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Helper functions
  const getCurrentTeacherId = async (): Promise<string | null> => {
    try {
      // Direct approach: get teacher ID from teacher table using auth user
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        console.error('No authenticated user found')
        return null
      }
      
      const { data: teacherData, error: teacherError } = await supabase
        .from('teacher')
        .select('teacher_id')
        .eq('user_id', user.user.id)
        .single()
        
      if (teacherError) {
        console.error('Error getting teacher by user_id:', teacherError)
        
        // If teacher doesn't exist, create one using RPC function
        try {
          const { data: teacherId, error: createError } = await supabase
            .rpc('ensure_teacher', {
              p_first: user.user.user_metadata?.first_name || 'Enseignant',
              p_last: user.user.user_metadata?.last_name || 'Utilisateur'
            })
            
          if (createError) {
            console.error('Error creating teacher via RPC:', createError)
            return null
          }
          
          return teacherId
        } catch (createTeacherError) {
          console.error('Failed to create teacher:', createTeacherError)
          return null
        }
      }
      
      return teacherData?.teacher_id || null
    } catch (error) {
      console.error('Error getting current teacher ID:', error)
      return null
    }
  }

  const addStudentToClass = async (classId: string, studentId: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: enrollError } = await supabase
        .from('enrolment')
        .insert({
          student_id: studentId,
          class_id: classId,
          enrolled_at: new Date().toISOString().split('T')[0]
        })

      if (enrollError) {
        error.value = enrollError.message
        return false
      }

      // Refresh class data
      if (selectedClass.value?.class_id === classId) {
        await fetchClassById(classId)
      }
      
      return true
    } catch (err) {
      error.value = 'Erreur lors de l\'ajout de l\'élève à la classe'
      console.error('Error adding student to class:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const removeStudentFromClass = async (classId: string, studentId: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: removeError } = await supabase
        .from('enrolment')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId)

      if (removeError) {
        error.value = removeError.message
        return false
      }

      // Refresh class data
      if (selectedClass.value?.class_id === classId) {
        await fetchClassById(classId)
      }
      
      return true
    } catch (err) {
      error.value = 'Erreur lors de la suppression de l\'élève de la classe'
      console.error('Error removing student from class:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Load reference data
  const fetchSchoolYears = async () => {
    try {
      const { data } = await supabase
        .from('school_year')
        .select('*')
        .order('starts_on', { ascending: false })

      schoolYears.value = data || []
    } catch (error) {
      console.error('Error fetching school years:', error)
    }
  }

  const fetchSchools = async () => {
    try {
      const { data } = await supabase
        .from('school')
        .select('*')
        .order('name', { ascending: true })

      schools.value = data || []
    } catch (error) {
      console.error('Error fetching schools:', error)
    }
  }

  const fetchTeachers = async () => {
    try {
      const { data } = await supabase
        .from('teacher')
        .select('*')
        .eq('active', true)
        .order('last_name', { ascending: true })

      teachers.value = data || []
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  // Filter methods
  const setSearchFilter = (search: string) => {
    filters.value.search = search
  }

  const setSchoolYearFilter = (schoolYearId: string | undefined) => {
    filters.value.school_year_id = schoolYearId
  }

  const setSchoolFilter = (schoolId: string | undefined) => {
    filters.value.school_id = schoolId
  }

  const setTeacherFilter = (teacherId: string | undefined) => {
    filters.value.teacher_id = teacherId
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      school_year_id: undefined,
      school_id: undefined,
      teacher_id: undefined
    }
  }

  // Utility methods
  const getClassFullName = (cls: ClassWithDetails) => {
    const parts = [cls.label]
    if (cls.level) parts.push(`(${cls.level})`)
    if (cls.school?.name) parts.push(`- ${cls.school.name}`)
    return parts.join(' ')
  }

  const getTeacherFullName = (teacher: Teacher) => {
    return `${teacher.first_name} ${teacher.last_name}`
  }

  const formatSchoolYear = (schoolYear: SchoolYear) => {
    return `${schoolYear.label} (${new Date(schoolYear.starts_on).getFullYear()}-${new Date(schoolYear.ends_on).getFullYear()})`
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Initialize
  const initialize = async () => {
    await Promise.all([
      fetchClasses(),
      fetchSchoolYears(),
      fetchSchools(),
      fetchTeachers()
    ])
  }

  return {
    // State
    classes: readonly(classes),
    selectedClass: readonly(selectedClass),
    schoolYears: readonly(schoolYears),
    schools: readonly(schools),
    teachers: readonly(teachers),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),

    // Computed
    filteredClasses,
    classesCount,
    currentYearClasses,

    // Actions
    fetchClasses,
    fetchClassById,
    createClass,
    updateClass,
    deleteClass,
    addStudentToClass,
    removeStudentFromClass,
    fetchSchoolYears,
    fetchSchools,
    fetchTeachers,

    // Filters
    setSearchFilter,
    setSchoolYearFilter,
    setSchoolFilter,
    setTeacherFilter,
    clearFilters,

    // Utilities
    getClassFullName,
    getTeacherFullName,
    formatSchoolYear,
    clearError,
    initialize
  }
}