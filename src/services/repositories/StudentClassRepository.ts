/**
 * Student-Class Repository
 * Phase 4.3: Services Layer - Repository Pattern
 *
 * Manages the many-to-many relationship between students and classes,
 * including enrollment tracking, status management, and transfers.
 *
 * @example
 * ```typescript
 * // Enroll a student in a class
 * await studentClassRepository.enrollStudent({
 *   studentId: '123',
 *   classId: '456',
 *   schoolYearId: '789',
 *   status: 'active'
 * })
 *
 * // Get students for a class
 * const students = await studentClassRepository.getStudentsForClass('456')
 *
 * // Transfer student between classes
 * await studentClassRepository.transferStudent({
 *   studentId: '123',
 *   fromClassId: '456',
 *   toClassId: '789'
 * })
 * ```
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Student } from '@/types/student.types'
import type { Class } from '@/types/student.types'

type StudentClassRow = Database['public']['Tables']['student_classes']['Row']
type StudentRow = Database['public']['Tables']['students']['Row']
type ClassRow = Database['public']['Tables']['classes']['Row']
type SchoolYearRow = Database['public']['Tables']['school_years']['Row']

/**
 * Represents a student-class enrollment with optional relations
 */
export interface StudentClassRelation extends StudentClassRow {
  student?: StudentRow | null
  class?: ClassRow | null
  school_year?: SchoolYearRow | null
}

/**
 * DTO for enrolling a student in a class
 */
export interface EnrollStudentDTO {
  studentId: string
  classId: string
  schoolYearId?: string
  status?: 'active' | 'transferred' | 'graduated' | 'dropped'
}

/**
 * DTO for updating student-class enrollment status
 */
export interface UpdateStudentClassDTO {
  status?: 'active' | 'transferred' | 'graduated' | 'dropped'
}

/**
 * DTO for transferring a student between classes
 */
export interface TransferStudentDTO {
  studentId: string
  fromClassId: string
  toClassId: string
  schoolYearId?: string
}

/**
 * Repository for managing student-class enrollments and relationships
 */
