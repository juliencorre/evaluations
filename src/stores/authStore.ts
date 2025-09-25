import { ref, readonly, computed, watchEffect } from 'vue'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const currentUser = ref<User | null>(null)
const currentSession = ref<Session | null>(null)
const isInitializing = ref(true)
const lastError = ref<AuthError | null>(null)
const hasInteracted = ref(false)

let isInitialized = false
let authListener: ReturnType<typeof supabase.auth.onAuthStateChange> | null = null

const resetError = () => {
  lastError.value = null
}

const startAuthListener = () => {
  if (authListener) {
    return
  }

  authListener = supabase.auth.onAuthStateChange((_event, session) => {
    currentSession.value = session
    currentUser.value = session?.user ?? null
    if (!hasInteracted.value) {
      hasInteracted.value = true
    }
  })
}

const loadInitialSession = async () => {
  if (isInitialized) {
    return
  }

  isInitializing.value = true
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    lastError.value = error
    currentSession.value = null
    currentUser.value = null
  } else {
    currentSession.value = data.session
    currentUser.value = data.session?.user ?? null
  }
  startAuthListener()
  isInitializing.value = false
  isInitialized = true
}

const ensureInitialized = async () => {
  if (!isInitialized) {
    await loadInitialSession()
  }
}

const getRedirectTo = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const url = new URL(window.location.href)
  const redirectTo = url.searchParams.get('redirectTo')
  if (redirectTo) {
    return `${window.location.origin}${redirectTo}`
  }

  return `${window.location.origin}/auth/callback`
}

const signInWithPassword = async (email: string, password: string) => {
  hasInteracted.value = true
  resetError()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    lastError.value = error
    return { data: null, error }
  }

  currentSession.value = data.session
  currentUser.value = data.user
  return { data, error: null }
}

interface SignUpPayload {
  email: string
  password: string
  fullName?: string
}

const signUpWithEmail = async ({ email, password, fullName }: SignUpPayload) => {
  hasInteracted.value = true
  resetError()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectTo(),
      data: {
        full_name: fullName?.trim()
      }
    }
  })

  if (error) {
    lastError.value = error
    return { data: null, error }
  }

  currentSession.value = data.session
  currentUser.value = data.user
  return { data, error: null }
}

const signOut = async () => {
  resetError()
  const { error } = await supabase.auth.signOut({ scope: 'global' })
  if (error) {
    lastError.value = error
    return { error }
  }

  currentSession.value = null
  currentUser.value = null
  return { error: null }
}

const sendPasswordReset = async (email: string) => {
  resetError()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectTo()
  })

  if (error) {
    lastError.value = error
  }

  return { error }
}

const updateProfile = async (payload: { fullName?: string; password?: string }) => {
  resetError()
  const { fullName, password } = payload

  if (typeof fullName === 'undefined' && !password) {
    return { data: null, error: null }
  }

  const updateData: { data?: Record<string, unknown>; password?: string } = {}

  if (fullName !== undefined) {
    updateData.data = { full_name: fullName }
  }

  if (password) {
    updateData.password = password
  }

  const { data, error } = await supabase.auth.updateUser(updateData)
  if (error) {
    lastError.value = error
    return { data: null, error }
  }

  currentUser.value = data.user
  return { data, error: null }
}

const refreshSession = async () => {
  resetError()
  const { data, error } = await supabase.auth.refreshSession()
  if (error) {
    lastError.value = error
  } else {
    currentSession.value = data.session
    currentUser.value = data.user
  }
  return { data, error }
}

const resendEmailVerification = async () => {
  if (!currentUser.value?.email) {
    return { error: new Error('Utilisateur inconnu') }
  }
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: currentUser.value.email
  })

  if (error) {
    lastError.value = error
  }

  return { error }
}

watchEffect(() => {
  if (!isInitialized) {
    void loadInitialSession()
  }
})

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

export const useAuthStore = () => {
  return {
    user: readonly(currentUser),
    session: readonly(currentSession),
    isInitializing: readonly(isInitializing),
    lastError: readonly(lastError),
    hasInteracted: readonly(hasInteracted),
    displayName,
    userEmail,
    isEmailVerified,
    ensureInitialized,
    signInWithPassword,
    signUpWithEmail,
    signOut,
    sendPasswordReset,
    updateProfile,
    refreshSession,
    resendEmailVerification,
    resetError
  }
}

export const isAuthenticated = computed(() => Boolean(currentUser.value))
