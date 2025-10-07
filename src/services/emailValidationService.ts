import { supabase } from '@/lib/supabase'

export interface EmailValidationResult {
  allowed: boolean
  message: string
}

/**
 * Service pour valider les emails avant inscription
 */
export const emailValidationService = {
  /**
   * Valide si un email est autorisé pour l'inscription
   */
  async validateEmail(email: string): Promise<EmailValidationResult> {
    try {
      // Normaliser l'email
      const normalizedEmail = email.toLowerCase().trim()

      // Appeler la fonction RPC Supabase
      const { data, error } = await supabase.rpc('validate_email_registration', {
        email_to_validate: normalizedEmail
      })

      if (error) {
        console.error('Erreur lors de la validation de l\'email:', error)
        return {
          allowed: false,
          message: 'Erreur lors de la validation de l\'email'
        }
      }

      return data as EmailValidationResult
    } catch (error) {
      console.error('Erreur dans emailValidationService.validateEmail:', error)
      return {
        allowed: false,
        message: 'Erreur de connexion au service de validation'
      }
    }
  },

  /**
   * Valide un email en utilisant l'Edge Function (alternative)
   */
  async validateEmailViaEdgeFunction(email: string): Promise<EmailValidationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-email-signup', {
        body: { email }
      })

      if (error) {
        console.error('Erreur lors de l\'appel à l\'Edge Function:', error)
        return {
          allowed: false,
          message: 'Erreur lors de la validation de l\'email'
        }
      }

      return data as EmailValidationResult
    } catch (error) {
      console.error('Erreur dans validateEmailViaEdgeFunction:', error)
      return {
        allowed: false,
        message: 'Erreur de connexion au service de validation'
      }
    }
  },

  /**
   * Validation côté client basique (pour UX rapide)
   */
  validateEmailFormat(email: string): { valid: boolean; message?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      return { valid: false, message: 'Email requis' }
    }

    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Format d\'email invalide' }
    }

    return { valid: true }
  },

  /**
   * Extraction du domaine d'un email
   */
  extractDomain(email: string): string {
    return email.split('@')[1]?.toLowerCase() || ''
  },

  /**
   * Validation côté client pour certains domaines connus
   */
  isEducationDomain(email: string): boolean {
    const domain = this.extractDomain(email)
    const educationDomains = [
      'education.gouv.fr',
      'ac-lyon.fr',
      'ac-paris.fr',
      'ac-versailles.fr',
      'ac-creteil.fr',
      'ac-bordeaux.fr',
      'ac-lille.fr',
      'ac-toulouse.fr',
      'ac-nantes.fr',
      'ac-rennes.fr',
      'ac-strasbourg.fr',
      'ac-grenoble.fr',
      'ac-montpellier.fr',
      'ac-aix-marseille.fr',
      'ac-nice.fr',
      'ac-reims.fr',
      'ac-nancy-metz.fr',
      'ac-orleans-tours.fr',
      'ac-caen.fr',
      'ac-rouen.fr',
      'ac-amiens.fr',
      'ac-dijon.fr',
      'ac-besancon.fr',
      'ac-limoges.fr',
      'ac-poitiers.fr',
      'ac-clermont.fr'
    ]

    return educationDomains.includes(domain) || domain.endsWith('.education.gouv.fr')
  }
}