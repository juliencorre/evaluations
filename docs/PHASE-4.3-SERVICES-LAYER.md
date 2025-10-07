# Phase 4.3: Services Layer - Repository Pattern

**Status**: ✅ Complete
**Date**: 2025-10-07
**Impact**: Clean architecture, dependency injection, testability

## Overview

Refactored the services layer from exported functions to a proper repository pattern with dependency injection, DTOs, and a service container. This provides better separation of concerns, testability, and maintainability.

## Problem Statement

The existing services were already implemented as classes (good!), but lacked:
- Formal repository pattern structure
- Data Transfer Objects (DTOs) for operations
- Centralized dependency injection
- Common base class for shared functionality
- Clear separation between data access and business logic

## Solution

Created a comprehensive repository architecture with:

### 1. [BaseRepository](../src/services/repositories/BaseRepository.ts)
**Purpose**: Common functionality for all repositories

```typescript
export abstract class BaseRepository {
  protected readonly supabase: SupabaseClient<Database>
  protected readonly entityName: string

  constructor(supabase: SupabaseClient<Database>, entityName: string) {
    this.supabase = supabase
    this.entityName = entityName
  }

  protected log(operation: string, data?: unknown): void {
    console.log(`[${this.entityName}Repository] ${operation}`, data || '')
  }

  protected logError(operation: string, error: unknown): void {
    console.error(`[${this.entityName}Repository] ${operation} failed:`, error)
  }

  protected handleError(operation: string, error: unknown): never {
    this.logError(operation, error)
    throw error
  }
}
```

**Benefits**:
- Consistent logging across all repositories
- Standardized error handling
- Dependency injection ready
- Easy to extend with new common functionality

### 2. Data Transfer Objects (DTOs)

Created focused DTOs for all operations:

**[student.dto.ts](../src/types/dtos/student.dto.ts)** (19 lines)
```typescript
export interface CreateStudentDTO {
  firstName: string
  lastName: string
  gender?: 'M' | 'F' | 'Autre' | null
  birthDate?: string | null
}

export interface UpdateStudentDTO {
  firstName?: string
  lastName?: string
  gender?: 'M' | 'F' | 'Autre' | null
  birthDate?: string | null
}

export interface BulkImportStudentDTO {
  firstName: string
  lastName: string
}
```

**[class.dto.ts](../src/types/dtos/class.dto.ts)** (26 lines)
```typescript
export interface CreateClassDTO {
  name: string
  description?: string
  schoolYear: string
  level?: string
  subject?: string
  active?: boolean
}

export interface UpdateClassDTO {
  name?: string
  description?: string
  schoolYear?: string
  level?: string
  subject?: string
  active?: boolean
}
```

**[evaluation.dto.ts](../src/types/dtos/evaluation.dto.ts)** (21 lines)
**[competency.dto.ts](../src/types/dtos/competency.dto.ts)** (53 lines)
**[result-type.dto.ts](../src/types/dtos/result-type.dto.ts)** (27 lines)

**Benefits**:
- Clear contracts for API operations
- Type safety for create/update operations
- Separation from domain models
- Easier to validate and transform data

### 3. Repository Implementations

**[StudentRepository](../src/services/repositories/StudentRepository.ts)** (230 lines)
```typescript
export class StudentRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'Student')
  }

  async findAll(): Promise<Student[]> { }
  async findById(id: string): Promise<Student | null> { }
  async create(dto: CreateStudentDTO): Promise<Student> { }
  async update(id: string, dto: UpdateStudentDTO): Promise<Student | null> { }
  async delete(id: string): Promise<boolean> { }
  async search(searchTerm: string): Promise<Student[]> { }
  async bulkImport(students: BulkImportStudentDTO[]): Promise<Student[]> { }
  subscribeToChanges(callback: (payload: unknown) => void) { }
}
```

