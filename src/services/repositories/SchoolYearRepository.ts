/**
 * School Year Repository
 * Provides a typed interface over the school_years table.
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type SchoolYearRow = Database['public']['Tables']['school_years']['Row']
type SchoolYearInsert = Database['public']['Tables']['school_years']['Insert']
type SchoolYearUpdate = Database['public']['Tables']['school_years']['Update']

export interface SchoolYearEntity {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSchoolYearDTO {
  name: string
  startDate: string
  endDate: string
  isCurrent?: boolean
}

export interface UpdateSchoolYearDTO {
  name?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
}

export class SchoolYearRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'SchoolYear')
  }

  private mapToDomain(row: SchoolYearRow): SchoolYearEntity {
    return {
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isCurrent: row.is_current,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  async findAll(): Promise<SchoolYearEntity[]> {
    try {
      this.log('findAll')

      const { data, error } = await this.supabase
        .from('school_years')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error

      return (data || []).map(row => this.mapToDomain(row))
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  async findCurrent(): Promise<SchoolYearEntity | null> {
    try {
      this.log('findCurrent')

      const { data, error } = await this.supabase
        .from('school_years')
        .select('*')
        .eq('is_current', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data ? this.mapToDomain(data) : null
    } catch (error) {
      this.handleError('findCurrent', error)
    }
  }

  async findById(id: string): Promise<SchoolYearEntity | null> {
    try {
      this.log('findById', { id })

      const { data, error } = await this.supabase
        .from('school_years')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data ? this.mapToDomain(data) : null
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findByName(name: string): Promise<SchoolYearEntity | null> {
    try {
      this.log('findByName', { name })

      const { data, error } = await this.supabase
        .from('school_years')
        .select('*')
        .eq('name', name)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data ? this.mapToDomain(data) : null
    } catch (error) {
      this.handleError('findByName', error)
    }
  }

  async create(dto: CreateSchoolYearDTO): Promise<SchoolYearEntity> {
    try {
      this.log('create', dto)

      // Validate school year name format
      const validation = this.validateSchoolYearName(dto.name)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // If setting as current, disable other current years first
      if (dto.isCurrent) {
        await this.disableAllCurrent()
      }

      const payload: SchoolYearInsert = {
        name: dto.name,
        start_date: dto.startDate,
        end_date: dto.endDate,
        is_current: dto.isCurrent ?? false
      }

      const { data, error } = await this.supabase
        .from('school_years')
        .insert(payload)
        .select()
        .single()

      if (error) throw error
      return this.mapToDomain(data)
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async update(id: string, dto: UpdateSchoolYearDTO): Promise<SchoolYearEntity> {
    try {
      this.log('update', { id, dto })

      // If setting as current, disable other current years first
      if (dto.isCurrent) {
        await this.disableAllCurrent()
      }

      const payload: SchoolYearUpdate = {}
      if (dto.name !== undefined) payload.name = dto.name
      if (dto.startDate !== undefined) payload.start_date = dto.startDate
      if (dto.endDate !== undefined) payload.end_date = dto.endDate
      if (dto.isCurrent !== undefined) payload.is_current = dto.isCurrent
      payload.updated_at = new Date().toISOString()

      const { data, error } = await this.supabase
        .from('school_years')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return this.mapToDomain(data)
    } catch (error) {
      this.handleError('update', error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.log('delete', { id })

      const { error } = await this.supabase
        .from('school_years')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      this.handleError('delete', error)
    }
  }

  /**
   * Set the current school year by ID.
   */
  async setCurrent(id: string): Promise<void> {
    try {
      this.log('setCurrent', { id })

      // First disable all current school years
      const { error: resetError } = await this.supabase
        .from('school_years')
        .update({ is_current: false })
        .neq('id', 'dummy')

      if (resetError) throw resetError

      const { error } = await this.supabase
        .from('school_years')
        .update({
          is_current: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      this.handleError('setCurrent', error)
    }
  }

  /**
   * Disable all current school years (used before setting a new current year)
   */
  private async disableAllCurrent(): Promise<void> {
    const { error } = await this.supabase
      .from('school_years')
      .update({ is_current: false })
      .neq('id', 'dummy')

    if (error) throw error
  }

  /**
   * Validate school year name format (YYYY-YYYY)
   */
  validateSchoolYearName(name: string): { valid: boolean; error?: string } {
    const schoolYearPattern = /^\d{4}-\d{4}$/
    if (!schoolYearPattern.test(name)) {
      return {
        valid: false,
        error: 'Format invalide. Utilisez YYYY-YYYY (ex: 2024-2025)'
      }
    }

    const years = name.split('-')
    const startYear = parseInt(years[0])
    const endYear = parseInt(years[1])

    if (endYear !== startYear + 1) {
      return {
        valid: false,
        error: "L'année de fin doit être l'année suivante (ex: 2024-2025)"
      }
    }

    return { valid: true }
  }

  /**
   * Generate current school year name based on current date
   */
  getCurrentSchoolYearName(): string {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // September-December: school year started (currentYear-nextYear)
    // January-August: second part of school year (previousYear-currentYear)
    if (currentMonth >= 9) {
      return `${currentYear}-${currentYear + 1}`
    } else {
      return `${currentYear - 1}-${currentYear}`
    }
  }

  /**
   * Get or create the current school year based on date
   */
  async getOrCreateCurrentYear(): Promise<SchoolYearEntity> {
    try {
      this.log('getOrCreateCurrentYear')

      // Try to find existing current year
      let current = await this.findCurrent()
      if (current) return current

      // Generate the expected current year name
      const currentYearName = this.getCurrentSchoolYearName()

      // Check if it exists but not marked as current
      const existing = await this.findByName(currentYearName)
      if (existing) {
        // Mark it as current
        await this.setCurrent(existing.id)
        return existing
      }

      // Create new school year
      const years = currentYearName.split('-')
      const startYear = parseInt(years[0])
      const endYear = parseInt(years[1])

      const newYear = await this.create({
        name: currentYearName,
        startDate: `${startYear}-09-01`,
        endDate: `${endYear}-08-31`,
        isCurrent: true
      })

      return newYear
    } catch (error) {
      this.handleError('getOrCreateCurrentYear', error)
    }
  }

  subscribeToChanges(
    callback: (payload: RealtimePostgresChangesPayload<SchoolYearRow>) => void
  ) {
    this.log('subscribeToChanges')

    return this.supabase
      .channel('school_years_changes')
      .on<SchoolYearRow>('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'school_years'
      }, callback)
      .subscribe()
  }
}
