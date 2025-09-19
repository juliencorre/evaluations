<template>
  <main role="main" class="evaluations-page">
    <h1 class="visually-hidden">Tableau d'évaluation des compétences</h1>

    <!-- Center-aligned App Bar -->
    <CenterAppBar
      v-if="!isLoading && framework.domains.length > 0"
      title="Évaluations"
      :is-scrolled="isScrolled"
      :show-search="false"
      @user-menu-click="handleUserMenuClick"
    />

    <!-- Evaluation Tabs -->
    <EvaluationTabs
      v-if="!isLoading && framework.domains.length > 0 && allEvaluations.length > 0"
      v-model="selectedEvaluationId"
      :evaluations="allEvaluations"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>Chargement des compétences...</p>
    </div>

    <!-- Evaluation Table -->
    <EvaluationTable
      v-else-if="framework.domains.length > 0"
      :evaluation="currentEvaluation"
      :students="allStudents"
      :framework="framework"
    />

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>Aucune compétence disponible</p>
    </div>

    <!-- Extended FAB -->
    <ExtendedFAB
      v-if="!showModal && !isLoading"
      icon="add"
      :visible="true"
      aria-label="Nouvelle évaluation"
      @click="openAddModal"
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
  </main>
</template>

<script setup lang="ts">
import { ref, watch, defineAsyncComponent, onMounted, onUnmounted } from 'vue'

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
import ExtendedFAB from '@/components/common/ExtendedFAB.vue'
import EvaluationTabs from '@/components/evaluations/EvaluationTabs.vue'
import EvaluationModals from '@/components/evaluations/EvaluationModals.vue'

// Stores
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { useEvaluationStore } from '@/stores/evaluationStore'

const { allStudents } = useStudentsStore()
const competenciesStore = useCompetencyFrameworkStore()
const { framework, isCompetenciesLoading } = competenciesStore

const evaluationStore = useEvaluationStore()
const { allEvaluations, currentEvaluation, addEvaluation, setCurrentEvaluation, getEvaluationById, loadEvaluations } = evaluationStore

// State
const isLoading = isCompetenciesLoading
const isScrolled = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const isSaving = ref(false)
const selectedEvaluationId = ref(currentEvaluation.value.id)

// Form data
const currentEvaluationForm = ref({
  name: '',
  description: '',
  frameworkId: framework.value.id
})

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  // Load evaluations from database
  await loadEvaluations()

  // Ensure selectedEvaluationId is properly set after loading
  if (currentEvaluation.value && currentEvaluation.value.id !== selectedEvaluationId.value) {
    console.log('🔧 [HomeView] Synchronisation selectedEvaluationId après chargement:', currentEvaluation.value.id)
    selectedEvaluationId.value = currentEvaluation.value.id
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Event handlers
const handleUserMenuClick = () => {
  console.log('User menu clicked')
}

const openAddModal = () => {
  isEditMode.value = false
  currentEvaluationForm.value = {
    name: '',
    description: '',
    frameworkId: framework.value.id
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
    frameworkId: framework.value.id
  }
}

const saveEvaluation = async (formData: { name: string; description: string; frameworkId: string }) => {
  isSaving.value = true

  try {
    if (isEditMode.value) {
      // TODO: Implement edit functionality when needed
      console.log('Edit evaluation not implemented yet')
    } else {
      // Add new evaluation
      const evaluationData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        classId: 'default-class',
        frameworkId: formData.frameworkId
      }

      const newEvaluation = await addEvaluation(evaluationData)

      if (newEvaluation) {
        selectedEvaluationId.value = newEvaluation.id
        console.log('➕ Nouvelle évaluation créée:', newEvaluation.name)
        closeModal()
      } else {
        console.error('Erreur: Impossible de créer l\'évaluation')
      }
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'évaluation:', error)
  } finally {
    isSaving.value = false
  }
}

// Watch for evaluation selection changes
watch(selectedEvaluationId, (newId) => {
  console.log('📋 [HomeView] Changement de sélection d\'évaluation:', newId)
  const evaluation = getEvaluationById(newId) || allEvaluations.value.find(item => item.id === newId)
  if (evaluation) {
    console.log('📋 [HomeView] Évaluation trouvée:', evaluation.name)
    setCurrentEvaluation(evaluation)
  } else {
    console.log('⚠️ [HomeView] Évaluation non trouvée pour l\'ID:', newId)
  }
})

// Watch for current evaluation changes to update selector
watch(currentEvaluation, (newEvaluation) => {
  console.log('🔄 [HomeView] Changement de currentEvaluation:', newEvaluation.name, 'ID:', newEvaluation.id)
  selectedEvaluationId.value = newEvaluation.id
})

// Watch for framework changes to update form
watch(framework, (newFramework) => {
  currentEvaluationForm.value.frameworkId = newFramework.id
}, { deep: true })

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
  padding: 20px;
  box-sizing: border-box;
}
</style>