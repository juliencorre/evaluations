import { supabase } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export interface SchoolYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface CreateSchoolYearRequest {
  name: string
  start_date: string
  end_date: string
  is_current?: boolean
}

export interface UpdateSchoolYearRequest {
  name?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
}

/**
 * Service pour gérer les années scolaires via Supabase
 */
export const supabaseSchoolYearsService = {
  /**
   * Récupère toutes les années scolaires
   */
  async getSchoolYears(): Promise<SchoolYear[]> {
    console.log('🔍 [SupabaseSchoolYears] Récupération des années scolaires')

    const { data, error } = await supabase
      .from('school_years')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) {
      console.error('❌ [SupabaseSchoolYears] Erreur lors de la récupération:', error)
      throw new Error(`Erreur lors de la récupération des années scolaires: ${error.message}`)
    }

    console.log(`✅ [SupabaseSchoolYears] ${data?.length || 0} années scolaires récupérées`)
    return data || []
  },

  /**
   * Récupère l'année scolaire courante
   */
  async getCurrentSchoolYear(): Promise<SchoolYear | null> {
    console.log('🔍 [SupabaseSchoolYears] Récupération de l\'année scolaire courante')

    const { data, error } = await supabase
      .from('school_years')
      .select('*')
      .eq('is_current', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [SupabaseSchoolYears] Aucune année scolaire courante définie')
        return null
      }
      console.error('❌ [SupabaseSchoolYears] Erreur lors de la récupération de l\'année courante:', error)
      throw new Error(`Erreur lors de la récupération de l'année scolaire courante: ${error.message}`)
    }

    console.log(`✅ [SupabaseSchoolYears] Année scolaire courante: ${data.name}`)
    return data
  },

  /**
   * Récupère une année scolaire par son ID
   */
  async getSchoolYearById(id: string): Promise<SchoolYear | null> {
    console.log(`🔍 [SupabaseSchoolYears] Récupération de l'année scolaire: ${id}`)

    const { data, error } = await supabase
      .from('school_years')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`ℹ️ [SupabaseSchoolYears] Année scolaire non trouvée: ${id}`)
        return null
      }
      console.error('❌ [SupabaseSchoolYears] Erreur lors de la récupération:', error)
      throw new Error(`Erreur lors de la récupération de l'année scolaire: ${error.message}`)
    }

    console.log(`✅ [SupabaseSchoolYears] Année scolaire récupérée: ${data.name}`)
    return data
  },

  /**
   * Récupère une année scolaire par son nom
   */
  async getSchoolYearByName(name: string): Promise<SchoolYear | null> {
    console.log(`🔍 [SupabaseSchoolYears] Récupération de l'année scolaire: ${name}`)

    const { data, error } = await supabase
      .from('school_years')
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`ℹ️ [SupabaseSchoolYears] Année scolaire non trouvée: ${name}`)
        return null
      }
      console.error('❌ [SupabaseSchoolYears] Erreur lors de la récupération:', error)
      throw new Error(`Erreur lors de la récupération de l'année scolaire: ${error.message}`)
    }

    console.log(`✅ [SupabaseSchoolYears] Année scolaire récupérée: ${data.name}`)
    return data
  },

  /**
   * Crée une nouvelle année scolaire
   */
  async createSchoolYear(schoolYear: CreateSchoolYearRequest): Promise<SchoolYear> {
    console.log('➕ [SupabaseSchoolYears] Création d\'une nouvelle année scolaire:', schoolYear.name)

    // Si c'est l'année courante, désactiver les autres années courantes
    if (schoolYear.is_current) {
      await this.setCurrentSchoolYear(schoolYear.name, false) // false = ne pas encore définir comme courante
    }

    const { data, error } = await supabase
      .from('school_years')
      .insert([{
        name: schoolYear.name,
        start_date: schoolYear.start_date,
        end_date: schoolYear.end_date,
        is_current: schoolYear.is_current || false
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ [SupabaseSchoolYears] Erreur lors de la création:', error)
      throw new Error(`Erreur lors de la création de l'année scolaire: ${error.message}`)
    }

    console.log(`✅ [SupabaseSchoolYears] Année scolaire créée: ${data.name}`)
    return data
  },

  /**
   * Met à jour une année scolaire
   */
  async updateSchoolYear(id: string, updates: UpdateSchoolYearRequest): Promise<SchoolYear> {
    console.log(`📝 [SupabaseSchoolYears] Mise à jour de l'année scolaire: ${id}`)

    // Si on définit cette année comme courante, désactiver les autres
    if (updates.is_current) {
      await this.setCurrentSchoolYear(id, false)
    }

    const { data, error } = await supabase
      .from('school_years')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ [SupabaseSchoolYears] Erreur lors de la mise à jour:', error)
      throw new Error(`Erreur lors de la mise à jour de l'année scolaire: ${error.message}`)
    }

    console.log(`✅ [SupabaseSchoolYears] Année scolaire mise à jour: ${data.name}`)
    return data
  },

  /**
   * Supprime une année scolaire
   */
  async deleteSchoolYear(id: string): Promise<boolean> {
    console.log(`🗑️ [SupabaseSchoolYears] Suppression de l'année scolaire: ${id}`)

    const { error } = await supabase
      .from('school_years')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ [SupabaseSchoolYears] Erreur lors de la suppression:', error)
      throw new Error(`Erreur lors de la suppression de l'année scolaire: ${error.message}`)
    }

    console.log(`✅ [SupabaseSchoolYears] Année scolaire supprimée`)
    return true
  },

  /**
   * Définit une année scolaire comme courante
   */
  async setCurrentSchoolYear(idOrName: string, makeCurrent: boolean = true): Promise<void> {
    console.log(`🎯 [SupabaseSchoolYears] Définition de l'année courante: ${idOrName}`)

    // D'abord, désactiver toutes les années courantes
    if (makeCurrent) {
      await supabase
        .from('school_years')
        .update({ is_current: false })
        .neq('id', 'dummy') // Mettre à jour toutes les lignes
    }

    // Ensuite, activer l'année spécifiée si makeCurrent est true
    if (makeCurrent) {
      const { error } = await supabase
        .from('school_years')
        .update({
          is_current: true,
          updated_at: new Date().toISOString()
        })
        .or(`id.eq.${idOrName},name.eq.${idOrName}`)

      if (error) {
        console.error('❌ [SupabaseSchoolYears] Erreur lors de la définition de l\'année courante:', error)
        throw new Error(`Erreur lors de la définition de l'année courante: ${error.message}`)
      }
    }

    console.log(`✅ [SupabaseSchoolYears] Année courante ${makeCurrent ? 'définie' : 'désactivée'}`)
  },

  /**
   * Valide le format d'une année scolaire
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
        error: 'L\'année de fin doit être l\'année suivante (ex: 2024-2025)'
      }
    }

    return { valid: true }
  },

  /**
   * Génère l'année scolaire courante basée sur la date
   */
  getCurrentSchoolYearName(): string {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // getMonth() retourne 0-11

    // Si on est entre septembre et décembre, l'année scolaire a commencé
    // Si on est entre janvier et août, on est dans la deuxième partie
    if (currentMonth >= 9) {
      return `${currentYear}-${currentYear + 1}`
    } else {
      return `${currentYear - 1}-${currentYear}`
    }
  },

  /**
   * Souscription aux changements des années scolaires (temps réel)
   */
  subscribeToSchoolYears(
    callback: (
      payload: RealtimePostgresChangesPayload<Database['public']['Tables']['school_years']['Row']>
    ) => void
  ) {
    console.log('🔔 [SupabaseSchoolYears] Abonnement aux changements des années scolaires')

    return supabase
      .channel('school_years_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'school_years'
        },
        callback
      )
      .subscribe()
  }
}