/**
 * Unit Tests for AuthRepository
 * Tests authentication operations: sign in, sign up, sign out, session management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthRepository } from '@/services/repositories/AuthRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AuthError } from '@supabase/auth-js'

describe('AuthRepository', () => {
  let repository: AuthRepository
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any

  beforeEach(() => {
    // Create comprehensive mock Supabase client
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        refreshSession: vi.fn(),
        updateUser: vi.fn(),
        resend: vi.fn(),
        onAuthStateChange: vi.fn()
      }
    } as unknown as SupabaseClient

    repository = new AuthRepository(mockSupabase)

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('getSession', () => {
    it('should return session successfully', async () => {
      const mockSession = { user: { id: '123' }, access_token: 'token' }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await repository.getSession()

      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
    })

    it('should handle session error', async () => {
      const mockError = new AuthError('Session expired')
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError
      })

      const result = await repository.getSession()

      expect(result.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signInWithPassword', () => {
    it('should sign in user successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await repository.signInWithPassword(
        'test@example.com',
        'password123'
      )

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should handle invalid credentials', async () => {
      const mockError = new AuthError('Invalid credentials')
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await repository.signInWithPassword(
        'wrong@example.com',
        'wrongpass'
      )

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signUp', () => {
    it('should create new user account', async () => {
      const mockUser = { id: '456', email: 'new@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await repository.signUp({
        email: 'new@example.com',
        password: 'password123',
        emailRedirectTo: 'http://localhost/callback',
        metadata: { full_name: 'John Doe' }
      })

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should handle email already exists error', async () => {
      const mockError = new AuthError('Email already registered')
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await repository.signUp({
        email: 'existing@example.com',
        password: 'password123'
      })

      expect(result.error).toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await repository.signOut('global')

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({ scope: 'global' })
    })

    it('should handle sign out error', async () => {
      const mockError = new AuthError('Sign out failed')
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError })

      const result = await repository.signOut('local')

      expect(result.error).toEqual(mockError)
    })
  })

  describe('resetPasswordForEmail', () => {
    it('should send password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await repository.resetPasswordForEmail(
        'user@example.com',
        'http://localhost/reset'
      )

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        { redirectTo: 'http://localhost/reset' }
      )
    })
  })

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockSession = { access_token: 'new_token' }
      const mockUser = { id: '123' }

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null
      })

      const result = await repository.refreshSession()

      expect(result.session).toEqual(mockSession)
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user metadata', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await repository.updateUser({
        data: { display_name: 'John Doe' }
      })

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })
  })

  describe('resendVerificationEmail', () => {
    it('should resend verification email', async () => {
      mockSupabase.auth.resend.mockResolvedValue({ error: null })

      const result = await repository.resendVerificationEmail('test@example.com')

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com'
      })
    })
  })

  describe('onAuthStateChange', () => {
    it('should register auth state change listener', () => {
      const callback = vi.fn()
      const mockSubscription = {
        data: { subscription: { unsubscribe: vi.fn() } }
      }

      mockSupabase.auth.onAuthStateChange.mockReturnValue(mockSubscription)

      const result = repository.onAuthStateChange(callback)

      expect(result).toEqual(mockSubscription)
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      )
    })
  })
})
