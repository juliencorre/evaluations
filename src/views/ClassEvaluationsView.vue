<template>
  <div class="evaluations-page">
    <h1 class="visually-hidden">Évaluations de la classe</h1>

    <!-- Center-aligned App Bar -->
    <CenterAppBar
      v-if="!isLoading && classData"
      :title="`Évaluations - ${classData.name}`"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      @back="handleBack"
      @user-menu-click="handleUserMenuClick"
      @logout="handleLogout"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>Chargement des évaluations...</p>
    </div>

    <!-- Main Content -->
    <main v-else class="evaluations-content" role="main">
      <!-- No Evaluations State -->
      <div v-if="evaluations.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Aucune évaluation</h2>
        <p class="empty-state-description">
          Créez votre première évaluation pour cette classe avec le bouton ci-dessous.
        </p>
      </div>

      <!-- Evaluations List -->
      <div v-else class="evaluations-container">
        <ul class="md3-list" role="list">
          <li
            v-for="evaluation in evaluations"
            :key="evaluation.id"
            class="md3-list-item"
            role="listitem"
            @click="openEvaluation(evaluation.id)"
          >
            <div class="md3-list-item__leading">
              <div class="evaluation-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
            </div>

            <div class="md3-list-item__content">
              <div class="md3-list-item__headline">{{ evaluation.name }}</div>
              <div v-if="evaluation.description" class="md3-list-item__supporting-text">
                {{ evaluation.description }}
              </div>
              <div v-else class="md3-list-item__supporting-text placeholder">
                Aucune description
              </div>
            </div>

            <div class="md3-list-item__trailing">
              <div class="evaluation-date">{{ formatDate(evaluation.createdAt) }}</div>
              <svg class="trailing-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
              </svg>
            </div>
          </li>
        </ul>
      </div>

    </main>

    <!-- Menu FAB -->
    <MenuFAB
      v-if="!showModal && !isLoading"
      :menu-items="fabMenuItems"
      @menu-item-click="handleMenuItemClick"
    />

    <!-- Evaluation Modals -->
    <EvaluationModals
      :visible="showModal"
      :is-editing="isEditMode"
      :initial-data="currentEvaluationForm"
      :is-saving="isSaving"
      :framework-id="framework.id"
      @close="closeModal"
      @save="saveEvaluation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { useLogout } from '@/composables/useLogout'

// Components
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import MenuFAB from '@/components/common/MenuFAB.vue'
import EvaluationModals from '@/components/evaluations/EvaluationModals.vue'

// Stores
import { useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { useSchoolYearStore } from '@/stores/schoolYearStore'
import { useClassStore } from '@/stores/classStore'
import { supabaseEvaluationsService } from '@/services/supabaseEvaluationsService'

// Props
const props = defineProps<{
  id: string
}>()

const router = useRouter()
const competenciesStore = useCompetencyFrameworkStore()
const { framework, refreshFromSupabase } = competenciesStore

const evaluationStore = useEvaluationStore()
const schoolYearStore = useSchoolYearStore()
const classStore = useClassStore()

// State
const isLoading = ref(true)
interface EvaluationItem {
  id: string
  name: string
  description?: string
  createdAt: string
}

interface ClassData {
  id: string
  name: string
}

const isScrolled = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const isSaving = ref(false)
const evaluations = ref<EvaluationItem[]>([])
const classData = ref<ClassData | null>(null)

// Form data
const currentEvaluationForm = ref({
  name: '',
  description: '',
  frameworkId: framework.id,
  classIds: [props.id]
})

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  // Load competency framework
  await refreshFromSupabase()

  // Load class data
  await classStore.loadClasses()
  classData.value = classStore.classes.find(c => c.id === props.id) || null

  // Load evaluations for this class
  await schoolYearStore.ensureLoaded()
  const currentSchoolYearId = schoolYearStore.currentSchoolYear.value?.id
  const dbEvaluations = await supabaseEvaluationsService.getEvaluationsByClass(
    props.id,
    currentSchoolYearId
  )
  // Map to EvaluationItem format (created_at instead of createdAt)
  evaluations.value = dbEvaluations

  isLoading.value = false
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Navigation
const openEvaluation = (evaluationId: string) => {
  router.push(`/evaluation/${evaluationId}`)
}

// Event handlers
const handleBack = () => {
  router.push(`/classes/${props.id}`)
}

const handleUserMenuClick = () => {
  console.log('User menu clicked')
}

const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
}

