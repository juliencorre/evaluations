import type { Evaluation, EvaluationResult, EvaluationValue } from '@/types/evaluation'

export interface EvaluationResultsServiceMessage {
  type: 'GET_EVALUATION' | 'SAVE_RESULT' | 'DELETE_RESULT' | 'BULK_SAVE_RESULTS' | 'RESET_EVALUATION'
  payload?: unknown
  requestId?: string
}

export interface EvaluationResultsServiceResponse {
  type: 'EVALUATION_RESULTS_RESPONSE'
  payload: {
    data: Evaluation | EvaluationResult | EvaluationResult[] | boolean | null
    success: boolean
    error?: string
  }
  requestId: string
}

/**
 * Service pour la persistance temporaire des résultats d'évaluation
 * Utilise localStorage comme stockage temporaire en attendant la migration Supabase
 */
export class EvaluationResultsService {
  private readonly STORAGE_KEY = 'evaluation_results_temp'
  private readonly EVALUATION_KEY = 'current_evaluation_temp'

  /**
   * Sauvegarde un résultat d'évaluation pour un élève et une compétence
   */
  saveResult(
    evaluationId: string,
    studentId: string,
    competencyId: string,
    value: EvaluationValue,
    comment?: string
  ): EvaluationResult {
    console.log('💾 [EvaluationService] Sauvegarde du résultat:', {
      evaluationId,
      studentId,
      competencyId,
      value,
      comment
    })

    const evaluationData = this.getEvaluationData(evaluationId)
    if (!evaluationData) {
      throw new Error(`Évaluation ${evaluationId} non trouvée`)
    }

    // Chercher un résultat existant
    const existingResultIndex = evaluationData.results.findIndex(
      r => r.studentId === studentId && r.competencyId === competencyId
    )

    const newResult: EvaluationResult = {
      studentId,
      competencyId,
      value,
      comment: comment || '',
      evaluatedAt: new Date().toISOString()
    }

    if (existingResultIndex !== -1) {
      // Mettre à jour le résultat existant
      evaluationData.results[existingResultIndex] = newResult
      console.log('🔄 [EvaluationService] Résultat mis à jour')
    } else {
      // Ajouter un nouveau résultat
      evaluationData.results.push(newResult)
      console.log('✅ [EvaluationService] Nouveau résultat ajouté')
    }

    this.saveEvaluationData(evaluationId, evaluationData)
    return newResult
  }

  /**
   * Récupère un résultat spécifique
   */
  getResult(evaluationId: string, studentId: string, competencyId: string): EvaluationResult | null {
    const evaluationData = this.getEvaluationData(evaluationId)
    if (!evaluationData) return null

    return evaluationData.results.find(
      r => r.studentId === studentId && r.competencyId === competencyId
    ) || null
  }

  /**
   * Récupère tous les résultats pour une évaluation
   */
  getAllResults(evaluationId: string): EvaluationResult[] {
    const evaluationData = this.getEvaluationData(evaluationId)
    return evaluationData?.results || []
  }

  /**
   * Supprime un résultat spécifique
   */
  deleteResult(evaluationId: string, studentId: string, competencyId: string): boolean {
    console.log('🗑️ [EvaluationService] Suppression du résultat:', {
      evaluationId,
      studentId,
      competencyId
    })

    const evaluationData = this.getEvaluationData(evaluationId)
    if (!evaluationData) return false

    const initialLength = evaluationData.results.length
    evaluationData.results = evaluationData.results.filter(
      r => !(r.studentId === studentId && r.competencyId === competencyId)
    )

    const deleted = evaluationData.results.length < initialLength
    if (deleted) {
      this.saveEvaluationData(evaluationId, evaluationData)
      console.log('✅ [EvaluationService] Résultat supprimé')
    }

    return deleted
  }

  /**
   * Sauvegarde en lot de plusieurs résultats
   */
  bulkSaveResults(evaluationId: string, results: Omit<EvaluationResult, 'evaluatedAt'>[]): EvaluationResult[] {
    console.log('📦 [EvaluationService] Sauvegarde en lot:', { evaluationId, count: results.length })

    const evaluationData = this.getEvaluationData(evaluationId)
    if (!evaluationData) {
      throw new Error(`Évaluation ${evaluationId} non trouvée`)
    }

    const savedResults: EvaluationResult[] = []
    const now = new Date().toISOString()

    for (const result of results) {
      const fullResult: EvaluationResult = {
        ...result,
        evaluatedAt: now
      }

      // Chercher et remplacer ou ajouter
      const existingIndex = evaluationData.results.findIndex(
        r => r.studentId === result.studentId && r.competencyId === result.competencyId
      )

      if (existingIndex !== -1) {
        evaluationData.results[existingIndex] = fullResult
      } else {
        evaluationData.results.push(fullResult)
      }

      savedResults.push(fullResult)
    }

    this.saveEvaluationData(evaluationId, evaluationData)
    console.log('✅ [EvaluationService] Sauvegarde en lot terminée')

    return savedResults
  }

  /**
   * Récupère ou crée une évaluation
   */
  getOrCreateEvaluation(evaluationData: Omit<Evaluation, 'results'>): Evaluation {
    const existingData = this.getEvaluationData(evaluationData.id)

    if (existingData) {
      // Mettre à jour les métadonnées si nécessaire
      const updated: Evaluation = {
        ...existingData,
        name: evaluationData.name,
        description: evaluationData.description,
        frameworkId: evaluationData.frameworkId,
        classId: evaluationData.classId
      }
      this.saveEvaluationData(evaluationData.id, updated)
      return updated
    }

    // Créer une nouvelle évaluation
    const newEvaluation: Evaluation = {
      ...evaluationData,
      results: []
    }

    this.saveEvaluationData(evaluationData.id, newEvaluation)
    console.log('🆕 [EvaluationService] Nouvelle évaluation créée:', evaluationData.id)

    return newEvaluation
  }

