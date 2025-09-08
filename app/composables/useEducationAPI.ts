/**
 * Education API Composable
 * Interface with French National Education Directory API
 */

export interface EducationAPISchool {
  identifiant_de_l_etablissement: string
  nom_etablissement: string
  type_etablissement: string
  adresse_1?: string
  code_postal?: string
  nom_commune?: string
  code_departement?: string
  statut_public_prive?: string
  telephone?: string
  mail?: string
  latitude?: number
  longitude?: number
}

export interface EducationAPIResponse {
  total_count: number
  results: EducationAPISchool[]
}

export const useEducationAPI = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  /**
   * Search schools by various criteria
   */
  const searchSchools = async (params: {
    query?: string
    city?: string
    department?: string
    limit?: number
    offset?: number
  } = {}): Promise<EducationAPIResponse | null> => {
    loading.value = true
    error.value = null

    try {
      // Use our server API endpoint to avoid CORS issues
      const response = await $fetch<EducationAPIResponse>('/api/education/schools', {
        params: {
          search: params.query,
          city: params.city,
          department: params.department,
          limit: params.limit || 100,
          offset: params.offset || 0
        }
      })
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la recherche des établissements'
      console.error('Error searching schools:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get all schools with pagination
   */
  const getAllSchools = async (limit = 1000): Promise<EducationAPISchool[]> => {
    const allSchools: EducationAPISchool[] = []
    let offset = 0
    const batchSize = Math.min(limit, 100) // API limit per request
    
    while (allSchools.length < limit) {
      const response = await searchSchools({
        limit: batchSize,
        offset
      })
      
      if (!response || response.results.length === 0) {
        break
      }
      
      allSchools.push(...response.results)
      offset += batchSize
      
      // Break if we've got all available records
      if (allSchools.length >= response.total_count) {
        break
      }
    }
    
    return allSchools.slice(0, limit)
  }

  /**
   * Get schools by department
   */
  const getSchoolsByDepartment = async (department: string): Promise<EducationAPISchool[]> => {
    const response = await searchSchools({
      department,
      limit: 1000
    })
    
    return response?.results || []
  }

  /**
   * Search schools by city
   */
  const getSchoolsByCity = async (city: string): Promise<EducationAPISchool[]> => {
    const response = await searchSchools({
      city,
      limit: 100
    })
    
    return response?.results || []
  }

  /**
   * Convert Education API school to our School format
   */
  const convertToSchoolFormat = (apiSchool: EducationAPISchool): {
    name: string
    uai: string
    city: string
  } => {
    return {
      name: apiSchool.nom_etablissement,
      uai: apiSchool.identifiant_de_l_etablissement,
      city: apiSchool.nom_commune || ''
    }
  }

  /**
   * Import schools into our database
   */
  const importSchools = async (schools: EducationAPISchool[]): Promise<{
    success: number
    errors: number
    details: string[]
  }> => {
    const { createSchool } = useSchools()
    const results = {
      success: 0,
      errors: 0,
      details: [] as string[]
    }

    loading.value = true
    error.value = null

    try {
      for (const apiSchool of schools) {
        try {
          const schoolData = convertToSchoolFormat(apiSchool)
          
          // Skip schools without required data
          if (!schoolData.name || !schoolData.uai) {
            results.errors++
            results.details.push(`École ignorée: données manquantes (${schoolData.uai || 'UAI manquant'})`)
            continue
          }

          const result = await createSchool(schoolData)
          
          if (result) {
            results.success++
            results.details.push(`École importée: ${schoolData.name} (${schoolData.uai})`)
          } else {
            results.errors++
            results.details.push(`Erreur lors de l'import: ${schoolData.name} (${schoolData.uai})`)
          }
        } catch (err: any) {
          results.errors++
          results.details.push(`Erreur: ${apiSchool.nom_etablissement} - ${err.message}`)
        }
      }
    } finally {
      loading.value = false
    }

    return results
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    
    // Methods
    searchSchools,
    getAllSchools,
    getSchoolsByDepartment,
    getSchoolsByCity,
    convertToSchoolFormat,
    importSchools
  }
}