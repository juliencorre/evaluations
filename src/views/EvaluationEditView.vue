<template>
  <main role="main" class="evaluation-edit-page">
    <h1 class="visually-hidden">Édition de l'évaluation</h1>

    <!-- App Bar -->
    <CenterAppBar
      :title="pageTitle"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      @back="goBack"
      @logout="handleLogout"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>Chargement de l'évaluation...</p>
    </div>

    <!-- Edit Form -->
    <div v-else class="edit-form-container">
      <div class="edit-form">
        <div class="form-section">
          <h2 class="section-title">Informations générales</h2>

          <!-- Nom de l'évaluation -->
          <div class="form-field">
            <label for="evaluation-name" class="field-label">Nom de l'évaluation</label>
            <input
              id="evaluation-name"
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="Entrez le nom de l'évaluation"
              required
            />
          </div>

          <!-- Description -->
          <div class="form-field">
            <label for="evaluation-description" class="field-label">Description</label>
            <textarea
              id="evaluation-description"
              v-model="formData.description"
              class="form-textarea"
              placeholder="Description optionnelle de l'évaluation"
              rows="4"
            ></textarea>
          </div>

          <!-- Référentiel de compétences -->
          <div class="form-field">
            <label for="framework-select" class="field-label">Référentiel de compétences</label>
            <select
              id="framework-select"
              v-model="formData.frameworkId"
              class="form-select"
              required
            >
              <option value="">Sélectionnez un référentiel</option>
              <option
                v-for="framework in frameworks"
                :key="framework.id"
                :value="framework.id"
              >
                {{ framework.name }} ({{ framework.version }})
              </option>
            </select>
          </div>

          <!-- Classe -->
          <div class="form-field">
            <label for="class-select" class="field-label">Classe</label>
            <select
              id="class-select"
              v-model="formData.classId"
              class="form-select"
              required
            >
              <option value="">Sélectionnez une classe</option>
              <option
                v-for="classItem in classes"
                :key="classItem.id"
                :value="classItem.id"
              >
                {{ classItem.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button
            type="button"
            class="secondary-button"
            @click="goBack"
          >
            Annuler
          </button>
          <button
            type="button"
            class="primary-button"
            :disabled="!isFormValid || isSaving"
            @click="saveEvaluation"
          >
            {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import { useEvaluationStore } from '@/stores/evaluationStore'
import type { Evaluation } from '@/types/evaluation'
import { useLogout } from '@/composables/useLogout'

const route = useRoute()
const router = useRouter()

// Props
interface Props {
  id: string
}

const props = defineProps<Props>()

// Store
const evaluationStore = useEvaluationStore()
const { updateEvaluation, getEvaluationById, loadEvaluations } = evaluationStore

// State
const isScrolled = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)

// Form data
const formData = ref({
  name: '',
  description: '',
  frameworkId: '',
  classId: ''
})

// Data loaded from Supabase
const frameworks = ref<Array<{ id: string; name: string; version?: string }>>([])
const classes = ref<Array<{ id: string; name: string }>>([])

// Load frameworks and classes from Supabase
const loadFormData = async () => {
  try {
    // Load frameworks from competency service
    const { supabaseCompetenciesService } = await import('@/services/supabaseCompetenciesService')
    const framework = await supabaseCompetenciesService.getOrCreateDefaultFramework()
    frameworks.value = [{
      id: framework.id,
      name: framework.name,
      version: framework.version
    }]

    // Load classes from class service
    const { supabaseClassesService } = await import('@/services/supabaseClassesService')
    const allClasses = await supabaseClassesService.getClasses()
    classes.value = allClasses.map((cls: { id: string; name: string }) => ({
      id: cls.id,
      name: cls.name
    }))
  } catch (error) {
    console.error('Error loading form data:', error)
  }
}

// Computed
const pageTitle = computed(() => {
  return formData.value.name ? `Édition - ${formData.value.name}` : 'Édition d\'évaluation'
})

const isFormValid = computed(() => {
  return formData.value.name.trim() !== '' &&
         formData.value.frameworkId !== '' &&
         formData.value.classId !== ''
})

// Methods
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
}

const goBack = () => {
  const evaluationId = props.id || (route?.params?.id as string)
  if (evaluationId) {
    router.push(`/evaluation/${evaluationId}`)
  } else {
    router.push('/evaluations')
  }
}

const loadEvaluationData = async () => {
  isLoading.value = true
  try {
    await loadEvaluations()

    const evaluationId = props.id || (route?.params?.id as string)
    if (evaluationId) {
      const evaluation = getEvaluationById(evaluationId)
      if (evaluation) {
        // Pré-remplir le formulaire avec les données existantes
        formData.value = {
          name: evaluation.name,
          description: evaluation.description,
          frameworkId: evaluation.frameworkId,
          classId: evaluation.classId
        }
      } else {
        console.error('❌ [EvaluationEditView] Evaluation not found:', evaluationId)
        router.push('/evaluations')
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'évaluation:', error)
  } finally {
    isLoading.value = false
  }
}

const saveEvaluation = async () => {
  if (!isFormValid.value) return

  isSaving.value = true
  try {
    const evaluationId = props.id || (route?.params?.id as string)
    if (evaluationId) {
      const updates: Partial<Evaluation> = {
        name: formData.value.name.trim(),
        description: formData.value.description.trim(),
        frameworkId: formData.value.frameworkId,
        classId: formData.value.classId
      }

      const updatedEvaluation = await updateEvaluation(evaluationId, updates)
      if (updatedEvaluation) {
        console.log('✅ [EvaluationEditView] Evaluation updated successfully')
        // Rediriger vers la page de l'évaluation
        router.push(`/evaluation/${evaluationId}`)
      } else {
        window.alert('Erreur lors de la sauvegarde de l\'évaluation')
      }
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    window.alert('Erreur lors de la sauvegarde de l\'évaluation')
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  await loadFormData()
  loadEvaluationData()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.evaluation-edit-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  color: var(--md-sys-color-on-surface-variant);
}

.edit-form-container {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 24px;
}

.edit-form {
  width: 100%;
  max-width: 600px;
  background: var(--md-sys-color-surface-container-low);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--md-sys-elevation-level1);
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-family: var(--md-sys-typescale-headline-small-font);
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  line-height: var(--md-sys-typescale-headline-small-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 24px 0;
}

.form-field {
  margin-bottom: 24px;
}

.field-label {
  display: block;
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-sys-typescale-body-medium-weight);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 4px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary), transparent 80%);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.primary-button,
.secondary-button {
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.primary-button {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.primary-button:hover:not(:disabled) {
  box-shadow: var(--md-sys-elevation-level1);
}

.primary-button:disabled {
  background: var(--md-sys-color-on-surface);
  color: var(--md-sys-color-surface);
  opacity: 0.38;
  cursor: not-allowed;
}

.secondary-button {
  background: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
}

.secondary-button:hover {
  background: color-mix(in srgb, var(--md-sys-color-primary), transparent 92%);
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

/* Responsive */
@media (max-width: 768px) {
  .edit-form-container {
    padding: 16px;
  }

  .edit-form {
    padding: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style>