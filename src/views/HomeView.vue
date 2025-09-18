<template>
  <main role="main">
    <h1 class="visually-hidden">Tableau d'évaluation des compétences</h1>

    <!-- Top App Bar -->
    <TopAppBar
      v-if="!isLoading && framework.domains.length > 0"
      :title="currentEvaluation.name"
      :subtitle="currentEvaluation.description"
      variant="medium"
    >
      <template #trailing>
        <select v-model="selectedEvaluationId" class="evaluation-selector" @change="switchEvaluation">
          <option v-for="evaluation in allEvaluations" :key="evaluation.id" :value="evaluation.id">
            {{ evaluation.name }}
          </option>
        </select>
      </template>
    </TopAppBar>


    <!-- Affichage conditionnel : attendre que les données soient chargées -->
    <div v-if="isLoading" class="loading-state">
      <p>Chargement des compétences...</p>
    </div>

    <EvaluationTable
      v-else-if="framework.domains.length > 0"
      :evaluation="currentEvaluation"
      :students="allStudents"
      :framework="framework"
    />

    <div v-else class="empty-state">
      <p>Aucune compétence disponible</p>
    </div>

    <!-- Material 3 Extended FAB -->
    <button
      v-if="!showAddModal && !showEditModal && !isLoading"
      class="extended-fab"
      @click="showAddModal = true"
    >
      <span class="material-symbols-outlined fab-icon">add</span>
      <span class="fab-label">Nouvelle évaluation</span>
    </button>

    <!-- Full-screen Dialog pour les évaluations -->
    <FullscreenDialog
      :model-value="showAddModal || showEditModal"
      :title="showEditModal ? 'Modifier l\'évaluation' : 'Nouvelle évaluation'"
      :save-button-text="showEditModal ? 'Modifier' : 'Créer'"
      :saving-text="showEditModal ? 'Modification...' : 'Création...'"
      :save-disabled="isSaving || !isFormValid"
      :is-saving="isSaving"
      @close="closeModal"
      @save="saveEvaluation"
    >
      <div class="dialog-content">
        <!-- Header Section -->
        <div class="form-header">
          <div class="header-icon">
            <span class="material-symbols-outlined">assignment</span>
          </div>
          <div class="header-content">
            <h2 class="header-title">
              {{ showEditModal ? 'Modifier l\'évaluation' : 'Nouvelle évaluation' }}
            </h2>
            <p class="header-description">
              {{ showEditModal
                ? 'Modifiez les informations de cette évaluation.'
                : 'Créez une nouvelle évaluation pour suivre les progrès de vos élèves.'
              }}
            </p>
          </div>
        </div>

        <!-- Form Section -->
        <div class="form-container">
          <div class="form-section">
            <h3 class="section-title">Informations de l'évaluation</h3>
            <p class="section-description">Définissez le nom et la description de votre nouvelle évaluation.</p>

            <div class="form-fields">
              <!-- Nom de l'évaluation -->
              <div class="field-group">
                <TextFieldOutlined
                  id="evaluationName"
                  v-model="currentEvaluationForm.name"
                  label="Nom de l'évaluation"
                  placeholder="Ex: Évaluation Trimestre 2, Contrôle Mathématiques"
                  required
                  :error="!!nameError"
                  :error-text="nameError"
                  supporting-text="Choisissez un nom descriptif pour identifier facilement cette évaluation"
                />
              </div>

              <!-- Description -->
              <div class="field-group">
                <div class="text-field-outlined" :class="{ 'error': descriptionError, 'filled': currentEvaluationForm.description }">
                  <textarea
                    id="evaluationDescription"
                    v-model="currentEvaluationForm.description"
                    class="text-field-textarea-outlined"
                    placeholder=" "
                    rows="4"
                    maxlength="500"
                  ></textarea>
                  <label for="evaluationDescription" class="text-field-label-outlined">Description (optionnel)</label>
                  <div class="text-field-outline">
                    <div class="text-field-outline-start"></div>
                    <div class="text-field-outline-notch">
                      <div class="text-field-outline-leading"></div>
                      <div class="text-field-outline-trailing"></div>
                    </div>
                    <div class="text-field-outline-end"></div>
                  </div>
                  <div class="text-field-supporting-text">
                    <span class="helper-text">Décrivez l'objectif et le contexte de cette évaluation</span>
                    <span class="character-count">{{ currentEvaluationForm.description.length }}/500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullscreenDialog>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import EvaluationTable from '@/components/EvaluationTable.vue'
import FullscreenDialog from '@/components/FullscreenDialog.vue'
import TextFieldOutlined from '@/components/TextFieldOutlined.vue'
import TopAppBar from '@/components/TopAppBar.vue'
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { useEvaluationStore } from '@/stores/evaluationStore'

const { allStudents } = useStudentsStore()
const competenciesStore = useCompetencyFrameworkStore()
const { framework, isCompetenciesLoading } = competenciesStore

