/**
 * Service Container
 * Phase 4.3: Services Layer - Repository Pattern
 *
 * Dependency Injection container for repositories and services.
 * Provides singleton instances configured with the Supabase client.
 *
 * @example
 * ```typescript
 * import { serviceContainer } from '@/services/ServiceContainer'
 *
 * // Access repositories
 * const students = await serviceContainer.students.findAll()
 * const newStudent = await serviceContainer.students.create({
 *   firstName: 'John',
 *   lastName: 'Doe'
 * })
 * ```
 */

import { supabase } from '@/lib/supabase'
import {
  AuthRepository,
  StudentRepository,
  ClassRepository,
  EvaluationRepository,
  CompetencyRepository,
  ResultTypeRepository,
  StudentClassRepository,
  SchoolYearRepository,
  EvaluationResultRepository,
  EvaluationClassRepository
} from './repositories'

/**
 * Service Container Class
 * Manages repository instances with dependency injection
 */
class ServiceContainer {
  private static instance: ServiceContainer

  // Repository instances
  public readonly auth: AuthRepository
  public readonly students: StudentRepository
  public readonly classes: ClassRepository
  public readonly evaluations: EvaluationRepository
  public readonly competencies: CompetencyRepository
  public readonly resultTypes: ResultTypeRepository
  public readonly studentClasses: StudentClassRepository
  public readonly schoolYears: SchoolYearRepository
  public readonly evaluationResults: EvaluationResultRepository
  public readonly evaluationClasses: EvaluationClassRepository

  private constructor() {
    // Initialize all repositories with Supabase client
    this.auth = new AuthRepository(supabase)
    this.students = new StudentRepository(supabase)
    this.classes = new ClassRepository(supabase)
    this.evaluations = new EvaluationRepository(supabase)
    this.competencies = new CompetencyRepository(supabase)
    this.resultTypes = new ResultTypeRepository(supabase)
    this.studentClasses = new StudentClassRepository(supabase)
    this.schoolYears = new SchoolYearRepository(supabase)
    this.evaluationResults = new EvaluationResultRepository(supabase)
    this.evaluationClasses = new EvaluationClassRepository(supabase)
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  /**
   * Reset instance (useful for testing)
   */
  public static reset(): void {
    ServiceContainer.instance = null as any
  }
}

/**
 * Singleton instance - use this throughout the application
 */
export const serviceContainer = ServiceContainer.getInstance()

/**
 * Export for testing purposes
 */
export { ServiceContainer }
