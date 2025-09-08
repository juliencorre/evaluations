import type { School, CreateSchoolForm } from '~/types/database'

export const useSchools = () => {
  const supabase = useSupabase()

  // Reactive state
  const schools = ref<School[]>([])
  const selectedSchool = ref<School | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Search and filters
  const searchQuery = ref('')
  const selectedCityFilter = ref('')

  // Computed properties
  const filteredSchools = computed(() => {
    let filtered = schools.value

    // Apply search filter
    if (searchQuery.value) {
      const search = searchQuery.value.toLowerCase()
      filtered = filtered.filter(school => 
        school.name.toLowerCase().includes(search) ||
        (school.city && school.city.toLowerCase().includes(search)) ||
        (school.uai && school.uai.toLowerCase().includes(search))
      )
    }

    // Apply city filter
    if (selectedCityFilter.value) {
      filtered = filtered.filter(school => school.city === selectedCityFilter.value)
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  })

  const schoolsCount = computed(() => filteredSchools.value.length)
  const totalSchoolsCount = computed(() => schools.value.length)

  const availableCities = computed(() => {
    const cities = schools.value
      .map(school => school.city)
      .filter(Boolean)
      .filter((city, index, array) => array.indexOf(city) === index)
    return cities.sort()
  })

  // Methods
  const fetchSchools = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('school')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError

      schools.value = data || []
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des écoles'
      console.error('Error fetching schools:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchSchoolById = async (schoolId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('school')
        .select(`
          *,
          class(
            class_id,
            label,
            level,
            school_year:school_year_id(label, starts_on, ends_on),
            student_count:student_enrolment(count)
          )
        `)
        .eq('school_id', schoolId)
        .single()

      if (fetchError) throw fetchError

      selectedSchool.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de l\'école'
      console.error('Error fetching school:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createSchool = async (schoolData: CreateSchoolForm) => {
    loading.value = true
    error.value = null

    try {
      // Use upsert to handle potential UAI duplicates during imports
      const { data, error: createError } = await supabase
        .from('school')
        .upsert({
          name: schoolData.name.trim(),
          uai: schoolData.uai?.trim() || null,
          city: schoolData.city?.trim() || null
        }, {
          onConflict: 'uai',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (createError) throw createError

      // Add to local state if not already present
      const existingIndex = schools.value.findIndex(s => s.school_id === data.school_id)
      if (existingIndex >= 0) {
        schools.value[existingIndex] = data
      } else {
        schools.value.push(data)
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de l\'école'
      console.error('Error creating school:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSchool = async (schoolId: string, schoolData: Partial<CreateSchoolForm>) => {
    loading.value = true
    error.value = null

    try {
      const updateData: any = {}
      if (schoolData.name !== undefined) updateData.name = schoolData.name.trim()
      if (schoolData.uai !== undefined) updateData.uai = schoolData.uai?.trim() || null
      if (schoolData.city !== undefined) updateData.city = schoolData.city?.trim() || null

      const { data, error: updateError } = await supabase
        .from('school')
        .update(updateData)
        .eq('school_id', schoolId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = schools.value.findIndex(s => s.school_id === schoolId)
      if (index !== -1) {
        schools.value[index] = data
      }

      // Update selected school if it's the one being updated
      if (selectedSchool.value?.school_id === schoolId) {
        selectedSchool.value = data
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour de l\'école'
      console.error('Error updating school:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSchool = async (schoolId: string) => {
    loading.value = true
    error.value = null

    try {
      // Check if school has classes
      const { data: classes } = await supabase
        .from('class')
        .select('class_id')
        .eq('school_id', schoolId)
        .limit(1)

      if (classes && classes.length > 0) {
        throw new Error('Impossible de supprimer cette école car elle contient des classes. Supprimez d\'abord toutes les classes associées.')
      }

      const { error: deleteError } = await supabase
        .from('school')
        .delete()
        .eq('school_id', schoolId)

      if (deleteError) throw deleteError

      // Remove from local state
      schools.value = schools.value.filter(s => s.school_id !== schoolId)

      // Clear selected school if it was deleted
      if (selectedSchool.value?.school_id === schoolId) {
        selectedSchool.value = null
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de l\'école'
      console.error('Error deleting school:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Filter methods
  const setSearchFilter = (query: string) => {
    searchQuery.value = query
  }

  const setCityFilter = (city: string) => {
    selectedCityFilter.value = city
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCityFilter.value = ''
  }

  // Utility methods
  const getSchoolFullAddress = (school: School) => {
    const parts = []
    if (school.city) parts.push(school.city)
    if (school.uai) parts.push(`UAI: ${school.uai}`)
    return parts.join(' - ') || 'Informations non renseignées'
  }

  const getSchoolClassCount = (school: any) => {
    return school.class?.length || 0
  }

  const getSchoolStudentCount = (school: any) => {
    if (!school.class) return 0
    return school.class.reduce((total: number, cls: any) => {
      return total + (cls.student_count?.[0]?.count || 0)
    }, 0)
  }

  return {
    // Reactive state
    schools: readonly(schools),
    selectedSchool: readonly(selectedSchool),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    filteredSchools,
    schoolsCount,
    totalSchoolsCount,
    availableCities,
    
    // Methods
    fetchSchools,
    fetchSchoolById,
    createSchool,
    updateSchool,
    deleteSchool,
    
    // Filter methods
    setSearchFilter,
    setCityFilter,
    clearFilters,
    
    // Utility methods
    getSchoolFullAddress,
    getSchoolClassCount,
    getSchoolStudentCount
  }
}