/**
 * Student Repository
 * Phase 4.3: Services Layer - Repository Pattern
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Student } from '@/types/student.types'
import type { CreateStudentDTO, UpdateStudentDTO, BulkImportStudentDTO } from '@/types/dtos'

type SupabaseStudent = Database['public']['Tables']['students']['Row']
type SupabaseStudentInsert = Database['public']['Tables']['students']['Insert']
type SupabaseStudentUpdate = Database['public']['Tables']['students']['Update']

export class StudentRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'Student')
  }

  /**
   * Map Supabase student to domain model
   */
  private mapToDomain(supabaseStudent: SupabaseStudent): Student {
    return {
      id: supabaseStudent.id,
      firstName: supabaseStudent.first_name,
      lastName: supabaseStudent.last_name,
      displayName: supabaseStudent.display_name,
      gender: supabaseStudent.gender || null,
      birthDate: supabaseStudent.birth_date || null
    }
  }

  /**
   * Generate display name
   */
  private generateDisplayName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName.charAt(0)}.`
  }

  /**
   * Find all students
   */
  async findAll(): Promise<Student[]> {
    try {
      this.log('findAll')

      const { data, error } = await this.supabase
        .from('students')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error

      return (data || []).map(student => this.mapToDomain(student))
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  /**
   * Find student by ID
   */
  async findById(id: string): Promise<Student | null> {
    try {
      this.log('findById', { id })

      const { data, error } = await this.supabase
        .from('students')
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

  /**
   * Create new student
   */
  async create(dto: CreateStudentDTO): Promise<Student> {
    try {
      this.log('create', dto)

      const displayName = this.generateDisplayName(dto.firstName, dto.lastName)

      const newStudent: SupabaseStudentInsert = {
        first_name: dto.firstName,
        last_name: dto.lastName,
        display_name: displayName,
        gender: dto.gender || null,
        birth_date: dto.birthDate || null
      }

      const { data, error } = await this.supabase
        .from('students')
        .insert(newStudent)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from insert')

      return this.mapToDomain(data)
    } catch (error) {
      this.handleError('create', error)
    }
  }

  /**
   * Update existing student
   */
  async update(id: string, dto: UpdateStudentDTO): Promise<Student | null> {
    try {
      this.log('update', { id, dto })

      const updateData: SupabaseStudentUpdate = {}

      if (dto.firstName !== undefined) updateData.first_name = dto.firstName
      if (dto.lastName !== undefined) updateData.last_name = dto.lastName
      if (dto.gender !== undefined) updateData.gender = dto.gender
      if (dto.birthDate !== undefined) updateData.birth_date = dto.birthDate

      // Regenerate display name if name changed
      if (dto.firstName || dto.lastName) {
        const current = await this.findById(id)
        if (!current) return null

        const firstName = dto.firstName || current.firstName
        const lastName = dto.lastName || current.lastName
        updateData.display_name = this.generateDisplayName(firstName, lastName)
      }

      const { data, error } = await this.supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data ? this.mapToDomain(data) : null
    } catch (error) {
      this.handleError('update', error)
    }
  }

  /**
   * Delete student
   */
  async delete(id: string): Promise<boolean> {
    try {
      this.log('delete', { id })

      const { error } = await this.supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      this.handleError('delete', error)
    }
  }

  /**
   * Search students
   */
  async search(searchTerm: string): Promise<Student[]> {
    try {
      this.log('search', { searchTerm })

      const { data, error } = await this.supabase
        .from('students')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .order('first_name', { ascending: true })

      if (error) throw error

      return (data || []).map(student => this.mapToDomain(student))
    } catch (error) {
      this.handleError('search', error)
    }
  }

  /**
   * Bulk import students
   */
  async bulkImport(students: BulkImportStudentDTO[]): Promise<Student[]> {
    try {
      this.log('bulkImport', { count: students.length })

      const studentsToInsert: SupabaseStudentInsert[] = students.map(student => ({
        first_name: student.firstName,
        last_name: student.lastName,
        display_name: this.generateDisplayName(student.firstName, student.lastName)
      }))

      const { data, error } = await this.supabase
        .from('students')
        .insert(studentsToInsert)
        .select()

      if (error) throw error

      return (data || []).map(student => this.mapToDomain(student))
    } catch (error) {
      this.handleError('bulkImport', error)
    }
  }

  /**
   * Subscribe to real-time changes
   */
  subscribeToChanges(callback: (payload: unknown) => void) {
    this.log('subscribeToChanges')

    return this.supabase
      .channel('students-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'students'
      }, callback)
      .subscribe()
  }
}
