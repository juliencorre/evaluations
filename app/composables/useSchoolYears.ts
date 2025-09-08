import type { SchoolYear, CreateSchoolYearForm } from '~/types/database'

export const useSchoolYears = () => {
  const supabase = useSupabase()

  // Reactive state
  const schoolYears = ref<SchoolYear[]>([])
  const selectedSchoolYear = ref<SchoolYear | null>(null)
  const currentSchoolYear = ref<SchoolYear | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Search and filters
  const searchQuery = ref('')
  const statusFilter = ref<'all' | 'current' | 'past' | 'future'>('all')

  // Computed properties
  const filteredSchoolYears = computed(() => {
    let filtered = schoolYears.value

    // Apply search filter
    if (searchQuery.value) {
      const search = searchQuery.value.toLowerCase()
      filtered = filtered.filter(year => 
        year.label.toLowerCase().includes(search)
      )
    }

    // Apply status filter
    const now = new Date()
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(year => {
        const starts = new Date(year.starts_on)
        const ends = new Date(year.ends_on)

        switch (statusFilter.value) {
          case 'current':
            return starts <= now && now <= ends
          case 'past':
            return ends < now
          case 'future':
            return starts > now
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => new Date(b.starts_on).getTime() - new Date(a.starts_on).getTime())
  })

  const schoolYearsCount = computed(() => filteredSchoolYears.value.length)
  const totalSchoolYearsCount = computed(() => schoolYears.value.length)

  // Methods
  const fetchSchoolYears = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('school_year')
        .select('*')
        .order('starts_on', { ascending: false })

      if (fetchError) throw fetchError

      schoolYears.value = data || []

      // Set current school year
      const now = new Date()
      currentSchoolYear.value = schoolYears.value.find(year => {
        const starts = new Date(year.starts_on)
        const ends = new Date(year.ends_on)
        return starts <= now && now <= ends
      }) || null

    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des années scolaires'
      console.error('Error fetching school years:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchSchoolYearById = async (schoolYearId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('school_year')
        .select(`
          *,
          class(
            class_id,
            label,
            level,
            school:school_id(name, city),
            student_count:student_enrolment(count)
          )
        `)
        .eq('school_year_id', schoolYearId)
        .single()

      if (fetchError) throw fetchError

      selectedSchoolYear.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de l\'année scolaire'
      console.error('Error fetching school year:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createSchoolYear = async (schoolYearData: CreateSchoolYearForm) => {
    loading.value = true
    error.value = null

    try {
      // Validate dates
      const startsOn = new Date(schoolYearData.starts_on)
      const endsOn = new Date(schoolYearData.ends_on)

      if (startsOn >= endsOn) {
        throw new Error('La date de fin doit être postérieure à la date de début')
      }

      // Check for overlapping years
      const { data: existingYears } = await supabase
        .from('school_year')
        .select('school_year_id, label, starts_on, ends_on')
        .or(`starts_on.lte.${schoolYearData.ends_on},ends_on.gte.${schoolYearData.starts_on}`)

      if (existingYears && existingYears.length > 0) {
        const overlapping = existingYears[0]
        throw new Error(`Cette période chevauche avec l'année scolaire "${overlapping.label}"`)
      }

      const { data, error: createError } = await supabase
        .from('school_year')
        .insert({
          label: schoolYearData.label.trim(),
          starts_on: schoolYearData.starts_on,
          ends_on: schoolYearData.ends_on
        })
        .select()
        .single()

      if (createError) throw createError

      // Add to local state
      schoolYears.value.unshift(data)

      // Update current school year if this is the current period
      const now = new Date()
      if (startsOn <= now && now <= endsOn) {
        currentSchoolYear.value = data
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de l\'année scolaire'
      console.error('Error creating school year:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSchoolYear = async (schoolYearId: string, schoolYearData: Partial<CreateSchoolYearForm>) => {
    loading.value = true
    error.value = null

    try {
      const updateData: any = {}
      if (schoolYearData.label !== undefined) updateData.label = schoolYearData.label.trim()
      if (schoolYearData.starts_on !== undefined) updateData.starts_on = schoolYearData.starts_on
      if (schoolYearData.ends_on !== undefined) updateData.ends_on = schoolYearData.ends_on

      // Validate dates if both are provided
      if (updateData.starts_on && updateData.ends_on) {
        const startsOn = new Date(updateData.starts_on)
        const endsOn = new Date(updateData.ends_on)

        if (startsOn >= endsOn) {
          throw new Error('La date de fin doit être postérieure à la date de début')
        }

        // Check for overlapping years (excluding current year)
        const { data: existingYears } = await supabase
          .from('school_year')
          .select('school_year_id, label, starts_on, ends_on')
          .neq('school_year_id', schoolYearId)
          .or(`starts_on.lte.${updateData.ends_on},ends_on.gte.${updateData.starts_on}`)

        if (existingYears && existingYears.length > 0) {
          const overlapping = existingYears[0]
          throw new Error(`Cette période chevauche avec l'année scolaire "${overlapping.label}"`)
        }
      }

      const { data, error: updateError } = await supabase
        .from('school_year')
        .update(updateData)
        .eq('school_year_id', schoolYearId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = schoolYears.value.findIndex(y => y.school_year_id === schoolYearId)
      if (index !== -1) {
        schoolYears.value[index] = data
      }

      // Update selected school year if it's the one being updated
      if (selectedSchoolYear.value?.school_year_id === schoolYearId) {
        selectedSchoolYear.value = data
      }

      // Update current school year if necessary
      const now = new Date()
      const startsOn = new Date(data.starts_on)
      const endsOn = new Date(data.ends_on)
      if (startsOn <= now && now <= endsOn) {
        currentSchoolYear.value = data
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour de l\'année scolaire'
      console.error('Error updating school year:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSchoolYear = async (schoolYearId: string) => {
    loading.value = true
    error.value = null

    try {
      // Check if school year has classes
      const { data: classes } = await supabase
        .from('class')
        .select('class_id')
        .eq('school_year_id', schoolYearId)
        .limit(1)

      if (classes && classes.length > 0) {
        throw new Error('Impossible de supprimer cette année scolaire car elle contient des classes. Supprimez d\'abord toutes les classes associées.')
      }

      const { error: deleteError } = await supabase
        .from('school_year')
        .delete()
        .eq('school_year_id', schoolYearId)

      if (deleteError) throw deleteError

      // Remove from local state
      schoolYears.value = schoolYears.value.filter(y => y.school_year_id !== schoolYearId)

      // Clear selected school year if it was deleted
      if (selectedSchoolYear.value?.school_year_id === schoolYearId) {
        selectedSchoolYear.value = null
      }

      // Clear current school year if it was deleted
      if (currentSchoolYear.value?.school_year_id === schoolYearId) {
        currentSchoolYear.value = null
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de l\'année scolaire'
      console.error('Error deleting school year:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Filter methods
  const setSearchFilter = (query: string) => {
    searchQuery.value = query
  }

  const setStatusFilter = (status: 'all' | 'current' | 'past' | 'future') => {
    statusFilter.value = status
  }

  const clearFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
  }

  // Utility methods
  const formatSchoolYear = (year: SchoolYear) => {
    const startYear = new Date(year.starts_on).getFullYear()
    const endYear = new Date(year.ends_on).getFullYear()
    return `${startYear}-${endYear}`
  }

  const getSchoolYearStatus = (year: SchoolYear) => {
    const now = new Date()
    const starts = new Date(year.starts_on)
    const ends = new Date(year.ends_on)

    if (now < starts) return 'future'
    if (now > ends) return 'past'
    return 'current'
  }

  const getSchoolYearClassCount = (year: any) => {
    return year.class?.length || 0
  }

  const getSchoolYearStudentCount = (year: any) => {
    if (!year.class) return 0
    return year.class.reduce((total: number, cls: any) => {
      return total + (cls.student_count?.[0]?.count || 0)
    }, 0)
  }

  const isCurrentSchoolYear = (year: SchoolYear) => {
    return currentSchoolYear.value?.school_year_id === year.school_year_id
  }

  return {
    // Reactive state
    schoolYears: readonly(schoolYears),
    selectedSchoolYear: readonly(selectedSchoolYear),
    currentSchoolYear: readonly(currentSchoolYear),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    filteredSchoolYears,
    schoolYearsCount,
    totalSchoolYearsCount,
    
    // Methods
    fetchSchoolYears,
    fetchSchoolYearById,
    createSchoolYear,
    updateSchoolYear,
    deleteSchoolYear,
    
    // Filter methods
    setSearchFilter,
    setStatusFilter,
    clearFilters,
    
    // Utility methods
    formatSchoolYear,
    getSchoolYearStatus,
    getSchoolYearClassCount,
    getSchoolYearStudentCount,
    isCurrentSchoolYear
  }
}