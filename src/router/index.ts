import { createRouter, createWebHistory } from 'vue-router'

// Define route constants for better maintainability
const ROUTE_NAMES = {
  HOME: 'home',
  EVALUATIONS: 'evaluations',
  EVALUATION_DETAIL: 'evaluation-detail',
  STUDENTS: 'students',
  COMPETENCIES: 'competencies',
  ANALYSIS: 'analysis',
  SETTINGS: 'settings'
} as const

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.HOME,
      redirect: '/evaluations'
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