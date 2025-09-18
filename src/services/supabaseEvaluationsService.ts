import { supabase } from '@/lib/supabase'
import type { Evaluation } from '@/types/evaluation'

export class SupabaseEvaluationsService {
  async getEvaluations(): Promise<Evaluation[]> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        frameworkId: item.framework_id,
        classId: item.class_id || '',
        createdAt: item.created_at,
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

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        frameworkId: data.framework_id,
        classId: data.class_id || '',
        createdAt: data.created_at,
        results: [] // Results are loaded separately
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'évaluation:', error)
      return null
    }
  }

  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'results'>): Promise<Evaluation | null> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .insert({
          name: evaluation.name,
          description: evaluation.description,
          framework_id: evaluation.frameworkId,
          class_id: evaluation.classId
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        frameworkId: data.framework_id,
        classId: data.class_id || '',
        createdAt: data.created_at,
        results: []
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error)
      return null
    }
  }

  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation | null> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .update({
          name: updates.name,
          description: updates.description,
          framework_id: updates.frameworkId,
          class_id: updates.classId
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        frameworkId: data.framework_id,
        classId: data.class_id || '',
        createdAt: data.created_at,
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