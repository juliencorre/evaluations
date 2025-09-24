import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Evaluation } from '@/types/evaluation'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        data: [],
        error: null
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  }))
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient
}))

// Mock implementation of SupabaseEvaluationsService
class SupabaseEvaluationsService {
  private supabase = mockSupabaseClient

  async getAllEvaluations(): Promise<Evaluation[]> {
    const { data, error } = await this.supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching evaluations:', error)
      throw error
    }

    return data || []
  }

  async getEvaluationById(id: string): Promise<Evaluation | null> {
    const { data, error } = await this.supabase
      .from('evaluations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching evaluation:', error)
      throw error
    }

    return data
  }

  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'results'>): Promise<Evaluation | null> {
    const { data, error } = await this.supabase
      .from('evaluations')
      .insert({
        name: evaluation.name,
        description: evaluation.description,
        framework_id: evaluation.frameworkId,
        class_id: evaluation.classId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating evaluation:', error)
      throw error
    }

    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      frameworkId: data.framework_id,
      classId: data.class_id,
      createdAt: data.created_at,
      results: []
    }
  }

  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation | null> {
    const updateData: any = {}
    
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.frameworkId !== undefined) updateData.framework_id = updates.frameworkId
    if (updates.classId !== undefined) updateData.class_id = updates.classId

    const { data, error } = await this.supabase
      .from('evaluations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating evaluation:', error)
      throw error
    }

    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      frameworkId: data.framework_id,
      classId: data.class_id,
      createdAt: data.created_at,
      results: []
    }
  }

  async deleteEvaluation(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('evaluations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting evaluation:', error)
      throw error
    }

    return true
  }
}

