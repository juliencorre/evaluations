import type { Student } from '@/types/evaluation'
import { useStudentsStore } from '@/stores/studentsStore'

// Interface pour la communication avec le service worker
export interface StudentsServiceMessage {
  type: 'GET_STUDENTS' | 'ADD_STUDENT' | 'UPDATE_STUDENT' | 'DELETE_STUDENT' | 'RESET_STUDENTS'
  payload?: any
  requestId?: string
}

export interface StudentsServiceResponse {
  type: 'STUDENTS_RESPONSE'
  payload: {
    data: Student[] | Student | null
    success: boolean
    error?: string
  }
  requestId: string
}

/**
 * Service pour la gestion des élèves
 * Interface entre le store et le service worker
 */
export class StudentsService {
  private studentsStore = useStudentsStore()

  /**
   * Récupère tous les élèves du store
   */
  getAllStudents(): Student[] {
    return this.studentsStore.allStudents.value
  }

  /**
   * Ajoute un nouvel élève
   */
  addStudent(studentData: { firstName: string; lastName: string }): Student {
    return this.studentsStore.addStudent(studentData)
  }

  /**
   * Met à jour un élève existant
   */
  updateStudent(studentId: string, updates: { firstName?: string; lastName?: string }): Student | null {
    return this.studentsStore.updateStudent(studentId, updates)
  }

  /**
   * Supprime un élève
   */
  deleteStudent(studentId: string): Student | null {
    return this.studentsStore.deleteStudent(studentId)
  }

  /**
   * Récupère un élève par son ID
   */
  getStudentById(studentId: string): Student | null {
    return this.studentsStore.getStudentById(studentId)
  }

  /**
   * Remet les élèves à leur état initial
   */
  resetStudents(): void {
    this.studentsStore.resetStudents()
  }

  /**
   * Traite les messages venant du service worker
   */
  handleMessage(message: StudentsServiceMessage): StudentsServiceResponse {
    const { type, payload, requestId = '' } = message

    try {
      let data: Student[] | Student | null = null

      switch (type) {
        case 'GET_STUDENTS':
          data = this.getAllStudents()
          break

        case 'ADD_STUDENT':
          if (payload?.firstName && payload?.lastName) {
            data = this.addStudent(payload)
          } else {
            throw new Error('firstName et lastName sont requis')
          }
          break

        case 'UPDATE_STUDENT':
          if (payload?.studentId) {
            data = this.updateStudent(payload.studentId, payload.updates || {})
          } else {
            throw new Error('studentId est requis')
          }
          break

        case 'DELETE_STUDENT':
          if (payload?.studentId) {
            data = this.deleteStudent(payload.studentId)
          } else {
            throw new Error('studentId est requis')
          }
          break

        case 'RESET_STUDENTS':
          this.resetStudents()
          data = this.getAllStudents()
          break

        default:
          throw new Error(`Type de message non supporté: ${type}`)
      }

      return {
        type: 'STUDENTS_RESPONSE',
        payload: {
          data,
          success: true
        },
        requestId
      }
    } catch (error) {
      return {
        type: 'STUDENTS_RESPONSE',
        payload: {
          data: null,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        requestId
      }
    }
  }
}

// Instance singleton du service
export const studentsService = new StudentsService()