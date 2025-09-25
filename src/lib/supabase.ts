import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { AuthError, Session, User } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

// Vérifier si nous sommes dans un environnement de test
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
const isVitest = typeof process !== 'undefined' && process.env.VITEST === 'true'

let hasWarnedAboutCredentials = false

// Mock Supabase pour les tests (directement dans le fichier)
const createMockSupabase = () => {
  const mockUsers = new Map<string, { password: string; user: User }>()
  let activeSession: Session | null = null

  const createMockId = () => `mock-${Math.random().toString(36).slice(2, 12)}`

  const toAuthError = (message: string, status = 400): AuthError =>
    ({
      name: 'AuthApiError',
      message,
      status
    } as AuthError)

  const buildMockUser = (email: string, fullName?: string): User => {
    const now = new Date().toISOString()
    return {
      id: createMockId(),
      app_metadata: { provider: 'email', providers: ['email'] },
      aud: 'authenticated',
      email,
      phone: '',
      created_at: now,
      confirmed_at: now,
      email_confirmed_at: now,
      phone_confirmed_at: null,
      last_sign_in_at: now,
      role: 'authenticated',
      identities: [],
      factors: [],
      user_metadata: fullName?.trim()
        ? { full_name: fullName.trim() }
        : {}
    } as unknown as User
  }

  const buildMockSession = (user: User): Session => {
    const expiresIn = 3600
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn
    return {
      access_token: `mock-access-token-${user.id}`,
      token_type: 'bearer',
      expires_in: expiresIn,
      expires_at: expiresAt,
      refresh_token: `mock-refresh-token-${user.id}`,
      user
    } as Session
  }

  const upsertSession = (user: User) => {
    const session = buildMockSession(user)
    activeSession = session
    return session
  }

  const getUserRecord = (email: string) => mockUsers.get(email.toLowerCase())

  const createChainableMock = () => {
    const mockArrayResult = {
      data: [],
      error: null
    }

    const mockSingleResult = {
      data: null,
      error: null
    }

    const chainable = {
      select: () => chainable,
      order: () => chainable,
      eq: () => chainable,
      or: () => chainable,
      single: () => mockSingleResult,
      upsert: () => chainable,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      then: (resolve: (value: any) => void) => resolve(mockArrayResult),
      ...mockArrayResult
    }

    return chainable
  }

  const createTableMock = () => ({
    select: () => createChainableMock(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert: (_data: any) => createChainableMock(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: (_data: any) => createChainableMock(),
    delete: () => createChainableMock(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upsert: (_data: any, _options?: any) => createChainableMock()
  })

  const authMock = {
    getSession: async () => ({ data: { session: activeSession }, error: null }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const normalizedEmail = email.trim().toLowerCase()
      const record = getUserRecord(normalizedEmail)

      if (!record || record.password !== password) {
        return {
          data: { session: null, user: null },
          error: toAuthError('Invalid login credentials', 400)
        }
      }

      const updatedUser = {
        ...record.user,
        last_sign_in_at: new Date().toISOString()
      } as User

      record.user = updatedUser
      const session = upsertSession(updatedUser)

      return {
        data: { session, user: updatedUser },
        error: null
      }
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) => {
      const normalizedEmail = email.trim().toLowerCase()
      if (mockUsers.has(normalizedEmail)) {
        return {
          data: { session: null, user: null },
          error: toAuthError('User already registered', 400)
        }
      }

      const fullName = options?.data?.full_name
      const user = buildMockUser(normalizedEmail, fullName)
      mockUsers.set(normalizedEmail, { password, user })
      const session = upsertSession(user)

      return {
        data: { session, user },
        error: null
      }
    },
    signOut: async (_options?: { scope?: 'local' | 'global' }) => {
      activeSession = null
      return { error: null }
    },
    resetPasswordForEmail: async (email: string) => {
      const normalizedEmail = email.trim().toLowerCase()
      const record = getUserRecord(normalizedEmail)
      if (!record) {
        return { error: null }
      }

      return { error: null }
    },
    updateUser: async ({ data, password }: { data?: Record<string, unknown>; password?: string }) => {
      if (!activeSession) {
        return {
          data: { user: null },
          error: toAuthError('Not authenticated', 401)
        }
      }

      const email = activeSession.user.email?.toLowerCase()
      const record = email ? getUserRecord(email) : null

      if (!record) {
        return {
          data: { user: activeSession.user },
          error: null
        }
      }

      if (password) {
        record.password = password
      }

      let updatedUser = record.user
      if (data) {
        const maybeFullName = data['full_name']
        if (typeof maybeFullName === 'string') {
          const fullName = maybeFullName.trim()
          updatedUser = {
            ...updatedUser,
            user_metadata: fullName
              ? { full_name: fullName }
              : updatedUser.user_metadata
          } as User
        }
      }

      record.user = updatedUser
      activeSession = { ...activeSession, user: updatedUser }

      return {
        data: { user: updatedUser },
        error: null
      }
    },
    refreshSession: async () => ({
      data: { session: activeSession, user: activeSession?.user ?? null },
      error: null
    }),
    resend: async (_config: { type: string; email: string }) => ({ error: null }),
    exchangeCodeForSession: async () => ({ data: { session: activeSession }, error: null }),
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      callback('INITIAL_SESSION', activeSession)
      return {
        data: {
          subscription: {
            unsubscribe: () => undefined
          }
        }
      }
    }
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (_table: any) => createTableMock(),
    channel: () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on: (..._args: any[]) => ({
        subscribe: () => ({})
      })
    }),
    auth: authMock
  }
}

// Créer le client approprié selon l'environnement
function createSupabaseClient(): SupabaseClient<Database> {
  const shouldMock = isTestEnvironment || isVitest

  if (shouldMock) {
    return createMockSupabase() as unknown as SupabaseClient<Database>
  }

  // En mode production/développement, utiliser le vrai client Supabase si les credentials sont fournis
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!hasWarnedAboutCredentials) {
      console.warn(
        '[Supabase] Credentials not configured. Falling back to an in-memory mock client.\n' +
          'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local to enable remote authentication.'
      )
      hasWarnedAboutCredentials = true
    }

    return createMockSupabase() as unknown as SupabaseClient<Database>
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'evaluations.auth.token'
    }
  })
}

export const supabase = createSupabaseClient()
