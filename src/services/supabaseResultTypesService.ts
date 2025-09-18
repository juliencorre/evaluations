import { supabase } from '@/lib/supabase'
import type { ResultTypeConfig, ResultTypeConfigValue } from '@/types/evaluation'
import type { Json } from '@/types/supabase'

export class SupabaseResultTypesService {
  private validatePivotValues(values: ResultTypeConfigValue[]) {
    for (const value of values) {
      if (value.pivot_value < 0 || value.pivot_value > 10) {
        throw new Error(`Pivot value must be between 0 and 10. Got: ${value.pivot_value} for value: ${value.label}`)
      }
    }
  }

  private parseConfig(config: unknown): { values: ResultTypeConfigValue[] } {
    // Type guard for config structure
    if (typeof config === 'object' && config !== null && 'values' in config) {
      const configObj = config as { values: unknown }
      if (Array.isArray(configObj.values)) {
        return { values: configObj.values as ResultTypeConfigValue[] }
      }
    }

    // Fallback to empty array if config is invalid
    return { values: [] }
  }

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
        config: this.parseConfig(item.config)
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
        config: this.parseConfig(data.config)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du type de résultat:', error)
      return null
    }
  }

  async createResultType(resultType: Omit<ResultTypeConfig, 'id'>): Promise<ResultTypeConfig | null> {
    try {
      // Validate pivot values are between 0 and 10
      this.validatePivotValues(resultType.config.values)

      const { data, error } = await supabase
        .from('result_type_configs')
        .insert({
          name: resultType.name,
          type: resultType.type,
          config: resultType.config as unknown as Json
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        config: this.parseConfig(data.config)
      }
    } catch (error) {
      console.error('Erreur lors de la création du type de résultat:', error)
      return null
    }
  }

  async updateResultType(id: string, resultType: Partial<ResultTypeConfig>): Promise<ResultTypeConfig | null> {
    try {
      // Validate pivot values are between 0 and 10
      if (resultType.config?.values) {
        this.validatePivotValues(resultType.config.values)
      }

      const { data, error } = await supabase
        .from('result_type_configs')
        .update({
          name: resultType.name,
          type: resultType.type,
          config: resultType.config as unknown as Json
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        config: this.parseConfig(data.config)
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