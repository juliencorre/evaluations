/**
 * Evaluation Repository
 * Phase 4.3: Services Layer - Repository Pattern
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Evaluation } from '@/types/evaluation.types'
import type { CreateEvaluationDTO, UpdateEvaluationDTO } from '@/types/dtos'
import { supabaseEvaluationsService } from '@/services/supabaseEvaluationsService'

type EvaluationRow = Database['public']['Tables']['evaluations']['Row']
type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert']
type EvaluationUpdate = Database['public']['Tables']['evaluations']['Update']
// type EvaluationClassRow = Database['public']['Tables']['evaluation_classes']['Row'] // TODO: Add evaluation_classes table

export class EvaluationRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'Evaluation')
  }

  /**
   * Map database row to domain model
   */
  private mapToDomain(row: EvaluationRow): Evaluation {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      frameworkId: row.framework_id,
      classId: '', // TODO: Add class_id to evaluations table or use evaluation_classes join table
      createdAt: row.created_at || new Date().toISOString(),
      results: []
    }
  }

  /**
   * Find all evaluations
   */
  async findAll(): Promise<Evaluation[]> {
    try {
      this.log('findAll')

      const { data, error } = await this.supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      return (data || []).map(row => this.mapToDomain(row))
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  /**
   * Find evaluation by ID
   */
  async findById(id: string): Promise<Evaluation | null> {
    try {
      this.log('findById', { id })

      const { data, error } = await this.supabase
        .from('evaluations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null

      return this.mapToDomain(data)
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  /**
   * Find evaluations by class ID
   * TODO: Implement when evaluation_classes table is added
   */
  async findByClass(classId: string, schoolYearId?: string): Promise<Evaluation[]> {
    try {
      this.log('findByClass', { classId, schoolYearId })
      return await supabaseEvaluationsService.getEvaluationsByClass(classId, schoolYearId)
    } catch (error) {
      this.handleError('findByClass', error)
    }
  }

  /**
   * Find evaluations by multiple class IDs
   */
  async findByClasses(classIds: string[]): Promise<Evaluation[]> {
    try {
      this.log('findByClasses', { classIdsCount: classIds.length })
      return await supabaseEvaluationsService.getEvaluationsByClasses(classIds)
    } catch (error) {
      this.handleError('findByClasses', error)
    }
  }

  /**
   * Create new evaluation
   */
  async create(dto: CreateEvaluationDTO): Promise<Evaluation | null> {
    try {
      this.log('create', dto)

      const insertData: EvaluationInsert = {
        name: dto.name,
        description: dto.description,
        framework_id: dto.frameworkId
      }

      const { data, error } = await this.supabase
        .from('evaluations')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return this.mapToDomain(data)
    } catch (error) {
      this.handleError('create', error)
    }
  }

  /**
   * Update evaluation
   */
  async update(id: string, dto: UpdateEvaluationDTO): Promise<Evaluation | null> {
    try {
      this.log('update', { id, dto })

      const updateData: EvaluationUpdate = {
        name: dto.name,
        description: dto.description,
        framework_id: dto.frameworkId
      }

      const { data, error } = await this.supabase
        .from('evaluations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) return null

      return this.mapToDomain(data)
    } catch (error) {
      this.handleError('update', error)
    }
  }

  /**
   * Delete evaluation
   */
  async delete(id: string): Promise<boolean> {
    try {
      this.log('delete', { id })

      const { error } = await this.supabase
        .from('evaluations')
        .delete()
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      this.handleError('delete', error)
    }
  }
}
