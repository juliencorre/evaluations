import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StudentsService } from '../studentsService'
import type { Student } from '@/types/evaluation'

// Mock the students store
vi.mock('@/stores/studentsStore', () => ({
  useStudentsStore: vi.fn(() => ({
    allStudents: { value: [] as Student[] },
    addStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
    getStudentById: vi.fn(),
    resetStudents: vi.fn()
  }))
}))

describe('StudentsService', () => {
  let service: StudentsService
  let mockStudentsStore: any
  
  const mockStudent: Student = {
    id: 'student-123',
    firstName: 'Jean',
    lastName: 'Dupont',
    displayName: 'Jean Dupont'
  }

  const mockStudent2: Student = {
    id: 'student-456',
    firstName: 'Marie',
    lastName: 'Martin',
    displayName: 'Marie Martin'
  }

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Get mock store from the module  
    const { useStudentsStore } = await import('@/stores/studentsStore')
    mockStudentsStore = useStudentsStore()
    
    // Create fresh service instance
    service = new StudentsService()
    
    // Reset mock store state
    mockStudentsStore.allStudents.value = []
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllStudents', () => {
    it('should return all students from store', () => {
      // Arrange
      mockStudentsStore.allStudents.value = [mockStudent, mockStudent2]

      // Act
      const result = service.getAllStudents()

      // Assert
      expect(result).toEqual([mockStudent, mockStudent2])
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no students', () => {
      // Arrange
      mockStudentsStore.allStudents.value = []

      // Act
      const result = service.getAllStudents()

      // Assert
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })
  })

  describe('addStudent', () => {
    it('should add new student successfully', async () => {
      // Arrange
      const studentData = { firstName: 'Jean', lastName: 'Dupont' }
      mockStudentsStore.addStudent.mockResolvedValue(mockStudent)

      // Act
      const result = await service.addStudent(studentData)

      // Assert
      expect(mockStudentsStore.addStudent).toHaveBeenCalledWith(studentData)
      expect(result).toEqual(mockStudent)
    })

    it('should handle student creation with minimal data', async () => {
      // Arrange
      const studentData = { firstName: 'Marie', lastName: 'Martin' }
      mockStudentsStore.addStudent.mockResolvedValue(mockStudent2)

      // Act
      const result = await service.addStudent(studentData)

      // Assert
      expect(mockStudentsStore.addStudent).toHaveBeenCalledWith(studentData)
      expect(result).toEqual(mockStudent2)
    })

    it('should propagate errors from store', async () => {
      // Arrange
      const studentData = { firstName: 'Jean', lastName: 'Dupont' }
      const error = new Error('Student creation failed')
      mockStudentsStore.addStudent.mockRejectedValue(error)

      // Act & Assert
      await expect(service.addStudent(studentData)).rejects.toThrow('Student creation failed')
      expect(mockStudentsStore.addStudent).toHaveBeenCalledWith(studentData)
    })
  })

  describe('updateStudent', () => {
    it('should update student successfully', async () => {
      // Arrange
      const studentId = 'student-123'
      const updates = { firstName: 'Jean-Pierre', lastName: 'Dupont' }
      const updatedStudent = { ...mockStudent, ...updates, displayName: 'Jean-Pierre Dupont' }
      mockStudentsStore.updateStudent.mockResolvedValue(updatedStudent)

      // Act
      const result = await service.updateStudent(studentId, updates)

      // Assert
      expect(mockStudentsStore.updateStudent).toHaveBeenCalledWith(studentId, updates)
      expect(result).toEqual(updatedStudent)
    })

    it('should handle partial updates', async () => {
      // Arrange
      const studentId = 'student-123'
      const updates = { firstName: 'Jean-Pierre' }
      const updatedStudent = { ...mockStudent, firstName: 'Jean-Pierre', displayName: 'Jean-Pierre Dupont' }
      mockStudentsStore.updateStudent.mockResolvedValue(updatedStudent)

      // Act
      const result = await service.updateStudent(studentId, updates)

      // Assert
      expect(mockStudentsStore.updateStudent).toHaveBeenCalledWith(studentId, updates)
      expect(result).toEqual(updatedStudent)
    })

    it('should return null when student not found', async () => {
      // Arrange
      const studentId = 'non-existent-id'
      const updates = { firstName: 'Jean' }
      mockStudentsStore.updateStudent.mockResolvedValue(null)

      // Act
      const result = await service.updateStudent(studentId, updates)

      // Assert
      expect(mockStudentsStore.updateStudent).toHaveBeenCalledWith(studentId, updates)
      expect(result).toBeNull()
    })

    it('should propagate errors from store', async () => {
      // Arrange
      const studentId = 'student-123'
      const updates = { firstName: 'Jean' }
      const error = new Error('Update failed')
      mockStudentsStore.updateStudent.mockRejectedValue(error)

      // Act & Assert
      await expect(service.updateStudent(studentId, updates)).rejects.toThrow('Update failed')
      expect(mockStudentsStore.updateStudent).toHaveBeenCalledWith(studentId, updates)
    })
  })

  describe('deleteStudent', () => {
    it('should delete student successfully', async () => {
      // Arrange
      const studentId = 'student-123'
      mockStudentsStore.deleteStudent.mockResolvedValue(mockStudent)

      // Act
      const result = await service.deleteStudent(studentId)

      // Assert
      expect(mockStudentsStore.deleteStudent).toHaveBeenCalledWith(studentId)
      expect(result).toEqual(mockStudent)
    })

    it('should return null when student not found', async () => {
      // Arrange
      const studentId = 'non-existent-id'
      mockStudentsStore.deleteStudent.mockResolvedValue(null)

      // Act
      const result = await service.deleteStudent(studentId)

      // Assert
      expect(mockStudentsStore.deleteStudent).toHaveBeenCalledWith(studentId)
      expect(result).toBeNull()
    })

    it('should propagate errors from store', async () => {
      // Arrange
      const studentId = 'student-123'
      const error = new Error('Delete failed')
      mockStudentsStore.deleteStudent.mockRejectedValue(error)

      // Act & Assert
      await expect(service.deleteStudent(studentId)).rejects.toThrow('Delete failed')
      expect(mockStudentsStore.deleteStudent).toHaveBeenCalledWith(studentId, { _deleted: true })
    })
  })

  describe('getStudentById', () => {
    it('should return student when found', () => {
      // Arrange
      const studentId = 'student-123'
      mockStudentsStore.getStudentById.mockReturnValue(mockStudent)

      // Act
      const result = service.getStudentById(studentId)

      // Assert
      expect(mockStudentsStore.getStudentById).toHaveBeenCalledWith(studentId)
      expect(result).toEqual(mockStudent)
    })

    it('should return null when student not found', () => {
      // Arrange
      const studentId = 'non-existent-id'
      mockStudentsStore.getStudentById.mockReturnValue(null)

      // Act
      const result = service.getStudentById(studentId)

      // Assert
      expect(mockStudentsStore.getStudentById).toHaveBeenCalledWith(studentId)
      expect(result).toBeNull()
    })
  })

  describe('resetStudents', () => {
    it('should reset students through store', () => {
      // Act
      service.resetStudents()

      // Assert
      expect(mockStudentsStore.resetStudents).toHaveBeenCalledTimes(1)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete student lifecycle', async () => {
      // Test complete CRUD operations
      const studentData = { firstName: 'Jean', lastName: 'Dupont' }
      
      // Create
      mockStudentsStore.addStudent.mockResolvedValue(mockStudent)
      const created = await service.addStudent(studentData)
      expect(created).toEqual(mockStudent)
      
      // Read
      mockStudentsStore.getStudentById.mockReturnValue(mockStudent)
      const retrieved = service.getStudentById(mockStudent.id)
      expect(retrieved).toEqual(mockStudent)
      
      // Update
      const updates = { firstName: 'Jean-Pierre' }
      const updatedStudent = { ...mockStudent, ...updates, displayName: 'Jean-Pierre Dupont' }
      mockStudentsStore.updateStudent.mockResolvedValue(updatedStudent)
      const updated = await service.updateStudent(mockStudent.id, updates)
      expect(updated).toEqual(updatedStudent)
      
      // Delete
      mockStudentsStore.deleteStudent.mockResolvedValue(updatedStudent)
      const deleted = await service.deleteStudent(mockStudent.id)
      expect(deleted).toEqual(updatedStudent)
    })

    it('should handle multiple students operations', async () => {
      // Arrange
      mockStudentsStore.allStudents.value = [mockStudent, mockStudent2]
      mockStudentsStore.addStudent.mockResolvedValue(mockStudent)
      
      // Act - Add student
      await service.addStudent({ firstName: 'Jean', lastName: 'Dupont' })
      
      // Act - Get all students
      const allStudents = service.getAllStudents()
      
      // Assert
      expect(allStudents).toHaveLength(2)
      expect(allStudents).toContain(mockStudent)
      expect(allStudents).toContain(mockStudent2)
    })
  })
})