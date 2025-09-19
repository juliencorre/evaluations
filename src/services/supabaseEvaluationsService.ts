import { supabase } from '@/lib/supabase'
import type { Evaluation } from '@/types/evaluation'
import type { Database } from '@/types/database.types'

type EvaluationRow = Database['public']['Tables']['evaluations']['Row']
type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert']
type EvaluationUpdate = Database['public']['Tables']['evaluations']['Update']

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
        classId: item.class_id || '',
        createdAt: item.created_at || new Date().toISOString(),
        results: [] // Results are loaded separately
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error)
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
        classId: evaluationData.class_id || '',
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
        framework_id: evaluation.frameworkId,
        class_id: evaluation.classId
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
        classId: evaluationData.class_id || '',
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
        framework_id: updates.frameworkId,
        class_id: updates.classId
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
        classId: evaluationData.class_id || '',
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