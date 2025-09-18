/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import type { Domain, Field, Competency, SpecificCompetency, CompetencyFramework } from '@/types/evaluation'

// Types Supabase pour faciliter l'utilisation
type SupabaseDomain = Database['public']['Tables']['domains']['Row']
type SupabaseField = Database['public']['Tables']['fields']['Row']
type SupabaseCompetency = Database['public']['Tables']['competencies']['Row']
type SupabaseSpecificCompetency = Database['public']['Tables']['specific_competencies']['Row']
type SupabaseFramework = Database['public']['Tables']['competency_frameworks']['Row']

// ID du framework par défaut - sera généré automatiquement
let DEFAULT_FRAMEWORK_ID: string | null = null

export class SupabaseCompetenciesService {
  // =================== FRAMEWORK ===================

  /**
   * Récupère le framework par défaut ou le crée s'il n'existe pas
   */
  static async getOrCreateDefaultFramework(): Promise<CompetencyFramework> {
    console.log('🏗️ [Framework] Début récupération/création du framework par défaut')

    try {
      // Si on n'a pas encore d'ID de framework, essayer de le trouver par nom
      if (!DEFAULT_FRAMEWORK_ID) {
        console.log('🔍 [Framework] Recherche d\'un framework existant par nom...')
        const { data: existingFramework } = await supabase
          .from('competency_frameworks')
          .select('*')
          .eq('name', 'Framework par défaut')
          .single()

        if (existingFramework) {
          console.log('✅ [Framework] Framework existant trouvé:', existingFramework.id)
          DEFAULT_FRAMEWORK_ID = existingFramework.id
          return SupabaseCompetenciesService.transformFramework(existingFramework)
        } else {
          console.log('❌ [Framework] Aucun framework existant trouvé')
        }
      }

      // Si on a un ID, essayer de récupérer le framework
      if (DEFAULT_FRAMEWORK_ID) {
        console.log('🔍 [Framework] Récupération avec ID:', DEFAULT_FRAMEWORK_ID)
        const { data: framework, error } = await supabase
          .from('competency_frameworks')
          .select('*')
          .eq('id', DEFAULT_FRAMEWORK_ID)
          .single()

        if (!error && framework) {
          console.log('✅ [Framework] Framework récupéré avec succès:', framework.name)
          return SupabaseCompetenciesService.transformFramework(framework)
        } else {
          console.log('❌ [Framework] Erreur récupération avec ID:', error)
        }
      }

      // Framework n'existe pas, le créer sans spécifier d'ID (UUID auto-généré)
      console.log('➕ [Framework] Création d\'un nouveau framework...')
      const { data: newFramework, error: createError } = await supabase
        .from('competency_frameworks')
        .insert({
          name: 'Framework par défaut',
          version: '1.0',
          description: 'Framework de compétences par défaut pour l\'évaluation des élèves'
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ [Framework] Erreur création:', createError)
        throw createError
      }

      // Sauvegarder l'ID généré
      DEFAULT_FRAMEWORK_ID = newFramework!.id
      console.log('✅ [Framework] Nouveau framework créé avec ID:', DEFAULT_FRAMEWORK_ID)

      return SupabaseCompetenciesService.transformFramework(newFramework!)
    } catch (error) {
      console.error('💥 [Framework] Erreur lors de la récupération du framework:', error)
      throw error
    }
  }

  // =================== DOMAINES ===================

  /**
   * Récupère tous les domaines avec leurs champs, compétences et sous-compétences
   */
  static async getAllDomains(): Promise<Domain[]> {
    console.log('🌳 [Domaines] Début récupération de tous les domaines')

    try {
      // S'assurer qu'on a un framework
      if (!DEFAULT_FRAMEWORK_ID) {
        console.log('🔄 [Domaines] Framework ID manquant, récupération...')
        await SupabaseCompetenciesService.getOrCreateDefaultFramework()
      }

      console.log('📡 [Domaines] Requête Supabase avec framework ID:', DEFAULT_FRAMEWORK_ID)
      const { data: domains, error } = await supabase
        .from('domains')
        .select(`
          *,
          fields (
            *,
            competencies (
              *,
              specific_competencies (*)
            )
          )
        `)
        .eq('framework_id', DEFAULT_FRAMEWORK_ID)
        .order('order_index')

      if (error) {
        console.error('❌ [Domaines] Erreur requête Supabase:', error)
        throw error
      }

      const transformedDomains = (domains || []).map(SupabaseCompetenciesService.transformDomainWithChildren)
      console.log('✅ [Domaines] Domaines récupérés:', transformedDomains.length, 'domaine(s)')

      transformedDomains.forEach((domain: Domain, index: number) => {
        console.log(`   📁 [${index + 1}] ${domain.name} (${domain.fields.length} champ(s))`)
        domain.fields.forEach((field: Field, fieldIndex: number) => {
          console.log(`      📂 [${fieldIndex + 1}] ${field.name} (${field.competencies.length} compétence(s))`)
          field.competencies.forEach((competency: Competency, compIndex: number) => {
            console.log(`         📄 [${compIndex + 1}] ${competency.name} (${competency.specificCompetencies.length} sous-compétence(s))`)
          })
        })
      })

      return transformedDomains
    } catch (error) {
      console.error('💥 [Domaines] Erreur lors de la récupération des domaines:', error)
      throw error
    }
  }

  /**
   * Crée un nouveau domaine
   */
  static async createDomain(name: string, description: string): Promise<Domain> {
    console.log('➕ [Domaine] Création d\'un nouveau domaine:', { name, description })

    try {
      // S'assurer qu'on a un framework
      if (!DEFAULT_FRAMEWORK_ID) {
        console.log('🔄 [Domaine] Framework ID manquant, récupération...')
        await SupabaseCompetenciesService.getOrCreateDefaultFramework()
      }

      // Obtenir le prochain index d'ordre
      console.log('🔢 [Domaine] Calcul de l\'index d\'ordre...')
      const { count } = await supabase
        .from('domains')
        .select('*', { count: 'exact', head: true })
        .eq('framework_id', DEFAULT_FRAMEWORK_ID!)

      const orderIndex = count || 0
      console.log('📊 [Domaine] Index d\'ordre calculé:', orderIndex)

      console.log('💾 [Domaine] Insertion en base...')
      const { data, error } = await supabase
        .from('domains')
        .insert({
          framework_id: DEFAULT_FRAMEWORK_ID!,
          name,
          description,
          order_index: orderIndex
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [Domaine] Erreur insertion:', error)
        throw error
      }

      const transformedDomain = SupabaseCompetenciesService.transformDomain(data!)
      console.log('✅ [Domaine] Domaine créé avec succès:', {
        id: transformedDomain.id,
        name: transformedDomain.name,
        orderIndex
      })

      return transformedDomain
    } catch (error) {
      console.error('💥 [Domaine] Erreur lors de la création du domaine:', error)
      throw error
    }
  }

  /**
   * Met à jour un domaine
   */
  static async updateDomain(domainId: string, updates: { name?: string; description?: string }): Promise<Domain | null> {
    console.log('✏️ [Domaine] Mise à jour domaine:', { domainId, updates })

    try {
      console.log('💾 [Domaine] Exécution de la mise à jour...')
      const { data, error } = await supabase
        .from('domains')
        .update(updates)
        .eq('id', domainId)
        .select()
        .single()

      if (error) {
        console.error('❌ [Domaine] Erreur mise à jour:', error)
        throw error
      }

      const transformedDomain = data ? SupabaseCompetenciesService.transformDomain(data) : null
      console.log('✅ [Domaine] Domaine mis à jour avec succès:', transformedDomain)

      return transformedDomain
    } catch (error) {
      console.error('💥 [Domaine] Erreur lors de la mise à jour du domaine:', error)
      throw error
    }
  }

  /**
   * Supprime un domaine et tout son contenu
   */
  static async deleteDomain(domainId: string): Promise<void> {
    console.log('🗑️ [Domaine] Suppression domaine:', domainId)

    try {
      console.log('💾 [Domaine] Exécution de la suppression...')
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId)

      if (error) {
        console.error('❌ [Domaine] Erreur suppression:', error)
        throw error
      }

      console.log('✅ [Domaine] Domaine supprimé avec succès (cascade: champs, compétences, sous-compétences)')
    } catch (error) {
      console.error('💥 [Domaine] Erreur lors de la suppression du domaine:', error)
      throw error
    }
  }

  /**
   * Réorganise l'ordre des domaines
   */
  static async reorderDomains(fromIndex: number, toIndex: number): Promise<void> {
    try {
      // S'assurer qu'on a un framework
      if (!DEFAULT_FRAMEWORK_ID) {
        await SupabaseCompetenciesService.getOrCreateDefaultFramework()
      }

      // Récupérer tous les domaines dans l'ordre actuel
      const { data: domains, error } = await supabase
        .from('domains')
        .select('id, order_index')
        .eq('framework_id', DEFAULT_FRAMEWORK_ID!)
        .order('order_index')

      if (error) throw error

      if (!domains || fromIndex >= domains.length || toIndex >= domains.length) return

      // Créer le nouvel ordre
      const reorderedDomains = [...domains]
      const [movedDomain] = reorderedDomains.splice(fromIndex, 1)
      reorderedDomains.splice(toIndex, 0, movedDomain)

      // Mettre à jour les index dans la base
      const updates = reorderedDomains.map((domain, index) => ({
        id: domain.id,
        order_index: index
      }))

      for (const update of updates) {
        await supabase
          .from('domains')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }
    } catch (error) {
      console.error('Erreur lors de la réorganisation des domaines:', error)
      throw error
    }
  }

  // =================== CHAMPS ===================

  /**
   * Crée un nouveau champ dans un domaine
   */
  static async createField(domainId: string, name: string, description: string): Promise<Field> {
    console.log('➕ [Champ] Création d\'un nouveau champ:', { domainId, name, description })

    try {
      // Obtenir le prochain index d'ordre
      console.log('🔢 [Champ] Calcul de l\'index d\'ordre...')
      const { count } = await supabase
        .from('fields')
        .select('*', { count: 'exact', head: true })
        .eq('domain_id', domainId)

      const orderIndex = count || 0
      console.log('📈 [Champ] Index d\'ordre calculé:', orderIndex)

      console.log('💾 [Champ] Insertion en base...')
      const { data, error } = await supabase
        .from('fields')
        .insert({
          domain_id: domainId,
          name,
          description,
          order_index: orderIndex
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [Champ] Erreur insertion:', error)
        throw error
      }

      const transformedField = SupabaseCompetenciesService.transformField(data!)
      console.log('✅ [Champ] Champ créé avec succès:', {
        id: transformedField.id,
        name: transformedField.name,
        domainId,
        orderIndex
      })

      return transformedField
    } catch (error) {
      console.error('💥 [Champ] Erreur lors de la création du champ:', error)
      throw error
    }
  }

  /**
   * Met à jour un champ
   */
  static async updateField(fieldId: string, updates: { name?: string; description?: string }): Promise<Field | null> {
    try {
      const { data, error } = await supabase
        .from('fields')
        .update(updates)
        .eq('id', fieldId)
        .select()
        .single()

      if (error) throw error

      return data ? SupabaseCompetenciesService.transformField(data) : null
    } catch (error) {
      console.error('Erreur lors de la mise à jour du champ:', error)
      throw error
    }
  }

  /**
   * Supprime un champ et tout son contenu
   */
  static async deleteField(fieldId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId)

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors de la suppression du champ:', error)
      throw error
    }
  }

