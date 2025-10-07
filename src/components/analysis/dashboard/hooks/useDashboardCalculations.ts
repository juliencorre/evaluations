import type { Ref } from 'vue'
import type { EvaluationResult, CompetencyFramework } from '@/types/evaluation'
import type { ResultTypeConfig } from '@/types/resultType'
import { useMetricCalculations } from '@/composables'

/**
 * Hook pour les calculs spécifiques au dashboard
 * Utilise useMetricCalculations et ajoute la logique spécifique au dashboard
 */
export function useDashboardCalculations(
  framework: Ref<CompetencyFramework | null>,
  resultTypes: Ref<ResultTypeConfig[]>,
  allEvaluationResults: Ref<EvaluationResult[]>,
  filteredEvaluations: Ref<Array<{ id: string; name: string }>>
) {
  const {
    getResultTypeConfigId,
    getDomainIdFromSpecificCompetencyId,
    getFieldIdFromSpecificCompetencyId,
    getCompetencyIdFromSpecificCompetencyId,
    getScoreFromValue
  } = useMetricCalculations(framework, resultTypes)

  /**
   * Calcule les moyennes de classe par niveau (domaines, champs, compétences)
   */
  const calculateClassAveragesByLevel = (metricType: string) => {
    const results = allEvaluationResults.value
    const evaluations = filteredEvaluations.value

    if (!framework.value || !Array.isArray(results) || results.length === 0 || evaluations.length === 0) {
      return []
    }

    // Grouper les résultats par évaluation
    const resultsByEvaluation = results.reduce((acc, result) => {
      const evaluationId = (result as any).evaluationId || 'current'
      const safeEvaluationId = evaluationId || 'unknown'

      if (!acc[safeEvaluationId]) {
        acc[safeEvaluationId] = []
      }
      acc[safeEvaluationId].push(result)
      return acc
    }, {} as Record<string, EvaluationResult[]>)

    const calculateByMetricType = (allResults: EvaluationResult[]) => {
      switch (metricType) {
        case 'domains': {
          const allDomains = framework.value?.domains || []
          const domainGroups = allResults.reduce((acc, result) => {
            const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
            const domainId = getDomainIdFromSpecificCompetencyId(effectiveSpecificCompetencyId)

            if (domainId) {
              if (!acc[domainId]) {
                acc[domainId] = []
              }
              acc[domainId].push(result)
            }
            return acc
          }, {} as Record<string, EvaluationResult[]>)

          return allDomains.map(domain => {
            const domainResults = domainGroups[domain.id] || []
            const scores = domainResults
              .map(r => {
                const resultTypeConfigId = getResultTypeConfigId(r.specificCompetencyId || r.competencyId)
                return getScoreFromValue(r.value || '', resultTypeConfigId)
              })
              .filter((score): score is number => score !== null)

            const average = scores.length > 0
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length
              : 0

            return {
              name: domain.name,
              value: average,
              count: domainResults.length
            }
          })
        }

        case 'fields': {
          const allFields = framework.value?.domains.flatMap(d => d.fields) || []
          const fieldGroups = allResults.reduce((acc, result) => {
            const effectiveSpecificCompetencyId = result.specificCompetencyId || result.competencyId || ''
            const fieldId = getFieldIdFromSpecificCompetencyId(effectiveSpecificCompetencyId)

            if (fieldId) {
              if (!acc[fieldId]) {
                acc[fieldId] = []
              }
              acc[fieldId].push(result)
            }
            return acc
          }, {} as Record<string, EvaluationResult[]>)

          return allFields.map(field => {
            const fieldResults = fieldGroups[field.id] || []
            const scores = fieldResults
              .map(r => {
                const resultTypeConfigId = getResultTypeConfigId(r.specificCompetencyId || r.competencyId)
                return getScoreFromValue(r.value || '', resultTypeConfigId)
              })
              .filter((score): score is number => score !== null)

            const average = scores.length > 0
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length
              : 0

            return {
              name: field.name,
              value: average,
              count: fieldResults.length
            }
          })
        }

        default:
          return []
      }
    }

    // Calculer pour chaque évaluation
    return evaluations.map(evaluation => {
      const evaluationResults = resultsByEvaluation[evaluation.id] || []
      const data = calculateByMetricType(evaluationResults)

      return {
        evaluationId: evaluation.id,
        evaluationName: evaluation.name,
        data
      }
    })
  }

  return {
    calculateClassAveragesByLevel,
    getResultTypeConfigId,
    getDomainIdFromSpecificCompetencyId,
    getFieldIdFromSpecificCompetencyId,
    getCompetencyIdFromSpecificCompetencyId,
    getScoreFromValue
  }
}
