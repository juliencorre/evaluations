/**
 * Data Transfer Objects (DTOs) Barrel Export
 * Centralized export for all DTOs used in the application
 */

// Student DTOs
export type {
  CreateStudentDTO,
  UpdateStudentDTO,
  BulkImportStudentDTO
} from './student.dto'

// Class DTOs
export type {
  CreateClassDTO,
  UpdateClassDTO,
  AddUserToClassDTO
} from './class.dto'

// Evaluation DTOs
export type {
  CreateEvaluationDTO,
  UpdateEvaluationDTO
} from './evaluation.dto'

// Competency DTOs
export type {
  CreateDomainDTO,
  UpdateDomainDTO,
  CreateFieldDTO,
  UpdateFieldDTO,
  CreateCompetencyDTO,
  UpdateCompetencyDTO,
  CreateSpecificCompetencyDTO,
  UpdateSpecificCompetencyDTO
} from './competency.dto'

// ResultType DTOs
export type {
  CreateResultTypeDTO,
  UpdateResultTypeDTO
} from './result-type.dto'

// School Year DTOs (added)
export type {
  CreateSchoolYearDTO,
  UpdateSchoolYearDTO
} from './schoolYear.dtos'