// Evaluation store
const evaluationStore = useEvaluationStore()
const { allEvaluations, currentEvaluation, addEvaluation, setCurrentEvaluation, getEvaluationById } = evaluationStore

// Utiliser l'état de chargement pour l'affichage conditionnel
const isLoading = isCompetenciesLoading

// Modal state
const showAddModal = ref(false)
const showEditModal = ref(false)
const isSaving = ref(false)

// Form data
const currentEvaluationForm = ref({
  name: '',
  description: '',
  frameworkId: framework.value.id
})

// Form validation
const nameError = computed(() => {
  const name = currentEvaluationForm.value.name.trim()
  if (!name) {
    return 'Le nom de l\'évaluation est requis'
  }
  if (name.length < 3) {
    return 'Le nom doit contenir au moins 3 caractères'
  }
  return ''
})

const descriptionError = computed(() => {
  if (currentEvaluationForm.value.description.length > 500) {
    return 'La description ne peut pas dépasser 500 caractères'
  }
  return ''
})

// Simplified form validation - only name is required
const isFormValid = computed(() => {
  const name = currentEvaluationForm.value.name.trim()
  const description = currentEvaluationForm.value.description

  // Only check that name has at least 3 characters and description isn't too long
  const nameIsValid = name.length >= 3
  const descriptionIsValid = description.length <= 500

  const isValid = nameIsValid && descriptionIsValid

  console.log('🔍 Form validation:', {
    name,
    nameLength: name.length,
    nameIsValid,
    descriptionLength: description.length,
    descriptionIsValid,
    isValid,
    isSaving: isSaving.value,
    buttonDisabled: isSaving.value || !isValid
  })

  return isValid
})


// Evaluation selection
const selectedEvaluationId = ref(currentEvaluation.value.id)

// Computed properties and helper functions removed - were unused

const switchEvaluation = () => {
  const evaluation = getEvaluationById(selectedEvaluationId.value)
  if (evaluation) {
    setCurrentEvaluation(evaluation)
  }
}

// Modal functions
const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

const resetForm = () => {
  currentEvaluationForm.value = {
    name: '',
    description: '',
    frameworkId: framework.value.id
  }
}

