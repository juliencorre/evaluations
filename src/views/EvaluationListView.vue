<template>
  <div class="evaluations-page">
    <h1 class="visually-hidden">Liste des évaluations</h1>

    <!-- Center-aligned App Bar -->
    <CenterAppBar
      v-if="!isLoading"
      title="Évaluations"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-school-icon="true"
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
      <div v-if="allEvaluations.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Aucune évaluation</h2>
        <p class="empty-state-description">
          Créez votre première évaluation avec le bouton ci-dessous.
        </p>
      </div>

      <!-- Evaluations List -->
      <div v-else class="evaluations-container">
        <ul class="md3-list" role="list">
          <li
            v-for="evaluation in allEvaluations"
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
import { useClassStore } from '@/stores/classStore'
// import type { Evaluation } from '@/types/evaluation'

const router = useRouter()
const competenciesStore = useCompetencyFrameworkStore()
const { framework, isCompetenciesLoading, refreshFromSupabase } = competenciesStore

const evaluationStore = useEvaluationStore()
const { allEvaluations, loadEvaluations } = evaluationStore

const classStore = useClassStore()

// State
const isLoading = isCompetenciesLoading
const isScrolled = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const isSaving = ref(false)

// No class filtering needed - show all evaluations

// Form data
const currentEvaluationForm = ref({
  name: '',
  description: '',
  frameworkId: framework.value.id,
  classIds: [] as string[]
})

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  // Load competency framework and evaluations from database
  await refreshFromSupabase()
  await loadEvaluations()
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
    frameworkId: framework.value.id,
    classIds: []
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  resetForm()
}

const resetForm = () => {
  currentEvaluationForm.value = {
    name: '',
    description: '',
    frameworkId: framework.value.id,
    classIds: []
  }
}

// FAB Menu configuration
const fabMenuItems = [
  {
    key: 'new-evaluation',
    icon: 'add',
    label: 'Nouvelle évaluation',
    ariaLabel: 'Créer une nouvelle évaluation',
    type: 'primary'
  }
]

// Handle menu item clicks
const handleMenuItemClick = (item: { key: string }) => {
  if (item.key === 'new-evaluation') {
    openAddModal()
  }
}

const saveEvaluation = async (formData: { name: string; description: string; frameworkId: string; classIds: string[] }) => {
  isSaving.value = true

  try {
    // Add new evaluation with classes
    // Ensure we have a valid framework ID
    const validFrameworkId = framework.value.id !== 'temp' ? framework.value.id : null
    if (!validFrameworkId) {
      throw new Error('Framework non chargé. Veuillez rafraîchir la page.')
    }

    // Validate that at least one class is selected
    if (!formData.classIds || formData.classIds.length === 0) {
      throw new Error('Au moins une classe doit être sélectionnée.')
    }

    const evaluationData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      frameworkId: validFrameworkId
    }

    // Use the new function that handles classes association
    const newEvaluation = await evaluationStore.addEvaluationWithClasses(
      evaluationData,
      formData.classIds
    )

    if (newEvaluation) {
      console.log('➕ Nouvelle évaluation créée:', newEvaluation.name)
      console.log('📚 Classes associées:', formData.classIds.length)
      closeModal()
      // Optionally redirect to the new evaluation
      // router.push(`/evaluation/${newEvaluation.id}`)
    } else {
      console.error('Erreur: Impossible de créer l\'évaluation')
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'évaluation:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.evaluations-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.evaluations-content {
  flex: 1;
  padding: 32px 24px 80px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: var(--md-sys-color-outline);
}

.empty-state-title {
  font-family: var(--md-sys-typescale-headline-small-font);
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  line-height: var(--md-sys-typescale-headline-small-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 16px 0;
}

.empty-state-description {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  max-width: 400px;
}

.evaluations-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Material Design 3 Lists */
.md3-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: transparent;
}

.md3-list-item {
  display: flex;
  align-items: flex-start;
  min-height: 72px;
  padding: 16px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  border-bottom: 1px solid var(--md-sys-color-outline, #79747E);
  background: var(--md-sys-color-surface);
}

.md3-list-item:last-child {
  border-bottom: none;
}

.md3-list-item:hover {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.md3-list-item:focus {
  outline: none;
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}

.md3-list-item:active {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 16%, transparent);
}

.md3-list-item__leading {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-right: 16px;
  flex-shrink: 0;
}

.evaluation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.evaluation-icon svg {
  width: 24px;
  height: 24px;
}

.md3-list-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  gap: 4px;
}

.md3-list-item__headline {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.md3-list-item__supporting-text {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.md3-list-item__supporting-text.placeholder {
  font-style: italic;
  color: var(--md-sys-color-outline);
}

.md3-list-item__trailing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
}

.evaluation-date {
  font-family: var(--md-sys-typescale-label-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-small-size, 11px);
  font-weight: var(--md-sys-typescale-label-small-weight, 500);
  line-height: var(--md-sys-typescale-label-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant);
  text-align: right;
  white-space: nowrap;
}

.trailing-icon {
  width: 24px;
  height: 24px;
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

/* Responsive Design */
@media (max-width: 768px) {
  .evaluations-content {
    padding: 24px 0 80px;
    max-width: 100%;
  }

  .evaluations-container {
    max-width: 100%;
  }

  .md3-list {
    /* Liste sans bordures ni carte sur mobile */
  }

  .md3-list-item {
    min-height: 64px;
    padding: 12px 16px;
  }

  .md3-list-item__leading {
    width: 48px;
    height: 48px;
    margin-right: 12px;
  }

  .evaluation-icon {
    width: 32px;
    height: 32px;
    border-radius: 16px;
  }

  .evaluation-icon svg {
    width: 20px;
    height: 20px;
  }

  .md3-list-item__headline {
    font-size: 15px;
    line-height: 22px;
  }

  .md3-list-item__supporting-text {
    font-size: 13px;
    line-height: 18px;
    -webkit-line-clamp: 1;
  }

  .evaluation-date {
    font-size: 10px;
    line-height: 14px;
  }

  .trailing-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .evaluations-content {
    padding: 16px 0 80px;
  }

  .md3-list-item {
    padding: 12px;
  }

  .md3-list-item__leading {
    margin-right: 8px;
  }

  .md3-list-item__trailing {
    margin-left: 8px;
  }
}
</style>