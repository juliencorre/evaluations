/**
 * Competency Repository
 * Phase 4.3: Services Layer - Repository Pattern
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Domain, Field, Competency, SpecificCompetency, CompetencyFramework } from '@/types/competency.types'
import type {
  CreateDomainDTO,
  UpdateDomainDTO,
  CreateFieldDTO,
  UpdateFieldDTO,
  CreateCompetencyDTO,
  UpdateCompetencyDTO,
  CreateSpecificCompetencyDTO,
  UpdateSpecificCompetencyDTO
} from '@/types/dtos'

type SupabaseDomain = Database['public']['Tables']['domains']['Row']
type SupabaseField = Database['public']['Tables']['fields']['Row']
type SupabaseCompetency = Database['public']['Tables']['competencies']['Row']
type SupabaseFramework = Database['public']['Tables']['competency_frameworks']['Row']

export class CompetencyRepository extends BaseRepository {
  private defaultFrameworkId: string | null = null

  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'Competency')
  }

  /**
   * Get or create default framework
   */
  async getOrCreateDefaultFramework(): Promise<CompetencyFramework> {
    try {
      this.log('getOrCreateDefaultFramework')

      if (!this.defaultFrameworkId) {
        const { data: existing } = await this.supabase
          .from('competency_frameworks')
          .select('*')
          .eq('name', 'Framework par défaut')
          .single()

        if (existing) {
          this.defaultFrameworkId = existing.id
          return this.mapFrameworkToDomain(existing)
        }

        const { data: newFramework, error } = await this.supabase
          .from('competency_frameworks')
          .insert({
            name: 'Framework par défaut',
            version: '1.0',
            description: 'Framework de compétences par défaut'
          })
          .select()
          .single()

        if (error) throw error

        this.defaultFrameworkId = newFramework.id
        return this.mapFrameworkToDomain(newFramework)
      }

      const { data, error } = await this.supabase
        .from('competency_frameworks')
        .select('*')
        .eq('id', this.defaultFrameworkId)
        .single()

      if (error) throw error

      return this.mapFrameworkToDomain(data)
    } catch (error) {
      this.handleError('getOrCreateDefaultFramework', error)
    }
  }

  /**
   * Find all domains with nested relations
   */
  async findAllDomains(): Promise<Domain[]> {
    try {
      this.log('findAllDomains')

      if (!this.defaultFrameworkId) {
        await this.getOrCreateDefaultFramework()
      }

      const { data, error } = await this.supabase
        .from('domains')
        .select(`
          *,
          fields (
            *,
            competencies (
              *,
              specific_competencies (
                *,
                result_type_configs (*)
              )
            )
          )
        `)
        .eq('framework_id', this.defaultFrameworkId!)
        .order('order_index')

      if (error) throw error

      return (data || []).map(domain => this.mapDomainWithChildren(domain))
    } catch (error) {
      this.handleError('findAllDomains', error)
    }
  }

  /**
   * Create domain
   */
  async createDomain(dto: CreateDomainDTO): Promise<Domain> {
    try {
      this.log('createDomain', dto)

      if (!this.defaultFrameworkId) {
        await this.getOrCreateDefaultFramework()
      }

      const { count } = await this.supabase
        .from('domains')
        .select('*', { count: 'exact', head: true })
        .eq('framework_id', this.defaultFrameworkId!)

      const { data, error } = await this.supabase
        .from('domains')
        .insert({
          framework_id: this.defaultFrameworkId!,
          name: dto.name,
          description: dto.description,
          order_index: count || 0
        })
        .select()
        .single()

      if (error) throw error

      return this.mapDomainToDomain(data)
    } catch (error) {
      this.handleError('createDomain', error)
    }
  }

  /**
   * Update domain
   */
  async updateDomain(domainId: string, dto: UpdateDomainDTO): Promise<Domain | null> {
    try {
      this.log('updateDomain', { domainId, dto })

      const { data, error } = await this.supabase
        .from('domains')
        .update(dto)
        .eq('id', domainId)
        .select()
        .single()

      if (error) throw error

      return data ? this.mapDomainToDomain(data) : null
    } catch (error) {
      this.handleError('updateDomain', error)
    }
  }

  /**
   * Delete domain
   */
  async deleteDomain(domainId: string): Promise<void> {
    try {
      this.log('deleteDomain', { domainId })

      const { error } = await this.supabase
        .from('domains')
        .delete()
        .eq('id', domainId)

      if (error) throw error
    } catch (error) {
      this.handleError('deleteDomain', error)
    }
  }

  /**
   * Create field
   */
  async createField(dto: CreateFieldDTO): Promise<Field> {
    try {
      this.log('createField', dto)

      const { count } = await this.supabase
        .from('fields')
        .select('*', { count: 'exact', head: true })
        .eq('domain_id', dto.domainId)

      const { data, error } = await this.supabase
        .from('fields')
        .insert({
          domain_id: dto.domainId,
          name: dto.name,
          description: dto.description,
          order_index: count || 0
        })
        .select()
        .single()

      if (error) throw error

      return this.mapFieldToField(data)
    } catch (error) {
      this.handleError('createField', error)
    }
  }

  /**
   * Update field
   */
  async updateField(fieldId: string, dto: UpdateFieldDTO): Promise<Field | null> {
    try {
      this.log('updateField', { fieldId, dto })

      const { data, error } = await this.supabase
        .from('fields')
        .update(dto)
        .eq('id', fieldId)
        .select()
        .single()

      if (error) throw error

      return data ? this.mapFieldToField(data) : null
    } catch (error) {
      this.handleError('updateField', error)
    }
  }

  /**
   * Delete field
   */
  async deleteField(fieldId: string): Promise<void> {
    try {
      this.log('deleteField', { fieldId })

      const { error } = await this.supabase
        .from('fields')
        .delete()
        .eq('id', fieldId)

      if (error) throw error
    } catch (error) {
      this.handleError('deleteField', error)
    }
  }

  /**
   * Create competency
   */
  async createCompetency(dto: CreateCompetencyDTO): Promise<Competency> {
    try {
      this.log('createCompetency', dto)

      const { count } = await this.supabase
        .from('competencies')
        .select('*', { count: 'exact', head: true })
        .eq('field_id', dto.fieldId)

      const { data, error } = await this.supabase
        .from('competencies')
        .insert({
          field_id: dto.fieldId,
          name: dto.name,
          description: dto.description,
          order_index: count || 0
        })
        .select()
        .single()

      if (error) throw error

      return this.mapCompetencyToCompetency(data)
    } catch (error) {
      this.handleError('createCompetency', error)
    }
  }

  /**
   * Update competency
   */
  async updateCompetency(competencyId: string, dto: UpdateCompetencyDTO): Promise<Competency | null> {
    try {
      this.log('updateCompetency', { competencyId, dto })

      const { data, error } = await this.supabase
        .from('competencies')
        .update(dto)
        .eq('id', competencyId)
        .select()
        .single()

      if (error) throw error

      return data ? this.mapCompetencyToCompetency(data) : null
    } catch (error) {
      this.handleError('updateCompetency', error)
    }
  }

  /**
   * Delete competency
   */
  async deleteCompetency(competencyId: string): Promise<void> {
    try {
      this.log('deleteCompetency', { competencyId })

      const { error } = await this.supabase
        .from('competencies')
        .delete()
        .eq('id', competencyId)

      if (error) throw error
    } catch (error) {
      this.handleError('deleteCompetency', error)
    }
  }

  /**
   * Create specific competency
   */
  async createSpecificCompetency(dto: CreateSpecificCompetencyDTO): Promise<SpecificCompetency> {
    try {
      this.log('createSpecificCompetency', dto)

      const { count } = await this.supabase
        .from('specific_competencies')
        .select('*', { count: 'exact', head: true })
        .eq('competency_id', dto.competencyId)

      const { data, error } = await this.supabase
        .from('specific_competencies')
        .insert({
          competency_id: dto.competencyId,
          name: dto.name,
          description: dto.description,
          result_type_config_id: dto.resultTypeConfigId || '',
          order_index: count || 0
        })
        .select()
        .single()

      if (error) throw error

      return this.mapSpecificCompetencyToSpecificCompetency(data)
    } catch (error) {
      this.handleError('createSpecificCompetency', error)
    }
  }

  /**
   * Update specific competency
   */
  async updateSpecificCompetency(
    specificCompetencyId: string,
    dto: UpdateSpecificCompetencyDTO
  ): Promise<SpecificCompetency | null> {
    try {
      this.log('updateSpecificCompetency', { specificCompetencyId, dto })

      const dbUpdates: any = {}
      if (dto.name !== undefined) dbUpdates.name = dto.name
      if (dto.description !== undefined) dbUpdates.description = dto.description
      if (dto.resultTypeConfigId !== undefined) {
        dbUpdates.result_type_config_id = dto.resultTypeConfigId
      }

      const { data, error } = await this.supabase
        .from('specific_competencies')
        .update(dbUpdates)
        .eq('id', specificCompetencyId)
        .select()
        .single()

      if (error) throw error

      return data ? this.mapSpecificCompetencyToSpecificCompetency(data) : null
    } catch (error) {
      this.handleError('updateSpecificCompetency', error)
    }
  }

  /**
   * Delete specific competency
   */
  async deleteSpecificCompetency(specificCompetencyId: string): Promise<void> {
    try {
      this.log('deleteSpecificCompetency', { specificCompetencyId })

      const { error } = await this.supabase
        .from('specific_competencies')
        .delete()
        .eq('id', specificCompetencyId)

      if (error) throw error
    } catch (error) {
      this.handleError('deleteSpecificCompetency', error)
    }
  }

  // Mapping functions
  private mapFrameworkToDomain(row: SupabaseFramework): CompetencyFramework {
    return {
      id: row.id,
      name: row.name,
      version: row.version || '1.0',
      domains: []
    }
  }

  private mapDomainToDomain(row: SupabaseDomain): Domain {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      fields: []
    }
  }

  private mapDomainWithChildren(row: any): Domain {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      fields: (row.fields || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((field: any) => this.mapFieldWithChildren(field))
    }
  }

  private mapFieldToField(row: SupabaseField): Field {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      competencies: []
    }
  }

  private mapFieldWithChildren(row: any): Field {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      competencies: (row.competencies || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((comp: any) => this.mapCompetencyWithChildren(comp))
    }
  }

  private mapCompetencyToCompetency(row: SupabaseCompetency): Competency {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      specificCompetencies: []
    }
  }

  private mapCompetencyWithChildren(row: any): Competency {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      specificCompetencies: (row.specific_competencies || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((spec: any) => this.mapSpecificCompetencyToSpecificCompetency(spec))
    }
  }

  private mapSpecificCompetencyToSpecificCompetency(row: any): SpecificCompetency {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      resultTypeConfigId: row.result_type_config_id,
      resultTypeConfig: row.result_type_configs
        ? {
            id: row.result_type_configs.id,
            name: row.result_type_configs.name,
            type: row.result_type_configs.type,
            config: row.result_type_configs.config
          }
        : undefined
    }
  }
}
