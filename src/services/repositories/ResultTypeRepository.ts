/**
 * ResultType Repository
 * Phase 4.3: Services Layer - Repository Pattern
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Json } from '@/types/supabase'
import type { ResultTypeConfig, ResultTypeConfigValue } from '@/types/result.types'
import type { CreateResultTypeDTO, UpdateResultTypeDTO } from '@/types/dtos'

export class ResultTypeRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'ResultType')
  }

  /**
   * Validate pivot values are between 0 and 10
   */
  private validatePivotValues(values: ResultTypeConfigValue[]): void {
    for (const value of values) {
      if (value.pivot_value === null) continue

      if (value.pivot_value < 0 || value.pivot_value > 10) {
        throw new Error(
          `Pivot value must be between 0 and 10. Got: ${value.pivot_value} for value: ${value.label}`
        )
      }
    }
  }

  /**
   * Parse config from database JSON
   */
  private parseConfig(config: unknown): {
    values: ResultTypeConfigValue[]
    minValue?: number
    maxValue?: number
  } {
    if (typeof config === 'object' && config !== null) {
      const configObj = config as {
        values?: unknown
        minValue?: number
        maxValue?: number
      }

      const values = Array.isArray(configObj.values)
        ? (configObj.values as ResultTypeConfigValue[])
        : []

      const result: {
        values: ResultTypeConfigValue[]
        minValue?: number
        maxValue?: number
      } = { values }

      if (typeof configObj.minValue === 'number') {
        result.minValue = configObj.minValue
      }

      if (typeof configObj.maxValue === 'number') {
        result.maxValue = configObj.maxValue
      }

      return result
    }

    return { values: [] }
  }

  /**
   * Find all result types
   */
  async findAll(): Promise<ResultTypeConfig[]> {
    try {
      this.log('findAll')

      const { data, error } = await this.supabase
        .from('result_type_configs')
        .select('*')
        .order('name')

      if (error) throw error

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        config: this.parseConfig(item.config)
      }))
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  /**
   * Find result type by ID
   */
  async findById(id: string): Promise<ResultTypeConfig | null> {
    try {
      this.log('findById', { id })

      const { data, error } = await this.supabase
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
      this.handleError('findById', error)
    }
  }

  /**
   * Create result type
   */
  async create(dto: CreateResultTypeDTO): Promise<ResultTypeConfig | null> {
    try {
      this.log('create', dto)

      if (dto.type !== 'numeric' && dto.config.values.length > 0) {
        this.validatePivotValues(dto.config.values)
      }

      const { data, error } = await this.supabase
        .from('result_type_configs')
        .insert({
          name: dto.name,
          type: dto.type,
          config: dto.config as unknown as Json
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
      this.handleError('create', error)
    }
  }

  /**
   * Update result type
   */
  async update(id: string, dto: UpdateResultTypeDTO): Promise<ResultTypeConfig | null> {
    try {
      this.log('update', { id, dto })

      if (
        dto.config?.values &&
        dto.type !== 'numeric' &&
        dto.config.values.length > 0
      ) {
        this.validatePivotValues(dto.config.values)
      }

      const { data, error } = await this.supabase
        .from('result_type_configs')
        .update({
          name: dto.name,
          type: dto.type,
          config: dto.config as unknown as Json
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
      this.handleError('update', error)
    }
  }

  /**
   * Delete result type
   */
  async delete(id: string): Promise<boolean> {
    try {
      this.log('delete', { id })

      const { error } = await this.supabase
        .from('result_type_configs')
        .delete()
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      this.handleError('delete', error)
    }
  }
}
