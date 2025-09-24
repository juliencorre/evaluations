import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EvaluationResult, Student, CompetencyFramework, ResultTypeConfig } from '@/types/evaluation'

// Mock pivot analysis service implementation
class PivotAnalysisService {
  /**
   * Calculate competency averages for a student
   */
  calculateStudentCompetencyAverages(
    studentId: string, 
    results: EvaluationResult[], 
    framework: CompetencyFramework
  ): Record<string, number> {
    const studentResults = results.filter(r => r.studentId === studentId)
    const competencyAverages: Record<string, number> = {}

    framework.domains.forEach(domain => {
      domain.fields.forEach(field => {
        field.competencies.forEach(competency => {
          const competencyResults = studentResults.filter(r => r.competencyId === competency.id)
          
          if (competencyResults.length > 0) {
            const average = this.calculateAverageScore(competencyResults)
            competencyAverages[competency.id] = average
          }
        })
      })
    })

    return competencyAverages
  }

  /**
   * Calculate class averages by competency
   */
  calculateClassCompetencyAverages(
    results: EvaluationResult[], 
    students: Student[], 
    framework: CompetencyFramework
  ): Record<string, number> {
    const competencyAverages: Record<string, number> = {}

    framework.domains.forEach(domain => {
      domain.fields.forEach(field => {
        field.competencies.forEach(competency => {
          const competencyResults = results.filter(r => r.competencyId === competency.id)
          
          if (competencyResults.length > 0) {
            const average = this.calculateAverageScore(competencyResults)
            competencyAverages[competency.id] = average
          }
        })
      })
    })

    return competencyAverages
  }

  /**
   * Generate student performance radar chart data
   */
  generateStudentRadarData(
    studentId: string,
    results: EvaluationResult[],
    framework: CompetencyFramework
  ): { labels: string[], data: number[] } {
    const competencyAverages = this.calculateStudentCompetencyAverages(studentId, results, framework)
    const labels: string[] = []
    const data: number[] = []

    framework.domains.forEach(domain => {
      domain.fields.forEach(field => {
        field.competencies.forEach(competency => {
          labels.push(competency.name)
          data.push(competencyAverages[competency.id] || 0)
        })
      })
    })

    return { labels, data }
  }

  /**
   * Generate class comparison bar chart data
   */
  generateClassComparisonData(
    results: EvaluationResult[],
    students: Student[],
    framework: CompetencyFramework
  ): { labels: string[], datasets: Array<{ label: string, data: number[] }> } {
    const labels: string[] = []
    const datasets: Array<{ label: string, data: number[] }> = []

    // Get competency labels
    framework.domains.forEach(domain => {
      domain.fields.forEach(field => {
        field.competencies.forEach(competency => {
          labels.push(competency.name)
        })
      })
    })

    // Generate data for each student
    students.forEach(student => {
      const studentData: number[] = []
      const competencyAverages = this.calculateStudentCompetencyAverages(student.id, results, framework)
      
      framework.domains.forEach(domain => {
        domain.fields.forEach(field => {
          field.competencies.forEach(competency => {
            studentData.push(competencyAverages[competency.id] || 0)
          })
        })
      })

      datasets.push({
        label: student.displayName,
        data: studentData
      })
    })

    return { labels, datasets }
  }

  /**
   * Calculate progression over time
   */
  calculateProgressionData(
    studentId: string,
    results: EvaluationResult[],
    timeInterval: 'day' | 'week' | 'month' = 'week'
  ): { dates: string[], averages: number[] } {
    const studentResults = results
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime())

    if (studentResults.length === 0) {
      return { dates: [], averages: [] }
    }

    // Group by time interval
    const groupedResults = this.groupResultsByTimeInterval(studentResults, timeInterval)
    const dates: string[] = []
    const averages: number[] = []

    Object.entries(groupedResults).forEach(([date, results]) => {
      dates.push(date)
      averages.push(this.calculateAverageScore(results))
    })

