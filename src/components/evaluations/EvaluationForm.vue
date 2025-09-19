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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TextFieldOutlined from '@/components/TextFieldOutlined.vue'

interface EvaluationFormData {
  name: string
  description: string
  frameworkId: string
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

// Local copy of form data
const localFormData = ref<EvaluationFormData>({ ...props.modelValue })

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

const isValid = computed(() => {
  return !nameError.value && !descriptionError.value
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
}
</style>