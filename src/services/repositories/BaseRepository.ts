/**
 * Base Repository Class
 * Phase 4.3: Services Layer - Repository Pattern
 *
 * Provides common repository functionality:
 * - Dependency injection for SupabaseClient
 * - Error handling patterns
 * - Logging utilities
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export abstract class BaseRepository {
  protected readonly supabase: SupabaseClient<Database>
  protected readonly entityName: string

  constructor(supabase: SupabaseClient<Database>, entityName: string) {
    this.supabase = supabase
    this.entityName = entityName
  }

  /**
   * Log repository operation
   */
  protected log(operation: string, data?: unknown): void {
    console.log(`[${this.entityName}Repository] ${operation}`, data || '')
  }

  /**
   * Log repository error
   */
  protected logError(operation: string, error: unknown): void {
    console.error(`[${this.entityName}Repository] ${operation} failed:`, error)
  }

  /**
   * Handle repository errors consistently
   */
  protected handleError(operation: string, error: unknown): never {
    this.logError(operation, error)
    throw error
  }
}