    return { dates, averages }
  }

  /**
   * Calculate distribution of results by level
   */
  calculateLevelDistribution(results: EvaluationResult[]): Record<string, number> {
    const distribution: Record<string, number> = {}

    results.forEach(result => {
      const level = result.level || result.value || 'N/A'
      distribution[level] = (distribution[level] || 0) + 1
    })

    return distribution
  }

  /**
   * Private helper: Calculate average score from results
   */
  private calculateAverageScore(results: EvaluationResult[]): number {
    if (results.length === 0) return 0

    const scoreMap: Record<string, number> = {
      'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'N/A': 0,
      '5': 5, '4': 4, '3': 3, '2': 2, '1': 1, '0': 0
    }

    const totalScore = results.reduce((sum, result) => {
      const level = (result.level || result.value || 'N/A').toString()
      return sum + (scoreMap[level] || 0)
    }, 0)

    return totalScore / results.length
  }

  /**
   * Private helper: Group results by time interval
   */
  private groupResultsByTimeInterval(
    results: EvaluationResult[], 
    interval: 'day' | 'week' | 'month'
  ): Record<string, EvaluationResult[]> {
    const grouped: Record<string, EvaluationResult[]> = {}

    results.forEach(result => {
      const date = new Date(result.evaluatedAt)
      let key: string

      switch (interval) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const startOfWeek = new Date(date)
          startOfWeek.setDate(date.getDate() - date.getDay())
          key = startOfWeek.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        default:
          key = date.toISOString().split('T')[0]
      }

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(result)
    })

    return grouped
  }

  /**
   * Generate heatmap data for competency performance
   */
  generateCompetencyHeatmapData(
    results: EvaluationResult[],
    students: Student[],
    framework: CompetencyFramework
  ): Array<{ student: string, competency: string, value: number }> {
    const heatmapData: Array<{ student: string, competency: string, value: number }> = []

    students.forEach(student => {
      framework.domains.forEach(domain => {
        domain.fields.forEach(field => {
          field.competencies.forEach(competency => {
            const studentCompetencyResults = results.filter(
              r => r.studentId === student.id && r.competencyId === competency.id
            )

            if (studentCompetencyResults.length > 0) {
              const average = this.calculateAverageScore(studentCompetencyResults)
              heatmapData.push({
                student: student.displayName,
                competency: competency.name,
                value: average
              })
            } else {
              heatmapData.push({
                student: student.displayName,
                competency: competency.name,
                value: 0
              })
            }
          })
        })
      })
    })

    return heatmapData
  }
}

