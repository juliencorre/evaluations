import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StudentClassRepository } from '@/services/repositories/StudentClassRepository'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSupabase: any = {
  from: vi.fn(),
  channel: vi.fn()
}

describe('StudentClassRepository', () => {
  let repository: StudentClassRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new StudentClassRepository(mockSupabase)
  })

  it('should create repository instance', () => {
    expect(repository).toBeInstanceOf(StudentClassRepository)
  })

  it('should call Supabase for findRelations', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }
    mockSupabase.from.mockReturnValue(mockQuery)

    await repository.findRelations()

    expect(mockSupabase.from).toHaveBeenCalledWith('student_classes')
  })

  it('should subscribe to changes', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    }
    mockSupabase.channel.mockReturnValue(mockChannel)

    repository.subscribeToChanges(vi.fn())

    expect(mockSupabase.channel).toHaveBeenCalledWith('student_classes_changes')
  })
})
