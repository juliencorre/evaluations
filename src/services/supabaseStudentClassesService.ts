import { supabase } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Student } from '@/types/evaluation'
import type { Database } from '@/types/supabase'

export interface StudentClass {
  id: string
  student_id: string
  class_id: string
  school_year_id: string
  enrolled_at: string
  status: 'active' | 'transferred' | 'graduated' | 'dropped'
  created_at: string
  updated_at: string
}

export interface StudentClassWithDetails extends StudentClass {
  student?: Student
  class?: {
    id: string
    name: string
    level?: string
    subject?: string
  }
  school_year?: {
    id: string
    name: string
    is_current: boolean
  }
}

export interface CreateStudentClassRequest {
  student_id: string
  class_id: string
  school_year_id?: string // Si non fourni, utilise l'année courante
  status?: 'active' | 'transferred' | 'graduated' | 'dropped'
}

export interface UpdateStudentClassRequest {
  status?: 'active' | 'transferred' | 'graduated' | 'dropped'
}

type StudentClassRow = Database['public']['Tables']['student_classes']['Row']
type StudentRow = Database['public']['Tables']['students']['Row']
type ClassRow = Database['public']['Tables']['classes']['Row']
type SchoolYearRow = Database['public']['Tables']['school_years']['Row']

type StudentClassWithStudentRow = StudentClassRow & {
  student: StudentRow | null
}

type StudentClassDetailsRow = StudentClassRow & {
  student: StudentRow | null
  class: ClassRow | null
  school_year: SchoolYearRow | null
}

/**
 * Service pour gérer les relations étudiants-classes via Supabase
 * Cette table remplace la relation directe students.class_id
 */
