import { describe, it, expect } from 'vitest'
import { PivotAnalysisService, type NormalizedEvaluationResult } from '@/services/pivotAnalysisService'
import type { EvaluationResult, ResultTypeConfig } from '@/types/evaluation'

describe('PivotAnalysisService', () => {
  const numericConfig: ResultTypeConfig = {
    id: 'numeric',
    name: 'Note sur 20',
    type: 'numeric',
    config: {
      minValue: 0,
      maxValue: 20,
      values: []
    }
  }

  const scaleConfig: ResultTypeConfig = {
    id: 'scale-4',
    name: 'Échelle qualitative',
    type: 'scale',
    config: {
      values: [
        { label: 'Non acquis', value: 'NA', pivot_value: 2 },
        { label: 'En cours', value: 'EC', pivot_value: 5 },
        { label: 'Acquis', value: 'A', pivot_value: 8 },
        { label: 'Maîtrisé', value: 'M', pivot_value: 10 }
      ]
    }
  }

  it('normalise un résultat numérique sur une échelle 0-10', () => {
    const result: EvaluationResult = {
      studentId: 'stu-1',
      competencyId: 'comp-1',
      value: '14',
      evaluatedAt: '2025-01-01T10:00:00.000Z'
    }

    const normalized = PivotAnalysisService.normalizeEvaluationResult(result, numericConfig)

    expect(normalized).toMatchObject({
      studentId: 'stu-1',
      competencyId: 'comp-1',
      originalValue: '14'
    })
    expect(normalized?.pivotValue).toBeCloseTo(7)
  })

  it('normalise un résultat qualitatif à partir de la configuration', () => {
    const result: EvaluationResult = {
      studentId: 'stu-2',
      competencyId: 'comp-2',
      value: 'A',
      evaluatedAt: '2025-01-01T10:00:00.000Z'
    }

    const normalized = PivotAnalysisService.normalizeEvaluationResult(result, scaleConfig)

    expect(normalized?.pivotValue).toBe(8)
  })

  it('normalise plusieurs résultats en utilisant les types de résultats connus', () => {
    const results: EvaluationResult[] = [
      { studentId: 'stu-1', competencyId: 'comp-1', value: 'A', evaluatedAt: '2025-01-01T10:00:00.000Z' },
      { studentId: 'stu-2', competencyId: 'comp-1', value: 'EC', evaluatedAt: '2025-01-01T10:05:00.000Z' }
    ]

    const configs = new Map<string, ResultTypeConfig>([[scaleConfig.id, scaleConfig]])

    const normalized = PivotAnalysisService.normalizeEvaluationResults(results, configs)

    expect(normalized).toHaveLength(2)
    expect(normalized.map(result => result.pivotValue)).toEqual([8, 5])
  })

  it('calcule les statistiques de distribution pour les graphiques', () => {
    const normalized: NormalizedEvaluationResult[] = [
      { studentId: 'stu-1', competencyId: 'comp-1', originalValue: 'A', pivotValue: 8, evaluatedAt: '2025-01-01T10:00:00.000Z' },
      { studentId: 'stu-2', competencyId: 'comp-1', originalValue: 'M', pivotValue: 10, evaluatedAt: '2025-01-01T10:05:00.000Z' },
      { studentId: 'stu-3', competencyId: 'comp-1', originalValue: 'EC', pivotValue: 5, evaluatedAt: '2025-01-01T10:10:00.000Z' }
    ]

    const stats = PivotAnalysisService.calculateStatistics(normalized)

    expect(stats).toMatchObject({
      average: 7.67,
      min: 5,
      max: 10,
      count: 3
    })
    expect(stats.distribution['8']).toBe(1)
  })

  it('regroupe les résultats normalisés par compétence et par élève', () => {
    const normalized: NormalizedEvaluationResult[] = [
      { studentId: 'stu-1', competencyId: 'comp-1', originalValue: 'A', pivotValue: 8, evaluatedAt: '2025-01-01T10:00:00.000Z' },
      { studentId: 'stu-1', competencyId: 'comp-2', originalValue: 'M', pivotValue: 10, evaluatedAt: '2025-01-01T10:05:00.000Z' },
      { studentId: 'stu-2', competencyId: 'comp-1', originalValue: 'EC', pivotValue: 5, evaluatedAt: '2025-01-01T10:10:00.000Z' }
    ]

    const byCompetency = PivotAnalysisService.groupByCompetency(normalized)
    const byStudent = PivotAnalysisService.groupByStudent(normalized)

    expect(Object.keys(byCompetency)).toEqual(['comp-1', 'comp-2'])
    expect(byCompetency['comp-1']).toHaveLength(2)
    expect(Object.keys(byStudent)).toEqual(['stu-1', 'stu-2'])
    expect(byStudent['stu-1']).toHaveLength(2)
  })

  it('dénormalise une valeur pivot pour retrouver l\'étiquette la plus proche', () => {
    const value = PivotAnalysisService.denormalizePivotValue(9, scaleConfig)
    expect(value && typeof value === 'object' ? value.value : value).toBe('A')
  })
})
