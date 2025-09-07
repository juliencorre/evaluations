/**
 * Centralized Error Messages
 * Maintains consistency across the application
 */

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_NOT_CONFIRMED: 'Veuillez confirmer votre email avant de vous connecter',
  TOO_MANY_REQUESTS: 'Trop de tentatives de connexion. Veuillez patienter quelques minutes.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cet email',
  WEAK_PASSWORD: 'Le mot de passe ne respecte pas les critères de sécurité',
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  GENERIC_ERROR: 'Une erreur est survenue. Veuillez réessayer.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  PASSWORD_RESET_ERROR: 'Erreur lors de la réinitialisation du mot de passe',
  REGISTRATION_ERROR: 'Erreur lors de l\'inscription. Veuillez réessayer.',
} as const

export const FORM_ERRORS = {
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  INVALID_EMAIL: 'L\'adresse email n\'est pas valide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
  PASSWORD_REQUIREMENTS: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas',
  TERMS_REQUIRED: 'Vous devez accepter les conditions d\'utilisation',
  NAME_TOO_SHORT: 'Le nom doit contenir au moins 2 caractères',
} as const

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie! Redirection en cours...',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  REGISTRATION_SUCCESS: 'Votre compte a été créé avec succès! Veuillez vérifier votre email pour confirmer votre compte.',
  PASSWORD_RESET_SENT: 'Un email de réinitialisation a été envoyé à votre adresse',
  PASSWORD_UPDATED: 'Votre mot de passe a été mis à jour avec succès',
  PROFILE_UPDATED: 'Votre profil a été mis à jour',
} as const

/**
 * Maps Supabase error codes to user-friendly messages
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return AUTH_ERRORS.GENERIC_ERROR
  
  const errorMessage = error.message || error.error_description || error
  
  // Map common error patterns to user-friendly messages
  if (errorMessage.includes('Invalid login credentials')) {
    return AUTH_ERRORS.INVALID_CREDENTIALS
  }
  if (errorMessage.includes('Email not confirmed')) {
    return AUTH_ERRORS.EMAIL_NOT_CONFIRMED
  }
  if (errorMessage.includes('Too many requests')) {
    return AUTH_ERRORS.TOO_MANY_REQUESTS
  }
  if (errorMessage.includes('User already registered')) {
    return AUTH_ERRORS.USER_ALREADY_EXISTS
  }
  if (errorMessage.includes('Password should be at least')) {
    return AUTH_ERRORS.WEAK_PASSWORD
  }
  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return AUTH_ERRORS.NETWORK_ERROR
  }
  if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
    return AUTH_ERRORS.SESSION_EXPIRED
  }
  if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return AUTH_ERRORS.UNAUTHORIZED
  }
  
  // Return generic error for unmapped errors
  return AUTH_ERRORS.GENERIC_ERROR
}