**[ClassRepository](../src/services/repositories/ClassRepository.ts)** (211 lines)
```typescript
export class ClassRepository extends BaseRepository {
  async findAll(): Promise<Class[]> { }
  async findByUser(userId: string): Promise<Class[]> { }
  async findById(id: string): Promise<Class | null> { }
  async create(dto: CreateClassDTO): Promise<Class> { }
  async update(id: string, dto: UpdateClassDTO): Promise<Class> { }
  async delete(id: string): Promise<void> { }
  async addUser(dto: AddUserToClassDTO): Promise<UserClassRow> { }
  async removeUser(userId: string, classId: string): Promise<void> { }
  async getTeachers(classId: string): Promise<ClassTeacher[]> { }
}
```

**[EvaluationRepository](../src/services/repositories/EvaluationRepository.ts)** (165 lines)
```typescript
export class EvaluationRepository extends BaseRepository {
  async findAll(): Promise<Evaluation[]> { }
  async findById(id: string): Promise<Evaluation | null> { }
  async findByClass(classId: string, schoolYearId?: string): Promise<Evaluation[]> { }
  async findByClasses(classIds: string[]): Promise<Evaluation[]> { }
  async create(dto: CreateEvaluationDTO): Promise<Evaluation | null> { }
  async update(id: string, dto: UpdateEvaluationDTO): Promise<Evaluation | null> { }
  async delete(id: string): Promise<boolean> { }
}
```

**[CompetencyRepository](../src/services/repositories/CompetencyRepository.ts)** (418 lines)
```typescript
export class CompetencyRepository extends BaseRepository {
  // Framework operations
  async getOrCreateDefaultFramework(): Promise<CompetencyFramework> { }

  // Domain operations
  async findAllDomains(): Promise<Domain[]> { }
  async createDomain(dto: CreateDomainDTO): Promise<Domain> { }
  async updateDomain(domainId: string, dto: UpdateDomainDTO): Promise<Domain | null> { }
  async deleteDomain(domainId: string): Promise<void> { }

  // Field operations
  async createField(dto: CreateFieldDTO): Promise<Field> { }
  async updateField(fieldId: string, dto: UpdateFieldDTO): Promise<Field | null> { }
  async deleteField(fieldId: string): Promise<void> { }

  // Competency operations
  async createCompetency(dto: CreateCompetencyDTO): Promise<Competency> { }
  async updateCompetency(competencyId: string, dto: UpdateCompetencyDTO): Promise<Competency | null> { }
  async deleteCompetency(competencyId: string): Promise<void> { }

  // Specific competency operations
  async createSpecificCompetency(dto: CreateSpecificCompetencyDTO): Promise<SpecificCompetency> { }
  async updateSpecificCompetency(id: string, dto: UpdateSpecificCompetencyDTO): Promise<SpecificCompetency | null> { }
  async deleteSpecificCompetency(specificCompetencyId: string): Promise<void> { }
}
```

**[ResultTypeRepository](../src/services/repositories/ResultTypeRepository.ts)** (170 lines)
```typescript
export class ResultTypeRepository extends BaseRepository {
  async findAll(): Promise<ResultTypeConfig[]> { }
  async findById(id: string): Promise<ResultTypeConfig | null> { }
  async create(dto: CreateResultTypeDTO): Promise<ResultTypeConfig | null> { }
  async update(id: string, dto: UpdateResultTypeDTO): Promise<ResultTypeConfig | null> { }
  async delete(id: string): Promise<boolean> { }
}
```

### 4. [Service Container](../src/services/ServiceContainer.ts)

**Purpose**: Centralized dependency injection

```typescript
class ServiceContainer {
  private static instance: ServiceContainer

  public readonly students: StudentRepository
  public readonly classes: ClassRepository
  public readonly evaluations: EvaluationRepository
  public readonly competencies: CompetencyRepository
  public readonly resultTypes: ResultTypeRepository

  private constructor() {
    this.students = new StudentRepository(supabase)
    this.classes = new ClassRepository(supabase)
    this.evaluations = new EvaluationRepository(supabase)
    this.competencies = new CompetencyRepository(supabase)
    this.resultTypes = new ResultTypeRepository(supabase)
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }
}

export const serviceContainer = ServiceContainer.getInstance()
```

