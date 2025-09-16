import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { createHandlerBoundToURL } from 'workbox-precaching'
import { CacheFirst } from 'workbox-strategies'
import { clientsClaim } from 'workbox-core'
import type { StudentsServiceMessage, StudentsServiceResponse } from '@/services/studentsService'

declare const self: ServiceWorkerGlobalScope

// Auto-update behavior
self.skipWaiting()
clientsClaim()

// Precache files
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Navigation fallback
const navigationRoute = new NavigationRoute(
  createHandlerBoundToURL('/index.html'),
  {
    denylist: [/^\/api/]
  }
)
registerRoute(navigationRoute)

// Google Fonts caching
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => request.url
      }
    ]
  }),
  'GET'
)

/**
 * Communication avec le service StudentsService
 * Le service worker agit comme proxy vers le service principal
 */

// Le service worker ne peut pas importer directement les modules Vue
// Il communique avec le thread principal via messages

/**
 * Gestionnaire des messages pour les opérations sur les élèves
 */
self.addEventListener('message', async (event) => {
  const { data } = event

  // Vérifier si c'est un message pour le service des élèves
  if (data?.type?.startsWith('STUDENTS_')) {
    try {
      // Envoyer le message au thread principal pour traitement
      const clients = await self.clients.matchAll({ type: 'window' })

      if (clients.length > 0) {
        // Envoyer au premier client disponible
        const client = clients[0]

        // Créer un ID unique pour la requête
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Préparer le message avec l'ID de requête
        const messageWithId: StudentsServiceMessage = {
          ...data,
          requestId
        }

        // Stocker la référence du port pour la réponse
        const responsePort = event.ports?.[0]

        // Créer un gestionnaire temporaire pour la réponse
        const handleResponse = (responseEvent: ExtendableMessageEvent) => {
          const responseData: StudentsServiceResponse = responseEvent.data

          if (responseData.requestId === requestId && responseData.type === 'STUDENTS_RESPONSE') {
            // Retirer le gestionnaire
            self.removeEventListener('message', handleResponse)

            // Envoyer la réponse via le port ou directement au client
            if (responsePort) {
              responsePort.postMessage(responseData)
            } else {
              event.source?.postMessage(responseData)
            }
          }
        }

        // Ajouter le gestionnaire temporaire
        self.addEventListener('message', handleResponse)

        // Envoyer le message au thread principal
        client.postMessage({
          type: 'SW_TO_MAIN_STUDENTS_REQUEST',
          payload: messageWithId
        })

      } else {
        // Aucun client disponible, retourner une erreur
        const errorResponse: StudentsServiceResponse = {
          type: 'STUDENTS_RESPONSE',
          payload: {
            data: null,
            success: false,
            error: 'Aucun client disponible pour traiter la requête'
          },
          requestId: data.requestId || ''
        }

        const responsePort = event.ports?.[0]
        if (responsePort) {
          responsePort.postMessage(errorResponse)
        } else {
          event.source?.postMessage(errorResponse)
        }
      }
    } catch (error) {
      console.error('Erreur dans le service worker:', error)

      const errorResponse: StudentsServiceResponse = {
        type: 'STUDENTS_RESPONSE',
        payload: {
          data: null,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        requestId: data.requestId || ''
      }

      const responsePort = event.ports?.[0]
      if (responsePort) {
        responsePort.postMessage(errorResponse)
      } else {
        event.source?.postMessage(errorResponse)
      }
    }
  }
})

// Note: Dans un vrai service worker, on n'exporterait pas d'API
// car les service workers communiquent uniquement via messages
// Cette partie est commentée car non utilisable dans le contexte d'un service worker

/*
export const StudentsAPI = {
  // API non disponible dans le contexte service worker
  // La communication se fait via postMessage uniquement
}
*/