import { supabase } from '@/lib/supabase'
import type { Class } from '@/types/evaluation'

export interface EvaluationClass {
  id: string
  evaluation_id: string
  class_id: string
  school_year_id: string
  created_at: string
  updated_at: string
}

export interface EvaluationClassWithDetails extends EvaluationClass {
  evaluation?: {
    id: string
    name: string
    description?: string
    framework_id: string
  }
  class?: Class
  school_year?: {
    id: string
    name: string
    is_current: boolean
  }
}

export interface CreateEvaluationClassRequest {
  evaluation_id: string
  class_id: string
  school_year_id?: string // Si non fourni, utilise l'année courante
}

/**
 * Service pour gérer les relations évaluations-classes via Supabase
 * Cette table permet une relation many-to-many entre evaluations, classes et school_years
 */
export const supabaseEvaluationClassesService = {
  /**
   * Récupère toutes les relations évaluations-classes
   */
  async getEvaluationClasses(options?: {
    evaluation_id?: string
    class_id?: string
    school_year_id?: string
    include_details?: boolean
  }): Promise<EvaluationClassWithDetails[]> {
    console.log('🔍 [SupabaseEvaluationClasses] Récupération des relations évaluations-classes')

    let query = supabase
      .from('evaluation_classes')
      .select(options?.include_details
        ? `
          *,
          evaluation:evaluations(*),
          class:classes(*),
          school_year:school_years(*)
        `
        : '*'
      )

    // Filtres optionnels
    if (options?.evaluation_id) {
      query = query.eq('evaluation_id', options.evaluation_id)
    }
    if (options?.class_id) {
      query = query.eq('class_id', options.class_id)
    }
    if (options?.school_year_id) {
      query = query.eq('school_year_id', options.school_year_id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [SupabaseEvaluationClasses] Erreur lors de la récupération:', error)
      throw new Error(`Erreur lors de la récupération des relations: ${error.message}`)
    }

    console.log(`✅ [SupabaseEvaluationClasses] ${data?.length || 0} relations récupérées`)
    return data || []
  },

  /**
   * Récupère les classes d'une évaluation pour une année scolaire
   */
  async getClassesForEvaluation(
    evaluation_id: string,
    school_year_id?: string
  ): Promise<Class[]> {
    console.log(`🔍 [SupabaseEvaluationClasses] Récupération des classes de l'évaluation: ${evaluation_id}`)

    try {
      let query = supabase
        .from('evaluation_classes')
        .select(`
          class:classes(*)
        `)
        .eq('evaluation_id', evaluation_id)

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

      const { data, error } = await query.order('created_at', { ascending: true })

      if (error) {
        console.error('❌ [SupabaseEvaluationClasses] Erreur lors de la récupération des classes:', error)
        throw new Error(`Erreur lors de la récupération des classes: ${error.message}`)
      }

      // Extraire les données classes des relations
      const classes = data?.map(item => (item as any).class).filter(Boolean) || []

      console.log(`✅ [SupabaseEvaluationClasses] ${classes.length} classes récupérées pour l'évaluation`)
      return classes as Class[]

    } catch (globalError) {
      console.error('❌ [SupabaseEvaluationClasses] Erreur globale:', globalError)
      return []
    }
  },

  /**
   * Récupère les évaluations d'une classe pour une année scolaire
   */
  async getEvaluationsForClass(
    class_id: string,
    school_year_id?: string
  ): Promise<any[]> {
    console.log(`🔍 [SupabaseEvaluationClasses] Récupération des évaluations de la classe: ${class_id}`)

    let query = supabase
      .from('evaluation_classes')
      .select(`
        *,
        evaluation:evaluations(*),
        school_year:school_years(*)
      `)
      .eq('class_id', class_id)

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

    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('❌ [SupabaseEvaluationClasses] Erreur lors de la récupération des évaluations:', error)
      throw new Error(`Erreur lors de la récupération des évaluations: ${error.message}`)
    }

    console.log(`✅ [SupabaseEvaluationClasses] ${data?.length || 0} évaluations récupérées pour la classe`)
    return data || []
  },

  /**
   * Associe une évaluation à une classe
   */
  async addClassToEvaluation(association: CreateEvaluationClassRequest): Promise<EvaluationClass> {
    console.log(`➕ [SupabaseEvaluationClasses] Association évaluation ${association.evaluation_id} avec classe ${association.class_id}`)

    try {
      // Si aucune année scolaire spécifiée, utilise l'année courante
      let school_year_id = association.school_year_id
      if (!school_year_id) {
        const { data: currentYear } = await supabase
          .from('school_years')
          .select('id')
          .eq('is_current', true)
          .single()

        if (currentYear) {
          school_year_id = currentYear.id
        } else {
          throw new Error('Aucune année scolaire courante trouvée')
        }
      }

      const { data, error } = await supabase
        .from('evaluation_classes')
        .upsert([{
          evaluation_id: association.evaluation_id,
          class_id: association.class_id,
          school_year_id: school_year_id
        }], {
          onConflict: 'evaluation_id,class_id,school_year_id'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [SupabaseEvaluationClasses] Erreur lors de l\'association:', error)
        throw new Error(`Erreur lors de l'association: ${error.message}`)
      }

      console.log(`✅ [SupabaseEvaluationClasses] Association créée avec succès`)
      return data

    } catch (globalError) {
      console.error('❌ [SupabaseEvaluationClasses] Erreur globale:', globalError)
      throw globalError
    }
  },

  /**
   * Associe une évaluation à plusieurs classes en une fois
   */
  async addClassesToEvaluation(
    evaluation_id: string,
    class_ids: string[],
    school_year_id?: string
  ): Promise<EvaluationClass[]> {
    console.log(`➕ [SupabaseEvaluationClasses] Association évaluation ${evaluation_id} avec ${class_ids.length} classes`)

    try {
      // Si aucune année scolaire spécifiée, utilise l'année courante
      if (!school_year_id) {
        const { data: currentYear } = await supabase
          .from('school_years')
          .select('id')
          .eq('is_current', true)
          .single()

        if (currentYear) {
          school_year_id = currentYear.id
        } else {
          throw new Error('Aucune année scolaire courante trouvée')
        }
      }

      // Créer les associations pour toutes les classes
      const associations = class_ids.map(class_id => ({
        evaluation_id,
        class_id,
        school_year_id: school_year_id!
      }))

      const { data, error } = await supabase
        .from('evaluation_classes')
        .upsert(associations, {
          onConflict: 'evaluation_id,class_id,school_year_id'
        })
        .select()

      if (error) {
        console.error('❌ [SupabaseEvaluationClasses] Erreur lors des associations:', error)
        throw new Error(`Erreur lors des associations: ${error.message}`)
      }

      console.log(`✅ [SupabaseEvaluationClasses] ${data?.length || 0} associations créées`)
      return data || []

    } catch (globalError) {
      console.error('❌ [SupabaseEvaluationClasses] Erreur globale:', globalError)
      throw globalError
    }
  },

  /**
   * Supprime l'association entre une évaluation et une classe
   */
  async removeClassFromEvaluation(
    evaluation_id: string,
    class_id: string,
    school_year_id?: string
  ): Promise<boolean> {
    console.log(`🗑️ [SupabaseEvaluationClasses] Suppression association évaluation-classe`)

    let query = supabase
      .from('evaluation_classes')
      .delete()
      .eq('evaluation_id', evaluation_id)
      .eq('class_id', class_id)

    if (school_year_id) {
      query = query.eq('school_year_id', school_year_id)
    }

    const { error } = await query

    if (error) {
      console.error('❌ [SupabaseEvaluationClasses] Erreur lors de la suppression:', error)
      throw new Error(`Erreur lors de la suppression: ${error.message}`)
    }

    console.log(`✅ [SupabaseEvaluationClasses] Association supprimée`)
    return true
  },

  /**
   * Supprime toutes les associations d'une évaluation
   */
  async removeAllClassesFromEvaluation(
    evaluation_id: string,
    school_year_id?: string
  ): Promise<boolean> {
    console.log(`🗑️ [SupabaseEvaluationClasses] Suppression de toutes les associations de l'évaluation`)

    let query = supabase
      .from('evaluation_classes')
      .delete()
      .eq('evaluation_id', evaluation_id)

    if (school_year_id) {
      query = query.eq('school_year_id', school_year_id)
    }

    const { error } = await query

    if (error) {
      console.error('❌ [SupabaseEvaluationClasses] Erreur lors de la suppression:', error)
      throw new Error(`Erreur lors de la suppression: ${error.message}`)
    }

    console.log(`✅ [SupabaseEvaluationClasses] Toutes les associations supprimées`)
    return true
  },

  /**
   * Met à jour les classes associées à une évaluation
   * Supprime les anciennes associations et crée les nouvelles
   */
  async updateEvaluationClasses(
    evaluation_id: string,
    class_ids: string[],
    school_year_id?: string
  ): Promise<EvaluationClass[]> {
    console.log(`🔄 [SupabaseEvaluationClasses] Mise à jour des classes pour l'évaluation ${evaluation_id}`)

    try {
      // Supprimer toutes les associations existantes
      await this.removeAllClassesFromEvaluation(evaluation_id, school_year_id)

      // Ajouter les nouvelles associations
      if (class_ids.length > 0) {
        return await this.addClassesToEvaluation(evaluation_id, class_ids, school_year_id)
      }

      return []

    } catch (globalError) {
      console.error('❌ [SupabaseEvaluationClasses] Erreur lors de la mise à jour:', globalError)
      throw globalError
    }
  },

  /**
   * Souscription aux changements des relations évaluations-classes
   */
  subscribeToEvaluationClasses(callback: (payload: any) => void) {
    console.log('🔔 [SupabaseEvaluationClasses] Abonnement aux changements des relations')

    return supabase
      .channel('evaluation_classes_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluation_classes'
        },
        callback
      )
      .subscribe()
  },

  /**
   * Obtient les statistiques d'une évaluation
   */
  async getEvaluationStatistics(evaluation_id: string, school_year_id?: string) {
    console.log(`📊 [SupabaseEvaluationClasses] Statistiques de l'évaluation: ${evaluation_id}`)

    let query = supabase
      .from('evaluation_classes')
      .select('class_id')
      .eq('evaluation_id', evaluation_id)

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
      console.error('❌ [SupabaseEvaluationClasses] Erreur lors des statistiques:', error)
      throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`)
    }

    const stats = {
      totalClasses: data?.length || 0,
      classIds: data?.map(item => item.class_id) || []
    }

    console.log(`✅ [SupabaseEvaluationClasses] Statistiques calculées:`, stats)
    return stats
  }
}