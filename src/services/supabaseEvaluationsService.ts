// @ts-nocheck
import { supabase } from '@/lib/supabase'
import type { Evaluation } from '@/types/evaluation'
import type { Database } from '@/types/supabase'

type EvaluationRow = Database['public']['Tables']['evaluations']['Row']
type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert']
type EvaluationUpdate = Database['public']['Tables']['evaluations']['Update']
type EvaluationClassRow = Database['public']['Tables']['evaluation_classes']['Row']

type EvaluationClassWithEvaluation = EvaluationClassRow & {
  evaluations: EvaluationRow | null
}

export class SupabaseEvaluationsService {
  async getEvaluations(): Promise<Evaluation[]> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      if (!data) return []

      return data.map((item: EvaluationRow) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        frameworkId: item.framework_id,
        createdAt: item.created_at || new Date().toISOString(),
        results: [] // Results are loaded separately
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error)
      return []
    }
  }

  /**
   * Récupère les évaluations pour une classe spécifique
   * Utilise maintenant la table evaluation_classes pour la relation many-to-many
   */
  async getEvaluationsByClass(classId: string, schoolYearId?: string): Promise<Evaluation[]> {
    try {
      // Construire la requête avec JOIN via evaluation_classes
      let query = supabase
        .from('evaluation_classes')
        .select(`
          evaluations (
            id,
            name,
            description,
            framework_id,
            created_at
          )
        `)
        .eq('class_id', classId)

      // Ajouter le filtre d'année scolaire si fourni
      if (schoolYearId) {
        query = query.eq('school_year_id', schoolYearId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      if (!data) return []

      // Transformer les données pour matcher l'interface Evaluation
      return ((data ?? []) as EvaluationClassWithEvaluation[])
        .map(item => item.evaluations)
        .filter((evaluation): evaluation is EvaluationRow => Boolean(evaluation))
        .map(evaluation => ({
          id: evaluation.id,
          name: evaluation.name,
          description: evaluation.description || '',
          frameworkId: evaluation.framework_id,
          // Note: classId n'est plus directement disponible car relation many-to-many
          createdAt: evaluation.created_at || new Date().toISOString(),
          results: [] // Results are loaded separately
        }))
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations par classe:', error)
      return []
    }
  }

  /**
   * Récupère les évaluations pour plusieurs classes (pour un utilisateur)
   * Utilise maintenant la table evaluation_classes pour la relation many-to-many
   */
  async getEvaluationsByClasses(classIds: string[]): Promise<Evaluation[]> {
    try {
      if (classIds.length === 0) return []

      const { data, error } = await supabase
        .from('evaluation_classes')
        .select(`
          evaluations (
            id,
            name,
            description,
            framework_id,
            school_year_id,
            created_at
          )
        `)
        .in('class_id', classIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!data) return []

      // Transformer les données pour matcher l'interface Evaluation
      return ((data ?? []) as EvaluationClassWithEvaluation[])
        .map(item => item.evaluations)
        .filter((evaluation): evaluation is EvaluationRow => Boolean(evaluation))
        .map(evaluation => ({
          id: evaluation.id,
          name: evaluation.name,
          description: evaluation.description || '',
          frameworkId: evaluation.framework_id,
          createdAt: evaluation.created_at || new Date().toISOString(),
          results: [] // Results are loaded separately
        }))
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations par classes:', error)
      return []
    }
  }

  async getEvaluationById(id: string): Promise<Evaluation | null> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null

      const evaluationData = data as EvaluationRow
      return {
        id: evaluationData.id,
        name: evaluationData.name,
        description: evaluationData.description || '',
        frameworkId: evaluationData.framework_id,
        schoolYearId: evaluationData.school_year_id,
        createdAt: evaluationData.created_at || new Date().toISOString(),
        results: [] // Results are loaded separately
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'évaluation:', error)
      return null
    }
  }

  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'results'>): Promise<Evaluation | null> {
    try {
      const insertData: EvaluationInsert = {
        name: evaluation.name,
        description: evaluation.description,
        framework_id: evaluation.frameworkId
      }

      const { data, error } = await supabase
        .from('evaluations')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      const evaluationData = data as EvaluationRow
      return {
        id: evaluationData.id,
        name: evaluationData.name,
        description: evaluationData.description || '',
        frameworkId: evaluationData.framework_id,
        createdAt: evaluationData.created_at || new Date().toISOString(),
        results: []
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error)
      return null
    }
  }

  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation | null> {
    try {
      const updateData: EvaluationUpdate = {
        name: updates.name,
        description: updates.description,
        framework_id: updates.frameworkId
      }

      const { data, error } = await supabase
        .from('evaluations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      const evaluationData = data as EvaluationRow
      return {
        id: evaluationData.id,
        name: evaluationData.name,
        description: evaluationData.description || '',
        frameworkId: evaluationData.framework_id,
        schoolYearId: evaluationData.school_year_id,
        createdAt: evaluationData.created_at || new Date().toISOString(),
        results: [] // Results are loaded separately
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', error)
      return null
    }
  }

  async deleteEvaluation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'évaluation:', error)
      return false
    }
  }
}

export const supabaseEvaluationsService = new SupabaseEvaluationsService()