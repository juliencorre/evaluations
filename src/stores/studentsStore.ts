import { ref, computed } from 'vue'
import type { Student, CompetencyFramework } from '@/types/evaluation'
import { STUDENTS } from '@/data/staticData'
import { supabaseStudentsService } from '@/services/supabaseStudentsService'

// Store réactif global pour les élèves
const students = ref<Student[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const useSupabase = ref(true) // Flag pour activer/désactiver Supabase

// Charger les élèves depuis Supabase au démarrage
const loadStudentsFromSupabase = async () => {
  if (!useSupabase.value) {
    students.value = [...STUDENTS]
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const supabaseStudents = await supabaseStudentsService.getAllStudents()
    students.value = supabaseStudents
  } catch (err) {
    console.error('Erreur lors du chargement depuis Supabase, utilisation des données locales:', err)
    error.value = 'Impossible de charger les élèves depuis Supabase, utilisation des données locales'
    students.value = [...STUDENTS]
    useSupabase.value = false // Désactiver Supabase en cas d'erreur
  } finally {
    isLoading.value = false
  }
}

// Initialiser les données au démarrage
loadStudentsFromSupabase()

// Actions pour manipuler les élèves
export const useStudentsStore = () => {
  // Getters
  const allStudents = computed(() => students.value)
  const studentCount = computed(() => students.value.length)

  // Utility function to generate displayName
  const generateDisplayName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName.charAt(0)}.`
  }

  // Actions
  const addStudent = async (studentData: { firstName: string; lastName: string }) => {
    // Si Supabase est désactivé, utiliser directement le local
    if (!useSupabase.value) {
      const newId = `STU${String(students.value.length + 1).padStart(3, '0')}`
      const newStudent: Student = {
        id: newId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        displayName: generateDisplayName(studentData.firstName, studentData.lastName)
      }
      students.value.push(newStudent)
      return newStudent
    }

    // Essayer Supabase
    try {
      const newStudent = await supabaseStudentsService.createStudent(
        studentData.firstName,
        studentData.lastName
      )
      students.value.push(newStudent)
      return newStudent
    } catch (err) {
      console.error('Erreur lors de l\'ajout dans Supabase, basculement local:', err)
      useSupabase.value = false // Désactiver Supabase pour les prochaines fois

      // Fallback: création locale
      const newId = `STU${String(students.value.length + 1).padStart(3, '0')}`
      const newStudent: Student = {
        id: newId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        displayName: generateDisplayName(studentData.firstName, studentData.lastName)
      }
      students.value.push(newStudent)
      return newStudent
    }
  }

  const updateStudent = async (studentId: string, updates: { firstName?: string; lastName?: string }) => {
    // Si Supabase est désactivé, utiliser directement le local
    if (!useSupabase.value) {
      const index = students.value.findIndex((s) => s.id === studentId)
      if (index !== -1) {
        const updatedStudent = {
          ...students.value[index],
          ...updates
        }
        // Regenerate displayName if firstName or lastName changed
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

    // Essayer Supabase
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
      console.error('Erreur lors de la mise à jour dans Supabase, basculement local:', err)
      useSupabase.value = false // Désactiver Supabase pour les prochaines fois

      // Fallback: mise à jour locale
      const index = students.value.findIndex((s) => s.id === studentId)
      if (index !== -1) {
        const updatedStudent = {
          ...students.value[index],
          ...updates
        }
        // Regenerate displayName if firstName or lastName changed
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
  }

  const deleteStudent = async (studentId: string) => {
    const studentToDelete = students.value.find((s) => s.id === studentId)
    if (!studentToDelete) return null

    // Si Supabase est désactivé, utiliser directement le local
    if (!useSupabase.value) {
      students.value = students.value.filter((s) => s.id !== studentId)
      return studentToDelete
    }

    // Essayer Supabase
    try {
      await supabaseStudentsService.deleteStudent(studentId)
      students.value = students.value.filter((s) => s.id !== studentId)
      return studentToDelete
    } catch (err) {
      console.error('Erreur lors de la suppression dans Supabase, basculement local:', err)
      useSupabase.value = false // Désactiver Supabase pour les prochaines fois

      // Fallback: suppression locale
      students.value = students.value.filter((s) => s.id !== studentId)
      return studentToDelete
    }
  }

  const getStudentById = (studentId: string) => {
    return students.value.find((s) => s.id === studentId) || null
  }

  const resetStudents = async () => {
    students.value = [...STUDENTS]

    // Optionnel: réinitialiser aussi dans Supabase
    if (useSupabase.value) {
      try {
        // D'abord supprimer tous les élèves existants
        const existingStudents = await supabaseStudentsService.getAllStudents()
        for (const student of existingStudents) {
          await supabaseStudentsService.deleteStudent(student.id)
        }

        // Puis importer les élèves par défaut
        await supabaseStudentsService.bulkImportStudents(
          STUDENTS.map(s => ({
            firstName: s.firstName,
            lastName: s.lastName
          }))
        )

        // Recharger depuis Supabase
        await loadStudentsFromSupabase()
      } catch (err) {
        console.error('Erreur lors de la réinitialisation dans Supabase:', err)
        error.value = 'Erreur lors de la réinitialisation des élèves'
      }
    }
  }

  const refreshFromSupabase = async () => {
    await loadStudentsFromSupabase()
  }

  return {
    // Getters
    allStudents,
    studentCount,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    useSupabase: computed(() => useSupabase.value),

    // Actions
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    resetStudents,
    refreshFromSupabase
  }
}

// Store réactif global pour le framework de compétences - démarrage minimal
const competencyFramework = ref<CompetencyFramework>({
  id: 'temp',
  name: 'Chargement en cours...',
  version: '1.0',
  domains: []
})

const isCompetenciesLoading = ref(false)
const competenciesError = ref<string | null>(null)

// Import du service Supabase
import { supabaseCompetenciesService } from '@/services/supabaseCompetenciesService'

// Charger depuis Supabase au démarrage
const loadFromSupabase = async () => {
  try {
    isCompetenciesLoading.value = true
    const framework = await supabaseCompetenciesService.getOrCreateDefaultFramework()
    const domains = await supabaseCompetenciesService.getAllDomains()

    competencyFramework.value = {
      id: framework.id,
      name: framework.name,
      version: framework.version,
      domains
    }
  } catch (err) {
    console.error('Erreur chargement Supabase:', err)
    competenciesError.value = 'Impossible de charger depuis Supabase'
  } finally {
    isCompetenciesLoading.value = false
  }
}

// Chargement automatique au démarrage de l'application
console.log('🚀 [Store] Initialisation du store des compétences...')
loadFromSupabase()

// Actions pour manipuler le framework de compétences
export const useCompetencyFrameworkStore = () => {
  // Getters
  const framework = computed(() => competencyFramework.value)

  // Actions pour les domaines
  const addDomain = (domainData: { name: string; description: string }) => {
    const newDomain = {
      id: `domain-${Date.now()}`,
      name: domainData.name,
      description: domainData.description,
      fields: []
    }
    competencyFramework.value.domains.push(newDomain)
    return newDomain
  }

  const updateDomain = (domainId: string, updates: { name?: string; description?: string }) => {
    const domain = competencyFramework.value.domains.find((d) => d.id === domainId)
    if (domain) {
      Object.assign(domain, updates)
      return domain
    }
    return null
  }

  const deleteDomain = (domainId: string) => {
    const index = competencyFramework.value.domains.findIndex((d) => d.id === domainId)
    if (index !== -1) {
      const deletedDomain = competencyFramework.value.domains[index]
      competencyFramework.value.domains.splice(index, 1)
      return deletedDomain
    }
    return null
  }

  // Actions pour les champs
  const addField = (domainId: string, fieldData: { name: string; description: string }) => {
    const domain = competencyFramework.value.domains.find((d) => d.id === domainId)
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

  const updateField = (fieldId: string, updates: { name?: string; description?: string }) => {
    for (const domain of competencyFramework.value.domains) {
      const field = domain.fields.find((f) => f.id === fieldId)
      if (field) {
        Object.assign(field, updates)
        return field
      }
    }
    return null
  }

  const deleteField = (fieldId: string) => {
    for (const domain of competencyFramework.value.domains) {
      const index = domain.fields.findIndex((f) => f.id === fieldId)
      if (index !== -1) {
        const deletedField = domain.fields[index]
        domain.fields.splice(index, 1)
        return deletedField
      }
    }
    return null
  }

  // Actions pour les compétences
  const addCompetency = (
    fieldId: string,
    competencyData: { name: string; description: string }
  ) => {
    for (const domain of competencyFramework.value.domains) {
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

  const updateCompetency = (
    competencyId: string,
    updates: { name?: string; description?: string }
  ) => {
    for (const domain of competencyFramework.value.domains) {
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

  const deleteCompetency = (competencyId: string) => {
    for (const domain of competencyFramework.value.domains) {
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

  // Actions pour les sous-compétences
  const addSpecificCompetency = (
    competencyId: string,
    specificCompetencyData: { name: string; description: string }
  ) => {
    for (const domain of competencyFramework.value.domains) {
      for (const field of domain.fields) {
        const competency = field.competencies.find((c) => c.id === competencyId)
        if (competency) {
          const newSpecificCompetency = {
            id: `spec-${Date.now()}`,
            name: specificCompetencyData.name,
            description: specificCompetencyData.description
          }
          competency.specificCompetencies.push(newSpecificCompetency)
          return newSpecificCompetency
        }
      }
    }
    return null
  }

  const updateSpecificCompetency = (
    specificCompetencyId: string,
    updates: { name?: string; description?: string }
  ) => {
    for (const domain of competencyFramework.value.domains) {
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
    return null
  }

  const deleteSpecificCompetency = (specificCompetencyId: string) => {
    for (const domain of competencyFramework.value.domains) {
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

  // Fonctions de réorganisation
  const reorderDomains = (fromIndex: number, toIndex: number) => {
    const domains = [...competencyFramework.value.domains]
    const [movedItem] = domains.splice(fromIndex, 1)
    domains.splice(toIndex, 0, movedItem)
    competencyFramework.value.domains = domains
  }

  const reorderFields = (domainId: string, fromIndex: number, toIndex: number) => {
    const domain = competencyFramework.value.domains.find((d) => d.id === domainId)
    if (domain) {
      const fields = [...domain.fields]
      const [movedItem] = fields.splice(fromIndex, 1)
      fields.splice(toIndex, 0, movedItem)
      domain.fields = fields
    }
  }

  const reorderCompetencies = (fieldId: string, fromIndex: number, toIndex: number) => {
    for (const domain of competencyFramework.value.domains) {
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

  const reorderSpecificCompetencies = (
    competencyId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    for (const domain of competencyFramework.value.domains) {
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

  // Fonction pour vider le framework
  const resetFramework = () => {
    competencyFramework.value = { id: '', name: '', version: '', domains: [] }
  }

  return {
    // Getters
    framework,
    isCompetenciesLoading: computed(() => isCompetenciesLoading.value),
    competenciesError: computed(() => competenciesError.value),

    // Actions domaines
    addDomain,
    updateDomain,
    deleteDomain,

    // Actions champs
    addField,
    updateField,
    deleteField,

    // Actions compétences
    addCompetency,
    updateCompetency,
    deleteCompetency,

    // Actions sous-compétences
    addSpecificCompetency,
    updateSpecificCompetency,
    deleteSpecificCompetency,

    // Actions de réorganisation
    reorderDomains,
    reorderFields,
    reorderCompetencies,
    reorderSpecificCompetencies,

    // Reset et refresh
    resetFramework,
    refreshFromSupabase: loadFromSupabase
  }
}
