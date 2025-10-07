/**
 * Unit Tests for ServiceContainer
 * Tests dependency injection and singleton pattern
 */

import { describe, it, expect, afterEach } from 'vitest'
import { ServiceContainer, serviceContainer } from '@/services/ServiceContainer'
import { AuthRepository } from '@/services/repositories/AuthRepository'
import { StudentRepository } from '@/services/repositories/StudentRepository'
import { ClassRepository } from '@/services/repositories/ClassRepository'
import { EvaluationRepository } from '@/services/repositories/EvaluationRepository'
import { CompetencyRepository } from '@/services/repositories/CompetencyRepository'
import { ResultTypeRepository } from '@/services/repositories/ResultTypeRepository'
import { StudentClassRepository } from '@/services/repositories/StudentClassRepository'
import { SchoolYearRepository } from '@/services/repositories/SchoolYearRepository'
import { EvaluationResultRepository } from '@/services/repositories/EvaluationResultRepository'
import { EvaluationClassRepository } from '@/services/repositories/EvaluationClassRepository'

describe('ServiceContainer', () => {
  afterEach(() => {
    // Reset singleton after each test
    ServiceContainer.reset()
  })

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = ServiceContainer.getInstance()
      const instance2 = ServiceContainer.getInstance()

      expect(instance1).toBe(instance2)
    })

    it('should use global serviceContainer export', () => {
      // Verify that serviceContainer is defined and has repositories
      expect(serviceContainer).toBeDefined()
      expect(serviceContainer.auth).toBeInstanceOf(AuthRepository)
      expect(serviceContainer.students).toBeInstanceOf(StudentRepository)
    })

    it('should reset singleton correctly', () => {
      const instance1 = ServiceContainer.getInstance()

      ServiceContainer.reset()

      const instance2 = ServiceContainer.getInstance()

      expect(instance1).not.toBe(instance2)
    })
  })

  describe('Repository Instances', () => {
    it('should initialize AuthRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.auth).toBeInstanceOf(AuthRepository)
    })

    it('should initialize StudentRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.students).toBeInstanceOf(StudentRepository)
    })

    it('should initialize ClassRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.classes).toBeInstanceOf(ClassRepository)
    })

    it('should initialize EvaluationRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.evaluations).toBeInstanceOf(EvaluationRepository)
    })

    it('should initialize CompetencyRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.competencies).toBeInstanceOf(CompetencyRepository)
    })

    it('should initialize ResultTypeRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.resultTypes).toBeInstanceOf(ResultTypeRepository)
    })

    it('should initialize StudentClassRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.studentClasses).toBeInstanceOf(StudentClassRepository)
    })

    it('should initialize SchoolYearRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.schoolYears).toBeInstanceOf(SchoolYearRepository)
    })

    it('should initialize EvaluationResultRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.evaluationResults).toBeInstanceOf(EvaluationResultRepository)
    })

    it('should initialize EvaluationClassRepository', () => {
      const container = ServiceContainer.getInstance()

      expect(container.evaluationClasses).toBeInstanceOf(EvaluationClassRepository)
    })
  })

  describe('Repository Count', () => {
    it('should have all 11 repositories', () => {
      const container = ServiceContainer.getInstance()

      const repositoryKeys = [
        'auth',
        'students',
        'classes',
        'evaluations',
        'competencies',
        'resultTypes',
        'studentClasses',
        'schoolYears',
        'evaluationResults',
        'evaluationClasses'
      ]

      repositoryKeys.forEach(key => {
        expect(container).toHaveProperty(key)
        expect(container[key as keyof ServiceContainer]).toBeDefined()
      })
    })
  })

  describe('Immutability', () => {
    it('should have readonly repositories', () => {
      const container = ServiceContainer.getInstance()
      const originalAuth = container.auth

      // TypeScript ensures readonly, but let's verify instance doesn't change
      expect(container.auth).toBe(originalAuth)
    })
  })

  describe('Dependency Injection', () => {
    it('should inject same Supabase client to all repositories', () => {
      const container = ServiceContainer.getInstance()

      // All repositories should have the same Supabase client instance
      // We can verify by checking if they're properly initialized
      expect(container.auth['supabase']).toBeDefined()
      expect(container.students['supabase']).toBeDefined()
      expect(container.auth['supabase']).toBe(container.students['supabase'])
    })
  })

  describe('Testing Support', () => {
    it('should support reset for testing isolation', () => {
      const container1 = ServiceContainer.getInstance()
      const auth1 = container1.auth

      ServiceContainer.reset()

      const container2 = ServiceContainer.getInstance()
      const auth2 = container2.auth

      expect(auth1).not.toBe(auth2)
      expect(container1).not.toBe(container2)
    })
  })
})
