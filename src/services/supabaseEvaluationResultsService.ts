import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import type { Evaluation, EvaluationResult, EvaluationLevel } from '@/types/evaluation'

type SupabaseEvaluation = Database['public']['Tables']['evaluations']['Row']
type SupabaseEvaluationInsert = Database['public']['Tables']['evaluations']['Insert']
type SupabaseEvaluationUpdate = Database['public']['Tables']['evaluations']['Update']

type SupabaseEvaluationResult = Database['public']['Tables']['evaluation_results']['Row']
type SupabaseEvaluationResultInsert = Database['public']['Tables']['evaluation_results']['Insert']

/**
 * Service pour la gestion des évaluations et résultats dans Supabase
 */
export class SupabaseEvaluationResultsService {
  // Cache pour mapper les IDs originaux vers les UUIDs Supabase
  private idMapping = new Map<string, string>()

  /**
   * Obtient l'UUID Supabase à partir de l'ID original
   */
  private getSupabaseId(originalId: string): string {
    return this.idMapping.get(originalId) || originalId
  }

  // =================== EVALUATIONS ===================

  /**
   * Crée ou récupère une évaluation
   */
  async getOrCreateEvaluation(evaluationData: Omit<Evaluation, 'results'>): Promise<Evaluation> {
    console.log('🚀 [SupabaseEvaluation] Récupération/création évaluation:', evaluationData.id)

    try {
      // Rechercher une évaluation existante par nom et framework_id
      const { data: existingEvaluation, error: getError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('name', evaluationData.name)
        .eq('framework_id', evaluationData.frameworkId)
        .single() as { data: SupabaseEvaluation | null; error: unknown }

      if (!getError && existingEvaluation) {
        console.log('✅ [SupabaseEvaluation] Évaluation existante trouvée')
        // Enregistrer le mapping ID original -> UUID Supabase
        this.idMapping.set(evaluationData.id, existingEvaluation.id)
        const results = await this.getAllResults(existingEvaluation.id)
        return this.mapSupabaseToEvaluation(existingEvaluation, results, evaluationData.id)
      }

      // Créer une nouvelle évaluation
      console.log('➕ [SupabaseEvaluation] Création nouvelle évaluation')
      const newEvaluationData: SupabaseEvaluationInsert = {
        // Ne pas spécifier l'id pour laisser Supabase générer un UUID
        name: evaluationData.name,
        description: evaluationData.description || null,
        framework_id: evaluationData.frameworkId,
        class_id: evaluationData.classId || null
      }

      const { data: newEvaluation, error: createError } = await supabase
        .from('evaluations')
        // @ts-expect-error - Mock Supabase types issue
        .insert(newEvaluationData)
        .select()
        .single() as { data: SupabaseEvaluation | null; error: unknown }

      if (createError) {
        console.error('❌ [SupabaseEvaluation] Erreur création:', createError)
        throw createError
      }

      console.log('✅ [SupabaseEvaluation] Évaluation créée avec succès')
      // Enregistrer le mapping ID original -> UUID Supabase
      this.idMapping.set(evaluationData.id, newEvaluation!.id)
      return this.mapSupabaseToEvaluation(newEvaluation!, [], evaluationData.id)

    } catch (error) {
      console.error('💥 [SupabaseEvaluation] Erreur lors de la gestion de l\'évaluation:', error)
      throw error
    }
  }

  /**
   * Met à jour une évaluation
   */
  async updateEvaluation(
    evaluationId: string,
    updates: Partial<Omit<Evaluation, 'id' | 'results' | 'createdAt'>>
  ): Promise<Evaluation | null> {
    console.log('✏️ [SupabaseEvaluation] Mise à jour évaluation:', evaluationId)

    try {
      const updateData: SupabaseEvaluationUpdate = {}

      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description || null
      if (updates.frameworkId !== undefined) updateData.framework_id = updates.frameworkId
      if (updates.classId !== undefined) updateData.class_id = updates.classId || null

      const { data: updatedEvaluation, error } = await supabase
        .from('evaluations')
        // @ts-expect-error - Mock Supabase types issue
        .update(updateData)
        .eq('id', evaluationId)
        .select()
        .single() as { data: SupabaseEvaluation | null; error: unknown }

      if (error) {
        console.error('❌ [SupabaseEvaluation] Erreur mise à jour:', error)
        throw error
      }

      if (!updatedEvaluation) return null

      const results = await this.getAllResults(evaluationId)
      console.log('✅ [SupabaseEvaluation] Évaluation mise à jour avec succès')
      return this.mapSupabaseToEvaluation(updatedEvaluation, results, evaluationId)

    } catch (error) {
      console.error('💥 [SupabaseEvaluation] Erreur lors de la mise à jour:', error)
      throw error
    }
  }

  /**
   * Supprime une évaluation et tous ses résultats
   */
  async deleteEvaluation(evaluationId: string): Promise<boolean> {
    console.log('🗑️ [SupabaseEvaluation] Suppression évaluation:', evaluationId)

    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', evaluationId)

      if (error) {
        console.error('❌ [SupabaseEvaluation] Erreur suppression:', error)
        throw error
      }

      console.log('✅ [SupabaseEvaluation] Évaluation supprimée avec succès')
      return true

    } catch (error) {
      console.error('💥 [SupabaseEvaluation] Erreur lors de la suppression:', error)
      throw error
    }
  }

