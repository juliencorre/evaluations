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
      <!-- Evaluations Section -->
      <section class="evaluations-section">
        <div class="section-header">
          <h2 class="section-title">
            Évaluations de la classe
            <span class="evaluations-count">({{ evaluations.length }})</span>
          </h2>
        </div>

        <!-- No Evaluations State -->
        <div v-if="evaluations.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h3 class="empty-state-title">Aucune évaluation</h3>
          <p class="empty-state-description">
            Créez votre première évaluation pour cette classe avec le bouton ci-dessous.
          </p>
        </div>

        <!-- Evaluations Grid -->
        <div v-else class="evaluations-grid">
        <div
          v-for="evaluation in evaluations"
          :key="evaluation.id"
          class="evaluation-card"
          @click="openEvaluation(evaluation.id)"
        >
          <div class="card-header">
            <div class="evaluation-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div class="evaluation-info">
              <h3 class="evaluation-name">{{ evaluation.name }}</h3>
              <p v-if="evaluation.description" class="evaluation-description">
                {{ evaluation.description }}
              </p>
              <p v-else class="evaluation-description placeholder">
                Aucune description
              </p>
            </div>
          </div>

          <div class="card-footer">
            <div class="evaluation-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="currentColor" class="meta-icon">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                </svg>
                Créé le {{ formatDate(evaluation.createdAt) }}
              </span>
            </div>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
            </svg>
          </div>
        </div>
        </div>
      </section>

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
import { useCompetencyFrameworkStore } from '@/stores'
import { useEvaluationStore } from '@/stores'
import { useSchoolYearStore } from '@/stores'
import { useClassStore } from '@/stores'
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
  const currentSchoolYearId = schoolYearStore.currentSchoolYear?.id
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
      schoolYearStore.currentSchoolYear?.id
    )

    // Reload evaluations
    const dbEvaluations = await supabaseEvaluationsService.getEvaluationsByClass(
      props.id,
      schoolYearStore.currentSchoolYear?.id
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
  padding-bottom: 90px;
}

.evaluations-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
}

/* Section */
.evaluations-section {
  background: var(--md-sys-color-surface-container-low);
  border-radius: var(--md-sys-shape-corner-large, 16px);
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.evaluations-count {
  color: var(--md-sys-color-primary);
  font-weight: 500;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 32px;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: var(--md-sys-color-outline);
}

.empty-state-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state-title {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  max-width: 400px;
}

/* Evaluations Grid */
.evaluations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.evaluation-card {
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-large, 16px);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.evaluation-card:hover {
  background: var(--md-sys-color-surface-container);
  border-color: var(--md-sys-color-outline);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.evaluation-card:active {
  transform: translateY(0);
}

.card-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.evaluation-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  flex-shrink: 0;
}

.evaluation-icon svg {
  width: 24px;
  height: 24px;
}

.evaluation-info {
  flex: 1;
  min-width: 0;
}

.evaluation-name {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.evaluation-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.evaluation-description.placeholder {
  font-style: italic;
  opacity: 0.7;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.evaluation-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant);
}

.meta-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-on-surface-variant);
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .evaluations-content {
    padding: 16px;
  }

  .evaluations-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .evaluation-card {
    padding: 16px;
  }

  .card-header {
    gap: 12px;
  }

  .evaluation-icon {
    width: 40px;
    height: 40px;
  }

  .evaluation-icon svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .evaluations-content {
    padding: 12px;
  }

  .evaluation-card {
    padding: 12px;
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