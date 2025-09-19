<template>
  <main role="main" class="evaluations-page">
    <h1 class="visually-hidden">Tableau d'évaluation des compétences</h1>

    <!-- Center-aligned App Bar -->
    <CenterAppBar
      v-if="!isLoading && framework.domains.length > 0"
      :title="currentEvaluation.name || 'Évaluation'"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      @back="goBackToList"
      @help="handleHelp"
      @logout="handleLogout"
    />


    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>Chargement des compétences...</p>
    </div>

    <!-- Desktop Evaluation Table -->
    <EvaluationTable
      v-else-if="framework.domains.length > 0 && !isMobileView"
      :evaluation="currentEvaluation"
      :students="allStudents"
      :framework="framework"
    />

    <!-- Mobile Evaluation View -->
    <EvaluationMobileView
      v-else-if="framework.domains.length > 0 && isMobileView"
      :evaluation="currentEvaluation"
      :students="allStudents"
      :framework="framework"
    />

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>Aucune compétence disponible</p>
    </div>


  </main>
</template>

<script setup lang="ts">
import { ref, watch, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Define props for the evaluation ID
interface Props {
  id: string
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

// Components
const EvaluationTable = defineAsyncComponent({
  loader: () => import('@/components/EvaluationTable.vue'),
  loadingComponent: {
    template: '<div class="loading-placeholder">Chargement du tableau...</div>',
    style: 'padding: 2rem; text-align: center; color: #666;'
  },
  delay: 200,
  timeout: 5000
})

import CenterAppBar from '@/components/common/CenterAppBar.vue'
import EvaluationMobileView from '@/components/EvaluationMobileView.vue'

// Stores
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { useEvaluationStore } from '@/stores/evaluationStore'

const { allStudents } = useStudentsStore()
const competenciesStore = useCompetencyFrameworkStore()
const { framework, isCompetenciesLoading } = competenciesStore

const evaluationStore = useEvaluationStore()
const { currentEvaluation, setCurrentEvaluation, getEvaluationById, loadEvaluations } = evaluationStore

// State
const isLoading = isCompetenciesLoading
const isScrolled = ref(false)
const isMobileView = ref(false)

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

// Mobile detection
const checkMobileView = () => {
  isMobileView.value = window.innerWidth <= 768
}

const handleResize = () => {
  checkMobileView()
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  handleScroll()
  checkMobileView()

  // Load evaluations from database
  await loadEvaluations()

  // Load the specific evaluation based on the route parameter
  const evaluationId = props.id || route.params.id as string
  if (evaluationId) {
    const evaluation = getEvaluationById(evaluationId)
    if (evaluation) {
      console.log('📋 [HomeView] Loading evaluation:', evaluation.name)
      setCurrentEvaluation(evaluation)
    } else {
      console.error('❌ [HomeView] Evaluation not found:', evaluationId)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

// Event handlers
const handleUserMenuClick = () => {
  console.log('User menu clicked')
}

const handleHelp = () => {
  console.log('Help requested')
  window.alert('Aide - Fonctionnalité à venir')
}

const handleLogout = () => {
  console.log('Logout requested')
  window.alert('Déconnexion - Fonctionnalité à venir')
}

const goBackToList = () => {
  router.push('/evaluations')
}

// Debug logs
console.log('🏠 [HomeView] Initialisation avec framework:', {
  domains: framework.value.domains.length,
  frameworkName: framework.value.name,
  isLoading: isLoading.value
})
</script>

<style scoped>
.evaluations-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  color: var(--md-sys-color-on-surface-variant);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

main {
  height: calc(100vh - 60px);
  overflow: hidden;
  padding: 20px 20px 80px;
  box-sizing: border-box;
}
</style>