**Benefits**:
- Singleton pattern for repositories
- Easy to mock for testing
- Centralized configuration
- Type-safe access to all repositories

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Application Layer                    │
│                (Components, Stores, Views)               │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Uses
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Container                      │
│              serviceContainer.students                   │
│              serviceContainer.classes                    │
│              serviceContainer.evaluations                │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Injects
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Repositories                         │
│   ┌───────────────────────────────────────────────┐    │
│   │           BaseRepository                       │    │
│   │  - log(), logError(), handleError()           │    │
│   └───────────────────────────────────────────────┘    │
│                     │ Extends                           │
│                     ▼                                    │
│   ┌───────────┬────────────┬─────────────┬──────────┐  │
│   │ Student   │ Class      │ Evaluation  │ Result   │  │
│   │ Repository│ Repository │ Repository  │ Type     │  │
│   └───────────┴────────────┴─────────────┴──────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Uses DTOs
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Transfer Objects                 │
│   CreateStudentDTO, UpdateStudentDTO, etc.              │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Maps to/from
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Domain Models                        │
│   Student, Class, Evaluation, Competency, etc.          │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Persisted via
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
└─────────────────────────────────────────────────────────┘
```

## Usage Examples

### Before (Exported Functions/Static Methods)
```typescript
// Old pattern - exported singleton
import { supabaseStudentsService } from '@/services/supabaseStudentsService'

const students = await supabaseStudentsService.getAllStudents()
await supabaseStudentsService.createStudent('John', 'Doe', 'M', null)
```

### After (Repository Pattern with DI)
```typescript
// New pattern - service container
import { serviceContainer } from '@/services/ServiceContainer'

// Cleaner API with DTOs
const students = await serviceContainer.students.findAll()
const newStudent = await serviceContainer.students.create({
  firstName: 'John',
  lastName: 'Doe',
  gender: 'M',
  birthDate: null
})

// Type-safe updates
await serviceContainer.students.update(student.id, {
  firstName: 'Jane' // Only firstName updated
})
```

### Advanced Examples

**Creating a Class with Users**
```typescript
import { serviceContainer } from '@/services/ServiceContainer'

// Create class
const newClass = await serviceContainer.classes.create({
  name: 'CE2 A',
  schoolYear: '2024-2025',
  level: 'CE2',
  subject: 'Général'
})

// Add teacher
await serviceContainer.classes.addUser({
  userId: currentUser.id,
  classId: newClass.id,
  role: 'owner'
})

// Get all teachers
const teachers = await serviceContainer.classes.getTeachers(newClass.id)
```

**Working with Competencies**
```typescript
import { serviceContainer } from '@/services/ServiceContainer'

// Get all domains with full hierarchy
const domains = await serviceContainer.competencies.findAllDomains()

// Create new domain
const domain = await serviceContainer.competencies.createDomain({
  name: 'Mathématiques',
  description: 'Compétences mathématiques'
})

// Create field in domain
const field = await serviceContainer.competencies.createField({
  domainId: domain.id,
  name: 'Nombres et calculs',
  description: 'Travail sur les nombres'
})

// Create competency in field
const competency = await serviceContainer.competencies.createCompetency({
  fieldId: field.id,
  name: 'Compter jusqu\'à 100',
  description: 'Maîtriser la suite numérique'
})

// Create specific competency
const specificComp = await serviceContainer.competencies.createSpecificCompetency({
  competencyId: competency.id,
  name: 'Compter de 0 à 50',
  description: 'Suite numérique 0-50',
  resultTypeConfigId: scaleResultTypeId
})
```

**Managing Evaluations**
```typescript
import { serviceContainer } from '@/services/ServiceContainer'

// Create evaluation
const evaluation = await serviceContainer.evaluations.create({
  name: 'Évaluation Trimestre 1',
  description: 'Première évaluation de l\'année',
  frameworkId: framework.id
})

// Get evaluations for specific class
const classEvaluations = await serviceContainer.evaluations.findByClass(
  classId,
  schoolYearId // optional
)

// Update evaluation
await serviceContainer.evaluations.update(evaluation.id, {
  name: 'Évaluation T1 (modifiée)'
})
```

## Benefits

### 1. Testability
```typescript
// Easy to mock for unit tests
import { ServiceContainer } from '@/services/ServiceContainer'