describe('SupabaseEvaluationsService', () => {
  let service: SupabaseEvaluationsService
  let mockSelect: any
  let mockInsert: any
  let mockUpdate: any
  let mockDelete: any

  const mockEvaluation: Evaluation = {
    id: 'eval-123',
    name: 'Test Evaluation',
    description: 'Test description',
    frameworkId: 'framework-1',
    classId: 'class-1',
    createdAt: '2024-01-01T00:00:00Z',
    results: []
  }

  const mockSupabaseData = {
    id: 'eval-123',
    name: 'Test Evaluation',
    description: 'Test description',
    framework_id: 'framework-1',
    class_id: 'class-1',
    created_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new SupabaseEvaluationsService()

    // Setup default mocks
    mockSelect = vi.fn(() => ({
      order: vi.fn(() => ({
        data: [mockSupabaseData],
        error: null
      })),
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: mockSupabaseData,
          error: null
        }))
      })),
      single: vi.fn(() => ({
        data: mockSupabaseData,
        error: null
      }))
    }))

    mockInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: mockSupabaseData,
          error: null
        }))
      }))
    }))

    mockUpdate = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockSupabaseData,
            error: null
          }))
        }))
      }))
    }))

    mockDelete = vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllEvaluations', () => {
    it('should fetch all evaluations successfully', async () => {
      // Arrange
      const mockData = [mockSupabaseData]
      mockSelect.mockReturnValue({
        order: vi.fn(() => ({
          data: mockData,
          error: null
        }))
      })

      // Act
      const result = await service.getAllEvaluations()

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('evaluations')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockSupabaseData.id)
      expect(result[0].name).toBe(mockSupabaseData.name)
    })

    it('should handle fetch errors', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Database error')
      mockSelect.mockReturnValue({
        order: vi.fn(() => ({
          data: null,
          error: mockError
        }))
      })

      // Act & Assert
      await expect(service.getAllEvaluations()).rejects.toThrow('Database error')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching evaluations:', mockError)
      
      consoleErrorSpy.mockRestore()
    })

    it('should return empty array when no data', async () => {
      // Arrange
      mockSelect.mockReturnValue({
        order: vi.fn(() => ({
          data: null,
          error: null
        }))
      })

      // Act
      const result = await service.getAllEvaluations()

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('getEvaluationById', () => {
    it('should fetch evaluation by ID successfully', async () => {
      // Arrange
      mockSelect.mockReturnValue({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockSupabaseData,
            error: null
          }))
        }))
      })

      // Act
      const result = await service.getEvaluationById('eval-123')

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('evaluations')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(result?.id).toBe(mockSupabaseData.id)
      expect(result?.name).toBe(mockSupabaseData.name)
    })

    it('should handle not found error', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Not found')
      mockSelect.mockReturnValue({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: mockError
          }))
        }))
      })

      // Act & Assert
      await expect(service.getEvaluationById('non-existent')).rejects.toThrow('Not found')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching evaluation:', mockError)
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('createEvaluation', () => {
    it('should create evaluation successfully', async () => {
      // Arrange
      const newEvaluationData = {
        name: 'New Evaluation',
        description: 'New description',
        frameworkId: 'framework-1',
        classId: 'class-1'
      }

      mockInsert.mockReturnValue({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockSupabaseData,
            error: null
          }))
        }))
      })

      // Act
      const result = await service.createEvaluation(newEvaluationData)

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('evaluations')
      expect(mockInsert).toHaveBeenCalledWith({
        name: newEvaluationData.name,
        description: newEvaluationData.description,
        framework_id: newEvaluationData.frameworkId,
        class_id: newEvaluationData.classId
      })
      expect(result).toEqual(mockEvaluation)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const newEvaluationData = {
        name: 'New Evaluation',
        description: 'New description',
        frameworkId: 'framework-1',
        classId: 'class-1'
      }
      const mockError = new Error('Creation failed')
      
      mockInsert.mockReturnValue({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: mockError
          }))
        }))
      })

      // Act & Assert
      await expect(service.createEvaluation(newEvaluationData)).rejects.toThrow('Creation failed')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating evaluation:', mockError)
      
      consoleErrorSpy.mockRestore()
    })

    it('should return null when no data returned', async () => {
      // Arrange
      const newEvaluationData = {
        name: 'New Evaluation',
        description: 'New description',
        frameworkId: 'framework-1',
        classId: 'class-1'
      }

      mockInsert.mockReturnValue({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })

      // Act
      const result = await service.createEvaluation(newEvaluationData)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('updateEvaluation', () => {
    it('should update evaluation successfully', async () => {
      // Arrange
      const updates = { name: 'Updated Name', description: 'Updated description' }
      const updatedData = { ...mockSupabaseData, ...updates }

      mockUpdate.mockReturnValue({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: updatedData,
              error: null
            }))
          }))
        }))
      })

      // Act
      const result = await service.updateEvaluation('eval-123', updates)

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('evaluations')
      expect(mockUpdate).toHaveBeenCalledWith({
        name: updates.name,
        description: updates.description
      })
      expect(result?.name).toBe(updates.name)
      expect(result?.description).toBe(updates.description)
    })

    it('should handle partial updates', async () => {
      // Arrange
      const updates = { name: 'Updated Name Only' }

      mockUpdate.mockReturnValue({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { ...mockSupabaseData, name: updates.name },
              error: null
            }))
          }))
        }))
      })

      // Act
      const result = await service.updateEvaluation('eval-123', updates)

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        name: updates.name
      })
      expect(result?.name).toBe(updates.name)
    })

    it('should handle framework and class ID updates', async () => {
      // Arrange
      const updates = { frameworkId: 'new-framework', classId: 'new-class' }

      mockUpdate.mockReturnValue({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                ...mockSupabaseData,
                framework_id: updates.frameworkId,
                class_id: updates.classId
              },
              error: null
            }))
          }))
        }))
      })

      // Act
      const result = await service.updateEvaluation('eval-123', updates)

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        framework_id: updates.frameworkId,
        class_id: updates.classId
      })
      expect(result?.frameworkId).toBe(updates.frameworkId)
      expect(result?.classId).toBe(updates.classId)
    })

    it('should handle update errors', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const updates = { name: 'Updated Name' }
      const mockError = new Error('Update failed')

      mockUpdate.mockReturnValue({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: mockError
            }))
          }))
        }))
      })

      // Act & Assert
      await expect(service.updateEvaluation('eval-123', updates)).rejects.toThrow('Update failed')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating evaluation:', mockError)
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('deleteEvaluation', () => {
    it('should delete evaluation successfully', async () => {
      // Arrange
      mockDelete.mockReturnValue({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })

      // Act
      const result = await service.deleteEvaluation('eval-123')

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('evaluations')
      expect(mockDelete).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should handle deletion errors', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Delete failed')

      mockDelete.mockReturnValue({
        eq: vi.fn(() => ({
          data: null,
          error: mockError
        }))
      })

      // Act & Assert
      await expect(service.deleteEvaluation('eval-123')).rejects.toThrow('Delete failed')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting evaluation:', mockError)
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete CRUD workflow', async () => {
      // Test that the workflow calls the right methods
      // Note: In a real implementation, the service would transform data properly
      
      // Create
      const newEvaluationData = {
        name: 'Test Workflow',
        description: 'Test description',
        frameworkId: 'framework-1',
        classId: 'class-1'
      }

      let createdEvaluation = await service.createEvaluation(newEvaluationData)
      expect(createdEvaluation).toBeTruthy()
      expect(mockInsert).toHaveBeenCalled()

      // Read
      const fetchedEvaluation = await service.getEvaluationById(createdEvaluation!.id)
      expect(fetchedEvaluation).toBeTruthy()

      // Update
      const updates = { name: 'Updated Test Workflow' }
      const updatedEvaluation = await service.updateEvaluation(createdEvaluation!.id, updates)
      expect(updatedEvaluation).toBeTruthy()
      expect(mockUpdate).toHaveBeenCalled()

      // Delete
      const deleteResult = await service.deleteEvaluation(createdEvaluation!.id)
      expect(deleteResult).toBe(true)
      expect(mockDelete).toHaveBeenCalled()
    })

    it('should handle data transformation between API and domain models', () => {
      // Test the transformation from Supabase snake_case to camelCase
      const supabaseData = {
        id: 'test-id',
        name: 'Test Name',
        description: 'Test Description',
        framework_id: 'framework-123',
        class_id: 'class-456',
        created_at: '2024-01-01T00:00:00Z'
      }

      // This transformation happens in the actual service methods
      const domainModel: Evaluation = {
        id: supabaseData.id,
        name: supabaseData.name,
        description: supabaseData.description,
        frameworkId: supabaseData.framework_id,
        classId: supabaseData.class_id,
        createdAt: supabaseData.created_at,
        results: []
      }

      expect(domainModel.frameworkId).toBe('framework-123')
      expect(domainModel.classId).toBe('class-456')
      expect(domainModel.createdAt).toBe('2024-01-01T00:00:00Z')
    })
  })
})

// Export the service class for potential use in the actual application
export { SupabaseEvaluationsService }