const openAddModal = () => {
  isEditMode.value = false
  currentEvaluationForm.value = {
    name: '',
    description: '',
    frameworkId: framework.id,
    classIds: [props.id]
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
}

const saveEvaluation = async (evaluationData: { name: string; description: string; frameworkId: string }) => {
  isSaving.value = true
  try {
    // Create evaluation with this class
    await evaluationStore.addEvaluationWithClasses(
      {
        name: evaluationData.name,
        description: evaluationData.description,
        frameworkId: evaluationData.frameworkId,
        classId: props.id
      },
      [props.id],
      schoolYearStore.currentSchoolYear.value?.id
    )

    // Reload evaluations
    const dbEvaluations = await supabaseEvaluationsService.getEvaluationsByClass(
      props.id,
      schoolYearStore.currentSchoolYear.value?.id
    )
    evaluations.value = dbEvaluations

    closeModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'évaluation:', error)
    window.alert('Erreur lors de la sauvegarde de l\'évaluation')
  } finally {
    isSaving.value = false
  }
}

const handleMenuItemClick = (menuItem: { id?: string; key?: string }) => {
  if (menuItem.id === 'add' || menuItem.key === 'add') {
    openAddModal()
  }
}

const fabMenuItems = ref([
  {
    id: 'add',
    key: 'add',
    label: 'Nouvelle évaluation',
    icon: 'add',
    ariaLabel: 'Créer une nouvelle évaluation'
  }
])
</script>

<style scoped>
/* Base Page Layout */
.evaluations-page {
  min-height: 100vh;
  background: var(--neuro-bg-base);
  padding-bottom: 90px;
}

.evaluations-content {
  max-width: 840px;
  margin: 0 auto;
  padding: 80px 16px 16px;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--neuro-text-secondary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: var(--neuro-text-tertiary);
  opacity: 0.5;
}

.empty-state-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--neuro-text-primary);
  margin: 0 0 12px 0;
}

.empty-state-description {
  font-size: 16px;
  color: var(--neuro-text-secondary);
  margin: 0;
  max-width: 400px;
}

/* Evaluations Container */
.evaluations-container {
  background: var(--neuro-bg-base);
  border-radius: var(--neuro-radius-large);
  overflow: hidden;
}

/* MD3 List */
.md3-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.md3-list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--neuro-bg-dark);
  background: var(--neuro-bg-base);
}

.md3-list-item:hover {
  background: var(--neuro-bg-light);
  box-shadow: var(--neuro-shadow-raised);
}

.md3-list-item:active {
  box-shadow: var(--neuro-shadow-inset);
}

.md3-list-item:last-child {
  border-bottom: none;
}

.md3-list-item__leading {
  margin-right: 16px;
}

.evaluation-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neuro-accent-primary);
  color: white;
  border-radius: var(--neuro-radius-medium);
  box-shadow: var(--neuro-shadow-raised);
}

.evaluation-icon svg {
  width: 24px;
  height: 24px;
}

.md3-list-item__content {
  flex: 1;
  min-width: 0;
}

.md3-list-item__headline {
  font-size: 16px;
  font-weight: 500;
  color: var(--neuro-text-primary);
  margin-bottom: 4px;
}

.md3-list-item__supporting-text {
  font-size: 14px;
  color: var(--neuro-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md3-list-item__supporting-text.placeholder {
  font-style: italic;
  opacity: 0.7;
}

.md3-list-item__trailing {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.evaluation-date {
  font-size: 12px;
  color: var(--neuro-text-tertiary);
  white-space: nowrap;
}

.trailing-icon {
  width: 24px;
  height: 24px;
  color: var(--neuro-text-tertiary);
}

/* Responsive Design */
@media (max-width: 600px) {
  .evaluations-content {
    padding: 70px 8px 8px;
  }

  .md3-list-item {
    padding: 12px;
  }

  .evaluation-date {
    display: none;
  }
}

/* Visually Hidden */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>