export class StudentClassRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'StudentClass')
  }

  private async resolveCurrentSchoolYearId(): Promise<string | null> {
    const { data } = await this.supabase
      .from('school_years')
      .select('id')
      .eq('is_current', true)
      .single()

    return data?.id ?? null
  }

  /**
   * Fetch relations with optional filters.
   */
  async findRelations(filters: {
    studentId?: string
    classId?: string
    schoolYearId?: string
    status?: string
    includeDetails?: boolean
  } = {}): Promise<StudentClassRelation[]> {
    try {
      this.log('findRelations', filters)

      let query = this.supabase
        .from('student_classes')
        .select(filters.includeDetails
          ? `
            *,
            student:students(*),
            class:classes(*),
            school_year:school_years(*)
          `
          : '*'
        )

      if (filters.studentId) query = query.eq('student_id', filters.studentId)
      if (filters.classId) query = query.eq('class_id', filters.classId)
      if (filters.schoolYearId) query = query.eq('school_year_id', filters.schoolYearId)
      if (filters.status) query = query.eq('status', filters.status)

      const { data, error } = await query.order('enrolled_at', { ascending: false })

      if (error) throw error
      return (data || []) as unknown as StudentClassRelation[]
    } catch (error) {
      this.handleError('findRelations', error)
    }
  }

  /**
   * Subscribe to realtime changes on student_classes.
   */
  subscribeToChanges(
    callback: (payload: RealtimePostgresChangesPayload<StudentClassRow>) => void
  ) {
    this.log('subscribeToChanges')

    return this.supabase
      .channel('student_classes_changes')
      .on<StudentClassRow>('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'student_classes'
      }, callback)
      .subscribe()
  }

  /**
   * Fetch students associated with a class.
   */
  async getStudentsForClass(classId: string, schoolYearId?: string, status = 'active'): Promise<Student[]> {
    try {
      this.log('getStudentsForClass', { classId, schoolYearId, status })

      let query = this.supabase
        .from('student_classes')
        .select(`
          *,
          student:students(*)
        `)
        .eq('class_id', classId)
        .eq('status', status)

      if (schoolYearId) {
        query = query.eq('school_year_id', schoolYearId)
      } else {
        const currentYearId = await this.resolveCurrentSchoolYearId()
        if (currentYearId) {
          query = query.eq('school_year_id', currentYearId)
        }
      }

      const { data, error } = await query.order('enrolled_at', { ascending: true })

      if (error) {
        // fallback to legacy structure without student_classes table
        const fallback = await this.supabase
          .from('students')
          .select('*')
          .eq('class_id', classId)

        if (fallback.error) throw error

        return (fallback.data || []).map((student: StudentRow) => ({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          displayName: student.display_name,
          gender: student.gender,
          birthDate: student.birth_date
        }))
      }

      return ((data ?? []) as unknown as StudentClassRelation[])
        .map(entry => entry.student)
        .filter((student): student is StudentRow => Boolean(student))
        .map(student => ({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          displayName: student.display_name,
          gender: student.gender,
          birthDate: student.birth_date
        }))
    } catch (error) {
      this.handleError('getStudentsForClass', error)
    }
  }

  /**
   * Fetch classes linked to a student.
   */
  async getClassesForStudent(studentId: string, schoolYearId?: string): Promise<Class[]> {
    try {
      this.log('getClassesForStudent', { studentId, schoolYearId })

      let query = this.supabase
        .from('student_classes')
        .select(`
          *,
          class:classes(*)
        `)
        .eq('student_id', studentId)
        .eq('status', 'active')

      if (schoolYearId) {
        query = query.eq('school_year_id', schoolYearId)
      }

      const { data, error } = await query.order('enrolled_at', { ascending: false })

      if (error) throw error

      return ((data ?? []) as unknown as StudentClassRelation[])
        .map(entry => entry.class)
        .filter((cls): cls is ClassRow => Boolean(cls))
        .map(cls => ({
          id: cls.id,
          name: cls.name,
          description: cls.description ?? undefined,
          schoolYear: cls.school_year,
          level: cls.level ?? undefined,
          subject: cls.subject ?? undefined,
          active: cls.active,
          createdAt: cls.created_at,
          updatedAt: cls.updated_at
        }))
    } catch (error) {
      this.handleError('getClassesForStudent', error)
    }
  }

  /**
   * Enroll a student in a class.
   */
  async enrollStudent(dto: EnrollStudentDTO): Promise<StudentClassRow> {
    try {
      this.log('enrollStudent', dto)

      const schoolYearId = dto.schoolYearId ?? await this.resolveCurrentSchoolYearId()

      if (!schoolYearId) {
        throw new Error('School year ID is required for enrollment')
      }

      const { data, error } = await this.supabase
        .from('student_classes')
        .insert({
          student_id: dto.studentId,
          class_id: dto.classId,
          school_year_id: schoolYearId,
          status: dto.status ?? 'active'
        })
        .select()
        .single()

      if (error) throw error
      return data as StudentClassRow
    } catch (error) {
      this.handleError('enrollStudent', error)
    }
  }

  /**
   * Update an enrollment status.
   */
  async updateEnrollment(studentId: string, classId: string, dto: UpdateStudentClassDTO, schoolYearId?: string): Promise<StudentClassRow | null> {
    try {
      this.log('updateEnrollment', { studentId, classId, dto, schoolYearId })

      const { data, error } = await this.supabase
        .from('student_classes')
        .update({
          status: dto.status
        })
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .select()
        .maybeSingle()

      if (error) throw error
      return data as StudentClassRow | null
    } catch (error) {
      this.handleError('updateEnrollment', error)
    }
  }

  /**
   * Remove an enrollment (soft via status update).
   */
  async removeEnrollment(
    studentId: string,
    classId: string,
    status: UpdateStudentClassDTO['status'] = 'transferred',
    schoolYearId?: string
  ): Promise<StudentClassRow | null> {
    return await this.updateEnrollment(studentId, classId, { status }, schoolYearId)
  }

  /**
   * Transfer a student between classes.
   */
  async transferStudent(dto: TransferStudentDTO): Promise<{ from: StudentClassRow | null; to: StudentClassRow }> {
    try {
      this.log('transferStudent', dto)

      const from = await this.removeEnrollment(dto.studentId, dto.fromClassId, 'transferred', dto.schoolYearId)
      const to = await this.enrollStudent({
        studentId: dto.studentId,
        classId: dto.toClassId,
        schoolYearId: dto.schoolYearId,
        status: 'active'
      })

      return { from, to }
    } catch (error) {
      this.handleError('transferStudent', error)
    }
  }

  /**
   * Fetch statistics for a class.
   */
  async getStatistics(classId: string, schoolYearId?: string): Promise<Record<string, number>> {
    try {
      this.log('getStatistics', { classId, schoolYearId })

      let query = this.supabase
        .from('student_classes')
        .select('status')
        .eq('class_id', classId)

      if (schoolYearId) {
        query = query.eq('school_year_id', schoolYearId)
      } else {
        const currentYearId = await this.resolveCurrentSchoolYearId()
        if (currentYearId) {
          query = query.eq('school_year_id', currentYearId)
        }
      }

      const { data, error } = await query
      if (error) throw error

      const statuses = data || []

      const stats = {
        total: statuses.length,
        active: statuses.filter(item => item.status === 'active').length,
        transferred: statuses.filter(item => item.status === 'transferred').length,
        graduated: statuses.filter(item => item.status === 'graduated').length,
        dropped: statuses.filter(item => item.status === 'dropped').length
      }

      return stats
    } catch (error) {
      this.handleError('getStatistics', error)
    }
  }
}
