import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useEvaluationResultsStore } from '../evaluationResultsStore'
import type { Evaluation, EvaluationResult, EvaluationLevel } from '@/types/evaluation'

// Mock the services
vi.mock('@/services/evaluationResultsService', () => ({
  evaluationResultsService: {
    saveResult: vi.fn(),
    getResult: vi.fn(),
    getAllResults: vi.fn(),
    deleteResult: vi.fn(),
    bulkSaveResults: vi.fn(),
    resetEvaluation: vi.fn(),
    exportAllData: vi.fn(),
    importAllData: vi.fn(),
    clearAllData: vi.fn(),
    getStats: vi.fn()
  }
}))

vi.mock('@/services/supabaseEvaluationResultsService', () => ({
  supabaseEvaluationResultsService: {
    saveResult: vi.fn(),
    getResult: vi.fn(),
    getAllResults: vi.fn(),
    deleteResult: vi.fn(),
    bulkSaveResults: vi.fn(),
    resetEvaluation: vi.fn()
  }
}))

vi.mock('@/stores/studentsStore', () => ({
  useCompetencyFrameworkStore: vi.fn(() => ({
    framework: { value: { domains: [] } }
  }))
}))

describe('EvaluationResultsStore', () => {
  let store: ReturnType<typeof useEvaluationResultsStore>
  let mockEvaluationResultsService: any
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

  const mockResult: EvaluationResult = {
    studentId: 'student-123',
    competencyId: 'comp-456',
    specificCompetencyId: 'spec-comp-789',
    level: 'A',
    value: 'A',
    comment: 'Excellent work',
    evaluatedAt: '2024-01-01T10:00:00Z'
  }

  const mockResult2: EvaluationResult = {
    studentId: 'student-456',
    competencyId: 'comp-456',
    specificCompetencyId: 'spec-comp-789',
    level: 'B',
    value: 'B',
    comment: 'Good work',
    evaluatedAt: '2024-01-01T11:00:00Z'
  }

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Get mock services from the modules
    const { evaluationResultsService } = await import('@/services/evaluationResultsService')
    const { supabaseEvaluationResultsService } = await import('@/services/supabaseEvaluationResultsService')
    mockEvaluationResultsService = evaluationResultsService
    mockSupabaseService = supabaseEvaluationResultsService
    
    // Get fresh store instance
    store = useEvaluationResultsStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initializeEvaluation', () => {
    it('should initialize evaluation successfully', async () => {
      // Arrange
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockSupabaseService.getAllResults.mockResolvedValue([mockResult])

      // Act
      await store.initializeEvaluation(mockEvaluation)

      // Assert
      expect(store.evaluation.value).toEqual(mockEvaluation)
      expect(store.results.value).toHaveLength(1)
      expect(store.results.value[0]).toEqual(mockResult)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚀 [EvaluationResultsStore] Initialisation'),
        mockEvaluation.name
      )
      
      consoleLogSpy.mockRestore()
    })

    it('should fallback to localStorage service on Supabase error', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockSupabaseService.getAllResults.mockRejectedValue(new Error('Supabase error'))
      mockEvaluationResultsService.getAllResults.mockReturnValue([mockResult])

      // Act
      await store.initializeEvaluation(mockEvaluation)

      // Assert
      expect(store.evaluation.value).toEqual(mockEvaluation)
      expect(store.results.value).toHaveLength(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erreur Supabase'),
        expect.any(Error)
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fallback vers localStorage')
      )
      
      consoleErrorSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })
  })

  describe('saveResult', () => {
    beforeEach(async () => {
      await store.initializeEvaluation(mockEvaluation)
    })

    it('should save result successfully with Supabase', async () => {
      // Arrange
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockSupabaseService.saveResult.mockResolvedValue(mockResult)

      // Act
      const result = await store.saveResult('student-123', 'spec-comp-789', 'A', 'Excellent work')

      // Assert
      expect(mockSupabaseService.saveResult).toHaveBeenCalledWith(
        mockEvaluation.id,
        'student-123',
        'spec-comp-789',
        'A',
        'Excellent work'
      )
      expect(result).toEqual(mockResult)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('💾 [EvaluationResultsStore] Sauvegarde résultat')
      )
      
      consoleLogSpy.mockRestore()
    })

    it('should fallback to localStorage on Supabase error during save', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockSupabaseService.saveResult.mockRejectedValue(new Error('Save failed'))
      mockEvaluationResultsService.saveResult.mockReturnValue(mockResult)

      // Act
      const result = await store.saveResult('student-123', 'spec-comp-789', 'A', 'Excellent work')

      // Assert
      expect(result).toEqual(mockResult)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erreur lors de la sauvegarde'),
        expect.any(Error)
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fallback vers localStorage')
      )
      
      consoleErrorSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('should handle save without comment', async () => {
      // Arrange
      mockSupabaseService.saveResult.mockResolvedValue({ ...mockResult, comment: undefined })

      // Act
      const result = await store.saveResult('student-123', 'spec-comp-789', 'A')

      // Assert
      expect(mockSupabaseService.saveResult).toHaveBeenCalledWith(
        mockEvaluation.id,
        'student-123',
        'spec-comp-789',
        'A',
        undefined
      )
      expect(result?.comment).toBeUndefined()
    })
  })

  describe('getResult', () => {
    beforeEach(async () => {
      mockSupabaseService.getAllResults.mockResolvedValue([mockResult, mockResult2])
      await store.initializeEvaluation(mockEvaluation)
    })

    it('should get result successfully', () => {
      // Act
      const result = store.getResult('student-123', 'spec-comp-789')

      // Assert
      expect(result).toEqual(mockResult)
    })

    it('should return null for non-existent result', () => {
      // Act
      const result = store.getResult('non-existent-student', 'non-existent-comp')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('deleteResult', () => {
    beforeEach(async () => {
      mockSupabaseService.getAllResults.mockResolvedValue([mockResult])
      await store.initializeEvaluation(mockEvaluation)
    })

    it('should delete result successfully', async () => {
      // Arrange
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockSupabaseService.deleteResult.mockResolvedValue(true)

      // Act
      const success = await store.deleteResult('student-123', 'spec-comp-789')

      // Assert
      expect(mockSupabaseService.deleteResult).toHaveBeenCalledWith(
        mockEvaluation.id,
        'student-123',
        'spec-comp-789'
      )
      expect(success).toBe(true)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🗑️ [EvaluationResultsStore] Suppression résultat')
      )
      
      consoleLogSpy.mockRestore()
    })

    it('should handle delete errors', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSupabaseService.deleteResult.mockRejectedValue(new Error('Delete failed'))
      mockEvaluationResultsService.deleteResult.mockReturnValue(true)

      // Act
      const success = await store.deleteResult('student-123', 'spec-comp-789')

      // Assert
      expect(success).toBe(true)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erreur lors de la suppression'),
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('bulkSaveResults', () => {
    beforeEach(async () => {
      await store.initializeEvaluation(mockEvaluation)
    })

    it('should bulk save results successfully', async () => {
      // Arrange
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const results = [mockResult, mockResult2]
      mockSupabaseService.bulkSaveResults.mockResolvedValue(results)

      // Act
      const savedResults = await store.bulkSaveResults(results)

      // Assert
      expect(mockSupabaseService.bulkSaveResults).toHaveBeenCalledWith(mockEvaluation.id, results)
      expect(savedResults).toEqual(results)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 [EvaluationResultsStore] Sauvegarde en lot'),
        results.length
      )
      
      consoleLogSpy.mockRestore()
    })
  })

  describe('resetEvaluation', () => {
    beforeEach(async () => {
      mockSupabaseService.getAllResults.mockResolvedValue([mockResult])
      await store.initializeEvaluation(mockEvaluation)
    })

    it('should reset evaluation successfully', async () => {
      // Arrange
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockSupabaseService.resetEvaluation.mockResolvedValue(true)

      // Act
      const success = await store.resetEvaluation()

      // Assert
      expect(mockSupabaseService.resetEvaluation).toHaveBeenCalledWith(mockEvaluation.id)
      expect(success).toBe(true)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔄 [EvaluationResultsStore] Reset évaluation')
      )
      
      consoleLogSpy.mockRestore()
    })
  })

  describe('Computed properties', () => {
    beforeEach(async () => {
      mockSupabaseService.getAllResults.mockResolvedValue([mockResult, mockResult2])
      await store.initializeEvaluation(mockEvaluation)
    })

    it('should calculate hasResults correctly', () => {
      expect(store.hasResults.value).toBe(true)
    })

    it('should calculate evaluation stats', () => {
      const stats = store.evaluationStats.value
      
      expect(stats.totalResults).toBe(2)
      expect(stats.studentsWithResults).toBe(2) // Two different students
      expect(stats.completionPercentage).toBeGreaterThan(0)
    })
  })

  describe('Utility methods', () => {
    beforeEach(async () => {
      mockSupabaseService.getAllResults.mockResolvedValue([mockResult, mockResult2])
      await store.initializeEvaluation(mockEvaluation)
    })

    it('should get results by student', () => {
      // Act
      const studentResults = store.getResultsByStudent('student-123')

      // Assert
      expect(studentResults).toHaveLength(1)
      expect(studentResults[0]).toEqual(mockResult)
    })

    it('should get results by competency', () => {
      // Act
      const competencyResults = store.getResultsByCompetency('spec-comp-789')

      // Assert
      expect(competencyResults).toHaveLength(2)
      expect(competencyResults).toContain(mockResult)
      expect(competencyResults).toContain(mockResult2)
    })

    it('should get student progress', () => {
      // Act
      const progress = store.getStudentProgress('student-123')

      // Assert
      expect(progress.totalEvaluated).toBe(1)
      expect(progress.averageLevel).toBeDefined()
      expect(progress.lastEvaluated).toBeDefined()
    })

    it('should export data', () => {
      // Arrange
      const mockExportData = { evaluations: [mockEvaluation], results: [mockResult] }
      mockEvaluationResultsService.exportAllData.mockReturnValue(mockExportData)

      // Act
      const exportedData = store.exportData()

      // Assert
      expect(exportedData).toEqual(mockExportData)
      expect(mockEvaluationResultsService.exportAllData).toHaveBeenCalledTimes(1)
    })

    it('should get service stats', () => {
      // Arrange
      const mockStats = { totalResults: 2, lastUpdate: new Date().toISOString() }
      mockEvaluationResultsService.getStats.mockReturnValue(mockStats)

      // Act
      const stats = store.getServiceStats()

      // Assert
      expect(stats).toEqual(mockStats)
      expect(mockEvaluationResultsService.getStats).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error handling', () => {
    it('should handle initialization without evaluation', async () => {
      // Act
      await store.initializeEvaluation(null as any)

      // Assert
      expect(store.evaluation.value).toBeNull()
      expect(store.results.value).toHaveLength(0)
    })

    it('should clear errors', () => {
      // Arrange - simulate an error state
      store.clearError()

      // Assert
      expect(store.error.value).toBeNull()
    })
  })
})