  /**
   * Réorganise l'ordre des champs dans un domaine
   */
  static async reorderFields(domainId: string, fromIndex: number, toIndex: number): Promise<void> {
    try {
      // Récupérer tous les champs du domaine dans l'ordre actuel
      const { data: fields, error } = await supabase
        .from('fields')
        .select('id, order_index')
        .eq('domain_id', domainId)
        .order('order_index')

      if (error) throw error

      if (!fields || fromIndex >= fields.length || toIndex >= fields.length) return

      // Créer le nouvel ordre
      const reorderedFields = [...fields]
      const [movedField] = reorderedFields.splice(fromIndex, 1)
      reorderedFields.splice(toIndex, 0, movedField)

      // Mettre à jour les index dans la base
      const updates = reorderedFields.map((field, index) => ({
        id: field.id,
        order_index: index
      }))

      for (const update of updates) {
        await supabase
          .from('fields')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }
    } catch (error) {
      console.error('Erreur lors de la réorganisation des champs:', error)
      throw error
    }
  }

  // =================== COMPÉTENCES ===================

  /**
   * Crée une nouvelle compétence dans un champ
   */
  static async createCompetency(fieldId: string, name: string, description: string): Promise<Competency> {
    console.log('➕ [Compétence] Création d\'une nouvelle compétence:', { fieldId, name, description })

    try {
      // Obtenir le prochain index d'ordre
      console.log('🔢 [Compétence] Calcul de l\'index d\'ordre...')
      const { count } = await supabase
        .from('competencies')
        .select('*', { count: 'exact', head: true })
        .eq('field_id', fieldId)

      const orderIndex = count || 0
      console.log('📈 [Compétence] Index d\'ordre calculé:', orderIndex)

      console.log('💾 [Compétence] Insertion en base...')
      const { data, error } = await supabase
        .from('competencies')
        .insert({
          field_id: fieldId,
          name,
          description,
          order_index: orderIndex
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [Compétence] Erreur insertion:', error)
        throw error
      }

      const transformedCompetency = SupabaseCompetenciesService.transformCompetency(data!)
      console.log('✅ [Compétence] Compétence créée avec succès:', {
        id: transformedCompetency.id,
        name: transformedCompetency.name,
        fieldId,
        orderIndex
      })

      return transformedCompetency
    } catch (error) {
      console.error('💥 [Compétence] Erreur lors de la création de la compétence:', error)
      throw error
    }
  }

  /**
   * Met à jour une compétence
   */
  static async updateCompetency(competencyId: string, updates: { name?: string; description?: string }): Promise<Competency | null> {
    try {
      const { data, error } = await supabase
        .from('competencies')
        .update(updates)
        .eq('id', competencyId)
        .select()
        .single()

      if (error) throw error

      return data ? SupabaseCompetenciesService.transformCompetency(data) : null
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la compétence:', error)
      throw error
    }
  }

  /**
   * Supprime une compétence et tout son contenu
   */
  static async deleteCompetency(competencyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('competencies')
        .delete()
        .eq('id', competencyId)

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors de la suppression de la compétence:', error)
      throw error
    }
  }

