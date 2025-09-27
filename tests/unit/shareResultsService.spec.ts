import { describe, it, expect, vi } from 'vitest'
import { shareResultsService } from '@/services/shareResultsService'

// Mock jsPDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 200,
        getHeight: () => 280
      }
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    output: vi.fn().mockReturnValue('data:application/pdf;base64,mockPdfData')
  }))
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { success: true },
        error: null
      })
    }
  }
}))

describe('shareResultsService', () => {
  const mockEvaluationData = {
    evaluation: {
      id: 'eval-001',
      name: 'Test Evaluation',
      description: 'Test description',
      date: '2024-09-27',
      schoolYearFilter: '2024-2025'
    },
    students: [
      { id: 'student1', firstName: 'John', lastName: 'Doe', fullName: 'John Doe' },
      { id: 'student2', firstName: 'Jane', lastName: 'Smith', fullName: 'Jane Smith' }
    ],
    competencies: [
      {
        id: 'comp1',
        name: 'Mathematics',
        domain: 'Math',
        field: 'Numbers',
        results: [
          { studentId: 'student1', studentName: 'John Doe', result: 'A' },
          { studentId: 'student2', studentName: 'Jane Smith', result: 'B' }
        ]
      }
    ],
    summary: {
      totalStudents: 2,
      totalCompetencies: 1,
      exportDate: '2024-09-27T10:00:00.000Z'
    }
  }

  it('génère un PDF des résultats d\'évaluation', async () => {
    const pdfData = await shareResultsService.generateResultsPDF(mockEvaluationData)
    
    expect(pdfData).toBe('mockPdfData')
  })

  it('valide les données de partage', () => {
    const validData = {
      evaluationId: 'eval-001',
      evaluationName: 'Test Evaluation',
      recipients: ['test@example.com'],
      pdfData: 'base64data',
      fileName: 'test.pdf'
    }

    const validation = shareResultsService.validateShareData(validData)
    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('détecte les données invalides', () => {
    const invalidData = {
      evaluationId: '',
      evaluationName: '',
      recipients: [],
      pdfData: '',
      fileName: ''
    }

    const validation = shareResultsService.validateShareData(invalidData)
    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })

  it('partage les résultats d\'évaluation', async () => {
    const recipients = ['test@example.com']
    const message = 'Test message'

    const result = await shareResultsService.shareEvaluationResults(
      mockEvaluationData,
      recipients,
      message
    )

    expect(result.success).toBe(true)
    expect(result.emailsSent).toBe(1)
  })
})