  /**
   * Remet à zéro tous les résultats d'une évaluation
   */
  resetEvaluation(evaluationId: string): boolean {
    console.log('🔄 [EvaluationService] Réinitialisation de l\'évaluation:', evaluationId)

    const evaluationData = this.getEvaluationData(evaluationId)
    if (!evaluationData) return false

    evaluationData.results = []
    this.saveEvaluationData(evaluationId, evaluationData)

    console.log('✅ [EvaluationService] Évaluation réinitialisée')
    return true
  }

  /**
   * Exporte toutes les données d'évaluation (pour backup/debug)
   */
  exportAllData(): Record<string, Evaluation> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('❌ [EvaluationService] Erreur lors de l\'export:', error)
      return {}
    }
  }

  /**
   * Importe des données d'évaluation (pour restore/migration)
   */
  importAllData(data: Record<string, Evaluation>): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      console.log('📥 [EvaluationService] Données importées avec succès')
      return true
    } catch (error) {
      console.error('❌ [EvaluationService] Erreur lors de l\'import:', error)
      return false
    }
  }

  /**
   * Vide toutes les données stockées
   */
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.EVALUATION_KEY)
    console.log('🧹 [EvaluationService] Toutes les données supprimées')
  }

  /**
   * Statistiques du service
   */
  getStats(): { evaluationsCount: number; totalResults: number; storageSize: number } {
    const allData = this.exportAllData()
    const evaluationsCount = Object.keys(allData).length
    const totalResults = Object.values(allData).reduce((sum, evaluation) => sum + evaluation.results.length, 0)

    // Taille approximative en bytes
    const storageSize = new Blob([JSON.stringify(allData)]).size

    return {
      evaluationsCount,
      totalResults,
      storageSize
    }
  }

  /**
   * Méthodes privées pour la gestion du stockage localStorage
   */
  private getEvaluationData(evaluationId: string): Evaluation | null {
    try {
      const allData = localStorage.getItem(this.STORAGE_KEY)
      if (!allData) return null

      const evaluationsData: Record<string, Evaluation> = JSON.parse(allData)
      return evaluationsData[evaluationId] || null
    } catch (error) {
      console.error('❌ [EvaluationService] Erreur lors de la lecture:', error)
      return null
    }
  }

  private saveEvaluationData(evaluationId: string, evaluationData: Evaluation): void {
    try {
      const allData = localStorage.getItem(this.STORAGE_KEY)
      const evaluationsData: Record<string, Evaluation> = allData ? JSON.parse(allData) : {}

      evaluationsData[evaluationId] = evaluationData
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(evaluationsData))
    } catch (error) {
      console.error('❌ [EvaluationService] Erreur lors de la sauvegarde:', error)
      throw new Error('Impossible de sauvegarder les données')
    }
  }

  /**
   * Traite les messages venant d'autres composants (pour uniformité avec les autres services)
   */
  async handleMessage(message: EvaluationResultsServiceMessage): Promise<EvaluationResultsServiceResponse> {
    const { type, payload, requestId = '' } = message

    try {
      let data: Evaluation | EvaluationResult | EvaluationResult[] | boolean | null = null

      switch (type) {
        case 'GET_EVALUATION':
          if (payload && typeof payload === 'object' && 'evaluationId' in payload) {
            const { evaluationId } = payload as { evaluationId: string }
            data = this.getEvaluationData(evaluationId)
          } else {
            throw new Error('evaluationId est requis')
          }
          break

        case 'SAVE_RESULT':
          if (payload && typeof payload === 'object') {
            const {
              evaluationId,
              studentId,
              competencyId,
              level,
              comment
            } = payload as {
              evaluationId: string
              studentId: string
              competencyId: string
              level: EvaluationLevel
              comment?: string
            }
            data = this.saveResult(evaluationId, studentId, competencyId, level, comment)
          } else {
            throw new Error('Données de résultat requises')
          }
          break

        case 'DELETE_RESULT':
          if (payload && typeof payload === 'object') {
            const { evaluationId, studentId, competencyId } = payload as {
              evaluationId: string
              studentId: string
              competencyId: string
            }
            data = this.deleteResult(evaluationId, studentId, competencyId)
          } else {
            throw new Error('evaluationId, studentId et competencyId sont requis')
          }
          break

        case 'BULK_SAVE_RESULTS':
          if (payload && typeof payload === 'object') {
            const { evaluationId, results } = payload as {
              evaluationId: string
              results: Omit<EvaluationResult, 'evaluatedAt'>[]
            }
            data = this.bulkSaveResults(evaluationId, results)
          } else {
            throw new Error('evaluationId et results sont requis')
          }
          break

        case 'RESET_EVALUATION':
          if (payload && typeof payload === 'object' && 'evaluationId' in payload) {
            const { evaluationId } = payload as { evaluationId: string }
            data = this.resetEvaluation(evaluationId)
          } else {
            throw new Error('evaluationId est requis')
          }
          break

        default:
          throw new Error(`Type de message non supporté: ${type}`)
      }

      return {
        type: 'EVALUATION_RESULTS_RESPONSE',
        payload: {
          data,
          success: true
        },
        requestId
      }
    } catch (error) {
      return {
        type: 'EVALUATION_RESULTS_RESPONSE',
        payload: {
          data: null,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        requestId
      }
    }
  }
}

// Instance singleton du service
export const evaluationResultsService = new EvaluationResultsService()