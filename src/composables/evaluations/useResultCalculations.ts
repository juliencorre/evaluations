import { computed, type Ref } from 'vue'
import type { EvaluationResult } from '@/types/evaluation'
import type { Student } from '@/types/student'

/**
 * Composable pour les calculs sur les résultats d'évaluation
 */
export function useResultCalculations(
  results: Ref<EvaluationResult[]>,
  students: Ref<Student[]>
) {
  /**
   * Calcule le nombre de résultats par étudiant
   */
  const resultsByStudent = computed(() => {
    return results.value.reduce((acc, result) => {
      if (!acc[result.studentId]) {
        acc[result.studentId] = []
      }
      acc[result.studentId].push(result)
      return acc
    }, {} as Record<string, EvaluationResult[]>)
  })

  /**
   * Calcule le nombre de résultats par compétence
   */
  const resultsByCompetency = computed(() => {
    return results.value.reduce((acc, result) => {
      const key = result.specificCompetencyId || result.competencyId
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(result)
      return acc
    }, {} as Record<string, EvaluationResult[]>)
  })

  /**
   * Calcule les statistiques globales
   */
  const statistics = computed(() => {
    const totalResults = results.value.length
    const totalStudents = new Set(results.value.map(r => r.studentId)).size
    const totalCompetencies = new Set(
      results.value.map(r => r.specificCompetencyId || r.competencyId)
    ).size

    // Compte les résultats par valeur
    const valueDistribution = results.value.reduce((acc, result) => {
      const value = result.value || 'N/A'
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalResults,
      totalStudents,
      totalCompetencies,
      valueDistribution
    }
  })

  /**
   * Obtient les résultats pour un étudiant spécifique
   */
  const getStudentResults = (studentId: string) => {
    return computed(() => results.value.filter(r => r.studentId === studentId))
  }

  /**
   * Obtient les résultats pour une compétence spécifique
   */
  const getCompetencyResults = (competencyId: string) => {
    return computed(() =>
      results.value.filter(
        r => r.specificCompetencyId === competencyId || r.competencyId === competencyId
      )
    )
  }

  /**
   * Calcule le pourcentage de complétion par étudiant
   */
  const studentCompletionRates = computed(() => {
    return students.value.map(student => {
      const studentResults = results.value.filter(r => r.studentId === student.id)
      const evaluated = studentResults.filter(r => r.value && r.value !== 'N/A').length
      const total = studentResults.length

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        evaluated,
        total,
        rate: total > 0 ? (evaluated / total) * 100 : 0
      }
    })
  })

  /**
   * Trouve les compétences les plus évaluées
   */
  const topEvaluatedCompetencies = computed(() => {
    const counts = Object.entries(resultsByCompetency.value)
      .map(([competencyId, results]) => ({
        competencyId,
        count: results.length
      }))
      .sort((a, b) => b.count - a.count)

    return counts.slice(0, 10)
  })

  return {
    resultsByStudent,
    resultsByCompetency,
    statistics,
    getStudentResults,
    getCompetencyResults,
    studentCompletionRates,
    topEvaluatedCompetencies
  }
}
