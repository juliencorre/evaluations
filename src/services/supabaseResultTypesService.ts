import { supabase } from '@/lib/supabase'
import type { ResultTypeConfig, ResultTypeConfigValue } from '@/types/evaluation'
import type { Json } from '@/types/database.types'

export class SupabaseResultTypesService {
  private validatePivotValues(values: ResultTypeConfigValue[]) {
    for (const value of values) {
      // Skip validation for N/A values (null pivot_value)
      if (value.pivot_value === null) continue

      if (value.pivot_value < 0 || value.pivot_value > 10) {
        throw new Error(`Pivot value must be between 0 and 10. Got: ${value.pivot_value} for value: ${value.label}`)
      }
    }
  }

  private parseConfig(config: unknown): { values: ResultTypeConfigValue[]; minValue?: number; maxValue?: number } {
    // Type guard for config structure
    if (typeof config === 'object' && config !== null) {
      const configObj = config as { values?: unknown; minValue?: number; maxValue?: number }
      
      // Parse values array if it exists
      const values = Array.isArray(configObj.values) ? configObj.values as ResultTypeConfigValue[] : []
      
      // Parse numeric configuration
      const result: { values: ResultTypeConfigValue[]; minValue?: number; maxValue?: number } = { values }
      
      if (typeof configObj.minValue === 'number') {
        result.minValue = configObj.minValue
      }
      
      if (typeof configObj.maxValue === 'number') {
        result.maxValue = configObj.maxValue
      }
      
      return result
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
      // Validate pivot values are between 0 and 10 (skip for numeric types which don't have predefined values)
      if (resultType.type !== 'numeric' && resultType.config.values.length > 0) {
        this.validatePivotValues(resultType.config.values)
      }

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
      // Validate pivot values are between 0 and 10 (skip for numeric types which don't have predefined values)
      if (resultType.config?.values && resultType.type !== 'numeric' && resultType.config.values.length > 0) {
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