import { createRouter, createWebHistory } from 'vue-router'

// Define route constants for better maintainability
const ROUTE_NAMES = {
  HOME: 'home',
  WELCOME: 'welcome',
  EVALUATIONS: 'evaluations',
  EVALUATION_DETAIL: 'evaluation-detail',
  EVALUATION_EDIT: 'evaluation-edit',
  STUDENTS: 'students',
  COMPETENCIES: 'competencies',
  TYPES: 'types',
  ANALYSIS: 'analysis',
  SETTINGS: 'settings'
} as const

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.HOME,
      redirect: '/welcome'
    },
    {
      path: '/welcome',
      name: ROUTE_NAMES.WELCOME,
      component: () => import(/* webpackChunkName: "welcome" */ '../views/WelcomeView.vue'),
      meta: {
        title: 'Accueil',
        description: 'Page d\'accueil de l\'application Évaluations',
        preload: true
      }
    },
    {
      path: '/evaluations',
      name: ROUTE_NAMES.EVALUATIONS,
      component: () => import(/* webpackChunkName: "evaluations" */ '../views/EvaluationListView.vue'),
      meta: {
        title: 'Évaluations',
        description: 'Liste des évaluations disponibles',
        preload: true
      }
    },
    {
      path: '/evaluation/:id',
      name: ROUTE_NAMES.EVALUATION_DETAIL,
      component: () => import(/* webpackChunkName: "evaluation-detail" */ '../views/HomeView.vue'),
      props: true,
      meta: {
        title: 'Évaluation',
        description: 'Tableau d\'évaluation des compétences'
      }
    },
    {
      path: '/evaluation/:id/edit',
      name: ROUTE_NAMES.EVALUATION_EDIT,
      component: () => import(/* webpackChunkName: "evaluation-edit" */ '../views/EvaluationEditView.vue'),
      props: true,
      meta: {
        title: 'Édition d\'évaluation',
        description: 'Modifier les paramètres de l\'évaluation'
      }
    },
    {
      path: '/students',
      name: ROUTE_NAMES.STUDENTS,
      component: () => import(/* webpackChunkName: "students" */ '../views/StudentsView.vue'),
      meta: {
        title: 'Élèves',
        description: 'Gérer la liste des élèves de la classe'
      }
    },
    {
      path: '/competencies',
      name: ROUTE_NAMES.COMPETENCIES,
      component: () => import(/* webpackChunkName: "competencies" */ '../views/CompetenciesView.vue'),
      meta: {
        title: 'Compétences',
        description: 'Référentiels de compétences'
      }
    },
    {
      path: '/types',
      name: ROUTE_NAMES.TYPES,
      component: () => import(/* webpackChunkName: "types" */ '../views/ResultTypesView.vue'),
      meta: {
        title: 'Types de résultats',
        description: 'Configuration des types de résultats'
      }
    },
    {
      path: '/analysis',
      name: ROUTE_NAMES.ANALYSIS,
      component: () => import(/* webpackChunkName: "analysis" */ '../views/AnalysisView.vue'),
      meta: {
        title: 'Analyse',
        description: 'Analyse des résultats'
      }
    },
    {
      path: '/settings',
      name: ROUTE_NAMES.SETTINGS,
      component: () => import(/* webpackChunkName: "settings" */ '../views/SettingsView.vue'),
      meta: {
        title: 'Paramètres',
        description: 'Personnalisez votre expérience de navigation'
      }
    }
  ]
})

// Add route guards for performance optimization
router.beforeEach((to, _from, next) => {
  // Set document title based on route meta
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Évaluations`
  }
  next()
})

// Preload critical routes on app initialization
export const preloadCriticalRoutes = () => {
  // Preload the students route as it's commonly accessed after home
  import(/* webpackChunkName: "students" */ '../views/StudentsView.vue')
}

export { router, ROUTE_NAMES }