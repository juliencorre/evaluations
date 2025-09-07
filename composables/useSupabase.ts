import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client composable
 * Provides a configured Supabase client instance with proper error handling
 * 
 * @returns {Object} Supabase client instance
 * @throws {Error} If configuration is missing
 */
export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  // Validate configuration
  if (!config.public.supabaseUrl) {
    throw new Error('SUPABASE_URL is required but not configured')
  }
  
  if (!config.public.supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY is required but not configured')
  }

  // Create and return Supabase client
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )

  return supabase
}