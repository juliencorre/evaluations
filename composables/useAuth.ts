import type { User, Session } from '@supabase/supabase-js'

/**
 * Authentication composable
 * Provides authentication state management and methods
 * Handles login, register, logout, and session management
 */
export const useAuth = () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  /**
   * Register a new user with email and password
   * @param email - User email address
   * @param password - User password
   * @param userData - Additional user data
   * @returns Promise with registration result
   */
  const register = async (email: string, password: string, userData: any = {}) => {
    if (!process.client) {
      return { data: null, error: 'Client-side only' }
    }

    const supabase = useSupabase()
    
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign in user with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Promise with login result
   */
  const login = async (email: string, password: string) => {
    if (!process.client) {
      return { data: null, error: 'Client-side only' }
    }

    const supabase = useSupabase()
    
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      console.error('Login error:', error)
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign out the current user
   * @returns Promise with logout result
   */
  const logout = async () => {
    if (!process.client) {
      return { error: 'Client-side only' }
    }

    const supabase = useSupabase()
    
    try {
      loading.value = true
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      // Clear local state
      user.value = null
      session.value = null
      
      // Redirect to home or login page
      await navigateTo('/')
      
      return { error: null }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { error: error.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Send password reset email
   * @param email - User email address
   * @returns Promise with reset result
   */
  const resetPassword = async (email: string) => {
    if (!process.client) {
      return { error: 'Client-side only' }
    }

    const supabase = useSupabase()
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { error: error.message }
    }
  }

  /**
   * Update user password
   * @param password - New password
   * @returns Promise with update result
   */
  const updatePassword = async (password: string) => {
    if (!process.client) {
      return { error: 'Client-side only' }
    }

    const supabase = useSupabase()
    
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      console.error('Password update error:', error)
      return { error: error.message }
    }
  }

  /**
   * Initialize auth state and listen for changes
   */
  const initAuth = async () => {
    if (!process.client) {
      loading.value = false
      return
    }

    const supabase = useSupabase()
    
    try {
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      
      if (initialSession) {
        session.value = initialSession
        user.value = initialSession.user
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('Auth state changed:', event)
        
        session.value = newSession
        user.value = newSession?.user ?? null

        // Handle different auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in')
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery initiated')
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const isLoggedIn = computed(() => !!user.value)
  const userProfile = computed(() => user.value?.user_metadata || {})

  // Initialize auth only on client side
  if (process.client) {
    onMounted(async () => {
      await initAuth()
    })
  } else {
    // Set loading to false on server side
    loading.value = false
  }

  return {
    // State
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    
    // Computed
    isLoggedIn,
    userProfile,
    
    // Methods
    register,
    login,
    logout,
    resetPassword,
    updatePassword,
    initAuth
  }
}