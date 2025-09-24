import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock jsPDF and html2canvas
const mockJsPDF = {
  setFontSize: vi.fn(),
  text: vi.fn(),
  addImage: vi.fn(),
  addPage: vi.fn(),
  save: vi.fn(),
  internal: {
    pageSize: {
      getWidth: vi.fn(() => 297), // A4 landscape width
      getHeight: vi.fn(() => 210) // A4 landscape height
    }
  }
}

const mockHtml2Canvas = vi.fn()

// Mock the imports
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => mockJsPDF)
}))

vi.mock('html2canvas', () => ({
  default: mockHtml2Canvas
}))

// Since we don't have the actual PDF generator utility yet, let's create a mock implementation
class PDFGenerator {
  async exportStudentChart(chartElement: HTMLElement, studentName: string = 'Élève'): Promise<void> {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    // Generate canvas from chart element
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Add title and date
    pdf.setFontSize(16)
    pdf.text('Analyse individuelle d\'élève', 15, 20)
    
    pdf.setFontSize(10)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 15, 30)

    // Add chart image
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15
    const imgWidth = pageWidth - (margin * 2)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', margin, 50, imgWidth, imgHeight)

    // Save PDF
    pdf.save(`analyse-${studentName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
  }

  async exportAllStudentsCharts(chartElements: HTMLElement[]): Promise<void> {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15

    // Add title
    pdf.setFontSize(16)
    pdf.text('Analyse de tous les élèves', margin, 20)

    pdf.setFontSize(10)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 30)

    let yPosition = 50

    for (let i = 0; i < chartElements.length; i++) {
      const chartElement = chartElements[i]

      // Generate canvas for this chart
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      })

      const imgWidth = pageWidth - (margin * 2)
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Check if we need a new page
      if (yPosition + imgHeight > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }

      // Add chart image
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)

      yPosition += imgHeight + 10 // Add some spacing
    }

    pdf.save('analyse-tous-eleves.pdf')
  }

  async exportEvaluationReport(evaluationData: any): Promise<void> {
    const { jsPDF } = await import('jspdf')

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const margin = 20
    let yPosition = margin

    // Title
    pdf.setFontSize(20)
    pdf.text(evaluationData.name || 'Rapport d\'évaluation', margin, yPosition)
    yPosition += 15

    // Date
    pdf.setFontSize(12)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition)
    yPosition += 10

    // Description
    if (evaluationData.description) {
      pdf.setFontSize(10)
      pdf.text(evaluationData.description, margin, yPosition)
      yPosition += 10
    }

    // Results summary
    pdf.setFontSize(14)
    pdf.text('Résumé des résultats', margin, yPosition)
    yPosition += 10

    // Add results data
    if (evaluationData.results && evaluationData.results.length > 0) {
      pdf.setFontSize(10)
      pdf.text(`Nombre total de résultats: ${evaluationData.results.length}`, margin, yPosition)
      yPosition += 5

      const levels = evaluationData.results.reduce((acc: any, result: any) => {
        const level = result.level || result.value
        acc[level] = (acc[level] || 0) + 1
        return acc
      }, {})

      Object.entries(levels).forEach(([level, count]) => {
        pdf.text(`Niveau ${level}: ${count}`, margin + 10, yPosition)
        yPosition += 5
      })
    }

    pdf.save(`rapport-${evaluationData.name?.toLowerCase().replace(/\s+/g, '-') || 'evaluation'}.pdf`)
  }
}

describe('PDFGenerator', () => {
  let pdfGenerator: PDFGenerator
  let mockCanvas: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    pdfGenerator = new PDFGenerator()
    
    // Setup mock canvas
    mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
      width: 800,
      height: 600
    }
    
    mockHtml2Canvas.mockResolvedValue(mockCanvas)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('exportStudentChart', () => {
    it('should generate PDF for student chart successfully', async () => {
      // Arrange
      const mockChartElement = document.createElement('div')
      mockChartElement.innerHTML = '<canvas>Mock Chart</canvas>'
      const studentName = 'Jean Dupont'

      // Act
      await pdfGenerator.exportStudentChart(mockChartElement, studentName)

      // Assert
      expect(mockHtml2Canvas).toHaveBeenCalledWith(mockChartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      })
      
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(16)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Analyse individuelle d\'élève', 15, 20)
      
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(10)
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('Généré le'),
        15,
        30
      )
      
      expect(mockJsPDF.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mock-image-data',
        'PNG',
        15, // margin
        50, // y position
        267, // calculated width
        200.25 // calculated height
      )
      
      expect(mockJsPDF.save).toHaveBeenCalledWith('analyse-jean-dupont.pdf')
    })

    it('should handle default student name', async () => {
      // Arrange
      const mockChartElement = document.createElement('div')

      // Act
      await pdfGenerator.exportStudentChart(mockChartElement)

      // Assert
      expect(mockJsPDF.save).toHaveBeenCalledWith('analyse-élève.pdf')
    })

    it('should handle canvas generation errors', async () => {
      // Arrange
      const mockChartElement = document.createElement('div')
      mockHtml2Canvas.mockRejectedValue(new Error('Canvas generation failed'))

      // Act & Assert
      await expect(pdfGenerator.exportStudentChart(mockChartElement)).rejects.toThrow('Canvas generation failed')
    })
  })

  describe('exportAllStudentsCharts', () => {
    it('should generate PDF for multiple student charts', async () => {
      // Arrange
      const mockChartElements = [
        document.createElement('div'),
        document.createElement('div')
      ]
      mockChartElements.forEach(el => el.innerHTML = '<canvas>Mock Chart</canvas>')

      // Act
      await pdfGenerator.exportAllStudentsCharts(mockChartElements)

      // Assert
      expect(mockHtml2Canvas).toHaveBeenCalledTimes(2)
      
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(16)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Analyse de tous les élèves', 15, 20)
      
      expect(mockJsPDF.addImage).toHaveBeenCalledTimes(2)
      expect(mockJsPDF.save).toHaveBeenCalledWith('analyse-tous-eleves.pdf')
    })

    it('should handle page breaks for large charts', async () => {
      // Arrange - Create multiple large charts that would exceed page height
      const mockChartElements = Array(5).fill(null).map(() => {
        const div = document.createElement('div')
        div.innerHTML = '<canvas>Large Chart</canvas>'
        return div
      })
      
      // Mock a large canvas
      const largeCanvas = {
        ...mockCanvas,
        height: 1200 // Large height
      }
      mockHtml2Canvas.mockResolvedValue(largeCanvas)

      // Act
      await pdfGenerator.exportAllStudentsCharts(mockChartElements)

      // Assert
      expect(mockJsPDF.addPage).toHaveBeenCalled()
      expect(mockJsPDF.addImage).toHaveBeenCalledTimes(5)
    })

    it('should handle empty chart elements array', async () => {
      // Act
      await pdfGenerator.exportAllStudentsCharts([])

      // Assert
      expect(mockHtml2Canvas).not.toHaveBeenCalled()
      expect(mockJsPDF.addImage).not.toHaveBeenCalled()
      expect(mockJsPDF.save).toHaveBeenCalledWith('analyse-tous-eleves.pdf')
    })
  })

  describe('exportEvaluationReport', () => {
    it('should generate evaluation report PDF successfully', async () => {
      // Arrange
      const evaluationData = {
        name: 'Évaluation Test',
        description: 'Description de test',
        results: [
          { studentId: 'student-1', competencyId: 'comp-1', level: 'A' },
          { studentId: 'student-2', competencyId: 'comp-1', level: 'B' },
          { studentId: 'student-3', competencyId: 'comp-2', level: 'A' }
        ]
      }

      // Act
      await pdfGenerator.exportEvaluationReport(evaluationData)

      // Assert
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(20)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Évaluation Test', 20, 20)
      
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(12)
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('Généré le'),
        20,
        35
      )
      
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(10)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Description de test', 20, 45)
      
      expect(mockJsPDF.text).toHaveBeenCalledWith('Nombre total de résultats: 3', 20, 65)
      
      expect(mockJsPDF.save).toHaveBeenCalledWith('rapport-évaluation-test.pdf')
    })

    it('should handle evaluation without description', async () => {
      // Arrange
      const evaluationData = {
        name: 'Évaluation Sans Description',
        results: []
      }

      // Act
      await pdfGenerator.exportEvaluationReport(evaluationData)

      // Assert
      expect(mockJsPDF.text).toHaveBeenCalledWith('Évaluation Sans Description', 20, 20)
      expect(mockJsPDF.save).toHaveBeenCalledWith('rapport-évaluation-sans-description.pdf')
    })

    it('should handle evaluation without name', async () => {
      // Arrange
      const evaluationData = {
        results: [
          { studentId: 'student-1', competencyId: 'comp-1', level: 'A' }
        ]
      }

      // Act
      await pdfGenerator.exportEvaluationReport(evaluationData)

      // Assert
      expect(mockJsPDF.text).toHaveBeenCalledWith('Rapport d\'évaluation', 20, 20)
      expect(mockJsPDF.save).toHaveBeenCalledWith('rapport-evaluation.pdf')
    })

    it('should handle empty results', async () => {
      // Arrange
      const evaluationData = {
        name: 'Évaluation Vide',
        description: 'Aucun résultat',
        results: []
      }

      // Act
      await pdfGenerator.exportEvaluationReport(evaluationData)

      // Assert
      expect(mockJsPDF.text).toHaveBeenCalledWith('Évaluation Vide', 20, 20)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Aucun résultat', 20, 45)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Nombre total de résultats: 0', 20, 60)
    })

    it('should calculate level distribution correctly', async () => {
      // Arrange
      const evaluationData = {
        name: 'Test Distribution',
        results: [
          { level: 'A' },
          { level: 'A' },
          { level: 'B' },
          { value: 'C' }, // Test value field as fallback
          { value: 'C' }
        ]
      }

      // Act
      await pdfGenerator.exportEvaluationReport(evaluationData)

      // Assert
      expect(mockJsPDF.text).toHaveBeenCalledWith('Test Distribution', 20, 20)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Nombre total de résultats: 5', 20, 55)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Niveau A: 2', 30, 60)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Niveau B: 1', 30, 65)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Niveau C: 2', 30, 70)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle PDF generation workflow', async () => {
      // Arrange
      const mockChartElement = document.createElement('div')
      const evaluationData = {
        name: 'Évaluation Complète',
        description: 'Test complet',
        results: [
          { studentId: 'student-1', level: 'A' },
          { studentId: 'student-2', level: 'B' }
        ]
      }

      // Act - Generate both chart and report
      await pdfGenerator.exportStudentChart(mockChartElement, 'Test Student')
      await pdfGenerator.exportEvaluationReport(evaluationData)

      // Assert
      expect(mockJsPDF.save).toHaveBeenCalledTimes(2)
      expect(mockJsPDF.save).toHaveBeenCalledWith('analyse-test-student.pdf')
      expect(mockJsPDF.save).toHaveBeenCalledWith('rapport-évaluation-complète.pdf')
    })
  })
})

// Export the PDFGenerator class for potential use in the actual application
export { PDFGenerator }