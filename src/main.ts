import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

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
