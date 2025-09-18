// Service Worker message handling - separated for better code splitting
import type { StudentsServiceMessage, StudentsServiceResponse } from '../services/studentsService'

// Lazy load the students service only when needed
let studentsService: any = null

const loadStudentsService = async () => {
  if (!studentsService) {
    const module = await import('../services/studentsService')
    studentsService = module.studentsService
  }
  return studentsService
}

export const initializeServiceWorkerHandler = () => {
  // Only initialize if service worker is supported
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.addEventListener('message', async (event) => {
    const { data } = event

    // Traiter les messages du service worker pour les élèves
    if (data?.type === 'SW_TO_MAIN_STUDENTS_REQUEST') {
      const message: StudentsServiceMessage = data.payload

      try {
        // Lazy load the service only when needed
        const service = await loadStudentsService()
        const response = await service.handleMessage(message)

        // Renvoyer la réponse au service worker
        if (event.source) {
          (event.source as ServiceWorker).postMessage(response)
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message du service worker:', error)

        // Envoyer une réponse d'erreur
        const errorResponse: StudentsServiceResponse = {
          type: 'STUDENTS_RESPONSE',
          payload: {
            data: null,
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          },
          requestId: message.requestId || ''
        }

        if (event.source) {
          (event.source as ServiceWorker).postMessage(errorResponse)
        }
      }
    }
  })
}