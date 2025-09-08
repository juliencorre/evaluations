/**
 * Competence Management Composable
 * Provides reactive state management for domains, fields, competences, and specific competences
 */

import type { 
  CompetenceFramework,
  Domain,
  DomainWithDetails, 
  Field,
  FieldWithDetails, 
  Competence, 
  SpecificCompetence,
  CompetenceWithDetails,
  SpecificCompetenceWithDetails,
  CreateDomainForm,
  CreateFieldForm,
  CreateCompetenceForm,
  CreateSpecificCompetenceForm,
  CompetenceFilter,
  SpecificCompetenceFilter,
  DomainFilter,
  FieldFilter
} from '~/types/database'

export const useCompetences = () => {
  const db = useDatabase()

  // Reactive state
  const frameworks = ref<CompetenceFramework[]>([])
  const domains = ref<DomainWithDetails[]>([])
  const fields = ref<FieldWithDetails[]>([])
  const competences = ref<CompetenceWithDetails[]>([])
  const specificCompetences = ref<SpecificCompetenceWithDetails[]>([])
  
  const selectedFramework = ref<CompetenceFramework | null>(null)
  const selectedDomain = ref<DomainWithDetails | null>(null)
  const selectedField = ref<FieldWithDetails | null>(null)
  const selectedCompetence = ref<CompetenceWithDetails | null>(null)
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const filters = ref<CompetenceFilter>({
    framework_id: undefined,
    domain_id: undefined,
    field_id: undefined,
    search: ''
  })

  // Computed values
  const filteredDomains = computed(() => {
    if (!filters.value.framework_id) return domains.value
    return domains.value.filter(domain => domain.framework_id === filters.value.framework_id)
  })

  const filteredFields = computed(() => {
    let result = fields.value
    
    if (filters.value.framework_id) {
      result = result.filter(field => field.framework_id === filters.value.framework_id)
    }
    
    if (filters.value.domain_id) {
      result = result.filter(field => field.domain_id === filters.value.domain_id)
    }
    
    return result
  })

  const filteredCompetences = computed(() => {
    let result = competences.value

    if (filters.value.framework_id) {
      result = result.filter(comp => comp.framework_id === filters.value.framework_id)
    }

    if (filters.value.field_id) {
      result = result.filter(comp => comp.field_id === filters.value.field_id)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(comp => 
        comp.label.toLowerCase().includes(search) ||
        comp.description?.toLowerCase().includes(search) ||
        comp.code?.toLowerCase().includes(search)
      )
    }

    return result.sort((a, b) => a.sort_order - b.sort_order)
  })

  const competenceHierarchy = computed(() => {
    const hierarchy = new Map<string, {
      framework: CompetenceFramework
      domains: Map<string, {
        domain: Domain
        fields: Map<string, {
          field: Field
          competences: Competence[]
        }>
      }>
    }>()

    // Build hierarchy from current data
    frameworks.value.forEach(framework => {
      hierarchy.set(framework.framework_id, {
        framework,
        domains: new Map()
      })
    })

    domains.value.forEach(domain => {
      const frameworkEntry = hierarchy.get(domain.framework_id)
      if (frameworkEntry) {
        frameworkEntry.domains.set(domain.domain_id, {
          domain,
          fields: new Map()
        })
      }
    })

    fields.value.forEach(field => {
      const frameworkEntry = hierarchy.get(field.framework_id)
      if (frameworkEntry) {
        const domainEntry = frameworkEntry.domains.get(field.domain_id)
        if (domainEntry) {
          domainEntry.fields.set(field.field_id, {
            field,
            competences: []
          })
        }
      }
    })

    competences.value.forEach(competence => {
      const frameworkEntry = hierarchy.get(competence.framework_id)
      if (frameworkEntry) {
        frameworkEntry.domains.forEach(domainEntry => {
          const fieldEntry = domainEntry.fields.get(competence.field_id)
          if (fieldEntry) {
            fieldEntry.competences.push(competence)
          }
        })
      }
    })

    return hierarchy
  })

  // Framework operations
  const fetchFrameworks = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await db.frameworks.getAll()
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      frameworks.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des référentiels'
      console.error('Error fetching frameworks:', err)
    } finally {
      loading.value = false
    }
  }

  // Domain operations
  const fetchDomains = async (frameworkId?: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.domains.getAll(frameworkId)
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      domains.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des domaines'
      console.error('Error fetching domains:', err)
    } finally {
      loading.value = false
    }
  }

  const createDomain = async (domainData: CreateDomainForm) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.domains.create(domainData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      domains.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création du domaine'
      console.error('Error creating domain:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateDomain = async (id: string, domainData: Partial<CreateDomainForm>) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.domains.update(id, domainData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      const index = domains.value.findIndex(d => d.domain_id === id)
      if (index !== -1) {
        domains.value[index] = { ...domains.value[index], ...response.data }
      }

      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la modification du domaine'
      console.error('Error updating domain:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteDomain = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.domains.delete(id)
      
      if (response.error) {
        error.value = response.error.message
        return false
      }

      domains.value = domains.value.filter(d => d.domain_id !== id)
      return true
    } catch (err) {
      error.value = 'Erreur lors de la suppression du domaine'
      console.error('Error deleting domain:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Field operations
  const fetchFields = async (domainId?: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.fields.getAll(domainId)
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      fields.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des champs'
      console.error('Error fetching fields:', err)
    } finally {
      loading.value = false
    }
  }

  const createField = async (fieldData: CreateFieldForm) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.fields.create(fieldData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      fields.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création du champ'
      console.error('Error creating field:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateField = async (id: string, fieldData: Partial<CreateFieldForm>) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.fields.update(id, fieldData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      const index = fields.value.findIndex(f => f.field_id === id)
      if (index !== -1) {
        fields.value[index] = { ...fields.value[index], ...response.data }
      }

      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la modification du champ'
      console.error('Error updating field:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteField = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.fields.delete(id)
      
      if (response.error) {
        error.value = response.error.message
        return false
      }

      fields.value = fields.value.filter(f => f.field_id !== id)
      return true
    } catch (err) {
      error.value = 'Erreur lors de la suppression du champ'
      console.error('Error deleting field:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Competence operations
  const fetchCompetences = async (filter?: CompetenceFilter) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.competences.getAll(filter)
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      competences.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des compétences'
      console.error('Error fetching competences:', err)
    } finally {
      loading.value = false
    }
  }

  const createCompetence = async (competenceData: CreateCompetenceForm) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.competences.create(competenceData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      competences.value.push(response.data as any) // TODO: Fix typing
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création de la compétence'
      console.error('Error creating competence:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateCompetence = async (id: string, competenceData: Partial<CreateCompetenceForm>) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.competences.update(id, competenceData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      const index = competences.value.findIndex(c => c.competence_id === id)
      if (index !== -1) {
        competences.value[index] = { ...competences.value[index], ...response.data }
      }

      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la modification de la compétence'
      console.error('Error updating competence:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteCompetence = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.competences.delete(id)
      
      if (response.error) {
        error.value = response.error.message
        return false
      }

      competences.value = competences.value.filter(c => c.competence_id !== id)
      return true
    } catch (err) {
      error.value = 'Erreur lors de la suppression de la compétence'
      console.error('Error deleting competence:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Specific competence operations
  const fetchSpecificCompetences = async (competenceId?: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.specificCompetences.getAll(competenceId)
      
      if (response.error) {
        error.value = response.error.message
        return
      }

      specificCompetences.value = response.data || []
    } catch (err) {
      error.value = 'Erreur lors du chargement des compétences spécifiques'
      console.error('Error fetching specific competences:', err)
    } finally {
      loading.value = false
    }
  }

  const createSpecificCompetence = async (specificCompetenceData: CreateSpecificCompetenceForm) => {
    loading.value = true
    error.value = null

    try {
      const response = await db.specificCompetences.create(specificCompetenceData)
      
      if (response.error) {
        error.value = response.error.message
        return null
      }

      specificCompetences.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = 'Erreur lors de la création de la compétence spécifique'
      console.error('Error creating specific competence:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Filter methods
  const setFrameworkFilter = (frameworkId: string | undefined) => {
    filters.value.framework_id = frameworkId
    selectedFramework.value = frameworkId ? frameworks.value.find(f => f.framework_id === frameworkId) || null : null
  }

  const setDomainFilter = (domainId: string | undefined) => {
    filters.value.domain_id = domainId
    selectedDomain.value = domainId ? domains.value.find(d => d.domain_id === domainId) || null : null
  }

  const setFieldFilter = (fieldId: string | undefined) => {
    filters.value.field_id = fieldId
    selectedField.value = fieldId ? fields.value.find(f => f.field_id === fieldId) || null : null
  }

  const setSearchFilter = (search: string) => {
    filters.value.search = search
  }

  const clearFilters = () => {
    filters.value = {
      framework_id: undefined,
      domain_id: undefined,
      field_id: undefined,
      search: ''
    }
    selectedFramework.value = null
    selectedDomain.value = null
    selectedField.value = null
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Initialize
  const initialize = async () => {
    await fetchFrameworks()
    await fetchDomains()
    await fetchFields()
    await fetchCompetences()
  }

  return {
    // State
    frameworks: readonly(frameworks),
    domains: readonly(domains),
    fields: readonly(fields),
    competences: readonly(competences),
    specificCompetences: readonly(specificCompetences),
    selectedFramework: readonly(selectedFramework),
    selectedDomain: readonly(selectedDomain),
    selectedField: readonly(selectedField),
    selectedCompetence: readonly(selectedCompetence),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),

    // Computed
    filteredDomains,
    filteredFields,
    filteredCompetences,
    competenceHierarchy,

    // Actions
    fetchFrameworks,
    fetchDomains,
    createDomain,
    updateDomain,
    deleteDomain,
    fetchFields,
    createField,
    updateField,
    deleteField,
    fetchCompetences,
    createCompetence,
    updateCompetence,
    deleteCompetence,
    fetchSpecificCompetences,
    createSpecificCompetence,

    // Filters
    setFrameworkFilter,
    setDomainFilter,
    setFieldFilter,
    setSearchFilter,
    clearFilters,
    clearError,
    initialize
  }
}