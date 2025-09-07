import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global functions before importing
const mockUseRuntimeConfig = vi.fn()
const mockCreateClient = vi.fn()

vi.mock('#app', () => ({
  useRuntimeConfig: mockUseRuntimeConfig
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}))

// Now import the composable
import { useSupabase } from '~/composables/useSupabase'

describe('useSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create and return Supabase client with valid config', () => {
    // Arrange
    const mockConfig = {
      public: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key'
      }
    }
    mockUseRuntimeConfig.mockReturnValue(mockConfig)
    const mockClient = { auth: {} }
    mockCreateClient.mockReturnValue(mockClient)

    // Act
    const result = useSupabase()

    // Assert
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    )
    expect(result).toBe(mockClient)
  })

  it('should throw error when SUPABASE_URL is missing', () => {
    // Arrange
    const mockConfig = {
      public: {
        supabaseUrl: undefined,
        supabaseAnonKey: 'test-anon-key'
      }
    }
    mockUseRuntimeConfig.mockReturnValue(mockConfig)

    // Act & Assert
    expect(() => useSupabase()).toThrow('SUPABASE_URL is required but not configured')
  })

  it('should throw error when SUPABASE_ANON_KEY is missing', () => {
    // Arrange
    const mockConfig = {
      public: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: undefined
      }
    }
    mockUseRuntimeConfig.mockReturnValue(mockConfig)

    // Act & Assert
    expect(() => useSupabase()).toThrow('SUPABASE_ANON_KEY is required but not configured')
  })

  it('should throw error when both config values are missing', () => {
    // Arrange
    const mockConfig = {
      public: {
        supabaseUrl: undefined,
        supabaseAnonKey: undefined
      }
    }
    mockUseRuntimeConfig.mockReturnValue(mockConfig)

    // Act & Assert
    expect(() => useSupabase()).toThrow('SUPABASE_URL is required but not configured')
  })
})