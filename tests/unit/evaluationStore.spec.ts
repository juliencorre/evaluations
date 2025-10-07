import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Evaluation } from '@/types/evaluation'

const mockEvaluationRepository = {
  findAll: vi.fn<[], Promise<Evaluation[]>>(),
  create: vi.fn<[], Promise<Evaluation>>(),
  update: vi.fn<[], Promise<Evaluation>>(),
  delete: vi.fn<[], Promise<boolean>>()
}

vi.mock('@/services/ServiceContainer', () => ({
  serviceContainer: {
    evaluations: mockEvaluationRepository,
    evaluationClasses: {
      findAll: vi.fn(() => Promise.resolve([])),
      getClassesForEvaluation: vi.fn(() => Promise.resolve([]))
    },
    auth: {
      getSession: vi.fn(() => Promise.resolve({ session: null, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
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
    setActivePinia(createPinia())
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('charge les évaluations et définit la première comme évaluation courante', async () => {
    mockEvaluationRepository.findAll.mockResolvedValue([sampleEvaluation])

    const { useEvaluationsStore } = await import('@/stores/modules/evaluations.store')
    const store = useEvaluationsStore()

    await store.loadEvaluations()

    expect(store.allEvaluations).toHaveLength(1)
    expect(store.currentEvaluation?.id).toBe(sampleEvaluation.id)
  })

  it('ajoute une évaluation et la définit comme évaluation courante', async () => {
    mockEvaluationRepository.create.mockResolvedValue(sampleEvaluation)

    const { useEvaluationsStore } = await import('@/stores/modules/evaluations.store')
    const store = useEvaluationsStore()

    const created = await store.addEvaluation({
      name: sampleEvaluation.name,
      description: sampleEvaluation.description,
      frameworkId: sampleEvaluation.frameworkId,
      classId: sampleEvaluation.classId
    })

    expect(created).toEqual(sampleEvaluation)
    expect(store.allEvaluations.find(evaluation => evaluation.id === sampleEvaluation.id)).toBeDefined()
    expect(store.currentEvaluation?.id).toBe(sampleEvaluation.id)
  })

  it('met à jour une évaluation existante et synchronise le store', async () => {
    const updatedEvaluation: Evaluation = { ...sampleEvaluation, name: 'Évaluation mise à jour' }

    mockEvaluationRepository.create.mockResolvedValue(sampleEvaluation)
    mockEvaluationRepository.update.mockResolvedValue(updatedEvaluation)

    const { useEvaluationsStore } = await import('@/stores/modules/evaluations.store')
    const store = useEvaluationsStore()

    await store.addEvaluation({
      name: sampleEvaluation.name,
      description: sampleEvaluation.description,
      frameworkId: sampleEvaluation.frameworkId,
      classId: sampleEvaluation.classId
    })

    const result = await store.updateEvaluation(sampleEvaluation.id, { name: updatedEvaluation.name })

    expect(result).toEqual(updatedEvaluation)
    expect(store.allEvaluations[0].name).toBe('Évaluation mise à jour')
    expect(store.currentEvaluation?.name).toBe('Évaluation mise à jour')
  })

  it('supprime une évaluation et met à jour la sélection courante', async () => {
    mockEvaluationRepository.create.mockResolvedValue(sampleEvaluation)
    mockEvaluationRepository.delete.mockResolvedValue(true)

    const { useEvaluationsStore } = await import('@/stores/modules/evaluations.store')
    const store = useEvaluationsStore()

    await store.addEvaluation({
      name: sampleEvaluation.name,
      description: sampleEvaluation.description,
      frameworkId: sampleEvaluation.frameworkId,
      classId: sampleEvaluation.classId
    })

    await store.deleteEvaluation(sampleEvaluation.id)

    expect(store.allEvaluations.find(evaluation => evaluation.id === sampleEvaluation.id)).toBeUndefined()
    // After deleting the only evaluation, currentEvaluation should be null
    expect(store.currentEvaluation).toBeNull()
  })
})