  /**
   * Réorganise l'ordre des compétences dans un champ
   */
  static async reorderCompetencies(fieldId: string, fromIndex: number, toIndex: number): Promise<void> {
    try {
      // Récupérer toutes les compétences du champ dans l'ordre actuel
      const { data: competencies, error } = await supabase
        .from('competencies')
        .select('id, order_index')
        .eq('field_id', fieldId)
        .order('order_index')

      if (error) throw error

      if (!competencies || fromIndex >= competencies.length || toIndex >= competencies.length) return

      // Créer le nouvel ordre
      const reorderedCompetencies = [...competencies]
      const [movedCompetency] = reorderedCompetencies.splice(fromIndex, 1)
      reorderedCompetencies.splice(toIndex, 0, movedCompetency)

      // Mettre à jour les index dans la base
      const updates = reorderedCompetencies.map((competency, index) => ({
        id: competency.id,
        order_index: index
      }))

      for (const update of updates) {
        await supabase
          .from('competencies')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }
    } catch (error) {
      console.error('Erreur lors de la réorganisation des compétences:', error)
      throw error
    }
  }

  // =================== SOUS-COMPÉTENCES ===================

  /**
   * Crée une nouvelle sous-compétence dans une compétence
   */
  static async createSpecificCompetency(competencyId: string, name: string, description: string): Promise<SpecificCompetency> {
    console.log('➕ [Sous-compétence] Création d\'une nouvelle sous-compétence:', { competencyId, name, description })

    try {
      // Obtenir le prochain index d'ordre
      console.log('🔢 [Sous-compétence] Calcul de l\'index d\'ordre...')
      const { count } = await supabase
        .from('specific_competencies')
        .select('*', { count: 'exact', head: true })
        .eq('competency_id', competencyId)

      const orderIndex = count || 0
      console.log('📈 [Sous-compétence] Index d\'ordre calculé:', orderIndex)

      console.log('💾 [Sous-compétence] Insertion en base...')
      const { data, error } = await supabase
        .from('specific_competencies')
        .insert({
          competency_id: competencyId,
          name,
          description,
          order_index: orderIndex
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [Sous-compétence] Erreur insertion:', error)
        throw error
      }

      const transformedSpecificCompetency = SupabaseCompetenciesService.transformSpecificCompetency(data!)
      console.log('✅ [Sous-compétence] Sous-compétence créée avec succès:', {
        id: transformedSpecificCompetency.id,
        name: transformedSpecificCompetency.name,
        competencyId,
        orderIndex
      })

      return transformedSpecificCompetency
    } catch (error) {
      console.error('💥 [Sous-compétence] Erreur lors de la création de la sous-compétence:', error)
      throw error
    }
  }

  /**
   * Met à jour une sous-compétence
   */
  static async updateSpecificCompetency(specificCompetencyId: string, updates: { name?: string; description?: string; resultTypeConfigId?: string }): Promise<SpecificCompetency | null> {
    try {
      // Convertir resultTypeConfigId en result_type_config_id pour Supabase
      const dbUpdates: { name?: string; description?: string; result_type_config_id?: string } = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.resultTypeConfigId !== undefined) dbUpdates.result_type_config_id = updates.resultTypeConfigId

      const { data, error } = await supabase
        .from('specific_competencies')
        .update(dbUpdates)
        .eq('id', specificCompetencyId)
        .select()
        .single()

      if (error) throw error

      return data ? SupabaseCompetenciesService.transformSpecificCompetency(data) : null
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la sous-compétence:', error)
      throw error
    }
  }

