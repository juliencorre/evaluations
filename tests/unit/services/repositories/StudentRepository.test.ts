/**
 * Unit Tests for StudentRepository
 * Tests CRUD operations for students
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StudentRepository } from '@/services/repositories/StudentRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateStudentDTO, UpdateStudentDTO } from '@/types/dtos'

describe('StudentRepository', () => {
  let repository: StudentRepository
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any

  beforeEach(() => {
    // Create mock Supabase client with query builder
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis()
    }

    mockSupabase = {
      from: vi.fn(() => mockQueryBuilder)
    } as unknown as SupabaseClient

    repository = new StudentRepository(mockSupabase)

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('findAll', () => {
    it('should retrieve all students', async () => {
      const mockStudents = [
        { id: '1', first_name: 'John', last_name: 'Doe', display_name: 'John D.', gender: 'M', birth_date: null },
        { id: '2', first_name: 'Jane', last_name: 'Smith', display_name: 'Jane S.', gender: 'F', birth_date: null }
      ]

      const queryBuilder = mockSupabase.from()
      queryBuilder.order.mockResolvedValue({
        data: mockStudents,
        error: null
      })

      const result = await repository.findAll()

      expect(result).toHaveLength(2)
      expect(result[0].firstName).toBe('John')
      expect(result[1].firstName).toBe('Jane')
      expect(mockSupabase.from).toHaveBeenCalledWith('students')
    })

    it('should handle empty result', async () => {
      const queryBuilder = mockSupabase.from()
      queryBuilder.order.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await repository.findAll()

      expect(result).toEqual([])
    })
  })

  describe('findById', () => {
    it('should find student by ID', async () => {
      const mockStudent = {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
        display_name: 'John D.',
        gender: 'M',
        birth_date: '2010-05-15'
      }

      const queryBuilder = mockSupabase.from()
      queryBuilder.single.mockResolvedValue({
        data: mockStudent,
        error: null
      })

      const result = await repository.findById('123')

      expect(result).toBeDefined()
      expect(result?.id).toBe('123')
      expect(result?.firstName).toBe('John')
      expect(result?.birthDate).toBe('2010-05-15')
    })

    it('should return null for non-existent student', async () => {
      const queryBuilder = mockSupabase.from()
      queryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // Not found error
      })

      const result = await repository.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create new student', async () => {
      const createDTO: CreateStudentDTO = {
        firstName: 'Alice',
        lastName: 'Johnson',
        gender: 'F',
        birthDate: '2011-03-20'
      }

      const mockCreated = {
        id: '456',
        first_name: 'Alice',
        last_name: 'Johnson',
        display_name: 'Alice J.',
        gender: 'F',
        birth_date: '2011-03-20',
        class_id: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      const queryBuilder = mockSupabase.from()
      queryBuilder.single.mockResolvedValue({
        data: mockCreated,
        error: null
      })

      const result = await repository.create(createDTO)

      expect(result.id).toBe('456')
      expect(result.firstName).toBe('Alice')
      expect(result.lastName).toBe('Johnson')
      expect(queryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Alice',
          last_name: 'Johnson',
          gender: 'F',
          birth_date: '2011-03-20'
        })
      )
    })
  })

  describe('update', () => {
    it('should update existing student', async () => {
      const updateDTO: UpdateStudentDTO = {
        firstName: 'John',
        lastName: 'Doe Updated'
      }

      const mockUpdated = {
        id: '123',
        first_name: 'John',
        last_name: 'Doe Updated',
        display_name: 'John D.',
        gender: 'M',
        birth_date: null,
        class_id: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      }

      const queryBuilder = mockSupabase.from()
      queryBuilder.single.mockResolvedValue({
        data: mockUpdated,
        error: null
      })

      const result = await repository.update('123', updateDTO)

      expect(result?.lastName).toBe('Doe Updated')
      expect(queryBuilder.update).toHaveBeenCalled()
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', '123')
    })
  })

  describe('delete', () => {
    it('should delete student successfully', async () => {
      const queryBuilder = mockSupabase.from()
      queryBuilder.eq.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await repository.delete('123')

      expect(result).toBe(true)
      expect(queryBuilder.delete).toHaveBeenCalled()
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', '123')
    })

    it('should handle delete error', async () => {
      const queryBuilder = mockSupabase.from()
      queryBuilder.eq.mockResolvedValue({
        data: null,
        error: new Error('Foreign key constraint')
      })

      await expect(repository.delete('123')).rejects.toThrow()
    })
  })

  describe('search', () => {
    it('should search students by query', async () => {
      const mockResults = [
        { id: '1', first_name: 'John', last_name: 'Doe', display_name: 'John D.', gender: 'M', birth_date: null }
      ]

      const queryBuilder = mockSupabase.from()
      // Le mock doit chaîner: select().or().order()
      queryBuilder.or.mockReturnThis()
      queryBuilder.order.mockResolvedValue({
        data: mockResults,
        error: null
      })

      const result = await repository.search('John')

      expect(result).toHaveLength(1)
      expect(result[0].firstName).toBe('John')
      expect(queryBuilder.select).toHaveBeenCalled()
      expect(queryBuilder.or).toHaveBeenCalled()
      expect(queryBuilder.order).toHaveBeenCalled()
    })
  })
})