describe('PivotAnalysisService', () => {
  let service: PivotAnalysisService
  
  const mockStudents: Student[] = [
    { id: 'student-1', firstName: 'Jean', lastName: 'Dupont', displayName: 'Jean Dupont' },
    { id: 'student-2', firstName: 'Marie', lastName: 'Martin', displayName: 'Marie Martin' }
  ]

  const mockFramework: CompetencyFramework = {
    id: 'framework-1',
    name: 'Test Framework',
    version: '1.0',
    domains: [
      {
        id: 'domain-1',
        name: 'Mathématiques',
        description: 'Domain math',
        fields: [
          {
            id: 'field-1',
            name: 'Algèbre',
            description: 'Field algebra',
            competencies: [
              {
                id: 'comp-1',
                name: 'Équations',
                description: 'Résoudre des équations',
                specificCompetencies: []
              },
              {
                id: 'comp-2',
                name: 'Fractions',
                description: 'Opérations sur les fractions',
                specificCompetencies: []
              }
            ]
          }
        ]
      }
    ]
  }

  const mockResults: EvaluationResult[] = [
    {
      studentId: 'student-1',
      competencyId: 'comp-1',
      specificCompetencyId: 'spec-1',
      level: 'A',
      value: 'A',
      evaluatedAt: '2024-01-01T10:00:00Z'
    },
    {
      studentId: 'student-1',
      competencyId: 'comp-2',
      specificCompetencyId: 'spec-2',
      level: 'B',
      value: 'B',
      evaluatedAt: '2024-01-02T10:00:00Z'
    },
    {
      studentId: 'student-2',
      competencyId: 'comp-1',
      specificCompetencyId: 'spec-1',
      level: 'B',
      value: 'B',
      evaluatedAt: '2024-01-01T11:00:00Z'
    },
    {
      studentId: 'student-2',
      competencyId: 'comp-2',
      specificCompetencyId: 'spec-2',
      level: 'C',
      value: 'C',
      evaluatedAt: '2024-01-02T11:00:00Z'
    }
  ]

  beforeEach(() => {
    service = new PivotAnalysisService()
  })

  describe('calculateStudentCompetencyAverages', () => {
    it('should calculate competency averages for a student', () => {
      // Act
      const averages = service.calculateStudentCompetencyAverages('student-1', mockResults, mockFramework)

      // Assert
      expect(averages['comp-1']).toBe(5) // Level A = 5
      expect(averages['comp-2']).toBe(4) // Level B = 4
    })

    it('should return empty object for student with no results', () => {
      // Act
      const averages = service.calculateStudentCompetencyAverages('non-existent-student', mockResults, mockFramework)

      // Assert
      expect(averages).toEqual({})
    })

    it('should handle multiple results for same competency', () => {
      // Arrange
      const extendedResults = [
        ...mockResults,
        {
          studentId: 'student-1',
          competencyId: 'comp-1',
          specificCompetencyId: 'spec-3',
          level: 'C',
          value: 'C',
          evaluatedAt: '2024-01-05T10:00:00Z'
        }
      ]

      // Act
      const averages = service.calculateStudentCompetencyAverages('student-1', extendedResults, mockFramework)

      // Assert
      expect(averages['comp-1']).toBe(4) // (A=5 + C=3) / 2 = 4
    })
  })

  describe('calculateClassCompetencyAverages', () => {
    it('should calculate class averages for each competency', () => {
      // Act
      const averages = service.calculateClassCompetencyAverages(mockResults, mockStudents, mockFramework)

      // Assert
      expect(averages['comp-1']).toBe(4.5) // (A=5 + B=4) / 2 = 4.5
      expect(averages['comp-2']).toBe(3.5) // (B=4 + C=3) / 2 = 3.5
    })

    it('should handle empty results', () => {
      // Act
      const averages = service.calculateClassCompetencyAverages([], mockStudents, mockFramework)

      // Assert
      expect(averages).toEqual({})
    })
  })

  describe('generateStudentRadarData', () => {
    it('should generate radar chart data for student', () => {
      // Act
      const radarData = service.generateStudentRadarData('student-1', mockResults, mockFramework)

      // Assert
      expect(radarData.labels).toEqual(['Équations', 'Fractions'])
      expect(radarData.data).toEqual([5, 4]) // A=5, B=4
    })

    it('should include zero values for competencies without results', () => {
      // Arrange
      const partialResults = mockResults.filter(r => r.competencyId === 'comp-1')

      // Act
      const radarData = service.generateStudentRadarData('student-1', partialResults, mockFramework)

      // Assert
      expect(radarData.labels).toEqual(['Équations', 'Fractions'])
      expect(radarData.data).toEqual([5, 0]) // comp-1=5, comp-2=0 (no results)
    })
  })

  describe('generateClassComparisonData', () => {
    it('should generate comparison data for all students', () => {
      // Act
      const comparisonData = service.generateClassComparisonData(mockResults, mockStudents, mockFramework)

      // Assert
      expect(comparisonData.labels).toEqual(['Équations', 'Fractions'])
      expect(comparisonData.datasets).toHaveLength(2)
      
      expect(comparisonData.datasets[0].label).toBe('Jean Dupont')
      expect(comparisonData.datasets[0].data).toEqual([5, 4])
      
      expect(comparisonData.datasets[1].label).toBe('Marie Martin')
      expect(comparisonData.datasets[1].data).toEqual([4, 3])
    })

    it('should handle students with no results', () => {
      // Arrange
      const studentsWithNoResults = [
        ...mockStudents,
        { id: 'student-3', firstName: 'Paul', lastName: 'Durand', displayName: 'Paul Durand' }
      ]

      // Act
      const comparisonData = service.generateClassComparisonData(mockResults, studentsWithNoResults, mockFramework)

      // Assert
      expect(comparisonData.datasets).toHaveLength(3)
      expect(comparisonData.datasets[2].label).toBe('Paul Durand')
      expect(comparisonData.datasets[2].data).toEqual([0, 0]) // No results
    })
  })

  describe('calculateProgressionData', () => {
    it('should calculate daily progression', () => {
      // Act
      const progression = service.calculateProgressionData('student-1', mockResults, 'day')

      // Assert
      expect(progression.dates).toEqual(['2024-01-01', '2024-01-02'])
      expect(progression.averages).toEqual([5, 4]) // A=5 on day 1, B=4 on day 2
    })

    it('should calculate weekly progression', () => {
      // Arrange - results spanning multiple weeks
      const weeklyResults = [
        {
          studentId: 'student-1',
          competencyId: 'comp-1',
          specificCompetencyId: 'spec-1',
          level: 'A',
          value: 'A',
          evaluatedAt: '2024-01-01T10:00:00Z' // Monday week 1
        },
        {
          studentId: 'student-1',
          competencyId: 'comp-2',
          specificCompetencyId: 'spec-2',
          level: 'B',
          value: 'B',
          evaluatedAt: '2024-01-08T10:00:00Z' // Monday week 2
        }
      ]

      // Act
      const progression = service.calculateProgressionData('student-1', weeklyResults, 'week')

      // Assert
      expect(progression.dates).toHaveLength(2)
      expect(progression.averages).toEqual([5, 4])
    })

    it('should return empty data for student with no results', () => {
      // Act
      const progression = service.calculateProgressionData('non-existent-student', mockResults, 'day')

      // Assert
      expect(progression.dates).toEqual([])
      expect(progression.averages).toEqual([])
    })
  })

  describe('calculateLevelDistribution', () => {
    it('should calculate distribution of levels', () => {
      // Act
      const distribution = service.calculateLevelDistribution(mockResults)

      // Assert
      expect(distribution).toEqual({
        'A': 1,
        'B': 2,
        'C': 1
      })
    })

    it('should handle results with value field instead of level', () => {
      // Arrange
      const resultsWithValues = mockResults.map(r => ({ ...r, level: undefined }))

      // Act
      const distribution = service.calculateLevelDistribution(resultsWithValues)

      // Assert
      expect(distribution).toEqual({
        'A': 1,
        'B': 2,
        'C': 1
      })
    })

    it('should handle empty results', () => {
      // Act
      const distribution = service.calculateLevelDistribution([])

      // Assert
      expect(distribution).toEqual({})
    })
  })

  describe('generateCompetencyHeatmapData', () => {
    it('should generate heatmap data for all student-competency combinations', () => {
      // Act
      const heatmapData = service.generateCompetencyHeatmapData(mockResults, mockStudents, mockFramework)

      // Assert
      expect(heatmapData).toHaveLength(4) // 2 students × 2 competencies
      
      // Check specific entries
      const jeanEquations = heatmapData.find(d => d.student === 'Jean Dupont' && d.competency === 'Équations')
      expect(jeanEquations?.value).toBe(5)
      
      const marieFractions = heatmapData.find(d => d.student === 'Marie Martin' && d.competency === 'Fractions')
      expect(marieFractions?.value).toBe(3)
    })

    it('should include zero values for student-competency pairs without results', () => {
      // Arrange - Remove some results
      const partialResults = mockResults.filter(r => !(r.studentId === 'student-2' && r.competencyId === 'comp-2'))

      // Act
      const heatmapData = service.generateCompetencyHeatmapData(partialResults, mockStudents, mockFramework)

      // Assert
      const marieFractions = heatmapData.find(d => d.student === 'Marie Martin' && d.competency === 'Fractions')
      expect(marieFractions?.value).toBe(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complex analysis workflow', () => {
      // Act - Run multiple analysis methods
      const studentAverages = service.calculateStudentCompetencyAverages('student-1', mockResults, mockFramework)
      const classAverages = service.calculateClassCompetencyAverages(mockResults, mockStudents, mockFramework)
      const radarData = service.generateStudentRadarData('student-1', mockResults, mockFramework)
      const progression = service.calculateProgressionData('student-1', mockResults, 'day')
      const distribution = service.calculateLevelDistribution(mockResults)

      // Assert - All methods should work together
      expect(Object.keys(studentAverages)).toHaveLength(2)
      expect(Object.keys(classAverages)).toHaveLength(2)
      expect(radarData.labels).toHaveLength(2)
      expect(progression.dates).toHaveLength(2)
      expect(Object.keys(distribution)).toHaveLength(3)
    })

    it('should handle edge cases consistently', () => {
      // Test with empty framework
      const emptyFramework: CompetencyFramework = {
        id: 'empty',
        name: 'Empty',
        version: '1.0',
        domains: []
      }

      // Act
      const studentAverages = service.calculateStudentCompetencyAverages('student-1', mockResults, emptyFramework)
      const radarData = service.generateStudentRadarData('student-1', mockResults, emptyFramework)

      // Assert
      expect(studentAverages).toEqual({})
      expect(radarData.labels).toEqual([])
      expect(radarData.data).toEqual([])
    })
  })
})

// Export the service class for potential use in the actual application
export { PivotAnalysisService }