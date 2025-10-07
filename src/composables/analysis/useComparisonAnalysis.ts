import { computed, type Ref } from 'vue'
import type { EvaluationResult } from '@/types/evaluation'
import type { Student } from '@/types/student'

export interface ComparisonData {
  studentId: string
  studentName: string
  scores: number[]
  average: number
}

/**
 * Composable pour l'analyse comparative des résultats
 */
export function useComparisonAnalysis(
  results: Ref<EvaluationResult[]>,
  students: Ref<Student[]>
) {
  /**
   * Compare les performances entre étudiants
   */
  const compareStudents = computed((): ComparisonData[] => {
    return students.value.map(student => {
      const studentResults = results.value.filter(r => r.studentId === student.id)
      const scores = studentResults
        .map(() => {
          // Placeholder - Convertir la valeur en score numérique
          // Cette logique devrait utiliser useMetricCalculations.getScoreFromValue
          return 0
        })
        .filter(score => score !== null) as number[]

      const average = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        scores,
        average
      }
    }).sort((a, b) => b.average - a.average)
  })

  /**
   * Identifie les étudiants qui excellent
   */
  const getTopPerformers = (limit = 5) => {
    return computed(() => compareStudents.value.slice(0, limit))
  }

  /**
   * Identifie les étudiants qui ont besoin d'aide
   */
  const getStruggling = (limit = 5) => {
    return computed(() => compareStudents.value.slice(-limit).reverse())
  }

  /**
   * Calcule les écarts de performance
   */
  const performanceGaps = computed(() => {
    const scores = compareStudents.value.map(s => s.average)
    if (scores.length === 0) return { min: 0, max: 0, range: 0, mean: 0, median: 0 }

    const sorted = [...scores].sort((a, b) => a - b)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const range = max - min
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length
    const median = sorted[Math.floor(sorted.length / 2)]

    return { min, max, range, mean, median }
  })

  /**
   * Groupe les étudiants par niveau de performance
   */
  const groupByPerformanceLevel = computed(() => {
    const gaps = performanceGaps.value
    const groups = {
      high: [] as ComparisonData[],
      medium: [] as ComparisonData[],
      low: [] as ComparisonData[]
    }

    const highThreshold = gaps.mean + (gaps.range * 0.25)
    const lowThreshold = gaps.mean - (gaps.range * 0.25)

    compareStudents.value.forEach(student => {
      if (student.average >= highThreshold) {
        groups.high.push(student)
      } else if (student.average <= lowThreshold) {
        groups.low.push(student)
      } else {
        groups.medium.push(student)
      }
    })

    return groups
  })

  /**
   * Calcule le pourcentage d'amélioration entre deux périodes
   */
  const calculateImprovement = (
    studentId: string,
    beforeDate: Date,
    afterDate: Date
  ): number | null => {
    const beforeResults = results.value.filter(
      r => r.studentId === studentId &&
        new Date(r.evaluatedAt || '') < beforeDate
    )

    const afterResults = results.value.filter(
      r => r.studentId === studentId &&
        new Date(r.evaluatedAt || '') >= afterDate
    )

    if (beforeResults.length === 0 || afterResults.length === 0) {
      return null
    }

    // Calculer les moyennes (à implémenter avec la vraie logique de score)
    const beforeAvg = 0 // Placeholder
    const afterAvg = 0 // Placeholder

    return ((afterAvg - beforeAvg) / beforeAvg) * 100
  }

  return {
    compareStudents,
    getTopPerformers,
    getStruggling,
    performanceGaps,
    groupByPerformanceLevel,
    calculateImprovement
  }
}
