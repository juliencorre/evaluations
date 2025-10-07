/**
 * Authentication Store - Pinia
 * Phase 4.3: Store/Module/Repository Pattern
 *
 * Manages user authentication state and operations through AuthRepository.
 * Handles session management, sign in/out, and auth state persistence.
 *
 * @example
 * ```typescript
 * const authStore = useAuthStore()
 *
 * // Check if user is authenticated
 * if (authStore.isAuthenticated) {
 *   console.log('User:', authStore.user)
 * }
 *
 * // Sign in
 * await authStore.signInWithPassword('user@example.com', 'password')
 *
 * // Sign out
 * await authStore.signOut()
 * ```
 *
 * @remarks
 * - Session is automatically restored on app load
 * - Auth state changes are monitored in real-time
 * - Errors are stored in lastError ref
 */

import { ref, readonly, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import { AuthError } from '@supabase/auth-js'
import { serviceContainer } from '@/services/ServiceContainer'

const currentUser = ref<User | null>(null)
const currentSession = ref<Session | null>(null)
const isInitializing = ref(true)
const lastError = ref<AuthError | null>(null)
const hasInteracted = ref(false)

let isInitialized = false
let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null
let initializationPromise: Promise<{ error: AuthError | null }> | null = null

const resolveStatus = (error: unknown, fallbackStatus = 500) => {
  if (error && typeof error === 'object' && 'status' in error) {
    const candidate = (error as { status?: unknown }).status
    if (typeof candidate === 'number') {
      return candidate
    }
  }

  return fallbackStatus
}

const toAuthError = (error: unknown, fallbackMessage: string, fallbackStatus = 500) => {
  if (error instanceof AuthError) {
    return error
  }

  if (error instanceof Error) {
    return new AuthError(error.message, resolveStatus(error, fallbackStatus))
  }

  return new AuthError(fallbackMessage, fallbackStatus)
}

const applySession = (session: Session | null) => {
  currentSession.value = session
  currentUser.value = session?.user ?? null
}

const resetError = () => {
  lastError.value = null
}

const stopAuthListener = () => {
  if (authListener) {
    authListener.data.subscription.unsubscribe()
    authListener = null
  }
}

const startAuthListener = () => {
  if (authListener) {
    return
  }

  const authRepository = serviceContainer.auth
  authListener = authRepository.onAuthStateChange((_event, session) => {
    applySession(session)
    if (!hasInteracted.value) {
      hasInteracted.value = true
    }
  })
}

const loadInitialSession = async () => {
  if (isInitialized) {
    return { error: null }
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      isInitializing.value = true
      resetError()
      try {
        const authRepository = serviceContainer.auth
        const { session, error } = await authRepository.getSession()
        if (error) {
          lastError.value = error
          applySession(null)
          return { error }
        } else {
          applySession(session)
        }
        startAuthListener()
        isInitialized = true
        return { error: null }
      } catch (unknownError) {
        const normalizedError = toAuthError(
          unknownError,
          "Impossible de récupérer la session d'authentification.",
          503
        )
        lastError.value = normalizedError
        applySession(null)
        return { error: normalizedError }
      } finally {
        isInitializing.value = false
        initializationPromise = null
        if (!isInitialized) {
          stopAuthListener()
        }
      }
    })()
  }

  return initializationPromise
}

const ensureInitialized = async () => {
  const result = await loadInitialSession()
  if (result?.error) {
    throw result.error
  }
}

const retryInitialization = async () => {
  stopAuthListener()
  isInitialized = false
  applySession(null)
  resetError()
  return ensureInitialized()
}

const getRedirectTo = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const url = new URL(window.location.href)
  const redirectParam = url.searchParams.get('redirect') || url.searchParams.get('redirectTo')

  const isSafeRedirect = (value: string | null) => Boolean(value && value.startsWith('/'))

  const callbackUrl = new URL('/auth/callback', window.location.origin)

  if (isSafeRedirect(redirectParam)) {
    callbackUrl.searchParams.set('redirect', redirectParam as string)
  }

  return callbackUrl.toString()
}

const signInWithPassword = async (email: string, password: string) => {
  hasInteracted.value = true
  resetError()

  const authRepository = serviceContainer.auth
  const { session, user, error } = await authRepository.signInWithPassword(email, password)

  if (error) {
    lastError.value = error
    return { data: null, error }
  }

  applySession(session)
  return { data: { session, user }, error: null }
}

interface SignUpPayload {
  email: string
  password: string
  fullName?: string
}

