import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Student, CompetencyFramework, Domain } from '@/types/evaluation'

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

const mockStudents: Student[] = [
  { id: 'stu-1', firstName: 'Alice', lastName: 'Martin', displayName: 'Alice M.' }
]

const mockSupabaseStudentsService = {
  getAllStudents: vi.fn<[], Promise<Student[]>>(),
  createStudent: vi.fn<[], Promise<Student>>(),
  updateStudent: vi.fn<[], Promise<Student | null>>(),
  deleteStudent: vi.fn<[], Promise<void>>()
}

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

const mockSupabaseCompetenciesService = {
  getOrCreateDefaultFramework: vi.fn<[], Promise<{ id: string; name: string; version: string }>>(),
  getAllDomains: vi.fn<[], Promise<Domain[]>>(),
  updateSpecificCompetency: vi.fn<[], Promise<null>>()
}

vi.mock('@/services/supabaseStudentsService', () => ({
  supabaseStudentsService: mockSupabaseStudentsService
}))

vi.mock('@/services/supabaseCompetenciesService', () => ({
  supabaseCompetenciesService: mockSupabaseCompetenciesService
}))

describe('useStudentsStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.resetModules()
    vi.clearAllMocks()

    mockSupabaseStudentsService.getAllStudents.mockResolvedValue([...mockStudents])
    mockSupabaseStudentsService.createStudent.mockImplementation(async (firstName: string, lastName: string) => ({
      id: 'stu-2',
      firstName,
      lastName,
      displayName: `${firstName} ${lastName.charAt(0)}.`
    }))
    mockSupabaseStudentsService.updateStudent.mockImplementation(async (id: string, updates: Partial<Student>) => ({
      ...mockStudents[0],
      ...updates,
      displayName: `${updates.firstName ?? mockStudents[0].firstName} ${(updates.lastName ?? mockStudents[0].lastName).charAt(0)}.`
    }))
    mockSupabaseStudentsService.deleteStudent.mockResolvedValue()

    mockSupabaseCompetenciesService.getOrCreateDefaultFramework.mockResolvedValue({
      id: mockFramework.id,
      name: mockFramework.name,
      version: mockFramework.version
    })
    mockSupabaseCompetenciesService.getAllDomains.mockResolvedValue(mockFramework.domains as Domain[])
    mockSupabaseCompetenciesService.updateSpecificCompetency.mockResolvedValue(null)
  })

  it('ajoute un élève en utilisant le service Supabase', async () => {
    const { useStudentsStore } = await import('@/stores/studentsStore')
    const store = useStudentsStore()

    await flushPromises()

    const newStudent = await store.addStudent({ firstName: 'Bruno', lastName: 'Dupont' })

    expect(newStudent).toMatchObject({ id: 'stu-2', firstName: 'Bruno', lastName: 'Dupont' })
    expect(store.allStudents).toContainEqual(newStudent)
  })

  it('met à jour un élève existant et rafraîchit le displayName', async () => {
    const { useStudentsStore } = await import('@/stores/studentsStore')
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
    const { useStudentsStore } = await import('@/stores/studentsStore')
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

    mockSupabaseStudentsService.getAllStudents.mockResolvedValue([...mockStudents])
    mockSupabaseStudentsService.createStudent.mockImplementation(async (firstName: string, lastName: string) => ({
      id: 'stu-2',
      firstName,
      lastName,
      displayName: `${firstName} ${lastName.charAt(0)}.`
    }))
    mockSupabaseStudentsService.updateStudent.mockImplementation(async (id: string, updates: Partial<Student>) => ({
      ...mockStudents[0],
      ...updates,
      displayName: `${updates.firstName ?? mockStudents[0].firstName} ${(updates.lastName ?? mockStudents[0].lastName).charAt(0)}.`
    }))
    mockSupabaseStudentsService.deleteStudent.mockResolvedValue()

    mockSupabaseCompetenciesService.getOrCreateDefaultFramework.mockResolvedValue({
      id: mockFramework.id,
      name: mockFramework.name,
      version: mockFramework.version
    })
    mockSupabaseCompetenciesService.getAllDomains.mockResolvedValue(mockFramework.domains as Domain[])
    mockSupabaseCompetenciesService.updateSpecificCompetency.mockResolvedValue(null)
  })

  it('crée, modifie et supprime une compétence', async () => {
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890)

    const { useCompetencyFrameworkStore } = await import('@/stores/studentsStore')
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
