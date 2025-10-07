/**
 * Unit Tests for BaseRepository
 * Tests base functionality: logging, error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseRepository } from '@/services/repositories/BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock implementation of BaseRepository for testing
class TestRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'TestEntity')
  }

  // Expose protected methods for testing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public testLog(operation: string, data?: any) {
    return this.log(operation, data)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public testLogError(operation: string, error: any) {
    return this.logError(operation, error)
  }

  public testHandleError(operation: string, error: unknown): never {
    return this.handleError(operation, error)
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository
  let mockSupabase: SupabaseClient

  beforeEach(() => {
    // Create mock Supabase client
    mockSupabase = {} as SupabaseClient

    // Spy on console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create repository instance
    repository = new TestRepository(mockSupabase)
  })

  describe('Logging', () => {
    it('should log operations with entity name', () => {
      repository.testLog('findAll')

      expect(console.log).toHaveBeenCalledWith(
        '[TestEntityRepository] findAll',
        ''
      )
    })

    it('should log operations with data', () => {
      const testData = { id: '123', name: 'Test' }
      repository.testLog('create', testData)

      expect(console.log).toHaveBeenCalledWith(
        '[TestEntityRepository] create',
        testData
      )
    })

    it('should log errors with error details', () => {
      const testError = new Error('Test error')
      repository.testLogError('delete', testError)

      expect(console.error).toHaveBeenCalledWith(
        '[TestEntityRepository] delete failed:',
        testError
      )
    })
  })

  describe('Error Handling', () => {
    it('should throw error with operation context', () => {
      const testError = new Error('Database error')

      expect(() => {
        repository.testHandleError('findById', testError)
      }).toThrow('Database error')
    })

    it('should log error before throwing', () => {
      const testError = new Error('Connection failed')

      try {
        repository.testHandleError('update', testError)
      } catch {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith(
        '[TestEntityRepository] update failed:',
        testError
      )
    })

    it('should handle non-Error objects', () => {
      const testError = 'String error'

      expect(() => {
        repository.testHandleError('save', testError)
      }).toThrow()
    })

    it('should handle null/undefined errors', () => {
      expect(() => {
        repository.testHandleError('load', null)
      }).toThrow()

      expect(() => {
        repository.testHandleError('load', undefined)
      }).toThrow()
    })
  })

  describe('Constructor', () => {
    it('should store Supabase client reference', () => {
      expect(repository['supabase']).toBe(mockSupabase)
    })

    it('should store entity name', () => {
      expect(repository['entityName']).toBe('TestEntity')
    })
  })
})
