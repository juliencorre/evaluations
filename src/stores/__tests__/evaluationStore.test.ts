import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useEvaluationStore } from '../evaluationStore'
import type { Evaluation } from '@/types/evaluation'

// Mock the Supabase service
vi.mock('@/services/supabaseEvaluationsService', () => ({
  supabaseEvaluationsService: {
    getAllEvaluations: vi.fn(),
    createEvaluation: vi.fn(),
    updateEvaluation: vi.fn(),
    deleteEvaluation: vi.fn(),
    getEvaluationById: vi.fn()
  }
}))

describe('EvaluationStore', () => {
  let store: ReturnType<typeof useEvaluationStore>
  let mockSupabaseService: any
  
  const mockEvaluation: Evaluation = {
    id: 'eval-123',
    name: 'Test Evaluation', 
    description: 'Test description',
    frameworkId: 'framework-1',
    classId: 'class-1',
    createdAt: '2024-01-01T00:00:00Z',
    results: []
  }

  const mockEvaluation2: Evaluation = {
    id: 'eval-456',
    name: 'Second Evaluation',
    description: 'Second description', 
    frameworkId: 'framework-2',
    classId: 'class-1',
    createdAt: '2024-01-02T00:00:00Z',
    results: []
  }

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Get mock service from the module
    const { supabaseEvaluationsService } = await import('@/services/supabaseEvaluationsService')
    mockSupabaseService = supabaseEvaluationsService
    
    // Get a fresh store instance
    store = useEvaluationStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('loadEvaluations', () => {
    it('should load evaluations successfully', async () => {
      // Arrange
      mockSupabaseService.getAllEvaluations.mockResolvedValue([mockEvaluation, mockEvaluation2])

      // Act
      await store.loadEvaluations()

      // Assert
      expect(mockSupabaseService.getAllEvaluations).toHaveBeenCalledTimes(1)
      expect(store.allEvaluations.value).toHaveLength(2)
      expect(store.allEvaluations.value[0]).toEqual(mockEvaluation)
      expect(store.allEvaluations.value[1]).toEqual(mockEvaluation2)
    })

    it('should handle errors when loading evaluations', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSupabaseService.getAllEvaluations.mockRejectedValue(new Error('Network error'))

      // Act
      await store.loadEvaluations()

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des évaluations:', 
        expect.any(Error)
      )
      expect(store.allEvaluations.value).toHaveLength(0)
      
      consoleErrorSpy.mockRestore()
    })

    it('should set loading state correctly during operation', async () => {
      // Arrange
      let resolvePromise: (value: Evaluation[]) => void
      const loadPromise = new Promise<Evaluation[]>((resolve) => {
        resolvePromise = resolve
      })
      mockSupabaseService.getAllEvaluations.mockReturnValue(loadPromise)

      // Act
      const loadingPromise = store.loadEvaluations()
      
      // Assert - loading should be true
      expect(store.isLoading.value).toBe(true)
      
      // Complete the promise
      resolvePromise!([mockEvaluation])
      await loadingPromise
      await nextTick()
      
      // Assert - loading should be false
      expect(store.isLoading.value).toBe(false)
    })
  })

  describe('addEvaluation', () => {
    it('should create new evaluation successfully', async () => {
      // Arrange
      const newEvaluationData = {
        name: 'New Evaluation',
        description: 'New description',
        frameworkId: 'framework-1',
        classId: 'class-1'
      }
      mockSupabaseService.createEvaluation.mockResolvedValue(mockEvaluation)

      // Act
      const result = await store.addEvaluation(newEvaluationData)

      // Assert
      expect(mockSupabaseService.createEvaluation).toHaveBeenCalledWith(newEvaluationData)
      expect(result).toEqual(mockEvaluation)
      expect(store.allEvaluations.value).toContain(mockEvaluation)
      expect(store.currentEvaluation.value).toEqual(mockEvaluation)
    })

    it('should return null when creation fails', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const newEvaluationData = {
        name: 'New Evaluation',
        description: 'New description',
        frameworkId: 'framework-1',
        classId: 'class-1'
      }
      mockSupabaseService.createEvaluation.mockRejectedValue(new Error('Creation failed'))

      // Act
      const result = await store.addEvaluation(newEvaluationData)

      // Assert
      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors de la création de l\'évaluation:', 
        expect.any(Error)
      )
      expect(store.allEvaluations.value).toHaveLength(0)
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('updateEvaluation', () => {
    beforeEach(async () => {
      // Setup initial evaluations
      mockSupabaseService.getAllEvaluations.mockResolvedValue([mockEvaluation])
      await store.loadEvaluations()
      store.setCurrentEvaluation(mockEvaluation)
    })

    it('should update evaluation successfully', async () => {
      // Arrange
      const updates = { name: 'Updated Name', description: 'Updated description' }
      const updatedEvaluation = { ...mockEvaluation, ...updates }
      mockSupabaseService.updateEvaluation.mockResolvedValue(updatedEvaluation)

      // Act
      const result = await store.updateEvaluation(mockEvaluation.id, updates)

      // Assert
      expect(mockSupabaseService.updateEvaluation).toHaveBeenCalledWith(mockEvaluation.id, updates)
      expect(result).toEqual(updatedEvaluation)
      expect(store.allEvaluations.value[0]).toEqual(updatedEvaluation)
      expect(store.currentEvaluation.value).toEqual(updatedEvaluation)
    })

    it('should handle update errors', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const updates = { name: 'Updated Name' }
      mockSupabaseService.updateEvaluation.mockRejectedValue(new Error('Update failed'))

      // Act
      const result = await store.updateEvaluation(mockEvaluation.id, updates)

      // Assert
      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors de la mise à jour de l\'évaluation:',
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('deleteEvaluation', () => {
    beforeEach(async () => {
      // Setup initial evaluations
      mockSupabaseService.getAllEvaluations.mockResolvedValue([mockEvaluation, mockEvaluation2])
      await store.loadEvaluations()
      store.setCurrentEvaluation(mockEvaluation)
    })

    it('should delete evaluation successfully', async () => {
      // Arrange
      mockSupabaseService.deleteEvaluation.mockResolvedValue(true)

      // Act
      const result = await store.deleteEvaluation(mockEvaluation.id)

      // Assert
      expect(mockSupabaseService.deleteEvaluation).toHaveBeenCalledWith(mockEvaluation.id)
      expect(result).toBe(true)
      expect(store.allEvaluations.value).toHaveLength(1)
      expect(store.allEvaluations.value[0]).toEqual(mockEvaluation2)
      expect(store.currentEvaluation.value).toEqual(mockEvaluation2) // Should switch to next available
    })

    it('should handle deletion when it is the current evaluation', async () => {
      // Arrange
      mockSupabaseService.deleteEvaluation.mockResolvedValue(true)

      // Act
      const result = await store.deleteEvaluation(mockEvaluation.id)

      // Assert
      expect(result).toBe(true)
      expect(store.currentEvaluation.value).toEqual(mockEvaluation2)
    })

    it('should handle deletion errors', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSupabaseService.deleteEvaluation.mockRejectedValue(new Error('Delete failed'))

      // Act
      const result = await store.deleteEvaluation(mockEvaluation.id)

      // Assert
      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors de la suppression de l\'évaluation:',
        expect.any(Error)
      )
      expect(store.allEvaluations.value).toHaveLength(2) // Should remain unchanged
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('setCurrentEvaluation', () => {
    it('should set current evaluation correctly', () => {
      // Arrange
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Act
      store.setCurrentEvaluation(mockEvaluation)

      // Assert
      expect(store.currentEvaluation.value).toEqual(mockEvaluation)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🗂️ [EvaluationStore] setCurrentEvaluation appelé avec:',
        mockEvaluation.name,
        'ID:',
        mockEvaluation.id
      )
      
      consoleLogSpy.mockRestore()
    })
  })

  describe('getEvaluationById', () => {
    beforeEach(async () => {
      // Setup initial evaluations
      mockSupabaseService.getAllEvaluations.mockResolvedValue([mockEvaluation, mockEvaluation2])
      await store.loadEvaluations()
    })

    it('should find evaluation by ID', () => {
      // Act
      const result = store.getEvaluationById(mockEvaluation.id)

      // Assert
      expect(result).toEqual(mockEvaluation)
    })

    it('should return undefined for non-existent ID', () => {
      // Act
      const result = store.getEvaluationById('non-existent-id')

      // Assert
      expect(result).toBeUndefined()
    })
  })
})