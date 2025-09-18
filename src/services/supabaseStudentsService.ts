import { supabase } from '../lib/supabase'
import type { Student } from '../types/evaluation'
import type { Database } from '../types/supabase'

type SupabaseStudent = Database['public']['Tables']['students']['Row']
type SupabaseStudentInsert = Database['public']['Tables']['students']['Insert']
type SupabaseStudentUpdate = Database['public']['Tables']['students']['Update']

/**
 * Service pour la gestion des élèves dans Supabase
 */
export class SupabaseStudentsService {
  /**
   * Convertit un élève Supabase en Student local
   */
  private mapSupabaseToStudent(supabaseStudent: Partial<SupabaseStudent> & {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
  }): Student {
    return {
      id: supabaseStudent.id,
      firstName: supabaseStudent.first_name,
      lastName: supabaseStudent.last_name,
      displayName: supabaseStudent.display_name
    }
  }

  /**
   * Génère le displayName d'un élève
   */
  private generateDisplayName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName.charAt(0)}.`
  }

  /**
   * Récupère tous les élèves depuis Supabase
   */
  async getAllStudents(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Erreur lors de la récupération des élèves:', error)
        throw error
      }

      return (data || []).map((student: SupabaseStudent) => this.mapSupabaseToStudent(student))
    } catch (error) {
      console.error('Erreur lors de la récupération des élèves:', error)
      throw error
    }
  }

  /**
   * Récupère un élève par son ID
   */
  async getStudentById(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Pas trouvé
          return null
        }
        console.error('Erreur lors de la récupération de l\'élève:', error)
        throw error
      }

      return data ? this.mapSupabaseToStudent(data as SupabaseStudent) : null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'élève:', error)
      throw error
    }
  }

  /**
   * Crée un nouvel élève dans Supabase
   */
  async createStudent(firstName: string, lastName: string): Promise<Student> {
    try {
      const displayName = this.generateDisplayName(firstName, lastName)

      const newStudent: SupabaseStudentInsert = {
        first_name: firstName,
        last_name: lastName,
        display_name: displayName
      }

      const { data, error } = await supabase
        .from('students')
        .insert(newStudent)
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la création de l\'élève:', error)
        throw error
      }

      if (!data) {
        throw new Error('Aucune donnée retournée lors de la création')
      }

      return this.mapSupabaseToStudent(data as SupabaseStudent)
    } catch (error) {
      console.error('Erreur lors de la création de l\'élève:', error)
      throw error
    }
  }

  /**
   * Met à jour un élève existant
   */
  async updateStudent(id: string, updates: { firstName?: string; lastName?: string }): Promise<Student | null> {
    try {
      const updateData: SupabaseStudentUpdate = {}

      if (updates.firstName !== undefined) {
        updateData.first_name = updates.firstName
      }

      if (updates.lastName !== undefined) {
        updateData.last_name = updates.lastName
      }

      // Si le nom ou prénom change, régénérer le displayName
      if (updates.firstName || updates.lastName) {
        // D'abord récupérer l'élève actuel
        const currentStudent = await this.getStudentById(id)
        if (!currentStudent) {
          return null
        }

        const firstName = updates.firstName || currentStudent.firstName
        const lastName = updates.lastName || currentStudent.lastName
        updateData.display_name = this.generateDisplayName(firstName, lastName)
      }

      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Pas trouvé
          return null
        }
        console.error('Erreur lors de la mise à jour de l\'élève:', error)
        throw error
      }

      return data ? this.mapSupabaseToStudent(data as SupabaseStudent) : null
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'élève:', error)
      throw error
    }
  }

  /**
   * Supprime un élève
   */
  async deleteStudent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erreur lors de la suppression de l\'élève:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'élève:', error)
      throw error
    }
  }

  /**
   * Recherche des élèves
   */
  async searchStudents(searchTerm: string): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Erreur lors de la recherche d\'élèves:', error)
        throw error
      }

      return (data || []).map((student: SupabaseStudent) => this.mapSupabaseToStudent(student))
    } catch (error) {
      console.error('Erreur lors de la recherche d\'élèves:', error)
      throw error
    }
  }

  /**
   * Importe plusieurs élèves en masse
   */
  async bulkImportStudents(students: { firstName: string; lastName: string }[]): Promise<Student[]> {
    try {
      const studentsToInsert: SupabaseStudentInsert[] = students.map(student => ({
        first_name: student.firstName,
        last_name: student.lastName,
        display_name: this.generateDisplayName(student.firstName, student.lastName)
      }))

      const { data, error } = await supabase
        .from('students')
        .insert(studentsToInsert)
        .select()

      if (error) {
        console.error('Erreur lors de l\'import en masse:', error)
        throw error
      }

      return (data || []).map((student: SupabaseStudent) => this.mapSupabaseToStudent(student))
    } catch (error) {
      console.error('Erreur lors de l\'import en masse:', error)
      throw error
    }
  }

  /**
   * Subscribe aux changements en temps réel sur la table students
   */
  subscribeToStudentsChanges(callback: (payload: unknown) => void) {
     
    return supabase
      .channel('students-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students'
        },
        callback
      )
      .subscribe()
  }
}

// Instance singleton du service
export const supabaseStudentsService = new SupabaseStudentsService()