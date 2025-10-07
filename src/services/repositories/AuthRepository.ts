/**
 * Auth Repository
 * Phase 4.3: Services Layer - Repository Pattern for Authentication
 *
 * Centralizes all Supabase authentication operations including:
 * - Session management (get, refresh)
 * - User authentication (sign in, sign up, sign out)
 * - Password management (reset, update)
 * - Email verification
 * - Auth state monitoring
 *
 * @example
 * ```typescript
 * // Sign in user
 * const { session, user, error } = await authRepository.signInWithPassword(
 *   'user@example.com',
 *   'password123'
 * )
 *
 * // Get current session
 * const { session, error } = await authRepository.getSession()
 *
 * // Sign out
 * await authRepository.signOut('global')
 * ```
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Session, User } from '@supabase/supabase-js'
import { AuthError } from '@supabase/auth-js'

/**
 * Options for signing up a new user
 */
interface SignUpOptions {
  email: string
  password: string
  emailRedirectTo?: string
  metadata?: {
    full_name?: string
    [key: string]: unknown
  }
}

/**
 * Options for updating user profile
 */
interface UpdateUserOptions {
  metadata?: {
    full_name?: string
    [key: string]: unknown
  }
  password?: string
}

/**
 * Repository for managing Supabase authentication operations
 */
export class AuthRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'Auth')
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      this.log('getSession')

      const { data, error } = await this.supabase.auth.getSession()

      if (error) {
        this.logError('getSession', error)
        return { session: null, error }
      }

      return { session: data.session, error: null }
    } catch (error) {
      this.handleError('getSession', error)
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string): Promise<{
    session: Session | null
    user: User | null
    error: AuthError | null
  }> {
    try {
      this.log('signInWithPassword', { email })

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        this.logError('signInWithPassword', error)
        return { session: null, user: null, error }
      }

      return { session: data.session, user: data.user, error: null }
    } catch (error) {
      this.handleError('signInWithPassword', error)
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(options: SignUpOptions): Promise<{
    session: Session | null
    user: User | null
    error: AuthError | null
  }> {
    try {
      this.log('signUp', { email: options.email })

      const { data, error } = await this.supabase.auth.signUp({
        email: options.email,
        password: options.password,
        options: {
          emailRedirectTo: options.emailRedirectTo,
          data: options.metadata
        }
      })

      if (error) {
        this.logError('signUp', error)
        return { session: null, user: null, error }
      }

      return { session: data.session, user: data.user, error: null }
    } catch (error) {
      this.handleError('signUp', error)
    }
  }

  /**
   * Sign out
   */
  async signOut(scope: 'global' | 'local' | 'others' = 'global'): Promise<{ error: AuthError | null }> {
    try {
      this.log('signOut', { scope })

      const { error } = await this.supabase.auth.signOut({ scope })

      if (error) {
        this.logError('signOut', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      this.handleError('signOut', error)
    }
  }

  /**
   * Reset password for email
   */
  async resetPasswordForEmail(email: string, redirectTo?: string): Promise<{ error: AuthError | null }> {
    try {
      this.log('resetPasswordForEmail', { email })

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      })

      if (error) {
        this.logError('resetPasswordForEmail', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      this.handleError('resetPasswordForEmail', error)
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<{
    session: Session | null
    user: User | null
    error: AuthError | null
  }> {
    try {
      this.log('refreshSession')

      const { data, error } = await this.supabase.auth.refreshSession()

      if (error) {
        this.logError('refreshSession', error)
        return { session: null, user: null, error }
      }

      return { session: data.session, user: data.user, error: null }
    } catch (error) {
      this.handleError('refreshSession', error)
    }
  }

  /**
   * Update user metadata or password
   */
  async updateUser(options: UpdateUserOptions): Promise<{
    user: User | null
    error: AuthError | null
  }> {
    try {
      this.log('updateUser')

      const updateData: {
        data?: Record<string, unknown>
        password?: string
      } = {}

      if (options.metadata) {
        updateData.data = options.metadata
      }

      if (options.password) {
        updateData.password = options.password
      }

      const { data, error } = await this.supabase.auth.updateUser(updateData)

      if (error) {
        this.logError('updateUser', error)
        return { user: null, error }
      }

      return { user: data.user, error: null }
    } catch (error) {
      this.handleError('updateUser', error)
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email: string): Promise<{ error: AuthError | null }> {
    try {
      this.log('resendVerificationEmail', { email })

      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      })

      if (error) {
        this.logError('resendVerificationEmail', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      this.handleError('resendVerificationEmail', error)
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    this.log('onAuthStateChange')

    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }
}
