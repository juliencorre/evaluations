import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global functions before importing
const mockNavigateTo = vi.fn()
const mockUseSupabase = vi.fn()

vi.mock('#app', () => ({
  navigateTo: mockNavigateTo
}))

vi.mock('~/composables/useSupabase', () => ({
  useSupabase: mockUseSupabase
}))

describe('useAuth', () => {
  let mockSupabase: any
  
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn()
      }
    }
    
    mockUseSupabase.mockReturnValue(mockSupabase)
  })

  it('should register user successfully', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    const mockUser = { id: '1', email: 'test@example.com' }
    const mockData = { user: mockUser, session: null }
    
    mockSupabase.auth.signUp.mockResolvedValue({
      data: mockData,
      error: null
    })

    const { register } = useAuth()

    // Act
    const result = await register('test@example.com', 'password123', { full_name: 'Test User' })

    // Assert
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: { full_name: 'Test User' }
      }
    })
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should handle registration error', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    const mockError = new Error('Registration failed')
    
    mockSupabase.auth.signUp.mockResolvedValue({
      data: null,
      error: mockError
    })

    const { register } = useAuth()

    // Act
    const result = await register('test@example.com', 'password123')

    // Assert
    expect(result.data).toBeNull()
    expect(result.error).toBe('Registration failed')
  })

  it('should login user successfully', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    const mockUser = { id: '1', email: 'test@example.com' }
    const mockData = { user: mockUser, session: { user: mockUser } }
    
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: mockData,
      error: null
    })

    const { login } = useAuth()

    // Act
    const result = await login('test@example.com', 'password123')

    // Assert
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should handle login error', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    const mockError = new Error('Invalid credentials')
    
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: mockError
    })

    const { login } = useAuth()

    // Act
    const result = await login('test@example.com', 'wrongpassword')

    // Assert
    expect(result.data).toBeNull()
    expect(result.error).toBe('Invalid credentials')
  })

  it('should logout user successfully', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null
    })

    const { logout } = useAuth()

    // Act
    const result = await logout()

    // Assert
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    expect(mockNavigateTo).toHaveBeenCalledWith('/')
    expect(result.error).toBeNull()
  })

  it('should handle logout error', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    const mockError = new Error('Logout failed')
    
    mockSupabase.auth.signOut.mockResolvedValue({
      error: mockError
    })

    const { logout } = useAuth()

    // Act
    const result = await logout()

    // Assert
    expect(result.error).toBe('Logout failed')
  })

  it('should reset password successfully', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
      error: null
    })

    const { resetPassword } = useAuth()

    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true
    })

    // Act
    const result = await resetPassword('test@example.com')

    // Assert
    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      { redirectTo: 'http://localhost:3000/reset-password' }
    )
    expect(result.error).toBeNull()
  })

  it('should update password successfully', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    
    mockSupabase.auth.updateUser.mockResolvedValue({
      error: null
    })

    const { updatePassword } = useAuth()

    // Act
    const result = await updatePassword('newpassword123')

    // Assert
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'newpassword123'
    })
    expect(result.error).toBeNull()
  })

  it('should initialize auth and listen for changes', async () => {
    // Arrange
    const { useAuth } = await import('~/composables/useAuth')
    const mockSession = { user: { id: '1', email: 'test@example.com' } }
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession }
    })
    
    mockSupabase.auth.onAuthStateChange.mockImplementation(() => {})

    const { initAuth } = useAuth()

    // Act
    await initAuth()

    // Assert
    expect(mockSupabase.auth.getSession).toHaveBeenCalled()
    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
  })
})