const signUpWithEmail = async ({ email, password, fullName }: SignUpPayload) => {
  hasInteracted.value = true
  resetError()

  const authRepository = serviceContainer.auth
  const { session, user, error } = await authRepository.signUp({
    email,
    password,
    emailRedirectTo: getRedirectTo(),
    metadata: {
      full_name: fullName?.trim()
    }
  })

  if (error) {
    lastError.value = error
    return { data: null, error }
  }

  if (session) {
    applySession(session)
  } else if (user) {
    currentUser.value = user
  }
  return { data: { session, user }, error: null }
}

const signOut = async () => {
  resetError()

  // Clear the session immediately to trigger reactive updates
  applySession(null)

  // Then perform the actual signOut
  const authRepository = serviceContainer.auth
  const { error } = await authRepository.signOut('global')

  if (error) {
    lastError.value = error
    // Re-apply the session if signOut failed
    const { session } = await authRepository.getSession()
    applySession(session)
    return { error }
  }

  return { error: null }
}

const sendPasswordReset = async (email: string) => {
  resetError()

  const authRepository = serviceContainer.auth
  const { error } = await authRepository.resetPasswordForEmail(email, getRedirectTo())

  if (error) {
    lastError.value = error
  }

  return { error }
}

async function refreshSession() {
  resetError()

  const authRepository = serviceContainer.auth
  const { session, user, error } = await authRepository.refreshSession()

  if (error) {
    lastError.value = error
  } else {
    applySession(session)
  }
  return { data: { session, user }, error }
}

const updateProfile = async (payload: { fullName?: string; password?: string }) => {
  resetError()
  const { fullName, password } = payload

  if (typeof fullName === 'undefined' && !password) {
    return { data: null, error: null }
  }

  const authRepository = serviceContainer.auth
  const updateOptions: { metadata?: { full_name?: string }; password?: string } = {}

  if (fullName !== undefined) {
    updateOptions.metadata = { full_name: fullName }
  }

  if (password) {
    updateOptions.password = password
  }

  const { user, error } = await authRepository.updateUser(updateOptions)

  if (error) {
    lastError.value = error
    return { data: null, error }
  }

  currentUser.value = user

  if (password) {
    const { error: refreshError } = await refreshSession()
    if (refreshError) {
      await authRepository.signOut('global')
      applySession(null)
      const forcedReauthError = new AuthError(
        'Votre mot de passe a été mis à jour. Merci de vous reconnecter pour sécuriser votre session.',
        resolveStatus(refreshError, 401)
      )
      lastError.value = forcedReauthError
      return { data: null, error: forcedReauthError }
    }
  }
  return { data: { user }, error: null }
}

const resendEmailVerification = async (email?: string) => {
  const targetEmail = email ?? currentUser.value?.email
  if (!targetEmail) {
    const error = new AuthError(
      "Une adresse e-mail valide est nécessaire pour renvoyer la confirmation.",
      400
    )
    lastError.value = error
    return { error }
  }

  const authRepository = serviceContainer.auth
  const { error } = await authRepository.resendVerificationEmail(targetEmail)

  if (error) {
    lastError.value = error
  }

  return { error }
}

// Démarre automatiquement l'initialisation au chargement du module
void loadInitialSession()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopAuthListener, { once: true })
}

const userEmail = computed(() => currentUser.value?.email ?? '')
const userMetadata = computed(() => currentUser.value?.user_metadata ?? {})
const displayName = computed(() => {
  const metadataName = (userMetadata.value as { full_name?: string }).full_name
  if (metadataName && metadataName.trim().length > 0) {
    return metadataName.trim()
  }
  if (currentUser.value?.email) {
    return currentUser.value.email.split('@')[0]
  }
  return 'Utilisateur'
})

const emailVerifiedAt = computed(() => currentUser.value?.email_confirmed_at)
const isEmailVerified = computed(() => Boolean(emailVerifiedAt.value))

// Export isAuthenticated as a module-level computed ref
export const isAuthenticated = computed(() => Boolean(currentUser.value))

export const useAuthStore = defineStore('auth', () => {

  return {
    user: readonly(currentUser),
    session: readonly(currentSession),
    isInitializing: readonly(isInitializing),
    lastError: readonly(lastError),
    hasInteracted: readonly(hasInteracted),
    displayName,
    userEmail,
    isEmailVerified,
    isAuthenticated,
    ensureInitialized,
    retryInitialization,
    signInWithPassword,
    signUpWithEmail,
    signOut,
    sendPasswordReset,
    updateProfile,
    refreshSession,
    resendEmailVerification,
    resetError,
    stopAuthListener
  }
})
