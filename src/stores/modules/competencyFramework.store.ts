import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CompetencyFramework, SpecificCompetency } from '@/types/evaluation'
import { supabaseCompetenciesService } from '@/services/supabaseCompetenciesService'

/**
 * Store Pinia pour la gestion du framework de compétences
 * Gère les domaines, champs, compétences et sous-compétences
 */
export const useCompetencyFrameworkStore = defineStore('competencyFramework', () => {
  // ==================== STATE ====================
  const framework = ref<CompetencyFramework>({
    id: 'temp',
    name: 'Chargement en cours...',
    version: '1.0',
    domains: []
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const hasData = computed(() => framework.value.domains.length > 0)
  const domainCount = computed(() => framework.value.domains.length)

  // ==================== ACTIONS ====================

  /**
   * Charger le framework depuis Supabase
   */
  async function loadFramework() {
    try {
      isLoading.value = true
      error.value = null

      const [frameworkData, domains] = await Promise.all([
        supabaseCompetenciesService.getOrCreateDefaultFramework(),
        supabaseCompetenciesService.getAllDomains()
      ])

      framework.value = {
        id: frameworkData.id,
        name: frameworkData.name,
        version: frameworkData.version,
        domains
      }
    } catch (err) {
      console.error('[CompetencyFrameworkStore] Erreur chargement Supabase:', err)
      error.value = 'Impossible de charger le framework de compétences'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Rafraîchir le framework depuis Supabase
   */
  async function refreshFromSupabase() {
    await loadFramework()
  }

  /**
   * Réinitialiser le framework
   */
  function resetFramework() {
    framework.value = {
      id: '',
      name: '',
      version: '',
      domains: []
    }
    error.value = null
  }

  // ==================== DOMAIN ACTIONS ====================

  function addDomain(domainData: { name: string; description: string }) {
    const newDomain = {
      id: `domain-${Date.now()}`,
      name: domainData.name,
      description: domainData.description,
      fields: []
    }
    framework.value.domains.push(newDomain)
    return newDomain
  }

  function updateDomain(domainId: string, updates: { name?: string; description?: string }) {
    const domain = framework.value.domains.find((d) => d.id === domainId)
    if (domain) {
      Object.assign(domain, updates)
      return domain
    }
    return null
  }

  function deleteDomain(domainId: string) {
    const index = framework.value.domains.findIndex((d) => d.id === domainId)
    if (index !== -1) {
      const deletedDomain = framework.value.domains[index]
      framework.value.domains.splice(index, 1)
      return deletedDomain
    }
    return null
  }

  function reorderDomains(fromIndex: number, toIndex: number) {
    const domains = [...framework.value.domains]
    const [movedItem] = domains.splice(fromIndex, 1)
    domains.splice(toIndex, 0, movedItem)
    framework.value.domains = domains
  }

  // ==================== FIELD ACTIONS ====================

  function addField(domainId: string, fieldData: { name: string; description: string }) {
    const domain = framework.value.domains.find((d) => d.id === domainId)
    if (domain) {
      const newField = {
        id: `field-${Date.now()}`,
        name: fieldData.name,
        description: fieldData.description,
        competencies: []
      }
      domain.fields.push(newField)
      return newField
    }
    return null
  }

  function updateField(fieldId: string, updates: { name?: string; description?: string }) {
    for (const domain of framework.value.domains) {
      const field = domain.fields.find((f) => f.id === fieldId)
      if (field) {
        Object.assign(field, updates)
        return field
      }
    }
    return null
  }

  function deleteField(fieldId: string) {
    for (const domain of framework.value.domains) {
      const index = domain.fields.findIndex((f) => f.id === fieldId)
      if (index !== -1) {
        const deletedField = domain.fields[index]
        domain.fields.splice(index, 1)
        return deletedField
      }
    }
    return null
  }

  function reorderFields(domainId: string, fromIndex: number, toIndex: number) {
    const domain = framework.value.domains.find((d) => d.id === domainId)
    if (domain) {
      const fields = [...domain.fields]
      const [movedItem] = fields.splice(fromIndex, 1)
      fields.splice(toIndex, 0, movedItem)
      domain.fields = fields
    }
  }

  // ==================== COMPETENCY ACTIONS ====================

  function addCompetency(
    fieldId: string,
    competencyData: { name: string; description: string }
  ) {
    for (const domain of framework.value.domains) {
      const field = domain.fields.find((f) => f.id === fieldId)
      if (field) {
        const newCompetency = {
          id: `comp-${Date.now()}`,
          name: competencyData.name,
          description: competencyData.description,
          specificCompetencies: []
        }
        field.competencies.push(newCompetency)
        return newCompetency
      }
    }
    return null
  }

  function updateCompetency(
    competencyId: string,
    updates: { name?: string; description?: string }
  ) {
    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        const competency = field.competencies.find((c) => c.id === competencyId)
        if (competency) {
          Object.assign(competency, updates)
          return competency
        }
      }
    }
    return null
  }

  function deleteCompetency(competencyId: string) {
    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        const index = field.competencies.findIndex((c) => c.id === competencyId)
        if (index !== -1) {
          const deletedCompetency = field.competencies[index]
          field.competencies.splice(index, 1)
          return deletedCompetency
        }
      }
    }
    return null
  }

  function reorderCompetencies(fieldId: string, fromIndex: number, toIndex: number) {
    for (const domain of framework.value.domains) {
      const field = domain.fields.find((f) => f.id === fieldId)
      if (field) {
        const competencies = [...field.competencies]
        const [movedItem] = competencies.splice(fromIndex, 1)
        competencies.splice(toIndex, 0, movedItem)
        field.competencies = competencies
        break
      }
    }
  }

  // ==================== SPECIFIC COMPETENCY ACTIONS ====================

  function addSpecificCompetency(
    competencyId: string,
    specificCompetencyData: { name: string; description: string; resultTypeConfigId?: string }
  ) {
    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        const competency = field.competencies.find((c) => c.id === competencyId)
        if (competency) {
          const newSpecificCompetency: SpecificCompetency = {
            id: `spec-${Date.now()}`,
            name: specificCompetencyData.name,
            description: specificCompetencyData.description,
            resultTypeConfigId: specificCompetencyData.resultTypeConfigId
          }
          competency.specificCompetencies.push(newSpecificCompetency)
          return newSpecificCompetency
        }
      }
    }
    return null
  }

  async function updateSpecificCompetency(
    specificCompetencyId: string,
    updates: { name?: string; description?: string; resultTypeConfigId?: string }
  ) {
    try {
      // Sauvegarder en base via Supabase
      const updatedSpecificCompetency = await supabaseCompetenciesService.updateSpecificCompetency(
        specificCompetencyId,
        updates
      )

      if (updatedSpecificCompetency) {
        // Mettre à jour localement
        for (const domain of framework.value.domains) {
          for (const field of domain.fields) {
            for (const competency of field.competencies) {
              const specificCompetency = competency.specificCompetencies.find(
                (s) => s.id === specificCompetencyId
              )
              if (specificCompetency) {
                Object.assign(specificCompetency, updates)
                return specificCompetency
              }
            }
          }
        }
      }

      return updatedSpecificCompetency
    } catch (err) {
      console.error('[CompetencyFrameworkStore] Erreur mise à jour sous-compétence:', err)
      error.value = 'Impossible de mettre à jour la sous-compétence'
      return null
    }
  }

  function deleteSpecificCompetency(specificCompetencyId: string) {
    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        for (const competency of field.competencies) {
          const index = competency.specificCompetencies.findIndex(
            (s) => s.id === specificCompetencyId
          )
          if (index !== -1) {
            const deletedSpecificCompetency = competency.specificCompetencies[index]
            competency.specificCompetencies.splice(index, 1)
            return deletedSpecificCompetency
          }
        }
      }
    }
    return null
  }

  function reorderSpecificCompetencies(
    competencyId: string,
    fromIndex: number,
    toIndex: number
  ) {
    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        const competency = field.competencies.find((c) => c.id === competencyId)
        if (competency) {
          const specificCompetencies = [...competency.specificCompetencies]
          const [movedItem] = specificCompetencies.splice(fromIndex, 1)
          specificCompetencies.splice(toIndex, 0, movedItem)
          competency.specificCompetencies = specificCompetencies
          return
        }
      }
    }
  }

  // ==================== RETURN ====================
  return {
    // State
    framework,
    isLoading,
    error,

    // Getters
    hasData,
    domainCount,

    // Framework actions
    loadFramework,
    refreshFromSupabase,
    resetFramework,

    // Domain actions
    addDomain,
    updateDomain,
    deleteDomain,
    reorderDomains,

    // Field actions
    addField,
    updateField,
    deleteField,
    reorderFields,

    // Competency actions
    addCompetency,
    updateCompetency,
    deleteCompetency,
    reorderCompetencies,

    // Specific competency actions
    addSpecificCompetency,
    updateSpecificCompetency,
    deleteSpecificCompetency,
    reorderSpecificCompetencies
  }
})