const saveEvaluation = async () => {
  // Validation
  if (!isFormValid.value) {
    console.warn('⚠️ Form is not valid, cannot save')
    return
  }

  isSaving.value = true

  try {
    if (showEditModal.value) {
      // TODO: Implement edit functionality when needed
      console.log('Edit evaluation not implemented yet')
    } else {
      // Add new evaluation
      const evaluationData = {
        name: currentEvaluationForm.value.name.trim(),
        description: currentEvaluationForm.value.description.trim(),
        classId: 'default-class', // Classe par défaut
        frameworkId: framework.value.id
      }

      const newEvaluation = await addEvaluation(evaluationData)

      if (newEvaluation) {
        // Update the selector to show the new evaluation
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

// Watch for framework changes to update form
watch(framework, (newFramework) => {
  currentEvaluationForm.value.frameworkId = newFramework.id
}, { deep: true })

// Watch for current evaluation changes to update selector
watch(currentEvaluation, (newEvaluation) => {
  selectedEvaluationId.value = newEvaluation.id
})

// Watch form changes for debugging
watch(
  () => currentEvaluationForm.value.name,
  (newName, oldName) => {
    console.log('📝 Name changed from:', oldName, 'to:', newName, 'Length:', newName.length)
  }
)

watch(
  () => currentEvaluationForm.value.description,
  (newDesc, oldDesc) => {
    console.log('📝 Description changed from:', oldDesc, 'to:', newDesc, 'Length:', newDesc.length)
  }
)

watch(
  () => isFormValid.value,
  (newValid) => {
    console.log('✅ Form validity changed:', newValid)
  }
)

// Debug: vérifier si le framework arrive dans HomeView
console.log('🏠 [HomeView] Initialisation avec framework:', {
  domains: framework.value.domains.length,
  frameworkName: framework.value.name,
  isLoading: isLoading.value
})

// Watcher pour voir les changements du framework
watch(framework, (newFramework) => {
  console.log('🏠 [HomeView] Framework mis à jour:', {
    domains: newFramework.domains.length,
    frameworkName: newFramework.name
  })
}, { deep: true })

// Watcher pour voir les changements de l'état de chargement
watch(isLoading, (newLoading) => {
  console.log('🏠 [HomeView] État de chargement:', newLoading ? 'EN COURS' : 'TERMINÉ')
})
</script>

<style scoped>
/* Evaluation Meta Section */
.evaluation-meta-section {
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 0 0 12px 12px;
  margin-bottom: 24px;
}


.evaluation-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.evaluation-date,
.evaluation-results-count {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
}


.evaluation-selector {
  min-width: 200px;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 4px;
  background: #ffffff;
  color: var(--md-sys-color-on-surface, #1d1b20);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  cursor: pointer;
}

.evaluation-selector:focus {
  outline: 2px solid var(--md-sys-color-primary, #6750a4);
  outline-offset: 2px;
}

/* States */
.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

/* Extended FAB */
.extended-fab {
  position: fixed;
  bottom: 104px; /* 64px menu height + 40px margin */
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  box-shadow: var(--md-sys-elevation-level3, 0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.12), 0px 3px 5px rgba(0, 0, 0, 0.20));
  transition: all 0.2s ease;
  z-index: 1000;
}

.extended-fab:hover {
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
  box-shadow: var(--md-sys-elevation-level4, 0px 8px 12px rgba(0, 0, 0, 0.14), 0px 4px 20px rgba(0, 0, 0, 0.12), 0px 3px 6px rgba(0, 0, 0, 0.20));
}

.extended-fab:active {
  box-shadow: var(--md-sys-elevation-level1, 0px 2px 4px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.20));
}

.fab-icon {
  font-size: 24px;
}

.fab-label {
  white-space: nowrap;
}

/* Dialog Content */
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 100%;
}

/* Form Header */
.form-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 0;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  border-radius: 12px;
}

.header-icon .material-symbols-outlined {
  font-size: 24px;
}

.header-content {
  flex: 1;
}

.header-title {
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0 0 8px 0;
}

.header-description {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0;
}

/* Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-family: var(--md-sys-typescale-title-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-large-size, 22px);
  font-weight: var(--md-sys-typescale-title-large-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 28px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0;
}

.section-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0;
}

/* Form fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Character count and supporting text */
.text-field-supporting-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px 0;
  gap: 16px;
}

.helper-text {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.character-count {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  white-space: nowrap;
}

.field-supporting-text {
  padding: 4px 16px 0;
}

.field-supporting-text .helper-text {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

/* Select Field Outlined */
.select-field-outlined {
  position: relative;
  width: 100%;
}

.select-input-outlined {
  width: 100%;
  min-height: 56px;
  padding: 16px 56px 16px 16px;
  border: none;
  background: transparent;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  outline: none;
  appearance: none;
  cursor: pointer;
  z-index: 1;
}

.select-input-outlined:focus {
  outline: none;
}

.select-label-outlined {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  pointer-events: none;
  transition: all 0.2s ease;
  background: #ffffff;
  padding: 0 4px;
  z-index: 2;
}

.select-input-outlined:focus + .select-label-outlined,
.select-input-outlined:not(:placeholder-shown) + .select-label-outlined,
.select-field-outlined:has(.select-input-outlined:not([value=""])) .select-label-outlined {
  top: 0;
  left: 12px;
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  color: var(--md-sys-color-primary, #6750a4);
  background: #ffffff;
  padding: 0 4px;
}

.select-outline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 4px;
  pointer-events: none;
  transition: all 0.2s ease;
}

.select-input-outlined:focus ~ .select-outline {
  border-color: var(--md-sys-color-primary, #6750a4);
  border-width: 2px;
}

.select-outline-start,
.select-outline-end {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
  border: inherit;
}

.select-outline-start {
  left: 0;
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.select-outline-end {
  right: 0;
  border-left: none;
  border-radius: 0 4px 4px 0;
}

.select-outline-notch {
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  bottom: 0;
  border-top: inherit;
  border-bottom: inherit;
}

.select-outline-leading,
.select-outline-trailing {
  position: absolute;
  top: 0;
  bottom: 0;
  border-top: inherit;
  border-bottom: inherit;
}

.select-outline-leading {
  left: 0;
  right: 50%;
}

.select-outline-trailing {
  left: 50%;
  right: 0;
}

.select-dropdown-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  pointer-events: none;
  z-index: 1;
}

/* Enhanced textarea styling */
.text-field-outlined.filled .text-field-label-outlined {
  top: 0;
  left: 12px;
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  color: var(--md-sys-color-primary, #6750a4);
}

/* Error states */
.text-field-outlined.error .text-field-outline,
.select-field-outlined.error .select-outline {
  border-color: var(--md-sys-color-error, #ba1a1a);
}

.text-field-outlined.error .text-field-label-outlined,
.select-field-outlined.error .select-label-outlined {
  color: var(--md-sys-color-error, #ba1a1a);
}

/* Large Screen with Navigation Rail */
@media (min-width: 1440px) {
  .extended-fab {
    position: fixed !important;
    bottom: 24px; /* Back to original position */
    right: 24px;
    z-index: 1001;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .evaluation-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .evaluation-meta {
    flex-direction: column;
    gap: 8px;
  }

  .evaluation-selector {
    min-width: 100%;
  }

  .extended-fab {
    bottom: 96px; /* 64px menu height + 32px margin for mobile */
    right: 16px;
  }
}
main {
  height: calc(100vh - 60px);
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.loading-state, .empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
}
</style>
