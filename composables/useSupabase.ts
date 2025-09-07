import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Global Supabase client instance (singleton)
let supabaseInstance: SupabaseClient | null = null

/**
 * Supabase client composable
 * Provides a configured Supabase client instance with proper error handling
 * Uses singleton pattern to avoid multiple instances
 * 
 * @returns {SupabaseClient} Supabase client instance
 * @throws {Error} If configuration is missing
 */
export const useSupabase = (): SupabaseClient => {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  const config = useRuntimeConfig()
  
  // Validate configuration
  if (!config.public.supabaseUrl) {
    throw new Error('SUPABASE_URL is required but not configured')
  }
  
  if (!config.public.supabaseKey) {
    throw new Error('SUPABASE_KEY is required but not configured')
  }

  // Create single instance
  supabaseInstance = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'evaluations-auth-token', // Unique storage key
      }
    }
  )

  return supabaseInstance
}