// @ts-nocheck
import type { Database } from '../types/supabase'
import type { Class } from '@/types/evaluation'
import { supabase } from '../lib/supabase'

type ClassInsert = Database['public']['Tables']['classes']['Insert']
type ClassUpdate = Database['public']['Tables']['classes']['Update']
type UserClass = Database['public']['Tables']['user_classes']['Row']

export class SupabaseClassesService {
  /**
   * Get all active classes
   */
  async getClasses(): Promise<Class[]> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('active', true)
        .order('school_year', { ascending: false })
        .order('level')
        .order('name')

      if (error) throw error

      return (data || []).map(cls => ({
        id: cls.id,
        name: cls.name,
        description: cls.description ?? undefined,
        schoolYear: cls.school_year, // Map snake_case to camelCase
        level: cls.level ?? undefined,
        subject: cls.subject ?? undefined,
        active: cls.active,
        createdAt: cls.created_at,
        updatedAt: cls.updated_at
      }))
    } catch (error) {
      console.error('Error fetching classes:', error)
      throw error
    }
  }

  /**
   * Get classes for a specific user
   */
  async getClassesForUser(userId: string): Promise<Class[]> {
    try {
      const { data, error } = await supabase
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

      // Transform the data to return just the classes, filtering for active ones
      const classes = (data || [])
        .map(item => item.classes)
        .filter((cls): cls is Database['public']['Tables']['classes']['Row'] => Boolean(cls))
        .filter(cls => cls.active)
        .map(cls => ({
          id: cls.id,
          name: cls.name,
          description: cls.description ?? undefined,
          schoolYear: cls.school_year, // Map snake_case to camelCase
          level: cls.level ?? undefined,
          subject: cls.subject ?? undefined,
          active: cls.active,
          createdAt: cls.created_at,
          updatedAt: cls.updated_at
        }))

      return classes
    } catch (error) {
      console.error('Error fetching user classes:', error)
      throw error
    }
  }

  /**
   * Get a single class by ID
   */
  async getClass(id: string): Promise<Class | null> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id,
        name: data.name,
        description: data.description ?? undefined,
        schoolYear: data.school_year, // Map snake_case to camelCase
        level: data.level ?? undefined,
        subject: data.subject ?? undefined,
        active: data.active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error fetching class:', error)
      throw error
    }
  }

  /**
   * Create a new class
   */
  async createClass(classData: ClassInsert): Promise<Class> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description ?? undefined,
        schoolYear: data.school_year, // Map snake_case to camelCase
        level: data.level ?? undefined,
        subject: data.subject ?? undefined,
        active: data.active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error creating class:', error)
      throw error
    }
  }

  /**
   * Update a class
   */
  async updateClass(id: string, updates: ClassUpdate): Promise<Class> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description ?? undefined,
        schoolYear: data.school_year, // Map snake_case to camelCase
        level: data.level ?? undefined,
        subject: data.subject ?? undefined,
        active: data.active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error updating class:', error)
      throw error
    }
  }

  /**
   * Delete a class (soft delete by setting active = false)
   */
  async deleteClass(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('classes')
        .update({ active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting class:', error)
      throw error
    }
  }

  /**
   * Associate a user with a class
   */
  async addUserToClass(userId: string, classId: string, role: string = 'teacher'): Promise<UserClass> {
    try {
      const { data, error } = await supabase
        .from('user_classes')
        .insert({
          user_id: userId,
          class_id: classId,
          role
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding user to class:', error)
      throw error
    }
  }

  /**
   * Remove a user from a class
   */
  async removeUserFromClass(userId: string, classId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_classes')
        .delete()
        .eq('user_id', userId)
        .eq('class_id', classId)

      if (error) throw error
    } catch (error) {
      console.error('Error removing user from class:', error)
      throw error
    }
  }

  /**
   * Get users associated with a class
   */
  async getClassUsers(classId: string): Promise<UserClass[]> {
    try {
      const { data, error } = await supabase
        .from('user_classes')
        .select('*')
        .eq('class_id', classId)
        .order('role')
        .order('created_at')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching class users:', error)
      throw error
    }
  }

  /**
   * Get students in a specific class
   */
  async getStudentsInClass(classId: string) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('last_name')
        .order('first_name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching students in class:', error)
      throw error
    }
  }

  /**
   * Get evaluations for a specific class
   */
  async getEvaluationsForClass(classId: string) {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          competency_frameworks (
            id,
            name,
            version,
            description
          )
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching evaluations for class:', error)
      throw error
    }
  }

  /**
   * Get teachers for a specific class (using existing user_classes table)
   */
  async getClassTeachers(classId: string) {
    try {
      console.log('📚 Fetching teachers for class:', classId)

      // First get the user_classes data
      const { data: userClassesData, error: userClassesError } = await supabase
        .from('user_classes')
        .select(`
          id,
          class_id,
          user_id,
          role,
          created_at
        `)
        .eq('class_id', classId)
        .order('role')
        .order('created_at')

      console.log('📊 User classes result:', { userClassesData, userClassesError })

      if (userClassesError) throw userClassesError

      // Now fetch user details for each user_id
      const teachers = await Promise.all((userClassesData || []).map(async (teacher) => {
        // Get user metadata from auth.users via RPC or direct query
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_email', { user_uuid: teacher.user_id })
          .single()

        console.log('👤 User data for', teacher.user_id, ':', { userData, userError })

        return {
          id: teacher.id,
          classId: teacher.class_id,
          userId: teacher.user_id,
          role: teacher.role,
          email: userData?.email || 'Email non disponible',
          fullName: userData?.raw_user_meta_data?.full_name || userData?.raw_user_meta_data?.name || 'Nom non disponible',
          createdAt: teacher.created_at,
          updatedAt: teacher.created_at
        }
      }))

      console.log('👥 Mapped teachers with user data:', teachers)
      return teachers
    } catch (error) {
      console.error('Error fetching class teachers:', error)
      // If RPC fails, try alternative approach
      return this.getClassTeachersAlternative(classId)
    }
  }

  /**
   * Alternative method to get teachers if RPC is not available
   */
  private async getClassTeachersAlternative(classId: string) {
    try {
      const { data, error } = await supabase
        .from('user_classes')
        .select(`
          id,
          class_id,
          user_id,
          role,
          created_at
        `)
        .eq('class_id', classId)
        .order('role')
        .order('created_at')

      if (error) throw error

      return (data || []).map(teacher => ({
        id: teacher.id,
        classId: teacher.class_id,
        userId: teacher.user_id,
        role: teacher.role,
        email: 'Email non disponible',
        fullName: 'Nom non disponible',
        createdAt: teacher.created_at,
        updatedAt: teacher.created_at
      }))
    } catch (error) {
      console.error('Error in alternative teacher fetch:', error)
      return []
    }
  }
}

export const supabaseClassesService = new SupabaseClassesService()