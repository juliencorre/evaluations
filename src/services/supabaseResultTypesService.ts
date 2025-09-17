import { supabase } from '@/lib/supabase'
import type { ResultTypeConfig } from '@/types/evaluation'

export class SupabaseResultTypesService {
  async getResultTypes(): Promise<ResultTypeConfig[]> {
    try {
      const { data, error } = await supabase
        .from('result_type_configs')
        .select('*')
        .order('name')

      if (error) throw error

      return data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        config: item.config as { values: string[]; labels: Record<string, string> }
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des types de résultats:', error)
      return []
    }
  }

  async getResultTypeById(id: string): Promise<ResultTypeConfig | null> {
    try {
      const { data, error } = await supabase
        .from('result_type_configs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        config: data.config as { values: string[]; labels: Record<string, string> }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du type de résultat:', error)
      return null
    }
  }

  async createResultType(resultType: Omit<ResultTypeConfig, 'id'>): Promise<ResultTypeConfig | null> {
    try {
      const { data, error } = await supabase
        .from('result_type_configs')
        .insert({
          name: resultType.name,
          type: resultType.type,
          config: resultType.config
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        config: data.config as { values: string[]; labels: Record<string, string> }
      }
    } catch (error) {
      console.error('Erreur lors de la création du type de résultat:', error)
      return null
    }
  }

  async updateResultType(id: string, resultType: Partial<ResultTypeConfig>): Promise<ResultTypeConfig | null> {
    try {
      const { data, error } = await supabase
        .from('result_type_configs')
        .update({
          name: resultType.name,
          type: resultType.type,
          config: resultType.config
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        config: data.config as { values: string[]; labels: Record<string, string> }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du type de résultat:', error)
      return null
    }
  }

  async deleteResultType(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('result_type_configs')
        .delete()
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du type de résultat:', error)
      return false
    }
  }
}

export const supabaseResultTypesService = new SupabaseResultTypesService()