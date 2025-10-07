/**
 * Class Repository
 * Phase 4.3: Services Layer - Repository Pattern
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Class, ClassTeacher } from '@/types/student.types'
import type { CreateClassDTO, UpdateClassDTO, AddUserToClassDTO } from '@/types/dtos'

export class ClassRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'Class')
  }
  /**
   * Map database row to domain model
   */
  private mapToDomain(row: any): Class {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      schoolYear: row.school_year,
      level: row.level ?? undefined,
      subject: row.subject ?? undefined,
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  /**
   * Find all searchable classes (bypasses RLS)
   */
  async findAll(): Promise<Class[]> {
    try {
      this.log('findAll')

      const { data, error } = await this.supabase
        .rpc('get_searchable_classes')

      if (error) throw error

      return (data || []).map((cls: any) => this.mapToDomain(cls))
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  /**
   * Find classes for specific user
   */
  async findByUser(userId: string): Promise<Class[]> {
    try {
      this.log('findByUser', { userId })

      const { data, error } = await this.supabase
        .from('user_classes')
        .select(`
          class_id,
          role,
          classes:class_id!inner (
            id,
            name,
            description,
            school_year,
            level,
            subject,
            active,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      return (data || [])
        .map(item => item.classes)
        .filter((cls): cls is any => Boolean(cls))
        .filter(cls => cls.active)
        .map(cls => this.mapToDomain(cls))
    } catch (error) {
      this.handleError('findByUser', error)
    }
  }

  /**
   * Find class by ID
   */
  async findById(id: string): Promise<Class | null> {
    try {
      this.log('findById', { id })

      const { data, error } = await this.supabase
        .from('classes')
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
   * Create new class
   */
  async create(dto: CreateClassDTO): Promise<Class> {
    try {
      this.log('create', dto)

      const insertData = {
        name: dto.name,
        description: dto.description,
        school_year: dto.schoolYear,
        level: dto.level,
        subject: dto.subject,
        active: dto.active ?? true
      }

      const { data, error } = await this.supabase
        .from('classes')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      return this.mapToDomain(data)
    } catch (error) {
      this.handleError('create', error)
    }
  }

  /**
   * Update existing class
   */
  async update(id: string, dto: UpdateClassDTO): Promise<Class> {
    try {
      this.log('update', { id, dto })

      const updateData: any = {}

      if (dto.name !== undefined) updateData.name = dto.name
      if (dto.description !== undefined) updateData.description = dto.description
      if (dto.schoolYear !== undefined) updateData.school_year = dto.schoolYear
      if (dto.level !== undefined) updateData.level = dto.level
      if (dto.subject !== undefined) updateData.subject = dto.subject
      if (dto.active !== undefined) updateData.active = dto.active

      const { data, error } = await this.supabase
        .from('classes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapToDomain(data)
    } catch (error) {
      this.handleError('update', error)
    }
  }

  /**
   * Soft delete class
   */
  async delete(id: string): Promise<void> {
    try {
      this.log('delete', { id })

      const { error } = await this.supabase
        .from('classes')
        .update({ active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      this.handleError('delete', error)
    }
  }

  /**
   * Add user to class
   */
  async addUser(dto: AddUserToClassDTO): Promise<any> {
    try {
      this.log('addUser', dto)

      const { data, error } = await this.supabase
        .from('user_classes')
        .insert({
          user_id: dto.userId,
          class_id: dto.classId,
          role: dto.role || 'teacher'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      this.handleError('addUser', error)
    }
  }

  /**
   * Remove user from class
   */
  async removeUser(userId: string, classId: string): Promise<void> {
    try {
      this.log('removeUser', { userId, classId })

      const { error } = await this.supabase
        .from('user_classes')
        .delete()
        .eq('user_id', userId)
        .eq('class_id', classId)

      if (error) throw error
    } catch (error) {
      this.handleError('removeUser', error)
    }
  }

  /**
   * Get class teachers (uses RPC function)
   */
  async getTeachers(classId: string): Promise<ClassTeacher[]> {
    try {
      this.log('getTeachers', { classId })

      const { data, error } = await this.supabase
        .rpc('get_class_members', { p_class_id: classId })

      if (error) throw error

      return (data || []).map((member: any) => ({
        id: member.id,
        classId: member.class_id,
        userId: member.user_id,
        role: member.role,
        email: member.user_email || 'Email non disponible',
        fullName: member.user_full_name || 'Nom non disponible',
        createdAt: member.created_at,
        updatedAt: member.created_at
      }))
    } catch {
      // Fallback to alternative method
      return this.getTeachersAlternative(classId)
    }
  }

  /**
   * Alternative method for getting teachers
   */
  private async getTeachersAlternative(classId: string): Promise<ClassTeacher[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_classes')
        .select('id, class_id, user_id, role, created_at')
        .eq('class_id', classId)
        .order('role')
        .order('created_at')

      if (error) throw error

      return (data || []).map(teacher => ({
        id: teacher.id,
        classId: teacher.class_id,
        userId: teacher.user_id,
        role: teacher.role as 'teacher' | 'owner' | 'assistant',
        email: 'Email non disponible',
        fullName: 'Nom non disponible',
        createdAt: teacher.created_at,
        updatedAt: teacher.created_at
      }))
    } catch (error) {
      this.handleError('getTeachersAlternative', error)
    }
  }
}
