import type { Student } from '@/types/evaluation'
import { useStudentsStore } from '@/stores'

// Interface pour la communication avec le service worker
export interface StudentsServiceMessage {
  type: 'GET_STUDENTS' | 'ADD_STUDENT' | 'UPDATE_STUDENT' | 'DELETE_STUDENT' | 'RESET_STUDENTS'
  payload?: unknown
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
    return this.studentsStore.allStudents
  }

  /**
   * Ajoute un nouvel élève
   */
  async addStudent(studentData: { firstName: string; lastName: string }): Promise<Student> {
    return await this.studentsStore.addStudent(studentData)
  }

  /**
   * Met à jour un élève existant
   */
  async updateStudent(studentId: string, updates: { firstName?: string; lastName?: string }): Promise<Student | null> {
    return await this.studentsStore.updateStudent(studentId, updates)
  }

  /**
   * Supprime un élève
   */
  async deleteStudent(studentId: string): Promise<Student | null> {
    return await this.studentsStore.deleteStudent(studentId)
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
  async handleMessage(message: StudentsServiceMessage): Promise<StudentsServiceResponse> {
    const { type, payload, requestId = '' } = message

    try {
      let data: Student[] | Student | null = null

      switch (type) {
        case 'GET_STUDENTS':
          data = this.getAllStudents()
          break

        case 'ADD_STUDENT':
          if (payload && typeof payload === 'object' && 'firstName' in payload && 'lastName' in payload) {
            data = await this.addStudent(payload as { firstName: string; lastName: string })
          } else {
            throw new Error('firstName et lastName sont requis')
          }
          break

        case 'UPDATE_STUDENT':
          if (payload && typeof payload === 'object' && 'studentId' in payload) {
            const updatePayload = payload as { studentId: string; updates?: { firstName?: string; lastName?: string } }
            data = await this.updateStudent(updatePayload.studentId, updatePayload.updates || {})
          } else {
            throw new Error('studentId est requis')
          }
          break

        case 'DELETE_STUDENT':
          if (payload && typeof payload === 'object' && 'studentId' in payload) {
            const deletePayload = payload as { studentId: string }
            data = await this.deleteStudent(deletePayload.studentId)
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