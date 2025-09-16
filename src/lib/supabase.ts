import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Vérifier si nous sommes dans un environnement de test
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
const isVitest = typeof process !== 'undefined' && process.env.VITEST === 'true'

// Mock Supabase pour les tests (directement dans le fichier)
const createMockSupabase = () => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      then: (resolve: (value: any) => void) => resolve(mockArrayResult),
      ...mockArrayResult
    }

    return chainable
  }

  return {
    from: () => ({
      select: () => createChainableMock(),
      insert: () => createChainableMock(),
      update: () => createChainableMock(),
      delete: () => createChainableMock()
    }),
    channel: () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on: (..._args: any[]) => ({
        subscribe: () => ({})
      })
    })
  }
}

// Créer le client approprié selon l'environnement
function createSupabaseClient(): SupabaseClient<Database> {
  if (isTestEnvironment || isVitest) {
    return createMockSupabase() as unknown as SupabaseClient<Database>
  } else {
    // En mode production/développement, utiliser le vrai client Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
      // Créer un client avec des valeurs par défaut pour éviter les erreurs
      return createClient<Database>('https://localhost', 'dummy-key')
    } else {
      return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      })
    }
  }
}

export const supabase = createSupabaseClient()