  /**
   * Supprime une sous-compétence
   */
  static async deleteSpecificCompetency(specificCompetencyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('specific_competencies')
        .delete()
        .eq('id', specificCompetencyId)

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors de la suppression de la sous-compétence:', error)
      throw error
    }
  }

  /**
   * Réorganise l'ordre des sous-compétences dans une compétence
   */
  static async reorderSpecificCompetencies(competencyId: string, fromIndex: number, toIndex: number): Promise<void> {
    try {
      // Récupérer toutes les sous-compétences de la compétence dans l'ordre actuel
      const { data: specificCompetencies, error } = await supabase
        .from('specific_competencies')
        .select('id, order_index')
        .eq('competency_id', competencyId)
        .order('order_index')

      if (error) throw error

      if (!specificCompetencies || fromIndex >= specificCompetencies.length || toIndex >= specificCompetencies.length) return

      // Créer le nouvel ordre
      const reorderedSpecificCompetencies = [...specificCompetencies]
      const [movedSpecificCompetency] = reorderedSpecificCompetencies.splice(fromIndex, 1)
      reorderedSpecificCompetencies.splice(toIndex, 0, movedSpecificCompetency)

      // Mettre à jour les index dans la base
      const updates = reorderedSpecificCompetencies.map((specificCompetency, index) => ({
        id: specificCompetency.id,
        order_index: index
      }))

      for (const update of updates) {
        await supabase
          .from('specific_competencies')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }
    } catch (error) {
      console.error('Erreur lors de la réorganisation des sous-compétences:', error)
      throw error
    }
  }

  // =================== FONCTIONS DE TRANSFORMATION ===================

  /**
   * Transforme un framework Supabase en objet CompetencyFramework
   */
  private static transformFramework(supabaseFramework: SupabaseFramework): CompetencyFramework {
    return {
      id: supabaseFramework.id,
      name: supabaseFramework.name,
      version: supabaseFramework.version,
      domains: [] // Sera rempli par getAllDomains()
    }
  }

  /**
   * Transforme un domaine Supabase en objet Domain
   */
  private static transformDomain(supabaseDomain: SupabaseDomain): Domain {
    return {
      id: supabaseDomain.id,
      name: supabaseDomain.name,
      description: supabaseDomain.description || '',
      fields: []
    }
  }

  /**
   * Transforme un domaine avec ses enfants
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformDomainWithChildren(supabaseDomain: any): Domain {
    return {
      id: supabaseDomain.id,
      name: supabaseDomain.name,
      description: supabaseDomain.description || '',
      fields: (supabaseDomain.fields || [])
        .sort((a: SupabaseField, b: SupabaseField) => a.order_index - b.order_index)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((field: any) => SupabaseCompetenciesService.transformFieldWithChildren(field))
    }
  }

  /**
   * Transforme un champ Supabase en objet Field
   */
  private static transformField(supabaseField: SupabaseField): Field {
    return {
      id: supabaseField.id,
      name: supabaseField.name,
      description: supabaseField.description || '',
      competencies: []
    }
  }

  /**
   * Transforme un champ avec ses enfants
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformFieldWithChildren(supabaseField: any): Field {
    return {
      id: supabaseField.id,
      name: supabaseField.name,
      description: supabaseField.description || '',
      competencies: (supabaseField.competencies || [])
        .sort((a: SupabaseCompetency, b: SupabaseCompetency) => a.order_index - b.order_index)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((competency: any) => SupabaseCompetenciesService.transformCompetencyWithChildren(competency))
    }
  }

  /**
   * Transforme une compétence Supabase en objet Competency
   */
  private static transformCompetency(supabaseCompetency: SupabaseCompetency): Competency {
    return {
      id: supabaseCompetency.id,
      name: supabaseCompetency.name,
      description: supabaseCompetency.description || '',
      specificCompetencies: []
    }
  }

  /**
   * Transforme une compétence avec ses enfants
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformCompetencyWithChildren(supabaseCompetency: any): Competency {
    return {
      id: supabaseCompetency.id,
      name: supabaseCompetency.name,
      description: supabaseCompetency.description || '',
      specificCompetencies: (supabaseCompetency.specific_competencies || [])
        .sort((a: SupabaseSpecificCompetency, b: SupabaseSpecificCompetency) => a.order_index - b.order_index)
        .map((specificCompetency: SupabaseSpecificCompetency) => SupabaseCompetenciesService.transformSpecificCompetency(specificCompetency))
    }
  }

  /**
   * Transforme une sous-compétence Supabase en objet SpecificCompetency
   */
  private static transformSpecificCompetency(supabaseSpecificCompetency: SupabaseSpecificCompetency): SpecificCompetency {
    return {
      id: supabaseSpecificCompetency.id,
      name: supabaseSpecificCompetency.name,
      description: supabaseSpecificCompetency.description || '',
      resultTypeConfigId: supabaseSpecificCompetency.result_type_config_id
    }
  }
}

// Export par défaut du service
export const supabaseCompetenciesService = SupabaseCompetenciesService