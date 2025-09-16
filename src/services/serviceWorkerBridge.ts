import type { StudentsServiceMessage, StudentsServiceResponse } from './studentsService'
import type { Student } from '@/types/evaluation'

/**
 * Bridge pour communiquer avec le service worker pour les opérations sur les élèves
 */
export class ServiceWorkerBridge {
  private serviceWorker: ServiceWorker | null = null
  private pendingRequests = new Map<string, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: (value: any) => void
    reject: (error: Error) => void
  }>()

  constructor() {
    this.initServiceWorker()
    this.setupMessageHandler()
  }

  private async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        this.serviceWorker = registration.active
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du service worker:', error)
      }
    }
  }

  async waitForServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker non supporté')
    }

    // Attendre que le service worker soit prêt
    const registration = await navigator.serviceWorker.ready
    this.serviceWorker = registration.active

    if (!this.serviceWorker) {
      throw new Error('Service Worker non disponible')
    }
  }

  private setupMessageHandler() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const response: StudentsServiceResponse = event.data

        if (response.type === 'STUDENTS_RESPONSE' && response.requestId) {
          const pending = this.pendingRequests.get(response.requestId)
          if (pending) {
            this.pendingRequests.delete(response.requestId)

            if (response.payload.success) {
              pending.resolve(response.payload.data)
            } else {
              pending.reject(new Error(response.payload.error || 'Erreur inconnue'))
            }
          }
        }
      })
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendMessage<T>(message: StudentsServiceMessage): Promise<T> {
    // S'assurer que le service worker est disponible
    if (!this.serviceWorker) {
      await this.waitForServiceWorker()
    }

    if (!this.serviceWorker) {
      throw new Error('Service Worker non disponible')
    }

    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId()
      const messageWithId = { ...message, requestId }

      // Stocker la promesse
      this.pendingRequests.set(requestId, { resolve, reject })

      // Timeout pour éviter les promesses pendantes
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId)
          reject(new Error('Timeout: Pas de réponse du service worker'))
        }
      }, 10000) // 10 secondes

      // Envoyer le message
      this.serviceWorker!.postMessage(messageWithId)
    })
  }

  /**
   * API publique pour les opérations sur les élèves via le service worker
   */

  async getAllStudents(): Promise<Student[]> {
    return this.sendMessage<Student[]>({
      type: 'GET_STUDENTS'
    })
  }

  async addStudent(firstName: string, lastName: string): Promise<Student> {
    return this.sendMessage<Student>({
      type: 'ADD_STUDENT',
      payload: { firstName, lastName }
    })
  }

  async updateStudent(studentId: string, updates: { firstName?: string; lastName?: string }): Promise<Student | null> {
    return this.sendMessage<Student | null>({
      type: 'UPDATE_STUDENT',
      payload: { studentId, updates }
    })
  }

  async deleteStudent(studentId: string): Promise<Student | null> {
    return this.sendMessage<Student | null>({
      type: 'DELETE_STUDENT',
      payload: { studentId }
    })
  }

  async resetStudents(): Promise<Student[]> {
    return this.sendMessage<Student[]>({
      type: 'RESET_STUDENTS'
    })
  }
}

// Instance singleton
export const serviceWorkerBridge = new ServiceWorkerBridge()