export const supabaseStudentClassesService = {
  /**
   * Récupère toutes les relations étudiants-classes
   */
  async getStudentClasses(options?: {
    student_id?: string
    class_id?: string
    school_year_id?: string
    status?: string
    include_details?: boolean
  }): Promise<StudentClassWithDetails[]> {
    console.log('🔍 [SupabaseStudentClasses] Récupération des relations étudiants-classes')

    let query = supabase
      .from('student_classes')
      .select(options?.include_details
        ? `
          *,
          student:students(*),
          class:classes(*),
          school_year:school_years(*)
        `
        : '*'
      )

    // Filtres optionnels
    if (options?.student_id) {
      query = query.eq('student_id', options.student_id)
    }
    if (options?.class_id) {
      query = query.eq('class_id', options.class_id)
    }
    if (options?.school_year_id) {
      query = query.eq('school_year_id', options.school_year_id)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query.order('enrolled_at', { ascending: false })

    if (error) {
      console.error('❌ [SupabaseStudentClasses] Erreur lors de la récupération:', error)
      throw new Error(`Erreur lors de la récupération des relations: ${error.message}`)
    }

    console.log(`✅ [SupabaseStudentClasses] ${data?.length || 0} relations récupérées`)
    return data || []
  },

  /**
   * Récupère les étudiants d'une classe pour une année scolaire
   */
  async getStudentsForClass(
    class_id: string,
    school_year_id?: string,
    status: string = 'active'
  ): Promise<Student[]> {
    console.log(`🔍 [SupabaseStudentClasses] Récupération des étudiants de la classe: ${class_id}`)

    try {
      let query = supabase
        .from('student_classes')
        .select(`
          student:students(*)
        `)
        .eq('class_id', class_id)
        .eq('status', status)

      // Si aucune année spécifiée, utilise l'année courante
      if (school_year_id) {
        query = query.eq('school_year_id', school_year_id)
      } else {
        // Sous-requête pour récupérer l'année courante
        const { data: currentYear } = await supabase
          .from('school_years')
          .select('id')
          .eq('is_current', true)
          .single()

        if (currentYear) {
          query = query.eq('school_year_id', currentYear.id)
        }
      }

      const { data, error } = await query.order('enrolled_at', { ascending: true })

      if (error) {
        console.warn('⚠️ [SupabaseStudentClasses] Table student_classes non disponible, utilisation du fallback:', error.message)
        // Fallback: utiliser l'ancienne méthode avec students.class_id
        return await this.getStudentsForClassFallback(class_id)
      }

      // Extraire les données students des relations et mapper les propriétés
      const students = ((data ?? []) as StudentClassWithStudentRow[])
        .map(item => item.student)
        .filter((student): student is StudentRow => Boolean(student))
        .map(student => ({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          displayName: student.display_name,
          createdAt: student.created_at,
          updatedAt: student.updated_at
        }))

      console.log(`✅ [SupabaseStudentClasses] ${students.length} étudiants récupérés pour la classe`)
      return students

    } catch (globalError) {
      console.warn('⚠️ [SupabaseStudentClasses] Erreur globale, utilisation du fallback:', globalError)
      return await this.getStudentsForClassFallback(class_id)
    }
  },

  /**
   * Méthode de fallback utilisant l'ancienne structure students.class_id
   * Utilisée quand la table student_classes n'existe pas encore
   */
  async getStudentsForClassFallback(class_id: string): Promise<Student[]> {
    console.log(`🔄 [SupabaseStudentClasses] Fallback: récupération via students.class_id`)

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', class_id)

    if (error) {
      console.error('❌ [SupabaseStudentClasses] Erreur lors du fallback:', error)
      return []
    }

    // Mapper snake_case vers camelCase
    const students = (data || []).map(student => ({
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      displayName: student.display_name,
      createdAt: student.created_at,
      updatedAt: student.updated_at
    }))

    console.log(`✅ [SupabaseStudentClasses] Fallback: ${students.length} étudiants récupérés`)
    return students
  },

  /**
   * Récupère les classes d'un étudiant pour une année scolaire
   */
  async getClassesForStudent(
    student_id: string,
    school_year_id?: string,
    status: string = 'active'
  ): Promise<StudentClassWithDetails[]> {
    console.log(`🔍 [SupabaseStudentClasses] Récupération des classes de l'étudiant: ${student_id}`)

    let query = supabase
      .from('student_classes')
      .select(`
        *,
        class:classes(*),
        school_year:school_years(*)
      `)
      .eq('student_id', student_id)
      .eq('status', status)

    if (school_year_id) {
      query = query.eq('school_year_id', school_year_id)
    } else {
      // Utilise l'année courante si non spécifiée
      const { data: currentYear } = await supabase
        .from('school_years')
        .select('id')
        .eq('is_current', true)
        .single()

      if (currentYear) {
        query = query.eq('school_year_id', currentYear.id)
      }
    }

    const { data, error } = await query.order('enrolled_at', { ascending: true })

    if (error) {
      console.error('❌ [SupabaseStudentClasses] Erreur lors de la récupération des classes:', error)
      throw new Error(`Erreur lors de la récupération des classes: ${error.message}`)
    }

    const typedData = ((data ?? []) as StudentClassDetailsRow[]).map(item => ({
      id: item.id,
      student_id: item.student_id,
      class_id: item.class_id,
      school_year_id: item.school_year_id,
      enrolled_at: item.enrolled_at,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      student: item.student
        ? {
            id: item.student.id,
            firstName: item.student.first_name,
            lastName: item.student.last_name,
            displayName: item.student.display_name,
            createdAt: item.student.created_at,
            updatedAt: item.student.updated_at
          }
        : undefined,
      class: item.class
        ? {
            id: item.class.id,
            name: item.class.name,
            description: item.class.description ?? undefined,
            schoolYear: item.class.school_year,
            level: item.class.level ?? undefined,
            subject: item.class.subject ?? undefined,
            active: item.class.active,
            createdAt: item.class.created_at,
            updatedAt: item.class.updated_at
          }
        : undefined,
      school_year: item.school_year
        ? {
            id: item.school_year.id,
            name: item.school_year.name,
            is_current: item.school_year.is_current
          }
        : undefined
    }))

    console.log(`✅ [SupabaseStudentClasses] ${typedData.length} classes récupérées pour l'étudiant`)
    return typedData
  },

  /**
   * Inscrit un étudiant dans une classe
   */
  async enrollStudentInClass(enrollment: CreateStudentClassRequest): Promise<StudentClass> {
    console.log(`➕ [SupabaseStudentClasses] Inscription de l'étudiant ${enrollment.student_id} dans la classe ${enrollment.class_id}`)

    try {
      // Vérifier que l'étudiant existe
      const { data: studentExists, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('id', enrollment.student_id)
        .single()

      if (studentError || !studentExists) {
        console.error('❌ [SupabaseStudentClasses] Étudiant non trouvé:', enrollment.student_id)
        throw new Error(`Étudiant avec l'ID ${enrollment.student_id} non trouvé`)
      }
      // Si aucune année scolaire spécifiée, utilise l'année courante
      let school_year_id = enrollment.school_year_id
      if (!school_year_id) {
        const { data: currentYear } = await supabase
          .from('school_years')
          .select('id')
          .eq('is_current', true)
          .single()

        if (currentYear) {
          school_year_id = currentYear.id
        } else {
          console.error('❌ [SupabaseStudentClasses] Aucune année scolaire courante trouvée')
          throw new Error('Aucune année scolaire courante configurée')
        }
      }

      const { data, error } = await supabase
        .from('student_classes')
        .upsert([{
          student_id: enrollment.student_id,
          class_id: enrollment.class_id,
          school_year_id: school_year_id,
          status: enrollment.status || 'active',
          enrolled_at: new Date().toISOString()
        }], {
          onConflict: 'student_id,class_id,school_year_id'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [SupabaseStudentClasses] Erreur lors de l\'inscription:', error.message)
        throw new Error(`Erreur lors de l'inscription: ${error.message}`)
      }

      console.log(`✅ [SupabaseStudentClasses] Étudiant inscrit avec succès`)
      return data

    } catch (globalError) {
      console.error('❌ [SupabaseStudentClasses] Erreur globale:', globalError)
      throw globalError
    }
  },


  /**
   * Met à jour le statut d'inscription d'un étudiant
   */
  async updateStudentClassStatus(
    student_id: string,
    class_id: string,
    updates: UpdateStudentClassRequest,
    school_year_id?: string
  ): Promise<StudentClass> {
    console.log(`📝 [SupabaseStudentClasses] Mise à jour du statut: ${student_id} -> ${updates.status}`)

    let query = supabase
      .from('student_classes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', student_id)
      .eq('class_id', class_id)

    if (school_year_id) {
      query = query.eq('school_year_id', school_year_id)
    } else {
      // Utilise l'année courante
      const { data: currentYear } = await supabase
        .from('school_years')
        .select('id')
        .eq('is_current', true)
        .single()

      if (currentYear) {
        query = query.eq('school_year_id', currentYear.id)
      }
    }

    const { data, error } = await query.select().single()

    if (error) {
      console.error('❌ [SupabaseStudentClasses] Erreur lors de la mise à jour:', error)
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
    }

    console.log(`✅ [SupabaseStudentClasses] Statut mis à jour`)
    return data
  },

  /**
   * Désinscrit un étudiant d'une classe (soft delete)
   */
  async unenrollStudentFromClass(
    student_id: string,
    class_id: string,
    status: 'transferred' | 'graduated' | 'dropped' = 'transferred',
    school_year_id?: string
  ): Promise<boolean> {
    console.log(`🚫 [SupabaseStudentClasses] Désinscription de l'étudiant ${student_id}`)

    await this.updateStudentClassStatus(student_id, class_id, { status }, school_year_id)

    console.log(`✅ [SupabaseStudentClasses] Étudiant désinscrit (statut: ${status})`)
    return true
  },

  /**
   * Supprime définitivement une inscription (hard delete)
   */
  async deleteStudentClass(
    student_id: string,
    class_id: string,
    school_year_id?: string
  ): Promise<boolean> {
    console.log(`🗑️ [SupabaseStudentClasses] Suppression définitive de l'inscription`)

    let query = supabase
      .from('student_classes')
      .delete()
      .eq('student_id', student_id)
      .eq('class_id', class_id)

    if (school_year_id) {
      query = query.eq('school_year_id', school_year_id)
    }

    const { error } = await query

    if (error) {
      console.error('❌ [SupabaseStudentClasses] Erreur lors de la suppression:', error)
      throw new Error(`Erreur lors de la suppression: ${error.message}`)
    }

    console.log(`✅ [SupabaseStudentClasses] Inscription supprimée définitivement`)
    return true
  },

  /**
   * Transfère un étudiant d'une classe à une autre
   */
  async transferStudent(
    student_id: string,
    from_class_id: string,
    to_class_id: string,
    school_year_id?: string
  ): Promise<{ from: StudentClass; to: StudentClass }> {
    console.log(`🔄 [SupabaseStudentClasses] Transfert de l'étudiant ${student_id}`)

    // Désinscription de l'ancienne classe
    const from = await this.updateStudentClassStatus(
      student_id,
      from_class_id,
      { status: 'transferred' },
      school_year_id
    )

    // Inscription dans la nouvelle classe
    const to = await this.enrollStudentInClass({
      student_id,
      class_id: to_class_id,
      school_year_id,
      status: 'active'
    })

    console.log(`✅ [SupabaseStudentClasses] Transfert effectué`)
    return { from, to }
  },

  /**
   * Souscription aux changements des relations étudiants-classes
   */
  subscribeToStudentClasses(
    callback: (
      payload: RealtimePostgresChangesPayload<StudentClassRow>
    ) => void
  ) {
    console.log('🔔 [SupabaseStudentClasses] Abonnement aux changements des relations')

    return supabase
      .channel('student_classes_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_classes'
        },
        callback
      )
      .subscribe()
  },

  /**
   * Obtient les statistiques d'une classe
   */
  async getClassStatistics(class_id: string, school_year_id?: string) {
    console.log(`📊 [SupabaseStudentClasses] Statistiques de la classe: ${class_id}`)

    let query = supabase
      .from('student_classes')
      .select('status')
      .eq('class_id', class_id)

    if (school_year_id) {
      query = query.eq('school_year_id', school_year_id)
    } else {
      const { data: currentYear } = await supabase
        .from('school_years')
        .select('id')
        .eq('is_current', true)
        .single()

      if (currentYear) {
        query = query.eq('school_year_id', currentYear.id)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ [SupabaseStudentClasses] Erreur lors des statistiques:', error)
      throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`)
    }

    const stats = {
      total: data?.length || 0,
      active: data?.filter(item => item.status === 'active').length || 0,
      transferred: data?.filter(item => item.status === 'transferred').length || 0,
      graduated: data?.filter(item => item.status === 'graduated').length || 0,
      dropped: data?.filter(item => item.status === 'dropped').length || 0
    }

    console.log(`✅ [SupabaseStudentClasses] Statistiques calculées:`, stats)
    return stats
  }
}