  // =================== RÉSULTATS ===================

  /**
   * Sauvegarde un résultat d'évaluation
   */
  async saveResult(
    evaluationId: string,
    studentId: string,
    specificCompetencyId: string,
    level: EvaluationLevel,
    comment?: string
  ): Promise<EvaluationResult> {
    console.log('💾 [SupabaseResult] Sauvegarde résultat:', {
      evaluationId,
      studentId,
      specificCompetencyId,
      level
    })

    try {
      const supabaseEvaluationId = this.getSupabaseId(evaluationId)
      const resultData: SupabaseEvaluationResultInsert = {
        evaluation_id: supabaseEvaluationId,
        student_id: studentId,
        specific_competency_id: specificCompetencyId,
        level,
        comment: comment || null,
        evaluated_at: new Date().toISOString()
      }

      // Utiliser upsert pour gérer les mises à jour
      const { data: savedResult, error } = await supabase
        .from('evaluation_results')
        // @ts-expect-error - Mock Supabase types issue
        .upsert(resultData, {
          onConflict: 'evaluation_id,student_id,specific_competency_id'
        })
        .select()
        .single() as { data: SupabaseEvaluationResult | null; error: unknown }

      if (error) {
        console.error('❌ [SupabaseResult] Erreur sauvegarde:', error)
        throw error
      }

      console.log('✅ [SupabaseResult] Résultat sauvegardé avec succès')
      return this.mapSupabaseToEvaluationResult(savedResult!)

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors de la sauvegarde:', error)
      throw error
    }
  }

