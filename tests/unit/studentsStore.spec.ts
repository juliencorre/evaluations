import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Student, CompetencyFramework, Domain } from '@/types/evaluation'

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

const mockFramework: CompetencyFramework = {
  id: 'framework-1',
  name: 'Framework Test',
  version: '1.0',
  domains: [
    {
      id: 'domain-1',
      name: 'Langue',
      description: 'Compétences linguistiques',
      fields: [
        {
          id: 'field-1',
          name: 'Oral',
          description: 'Expression orale',
          competencies: []
        }
      ]
    }
  ]
}

const mockStudentRepository = {
  findAll: vi.fn<[], Promise<Student[]>>(),
  create: vi.fn<[], Promise<Student>>(),
  update: vi.fn<[], Promise<Student>>(),
  delete: vi.fn<[], Promise<void>>(),
  findById: vi.fn<[], Promise<Student | null>>()
}

const mockCompetencyRepository = {
  getOrCreateDefaultFramework: vi.fn<[], Promise<{ id: string; name: string; version: string }>>(),
  findAllDomains: vi.fn<[], Promise<Domain[]>>(),
  updateCompetency: vi.fn<[], Promise<void>>()
}

vi.mock('@/services/ServiceContainer', () => ({
  serviceContainer: {
    students: mockStudentRepository,
    competencies: mockCompetencyRepository,
    auth: {
      getSession: vi.fn(() => Promise.resolve({ session: null, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}))

const mockStudents: Student[] = [
  { id: 'stu-1', firstName: 'Alice', lastName: 'Martin', displayName: 'Alice M.' }
]

describe('useStudentsStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.resetModules()
    vi.clearAllMocks()

    mockStudentRepository.findAll.mockResolvedValue([...mockStudents])
    mockStudentRepository.create.mockImplementation(async (dto) => ({
      id: 'stu-2',
      firstName: dto.firstName,
      lastName: dto.lastName,
      displayName: `${dto.firstName} ${dto.lastName.charAt(0)}.`
    }))
    mockStudentRepository.update.mockImplementation(async (id, dto) => ({
      id,
      firstName: dto.firstName ?? mockStudents[0].firstName,
      lastName: dto.lastName ?? mockStudents[0].lastName,
      displayName: `${dto.firstName ?? mockStudents[0].firstName} ${(dto.lastName ?? mockStudents[0].lastName).charAt(0)}.`
    }))
    mockStudentRepository.findById.mockImplementation(async (id) =>
      mockStudents.find(s => s.id === id) ?? null
    )
    mockStudentRepository.delete.mockResolvedValue()

    mockCompetencyRepository.getOrCreateDefaultFramework.mockResolvedValue({
      id: mockFramework.id,
      name: mockFramework.name,
      version: mockFramework.version
    })
    mockCompetencyRepository.findAllDomains.mockResolvedValue(mockFramework.domains as Domain[])
    mockCompetencyRepository.updateCompetency.mockResolvedValue(undefined)
  })

  it('ajoute un élève en utilisant le service Supabase', async () => {
    const { useStudentsStore } = await import('@/stores/modules/students.store')
    const store = useStudentsStore()

    await flushPromises()

    const newStudent = await store.addStudent({ firstName: 'Bruno', lastName: 'Dupont' })

    expect(newStudent).toMatchObject({ id: 'stu-2', firstName: 'Bruno', lastName: 'Dupont' })
    expect(store.allStudents).toContainEqual(newStudent)
  })

  it('met à jour un élève existant et rafraîchit le displayName', async () => {
    const { useStudentsStore } = await import('@/stores/modules/students.store')
    const store = useStudentsStore()

    // Ensure students are loaded first
    await store.refreshFromSupabase()
    await flushPromises()

    const updated = await store.updateStudent('stu-1', { firstName: 'Alicia' })

    expect(updated?.firstName).toBe('Alicia')
    expect(updated?.displayName).toBe('Alicia M.')
    expect(store.getStudentById('stu-1')?.firstName).toBe('Alicia')
  })

  it('supprime un élève et met à jour la liste', async () => {
    const { useStudentsStore } = await import('@/stores/modules/students.store')
    const store = useStudentsStore()

    // Ensure students are loaded first
    await store.refreshFromSupabase()
    await flushPromises()

    const deleted = await store.deleteStudent('stu-1')

    expect(deleted?.id).toBe('stu-1')
    expect(store.getStudentById('stu-1')).toBeNull()
  })
})

describe('useCompetencyFrameworkStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.resetModules()
    vi.clearAllMocks()

    mockCompetencyRepository.getOrCreateDefaultFramework.mockResolvedValue({
      id: mockFramework.id,
      name: mockFramework.name,
      version: mockFramework.version
    })
    mockCompetencyRepository.findAllDomains.mockResolvedValue(mockFramework.domains as Domain[])
    mockCompetencyRepository.updateCompetency.mockResolvedValue(undefined)
  })

  it('crée, modifie et supprime une compétence', async () => {
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890)

    const { useCompetencyFrameworkStore } = await import('@/stores/modules/competencyFramework.store')
    const store = useCompetencyFrameworkStore()

    // Trigger the loading of framework data
    await store.refreshFromSupabase()
    await flushPromises()

    const framework = store.framework
    const fieldId = framework?.domains[0].fields[0].id

    const newCompetency = store.addCompetency(fieldId, {
      name: 'Comprendre un texte',
      description: 'Analyse de compréhension'
    })

    expect(newCompetency).toBeTruthy()
    expect(framework.domains[0].fields[0].competencies).toContainEqual(expect.objectContaining({
      id: 'comp-1234567890',
      name: 'Comprendre un texte'
    }))

    const updated = store.updateCompetency(newCompetency!.id, { name: 'Compréhension écrite' })
    expect(updated?.name).toBe('Compréhension écrite')

    const deleted = store.deleteCompetency(newCompetency!.id)
    expect(deleted?.id).toBe(newCompetency!.id)
    expect(framework.domains[0].fields[0].competencies.find(c => c.id === newCompetency!.id)).toBeUndefined()

    dateNowSpy.mockRestore()
  })
})
