import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore, isAuthenticated } from '@/stores/authStore'
import { ROUTE_NAMES } from './route-names'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.HOME,
      redirect: '/welcome',
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/auth',
      name: ROUTE_NAMES.AUTH,
      component: () => import(/* webpackChunkName: "auth" */ '../views/AuthView.vue'),
      meta: {
        title: 'Connexion',
        description: 'Identifiez-vous pour accéder à l\'application Évaluations',
        requiresAuth: false,
        guestOnly: true
      }
    },
    {
      path: '/auth/callback',
      name: ROUTE_NAMES.AUTH_CALLBACK,
      component: () => import(/* webpackChunkName: "auth-callback" */ '../views/AuthCallbackView.vue'),
      meta: {
        title: 'Connexion en cours',
        description: 'Finalisation du processus de connexion sécurisée',
        requiresAuth: false
      }
    },
    {
      path: '/welcome',
      name: ROUTE_NAMES.WELCOME,
      component: () => import(/* webpackChunkName: "welcome" */ '../views/WelcomeView.vue'),
      meta: {
        title: 'Accueil',
        description: 'Page d\'accueil de l\'application Évaluations',
        preload: true,
        requiresAuth: true
      }
    },
    {
      path: '/evaluations',
      name: ROUTE_NAMES.EVALUATIONS,
      component: () => import(/* webpackChunkName: "evaluations" */ '../views/EvaluationListView.vue'),
      meta: {
        title: 'Évaluations',
        description: 'Liste des évaluations disponibles',
        preload: true,
        requiresAuth: true
      }
    },
    {
      path: '/evaluation/:id',
      name: ROUTE_NAMES.EVALUATION_DETAIL,
      component: () => import(/* webpackChunkName: "evaluation-detail" */ '../views/HomeView.vue'),
      props: true,
      meta: {
        title: 'Évaluation',
        description: 'Tableau d\'évaluation des compétences',
        requiresAuth: true
      }
    },
    {
      path: '/evaluation/:id/edit',
      name: ROUTE_NAMES.EVALUATION_EDIT,
      component: () => import(/* webpackChunkName: "evaluation-edit" */ '../views/EvaluationEditView.vue'),
      props: true,
      meta: {
        title: 'Édition d\'évaluation',
        description: 'Modifier les paramètres de l\'évaluation',
        requiresAuth: true
      }
    },
    {
      path: '/students',
      name: ROUTE_NAMES.STUDENTS,
      component: () => import(/* webpackChunkName: "students" */ '../views/StudentsView.vue'),
      meta: {
        title: 'Élèves',
        description: 'Gérer la liste des élèves de la classe',
        requiresAuth: true
      }
    },
    {
      path: '/competencies',
      name: ROUTE_NAMES.COMPETENCIES,
      component: () => import(/* webpackChunkName: "competencies" */ '../views/CompetenciesView.vue'),
      meta: {
        title: 'Compétences',
        description: 'Référentiels de compétences',
        requiresAuth: true
      }
    },
    {
      path: '/types',
      name: ROUTE_NAMES.TYPES,
      component: () => import(/* webpackChunkName: "types" */ '../views/ResultTypesView.vue'),
      meta: {
        title: 'Types de résultats',
        description: 'Configuration des types de résultats',
        requiresAuth: true
      }
    },
    {
      path: '/analysis',
      name: ROUTE_NAMES.ANALYSIS,
      component: () => import(/* webpackChunkName: "analysis" */ '../views/AnalysisView.vue'),
      meta: {
        title: 'Analyse',
        description: 'Analyse des résultats',
        requiresAuth: true
      }
    },
    {
      path: '/settings',
      name: ROUTE_NAMES.SETTINGS,
      component: () => import(/* webpackChunkName: "settings" */ '../views/SettingsView.vue'),
      meta: {
        title: 'Paramètres',
        description: 'Personnalisez votre expérience de navigation',
        requiresAuth: true
      }
    }
  ]
})

const sanitizeRedirectPath = (value: unknown) => {
  if (typeof value === 'string' && value.startsWith('/')) {
    return value
  }
  return '/welcome'
}

// Add route guards for performance optimization
router.beforeEach(async (to, _from, next) => {
  // Set document title based on route meta
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Évaluations`
  }

  const store = useAuthStore()
  await store.ensureInitialized()

  const authStatus = isAuthenticated.value
  const requiresAuth = to.meta?.requiresAuth !== false
  const guestOnly = Boolean(to.meta?.guestOnly)

  if (requiresAuth && !authStatus) {
    const redirect = sanitizeRedirectPath(to.fullPath)
    next({
      name: ROUTE_NAMES.AUTH,
      query: { redirect }
    })
    return
  }

  if (guestOnly && authStatus) {
    const redirect = sanitizeRedirectPath(to.query.redirect)
    next(redirect)
    return
  }

  next()
})

// Preload critical routes on app initialization
export const preloadCriticalRoutes = () => {
  // Preload the students route as it's commonly accessed after home
  import(/* webpackChunkName: "students" */ '../views/StudentsView.vue')
}

export { router, ROUTE_NAMES }
