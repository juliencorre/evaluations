export interface RadarDataPoint {
  name: string
  evaluations: { score: number }[]
}

export interface EvaluationDataPoint {
  name: string
  value: number
}

export interface EvaluationData {
  data: EvaluationDataPoint[]
}

/**
 * Composable pour la transformation de données en format radar
 */
export function useRadarData() {
  /**
   * Transforme les données d'évaluation en format radar
   * Format attendu par les composants de graphique radar
   */
  const transformToRadarFormat = (
    data: EvaluationData[]
  ): RadarDataPoint[] => {
    if (!data || data.length === 0) {
      return []
    }

    // Obtenir tous les noms uniques (domaines/champs/compétences)
    const allNames = new Map<string, RadarDataPoint>()

    // Initialiser la structure avec tous les noms
    data.forEach(evaluationData => {
      evaluationData.data.forEach(item => {
        if (!allNames.has(item.name)) {
          allNames.set(item.name, {
            name: item.name,
            evaluations: []
          })
        }
      })
    })

    // Remplir les scores pour chaque évaluation
    data.forEach((evaluationData, evaluationIndex) => {
      allNames.forEach((radarPoint, name) => {
        const itemData = evaluationData.data.find(d => d.name === name)

        // S'assurer d'avoir le bon nombre de slots d'évaluation
        while (radarPoint.evaluations.length <= evaluationIndex) {
          radarPoint.evaluations.push({ score: 0 })
        }

        radarPoint.evaluations[evaluationIndex] = {
          score: itemData ? itemData.value : 0
        }
      })
    })

    return Array.from(allNames.values())
  }

  /**
   * Calcule les moyennes par catégorie
   */
  const calculateAveragesByCategory = (
    data: RadarDataPoint[]
  ): Array<{ name: string; average: number }> => {
    return data.map(item => {
      const scores = item.evaluations.map(e => e.score).filter(s => s > 0)
      const average = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0

      return {
        name: item.name,
        average
      }
    })
  }

  /**
   * Trouve les catégories avec les scores les plus élevés
   */
  const getTopCategories = (
    data: RadarDataPoint[],
    limit = 5
  ): Array<{ name: string; score: number }> => {
    const averages = calculateAveragesByCategory(data)
    return averages
      .sort((a, b) => b.average - a.average)
      .slice(0, limit)
      .map(item => ({ name: item.name, score: item.average }))
  }

  /**
   * Trouve les catégories avec les scores les plus bas
   */
  const getBottomCategories = (
    data: RadarDataPoint[],
    limit = 5
  ): Array<{ name: string; score: number }> => {
    const averages = calculateAveragesByCategory(data)
    return averages
      .sort((a, b) => a.average - b.average)
      .slice(0, limit)
      .map(item => ({ name: item.name, score: item.average }))
  }

  /**
   * Normalise les scores radar sur une échelle donnée
   */
  const normalizeRadarScores = (
    data: RadarDataPoint[],
    maxScale = 100
  ): RadarDataPoint[] => {
    // Trouver le score maximum
    let maxScore = 0
    data.forEach(item => {
      item.evaluations.forEach(e => {
        if (e.score > maxScore) {
          maxScore = e.score
        }
      })
    })

    if (maxScore === 0) return data

    // Normaliser tous les scores
    return data.map(item => ({
      ...item,
      evaluations: item.evaluations.map(e => ({
        score: (e.score / maxScore) * maxScale
      }))
    }))
  }

  return {
    transformToRadarFormat,
    calculateAveragesByCategory,
    getTopCategories,
    getBottomCategories,
    normalizeRadarScores
  }
}