  /**
   * Récupère un résultat spécifique
   */
  async getResult(
    evaluationId: string,
    studentId: string,
    specificCompetencyId: string
  ): Promise<EvaluationResult | null> {
    try {
      const { data, error } = await supabase
        .from('evaluation_results')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .eq('student_id', studentId)
        .eq('specific_competency_id', specificCompetencyId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Résultat non trouvé
          return null
        }
        console.error('❌ [SupabaseResult] Erreur récupération:', error)
        throw error
      }

      return data ? this.mapSupabaseToEvaluationResult(data) : null

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors de la récupération:', error)
      throw error
    }
  }

  /**
   * Récupère tous les résultats d'une évaluation
   */
  async getAllResults(evaluationId: string): Promise<EvaluationResult[]> {
    console.log('📊 [SupabaseResult] Récupération de tous les résultats:', evaluationId)

    try {
      const supabaseEvaluationId = this.getSupabaseId(evaluationId)
      const { data, error } = await supabase
        .from('evaluation_results')
        .select('*')
        .eq('evaluation_id', supabaseEvaluationId)
        .order('evaluated_at', { ascending: false })

      if (error) {
        console.error('❌ [SupabaseResult] Erreur récupération:', error)
        throw error
      }

      const results = (data || []).map(this.mapSupabaseToEvaluationResult)
      console.log('✅ [SupabaseResult] Résultats récupérés:', results.length)
      return results

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors de la récupération:', error)
      throw error
    }
  }

  /**
   * Récupère les résultats d'un élève pour une évaluation
   */
  async getResultsByStudent(evaluationId: string, studentId: string): Promise<EvaluationResult[]> {
    try {
      const { data, error } = await supabase
        .from('evaluation_results')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .eq('student_id', studentId)
        .order('evaluated_at', { ascending: false })

      if (error) {
        console.error('❌ [SupabaseResult] Erreur récupération par élève:', error)
        throw error
      }

      return (data || []).map(this.mapSupabaseToEvaluationResult)

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors de la récupération par élève:', error)
      throw error
    }
  }

  /**
   * Récupère les résultats pour une compétence spécifique
   */
  async getResultsByCompetency(
    evaluationId: string,
    specificCompetencyId: string
  ): Promise<EvaluationResult[]> {
    try {
      const { data, error } = await supabase
        .from('evaluation_results')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .eq('specific_competency_id', specificCompetencyId)
        .order('evaluated_at', { ascending: false })

      if (error) {
        console.error('❌ [SupabaseResult] Erreur récupération par compétence:', error)
        throw error
      }

      return (data || []).map(this.mapSupabaseToEvaluationResult)

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors de la récupération par compétence:', error)
      throw error
    }
  }

  /**
   * Supprime un résultat spécifique
   */
  async deleteResult(
    evaluationId: string,
    studentId: string,
    specificCompetencyId: string
  ): Promise<boolean> {
    console.log('🗑️ [SupabaseResult] Suppression résultat:', {
      evaluationId,
      studentId,
      specificCompetencyId
    })

    try {
      const { error } = await supabase
        .from('evaluation_results')
        .delete()
        .eq('evaluation_id', evaluationId)
        .eq('student_id', studentId)
        .eq('specific_competency_id', specificCompetencyId)

      if (error) {
        console.error('❌ [SupabaseResult] Erreur suppression:', error)
        throw error
      }

      console.log('✅ [SupabaseResult] Résultat supprimé avec succès')
      return true

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors de la suppression:', error)
      throw error
    }
  }

  /**
   * Sauvegarde en lot de plusieurs résultats
   */
  async bulkSaveResults(
    evaluationId: string,
    results: Omit<EvaluationResult, 'evaluatedAt'>[]
  ): Promise<EvaluationResult[]> {
    console.log('📦 [SupabaseResult] Sauvegarde en lot:', results.length)

    try {
      const now = new Date().toISOString()
      const resultsToInsert: SupabaseEvaluationResultInsert[] = results.map(result => ({
        evaluation_id: evaluationId,
        student_id: result.studentId,
        specific_competency_id: result.competencyId,
        level: result.level,
        comment: result.comment || null,
        evaluated_at: now
      }))

      const { data: savedResults, error } = await supabase
        .from('evaluation_results')
        // @ts-expect-error - Mock Supabase types issue
        .upsert(resultsToInsert, {
          onConflict: 'evaluation_id,student_id,specific_competency_id'
        })
        .select() as { data: SupabaseEvaluationResult[] | null; error: unknown }

      if (error) {
        console.error('❌ [SupabaseResult] Erreur sauvegarde en lot:', error)
        throw error
      }

      const mappedResults = (savedResults || []).map(this.mapSupabaseToEvaluationResult)
      console.log('✅ [SupabaseResult] Sauvegarde en lot terminée:', mappedResults.length)
      return mappedResults

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors de la sauvegarde en lot:', error)
      throw error
    }
  }

  /**
   * Remet à zéro tous les résultats d'une évaluation
   */
  async resetEvaluation(evaluationId: string): Promise<boolean> {
    console.log('🔄 [SupabaseResult] Réinitialisation évaluation:', evaluationId)

    try {
      const { error } = await supabase
        .from('evaluation_results')
        .delete()
        .eq('evaluation_id', evaluationId)

      if (error) {
        console.error('❌ [SupabaseResult] Erreur réinitialisation:', error)
        throw error
      }

      console.log('✅ [SupabaseResult] Évaluation réinitialisée avec succès')
      return true

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors de la réinitialisation:', error)
      throw error
    }
  }

  /**
   * Obtient des statistiques sur les résultats
   */
  async getEvaluationStats(evaluationId: string) {
    try {
      const { data, error } = await supabase
        .from('evaluation_results')
        .select('level')
        .eq('evaluation_id', evaluationId) as { data: { level: EvaluationLevel }[] | null; error: unknown }

      if (error) throw error

      const levelCounts = (data || []).reduce((acc, result) => {
        acc[result.level] = (acc[result.level] || 0) + 1
        return acc
      }, {} as Record<EvaluationLevel, number>)

      return {
        totalResults: data?.length || 0,
        levelCounts
      }

    } catch (error) {
      console.error('💥 [SupabaseResult] Erreur lors du calcul des statistiques:', error)
      throw error
    }
  }

  // =================== FONCTIONS DE TRANSFORMATION ===================

  /**
   * Transforme une évaluation Supabase en objet Evaluation
   */
  private mapSupabaseToEvaluation(
    supabaseEvaluation: SupabaseEvaluation,
    results: EvaluationResult[],
    originalId?: string
  ): Evaluation {
    return {
      id: originalId || supabaseEvaluation.id, // Utiliser l'ID original si fourni
      name: supabaseEvaluation.name,
      description: supabaseEvaluation.description || '',
      frameworkId: supabaseEvaluation.framework_id,
      classId: supabaseEvaluation.class_id || '',
      createdAt: supabaseEvaluation.created_at,
      results
    }
  }

  /**
   * Transforme un résultat Supabase en objet EvaluationResult
   */
  private mapSupabaseToEvaluationResult(supabaseResult: SupabaseEvaluationResult): EvaluationResult {
    return {
      studentId: supabaseResult.student_id,
      competencyId: supabaseResult.specific_competency_id,
      level: supabaseResult.level,
      comment: supabaseResult.comment || '',
      evaluatedAt: supabaseResult.evaluated_at
    }
  }

  // =================== ABONNEMENTS TEMPS RÉEL ===================

  /**
   * Souscrit aux changements en temps réel sur les résultats d'une évaluation
   */
  subscribeToEvaluationResults(
    evaluationId: string,
    callback: (payload: unknown) => void
  ) {
    console.log('🔔 [SupabaseResult] Abonnement temps réel:', evaluationId)

    return supabase
      .channel(`evaluation-results-${evaluationId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluation_results',
          filter: `evaluation_id=eq.${evaluationId}`
        },
        callback
      )
      .subscribe()
  }

  /**
   * Souscrit aux changements sur les évaluations
   */
  subscribeToEvaluations(callback: (payload: unknown) => void) {
    console.log('🔔 [SupabaseEvaluation] Abonnement temps réel évaluations')

    return supabase
      .channel('evaluations-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluations'
        },
        callback
      )
      .subscribe()
  }
}

// Instance singleton du service
export const supabaseEvaluationResultsService = new SupabaseEvaluationResultsService()