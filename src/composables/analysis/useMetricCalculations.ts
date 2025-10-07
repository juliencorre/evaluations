import type { Ref } from 'vue'
import type { EvaluationResult, CompetencyFramework } from '@/types/evaluation'
import type { ResultTypeConfig } from '@/types/resultType'

/**
 * Composable pour les calculs de métriques d'évaluation
 * Extrait la logique métier complexe de DashboardView
 */
export function useMetricCalculations(
  framework: Ref<CompetencyFramework | null>,
  resultTypes: Ref<ResultTypeConfig[]>
) {
  /**
   * Récupère l'ID du type de résultat pour une compétence spécifique
   */
  const getResultTypeConfigId = (specificCompetencyId?: string): string | undefined => {
    if (!specificCompetencyId || !framework.value) return undefined

    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        for (const competency of field.competencies) {
          const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
          if (specificComp) {
            return specificComp.resultTypeConfigId
          }
        }
      }
    }
    return undefined
  }

  /**
   * Récupère l'ID du domaine à partir d'une compétence spécifique
   */
  const getDomainIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
    if (!framework.value) return undefined
    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        for (const competency of field.competencies) {
          const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
          if (specificComp) {
            return domain.id
          }
        }
      }
    }
    return undefined
  }

  /**
   * Récupère l'ID du champ à partir d'une compétence spécifique
   */
  const getFieldIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
    if (!framework.value) return undefined
    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        for (const competency of field.competencies) {
          const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
          if (specificComp) {
            return field.id
          }
        }
      }
    }
    return undefined
  }

  /**
   * Récupère l'ID de la compétence à partir d'une compétence spécifique
   */
  const getCompetencyIdFromSpecificCompetencyId = (specificCompetencyId: string): string | undefined => {
    if (!framework.value) return undefined
    for (const domain of framework.value.domains) {
      for (const field of domain.fields) {
        for (const competency of field.competencies) {
          const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
          if (specificComp) {
            return competency.id
          }
        }
      }
    }
    return undefined
  }

  /**
   * Convertit une valeur d'évaluation en score numérique
   * Retourne null pour les valeurs N/A pour les exclure des calculs
   */
  const getScoreFromValue = (value: string, resultTypeConfigId?: string): number | null => {
    if (!value || !resultTypeConfigId) {
      return null
    }

    // Return null for N/A values to exclude them from calculations
    if (value === 'N/A' || value === 'Non évalué') {
      return null
    }

    const resultType = resultTypes.value.find(rt => rt.id === resultTypeConfigId)
    if (!resultType) {
      return null
    }

    const configValue = resultType.config.values.find((v: { value: string; pivot_value?: number | null }) => v.value === value)
    if (!configValue) {
      return null
    }

    // Check if this is a N/A value (pivot_value might be null or undefined for N/A)
    if (configValue.pivot_value === null || configValue.pivot_value === undefined) {
      return null
    }

    return configValue.pivot_value
  }

  /**
   * Calcule la moyenne d'un tableau de scores
   */
  const calculateAverage = (scores: (number | null)[]): number | null => {
    const validScores = scores.filter((score): score is number => score !== null)
    if (validScores.length === 0) return null

    const sum = validScores.reduce((acc, score) => acc + score, 0)
    return sum / validScores.length
  }

  /**
   * Groupe les résultats par ID (domaine, champ, compétence)
   */
  const groupResultsById = (
    results: EvaluationResult[],
    getIdFn: (specificCompetencyId: string) => string | undefined
  ): Record<string, EvaluationResult[]> => {
    return results.reduce((acc, result) => {
      const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
      const id = getIdFn(effectiveSpecificCompetencyId)

      if (id) {
        if (!acc[id]) {
          acc[id] = []
        }
        acc[id].push(result)
      }
      return acc
    }, {} as Record<string, EvaluationResult[]>)
  }

  return {
    getResultTypeConfigId,
    getDomainIdFromSpecificCompetencyId,
    getFieldIdFromSpecificCompetencyId,
    getCompetencyIdFromSpecificCompetencyId,
    getScoreFromValue,
    calculateAverage,
    groupResultsById
  }
}
