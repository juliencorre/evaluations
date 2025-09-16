import { ref, computed } from 'vue'
import type { Student, CompetencyFramework } from '@/types/evaluation'
import { STUDENTS, COMPETENCY_FRAMEWORK } from '@/data/staticData'

// Store réactif global pour les élèves
const students = ref<Student[]>([...STUDENTS])

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
  const addStudent = (studentData: { firstName: string; lastName: string }) => {
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

  const updateStudent = (studentId: string, updates: { firstName?: string; lastName?: string }) => {
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

  const deleteStudent = (studentId: string) => {
    const index = students.value.findIndex((s) => s.id === studentId)
    if (index !== -1) {
      const deletedStudent = students.value[index]
      students.value.splice(index, 1)
      return deletedStudent
    }
    return null
  }

  const getStudentById = (studentId: string) => {
    return students.value.find((s) => s.id === studentId) || null
  }

  const resetStudents = () => {
    students.value = [...STUDENTS]
  }

  return {
    // Getters
    allStudents,
    studentCount,

    // Actions
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    resetStudents
  }
}

// Store réactif global pour le framework de compétences
const competencyFramework = ref<CompetencyFramework>(
  JSON.parse(JSON.stringify(COMPETENCY_FRAMEWORK))
)

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

  // Fonction pour réinitialiser le framework
  const resetFramework = () => {
    competencyFramework.value = JSON.parse(JSON.stringify(COMPETENCY_FRAMEWORK))
  }

  return {
    // Getter
    framework,

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

    // Reset
    resetFramework
  }
}
