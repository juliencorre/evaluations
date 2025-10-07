<template>
  <div class="evaluation-form">
    <!-- Header Section -->
    <div class="form-header">
      <div class="header-icon">
        <span class="material-symbols-outlined">assignment</span>
      </div>
      <div class="header-content">
        <h2 class="header-title">
          {{ isEditing ? 'Modifier l\'évaluation' : 'Nouvelle évaluation' }}
        </h2>
        <p class="header-description">
          {{ isEditing
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
        <p class="section-description">
          Définissez le nom et la description de votre nouvelle évaluation.
        </p>

        <div class="form-fields">
          <!-- Nom de l'évaluation -->
          <div class="field-group">
            <TextFieldOutlined
              id="evaluationName"
              v-model="localFormData.name"
              label="Nom de l'évaluation"
              placeholder="Ex: Évaluation Trimestre 2, Contrôle Mathématiques"
              required
              :error="!!nameError"
              :error-text="nameError"
              supporting-text="Choisissez un nom descriptif pour identifier facilement cette évaluation"
              @input="updateFormData"
            />
          </div>

          <!-- Description -->
          <div class="field-group">
            <TextFieldOutlined
              id="evaluationDescription"
              v-model="localFormData.description"
              label="Description (optionnel)"
              textarea
              :rows="4"
              :max-length="500"
              :show-character-count="true"
              :error="!!descriptionError"
              :error-text="descriptionError"
              supporting-text="Décrivez l'objectif et le contexte de cette évaluation"
              @input="updateFormData"
            />
          </div>

          <!-- Framework de compétences -->
          <div class="field-group">
            <label class="field-label">Framework de compétences</label>
            <p class="field-description">
              Sélectionnez le référentiel de compétences à utiliser pour cette évaluation.
            </p>
            <div class="framework-selector">
              <div class="framework-option selected">
                <div class="framework-info">
                  <h4 class="framework-name">{{ availableFramework.name }}</h4>
                  <p class="framework-description">{{ availableFramework.description }}</p>
                </div>
                <div class="framework-badge">
                  <span class="material-symbols-outlined">check_circle</span>
                  Sélectionné
                </div>
              </div>
              <p class="framework-note">
                <span class="material-symbols-outlined">info</span>
                Pour l'instant, un seul framework est disponible. D'autres pourront être ajoutés dans les paramètres.
              </p>
            </div>
          </div>

          <!-- Sélection des classes -->
          <div class="field-group">
            <ClassesSelector
              v-model="localFormData.classIds"
              @update:modelValue="updateFormData"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TextFieldOutlined from '@/components/TextFieldOutlined.vue'
import ClassesSelector from './ClassesSelector.vue'
import { useCompetencyFrameworkStore } from '@/stores'

interface EvaluationFormData {
  name: string
  description: string
  frameworkId: string
  classIds: string[]
}

interface Props {
  modelValue: EvaluationFormData
  isEditing?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: EvaluationFormData): void
  (e: 'validity-change', isValid: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
})

const emit = defineEmits<Emits>()

// Framework store
const { framework } = useCompetencyFrameworkStore()

// Available framework (for now, just one)
const availableFramework = computed(() => ({
  id: framework.id,
  name: framework.name,
  description: 'Framework de compétences par défaut pour l\'évaluation des élèves'
}))

// Local copy of form data
const localFormData = ref<EvaluationFormData>({ ...props.modelValue })

// Ensure frameworkId is set when component initializes
if (!localFormData.value.frameworkId && framework.id !== 'temp') {
  localFormData.value.frameworkId = framework.id
}

// Ensure classIds is initialized
if (!localFormData.value.classIds) {
  localFormData.value.classIds = []
}

// Validation
const nameError = computed(() => {
  const name = localFormData.value.name.trim()
  if (!name) {
    return 'Le nom de l\'évaluation est requis'
  }
  if (name.length < 3) {
    return 'Le nom doit contenir au moins 3 caractères'
  }
  return ''
})

const descriptionError = computed(() => {
  if (localFormData.value.description.length > 500) {
    return 'La description ne peut pas dépasser 500 caractères'
  }
  return ''
})

const classesError = computed(() => {
  if (localFormData.value.classIds.length === 0) {
    return 'Au moins une classe doit être sélectionnée'
  }
  return ''
})

const isValid = computed(() => {
  return !nameError.value && !descriptionError.value && !classesError.value
})

// Update parent when form data changes
const updateFormData = () => {
  emit('update:modelValue', { ...localFormData.value })
}

// Watch for validity changes
watch(isValid, (newValidity) => {
  emit('validity-change', newValidity)
})

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  localFormData.value = { ...newValue }
}, { deep: true })
</script>

<style scoped>
.evaluation-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 100%;
}

.form-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 0;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: var(--md-sys-shape-corner-medium);
}

.header-icon .material-symbols-outlined {
  font-size: 24px;
}

.header-content {
  flex: 1;
}

.header-title {
  font-family: var(--md-sys-typescale-headline-small-font);
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  line-height: var(--md-sys-typescale-headline-small-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
}

.header-description {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

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
  font-family: var(--md-sys-typescale-title-large-font);
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  line-height: var(--md-sys-typescale-title-large-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.section-description {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-sys-typescale-body-medium-weight);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.field-group:last-child {
  margin-bottom: 0;
}

/* Framework Selector Styles */
.field-label {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
  display: block;
}

.field-description {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-sys-typescale-body-medium-weight);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 16px 0;
}

.framework-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.framework-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  background: var(--md-sys-color-surface-container-low);
  transition: all 0.2s ease;
}

.framework-option.selected {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary-container);
}

.framework-info {
  flex: 1;
}

.framework-name {
  font-family: var(--md-sys-typescale-title-medium-font);
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 4px 0;
}

.framework-option.selected .framework-name {
  color: var(--md-sys-color-on-primary-container);
}

.framework-description {
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  font-weight: var(--md-sys-typescale-body-small-weight);
  line-height: var(--md-sys-typescale-body-small-line-height);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.framework-option.selected .framework-description {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.8;
}

.framework-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--md-sys-typescale-label-medium-font);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: var(--md-sys-typescale-label-medium-weight);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  color: var(--md-sys-color-primary);
  background: var(--md-sys-color-surface);
  padding: 8px 12px;
  border-radius: var(--md-sys-shape-corner-small);
  border: 1px solid var(--md-sys-color-primary);
}

.framework-option.selected .framework-badge {
  color: var(--md-sys-color-on-primary);
  background: var(--md-sys-color-primary);
}

.framework-badge .material-symbols-outlined {
  font-size: 18px;
}

.framework-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  font-weight: var(--md-sys-typescale-body-small-weight);
  line-height: var(--md-sys-typescale-body-small-line-height);
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container-highest);
  padding: 12px 16px;
  border-radius: var(--md-sys-shape-corner-small);
  margin: 0;
}

.framework-note .material-symbols-outlined {
  font-size: 16px;
  color: var(--md-sys-color-primary);
}
</style>