import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Evaluation } from '@/types/evaluation'

const mockSupabaseEvaluationsService = {
  getEvaluations: vi.fn<[], Promise<Evaluation[]>>(),
  createEvaluation: vi.fn<[], Promise<Evaluation | null>>(),
  updateEvaluation: vi.fn<[], Promise<Evaluation | null>>(),
  deleteEvaluation: vi.fn<[], Promise<boolean>>()
}

vi.mock('@/services/supabaseEvaluationsService', () => ({
  supabaseEvaluationsService: mockSupabaseEvaluationsService
}))

const sampleEvaluation = {
  id: 'eval-001',
  name: 'Évaluation initiale',
  description: 'Évaluation de référence',
  frameworkId: 'framework-1',
  classId: 'class-a',
  createdAt: '2025-01-01T10:00:00.000Z',
  results: []
} satisfies Evaluation

describe('useEvaluationStore', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('charge les évaluations et définit la première comme évaluation courante', async () => {
    mockSupabaseEvaluationsService.getEvaluations.mockResolvedValue([sampleEvaluation])

    const { useEvaluationStore } = await import('@/stores/evaluationStore')
    const store = useEvaluationStore()

    await store.loadEvaluations()

    expect(store.allEvaluations.value).toHaveLength(1)
    expect(store.currentEvaluation.value.id).toBe(sampleEvaluation.id)
  })

  it('ajoute une évaluation et la définit comme évaluation courante', async () => {
    mockSupabaseEvaluationsService.createEvaluation.mockResolvedValue(sampleEvaluation)

    const { useEvaluationStore } = await import('@/stores/evaluationStore')
    const store = useEvaluationStore()

    const created = await store.addEvaluation({
      name: sampleEvaluation.name,
      description: sampleEvaluation.description,
      frameworkId: sampleEvaluation.frameworkId,
      classId: sampleEvaluation.classId
    })

    expect(created).toEqual(sampleEvaluation)
    expect(store.allEvaluations.value.find(evaluation => evaluation.id === sampleEvaluation.id)).toBeDefined()
    expect(store.currentEvaluation.value.id).toBe(sampleEvaluation.id)
  })

  it('met à jour une évaluation existante et synchronise le store', async () => {
    const updatedEvaluation: Evaluation = { ...sampleEvaluation, name: 'Évaluation mise à jour' }

    mockSupabaseEvaluationsService.createEvaluation.mockResolvedValue(sampleEvaluation)
    mockSupabaseEvaluationsService.updateEvaluation.mockResolvedValue(updatedEvaluation)

    const { useEvaluationStore } = await import('@/stores/evaluationStore')
    const store = useEvaluationStore()

    await store.addEvaluation({
      name: sampleEvaluation.name,
      description: sampleEvaluation.description,
      frameworkId: sampleEvaluation.frameworkId,
      classId: sampleEvaluation.classId
    })

    const result = await store.updateEvaluation(sampleEvaluation.id, { name: updatedEvaluation.name })

    expect(result).toEqual(updatedEvaluation)
    expect(store.allEvaluations.value[0].name).toBe('Évaluation mise à jour')
    expect(store.currentEvaluation.value.name).toBe('Évaluation mise à jour')
  })

  it('supprime une évaluation et met à jour la sélection courante', async () => {
    mockSupabaseEvaluationsService.createEvaluation.mockResolvedValue(sampleEvaluation)
    mockSupabaseEvaluationsService.deleteEvaluation.mockResolvedValue(true)

    const { useEvaluationStore } = await import('@/stores/evaluationStore')
    const store = useEvaluationStore()

    await store.addEvaluation({
      name: sampleEvaluation.name,
      description: sampleEvaluation.description,
      frameworkId: sampleEvaluation.frameworkId,
      classId: sampleEvaluation.classId
    })

    const success = await store.deleteEvaluation(sampleEvaluation.id)

    expect(success).toBe(true)
    expect(store.allEvaluations.value.find(evaluation => evaluation.id === sampleEvaluation.id)).toBeUndefined()
    expect(store.currentEvaluation.value.id).not.toBe(sampleEvaluation.id)
  })
})
