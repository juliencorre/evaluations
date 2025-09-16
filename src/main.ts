import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import './registerSW'
import { studentsService } from './services/studentsService'
import type { StudentsServiceMessage, StudentsServiceResponse } from './services/studentsService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue')
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('./views/StudentsView.vue')
    },
    {
      path: '/competencies',
      name: 'competencies',
      component: () => import('./views/CompetenciesView.vue')
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('./views/AnalysisView.vue')
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')

// Gestionnaire pour les messages du service worker vers le service des élèves
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { data } = event

    // Traiter les messages du service worker pour les élèves
    if (data?.type === 'SW_TO_MAIN_STUDENTS_REQUEST') {
      const message: StudentsServiceMessage = data.payload

      try {
        // Traiter le message avec le service des élèves
        const response = studentsService.handleMessage(message)

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