describe('StudentStore', () => {
  let mockStudentRepo: jest.Mocked<StudentRepository>

  beforeEach(() => {
    mockStudentRepo = {
      findAll: jest.fn().mockResolvedValue([...]),
      create: jest.fn().mockResolvedValue({...})
    } as any

    // Inject mock
    ServiceContainer.getInstance = () => ({
      students: mockStudentRepo
    } as any)
  })
})
```

### 2. Dependency Injection
- Single source of truth for repository instances
- Easy to swap implementations (e.g., for testing, different backends)
- Centralized configuration

### 3. Type Safety
- DTOs provide clear contracts
- Strong typing throughout the stack
- IntelliSense support for all operations

### 4. Separation of Concerns
- Repositories handle data access
- DTOs handle data transfer
- Domain models represent business entities
- Services/stores handle business logic

### 5. Consistency
- Common error handling
- Standardized logging
- Uniform API patterns across all repositories

### 6. Maintainability
- Easy to add new repositories
- Shared functionality in BaseRepository
- Clear file structure

## File Structure

```
src/
├── types/
│   └── dtos/
│       ├── student.dto.ts (19 lines)
│       ├── class.dto.ts (26 lines)
│       ├── evaluation.dto.ts (21 lines)
│       ├── competency.dto.ts (53 lines)
│       ├── result-type.dto.ts (27 lines)
│       └── index.ts (barrel export)
│
├── services/
│   ├── repositories/
│   │   ├── BaseRepository.ts (38 lines)
│   │   ├── StudentRepository.ts (230 lines)
│   │   ├── ClassRepository.ts (211 lines)
│   │   ├── EvaluationRepository.ts (165 lines)
│   │   ├── CompetencyRepository.ts (418 lines)
│   │   ├── ResultTypeRepository.ts (170 lines)
│   │   └── index.ts (barrel export)
│   │
│   └── ServiceContainer.ts (58 lines)
│
└── [existing services remain for backward compatibility]
```

## Migration Strategy

### Phase 1: Parallel Operation (Current)
- New repositories exist alongside old services
- Both patterns work simultaneously
- No breaking changes

### Phase 2: Gradual Migration (Future)
```typescript
// Update stores to use new pattern
import { serviceContainer } from '@/services/ServiceContainer'

// Example: StudentsStore
export const useStudentsStore = defineStore('students', () => {
  const students = ref<Student[]>([])

  async function loadStudents() {
    // Old: students.value = await supabaseStudentsService.getAllStudents()
    // New:
    students.value = await serviceContainer.students.findAll()
  }

  async function createStudent(data: CreateStudentDTO) {
    // Old: await supabaseStudentsService.createStudent(...)
    // New:
    const newStudent = await serviceContainer.students.create(data)
    students.value.push(newStudent)
  }

  return { students, loadStudents, createStudent }
})
```

### Phase 3: Deprecation (Future)
- Mark old services as deprecated
- Update all stores/components
- Remove old services

## Performance Considerations

- **Singleton Pattern**: ServiceContainer ensures only one instance of each repository
- **No overhead**: Repository pattern adds minimal abstraction
- **Same Supabase Client**: All repositories use the same Supabase client instance
- **Lazy Initialization**: Repositories initialized once on first ServiceContainer access

## Testing Strategy

```typescript
// Unit Test Example
import { StudentRepository } from '@/services/repositories'
import { createClient } from '@supabase/supabase-js'

describe('StudentRepository', () => {
  let repository: StudentRepository
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn()
      }))
    }

    repository = new StudentRepository(mockSupabase)
  })

  it('should find all students', async () => {
    mockSupabase.from().single.mockResolvedValue({
      data: [
        { id: '1', first_name: 'John', last_name: 'Doe', ... }
      ],
      error: null
    })

    const students = await repository.findAll()

    expect(students).toHaveLength(1)
    expect(students[0].firstName).toBe('John')
  })
})
```

## Conclusion

Phase 4.3 successfully implemented a clean repository pattern with:
- ✅ 5 repository classes extending BaseRepository
- ✅ 5 DTO modules with 14+ DTO types
- ✅ Service container with dependency injection
- ✅ Backward compatibility maintained
- ✅ Type-safe, testable, maintainable architecture

The new architecture provides a solid foundation for future development while maintaining all existing functionality.
