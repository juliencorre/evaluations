import { supabase } from '@/lib/supabase'

export interface EmailRestriction {
  id: string
  rule_type: 'email' | 'domain'
  value: string
  description?: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateEmailRestrictionData {
  rule_type: 'email' | 'domain'
  value: string
  description?: string
  is_active?: boolean
}

/**
 * Service pour gérer les restrictions d'emails côté administration
 */
export const emailRestrictionsService = {
  /**
   * Récupère toutes les restrictions d'emails
   */
  async getEmailRestrictions(): Promise<EmailRestriction[]> {
    try {
      const { data, error } = await supabase
        .from('email_restrictions' as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors de la récupération des restrictions:', error)
        throw error
      }

      return (data as unknown as EmailRestriction[]) || []
    } catch (error) {
      console.error('Erreur dans getEmailRestrictions:', error)
      throw error
    }
  },

  /**
   * Récupère uniquement les restrictions actives
   */
  async getActiveEmailRestrictions(): Promise<EmailRestriction[]> {
    try {
      const { data, error } = await supabase
        .from('email_restrictions' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors de la récupération des restrictions actives:', error)
        throw error
      }

      return (data as unknown as EmailRestriction[]) || []
    } catch (error) {
      console.error('Erreur dans getActiveEmailRestrictions:', error)
      throw error
    }
  },

  /**
   * Crée une nouvelle restriction d'email
   */
  async createEmailRestriction(restrictionData: CreateEmailRestrictionData): Promise<EmailRestriction> {
    try {
      // Normaliser les données
      const normalizedData = {
        ...restrictionData,
        value: restrictionData.value.toLowerCase().trim(),
        description: restrictionData.description?.trim() || null,
        is_active: restrictionData.is_active ?? true
      }

      const { data, error } = await supabase
        .from('email_restrictions' as any)
        .insert([normalizedData])
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la création de la restriction:', error)
        throw error
      }

      return data as unknown as EmailRestriction
    } catch (error) {
      console.error('Erreur dans createEmailRestriction:', error)
      throw error
    }
  },

  /**
   * Met à jour une restriction d'email
   */
  async updateEmailRestriction(
    id: string,
    updates: Partial<CreateEmailRestrictionData>
  ): Promise<EmailRestriction> {
    try {
      // Normaliser les données de mise à jour
      type EmailRestrictionUpdate = Partial<Omit<CreateEmailRestrictionData, 'description'>> & {
        description?: string | null
      }

      const normalizedUpdates: EmailRestrictionUpdate = { ...updates }
      if (updates.value) {
        normalizedUpdates.value = updates.value.toLowerCase().trim()
      }
      if (updates.description !== undefined) {
        normalizedUpdates.description = updates.description?.trim() || null
      }

      const { data, error } = await supabase
        .from('email_restrictions' as any)
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la mise à jour de la restriction:', error)
        throw error
      }

      return data as unknown as EmailRestriction
    } catch (error) {
      console.error('Erreur dans updateEmailRestriction:', error)
      throw error
    }
  },

  /**
   * Active/désactive une restriction d'email
   */
  async toggleEmailRestriction(id: string, isActive: boolean): Promise<EmailRestriction> {
    try {
      const { data, error } = await supabase
        .from('email_restrictions' as any)
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erreur lors du toggle de la restriction:', error)
        throw error
      }

      return data as unknown as EmailRestriction
    } catch (error) {
      console.error('Erreur dans toggleEmailRestriction:', error)
      throw error
    }
  },

  /**
   * Supprime une restriction d'email
   */
  async deleteEmailRestriction(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_restrictions' as any)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erreur lors de la suppression de la restriction:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Erreur dans deleteEmailRestriction:', error)
      throw error
    }
  },

  /**
   * Vérifie si l'utilisateur actuel a les permissions d'administration
   */
  async checkAdminPermissions(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return false
      }

      // Vérifier si l'utilisateur est dans la liste des admins
      // Cette logique peut être adaptée selon vos besoins
      const adminEmails = [
        'admin@localhost',
        'admin@education.gouv.fr'
      ]

      return adminEmails.includes(user.email || '')
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error)
      return false
    }
  },

  /**
   * Importe des restrictions en lot depuis un tableau
   */
  async bulkCreateEmailRestrictions(restrictions: CreateEmailRestrictionData[]): Promise<EmailRestriction[]> {
    try {
      // Normaliser toutes les données
      const normalizedRestrictions = restrictions.map(restriction => ({
        ...restriction,
        value: restriction.value.toLowerCase().trim(),
        description: restriction.description?.trim() || null,
        is_active: restriction.is_active ?? true
      }))

      const { data, error } = await supabase
        .from('email_restrictions' as any)
        .insert(normalizedRestrictions)
        .select()

      if (error) {
        console.error('Erreur lors de la création en lot:', error)
        throw error
      }

      return (data as unknown as EmailRestriction[]) || []
    } catch (error) {
      console.error('Erreur dans bulkCreateEmailRestrictions:', error)
      throw error
    }
  },

  /**
   * Exporte toutes les restrictions au format JSON
   */
  async exportEmailRestrictions(): Promise<string> {
    try {
      const restrictions = await this.getEmailRestrictions()
      return JSON.stringify(restrictions, null, 2)
    } catch (error) {
      console.error('Erreur dans exportEmailRestrictions:', error)
      throw error
    }
  },

  /**
   * Statistiques sur les restrictions
   */
  async getEmailRestrictionsStats(): Promise<{
    total: number
    active: number
    inactive: number
    byType: { email: number; domain: number }
  }> {
    try {
      const restrictions = await this.getEmailRestrictions()

      const stats = {
        total: restrictions.length,
        active: restrictions.filter(r => r.is_active).length,
        inactive: restrictions.filter(r => !r.is_active).length,
        byType: {
          email: restrictions.filter(r => r.rule_type === 'email').length,
          domain: restrictions.filter(r => r.rule_type === 'domain').length
        }
      }

      return stats
    } catch (error) {
      console.error('Erreur dans getEmailRestrictionsStats:', error)
      throw error
    }
  }
}