<template>
  <FullscreenDialog
    :visible="visible"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    :save-button-text="saveButtonText"
    :saving-text="savingText"
    :save-disabled="!isFormValid"
    :is-saving="isSubmitting"
    compact
    @close="handleClose"
    @save="handleSubmit"
  >
    <template #header>
      <div class="dialog-description">
        <p>{{ description }}</p>
      </div>
    </template>

    <form class="class-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="class-name" class="form-label">Nom de la classe *</label>
        <input
          id="class-name"
          v-model="formData.name"
          type="text"
          class="form-input"
          :class="{ 'error': errors.name }"
          placeholder="Ex: Grande Section A"
          required
          :disabled="isSubmitting"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="class-description" class="form-label">Description</label>
        <textarea
          id="class-description"
          v-model="formData.description"
          class="form-textarea"
          placeholder="Description de la classe..."
          rows="3"
          :disabled="isSubmitting"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="class-level" class="form-label">Niveau</label>
          <select
            id="class-level"
            v-model="formData.level"
            class="form-select"
            :disabled="isSubmitting"
          >
            <option value="">Sélectionner un niveau</option>
            <option value="Petite Section">Petite Section</option>
            <option value="Moyenne Section">Moyenne Section</option>
            <option value="Grande Section">Grande Section</option>
            <option value="CP">CP</option>
            <option value="CE1">CE1</option>
            <option value="CE2">CE2</option>
            <option value="CM1">CM1</option>
            <option value="CM2">CM2</option>
            <option value="6ème">6ème</option>
            <option value="5ème">5ème</option>
            <option value="4ème">4ème</option>
            <option value="3ème">3ème</option>
            <option value="Seconde">Seconde</option>
            <option value="Première">Première</option>
            <option value="Terminale">Terminale</option>
          </select>
        </div>

        <div class="form-group">
          <label for="class-subject" class="form-label">Matière</label>
          <input
            id="class-subject"
            v-model="formData.subject"
            type="text"
            class="form-input"
            placeholder="Ex: Mathématiques"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="class-year" class="form-label">Année scolaire</label>
        <select
          id="class-year"
          v-model="formData.schoolYear"
          class="form-select"
          :class="{ 'error': errors.schoolYear }"
          :disabled="isSubmitting"
        >
          <option value="">Sélectionner une année scolaire</option>
          <option
            v-for="year in availableSchoolYears"
            :key="year.id"
            :value="year.name"
          >
            {{ year.name }}
            <span v-if="year.is_current">(Actuelle)</span>
          </option>
        </select>
        <span v-if="errors.schoolYear" class="error-message">{{ errors.schoolYear }}</span>
      </div>

      <div v-if="isEditing" class="form-group">
        <label class="form-label">Statut</label>
        <div class="checkbox-group">
          <input
            id="class-active"
            v-model="formData.active"
            type="checkbox"
            class="form-checkbox"
            :disabled="isSubmitting"
          />
          <label for="class-active" class="checkbox-label">Classe active</label>
        </div>
      </div>

      <div v-if="error" class="error-banner">
        <svg viewBox="0 0 24 24" fill="currentColor" class="error-icon">
          <path d="M12,2L13.09,8.26L22,9L17,14L18.18,22L12,19.27L5.82,22L7,14L2,9L10.91,8.26L12,2Z"/>
        </svg>
        {{ error }}
      </div>
    </form>

    <template #footer>
      <div class="form-validation-info">
        <p class="validation-text">
          <span class="required-indicator">*</span>
          Champs obligatoires
        </p>
        <div v-if="formData.name && !isEditing" class="preview-info">
          <p class="preview-text">
            Aperçu : <strong>{{ formData.name }}</strong>
            <span v-if="formData.level"> - {{ formData.level }}</span>
            <span v-if="formData.subject"> ({{ formData.subject }})</span>
          </p>
        </div>
      </div>
    </template>
  </FullscreenDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import FullscreenDialog from '@/components/common/FullscreenDialog.vue'
import { useSoftDelete } from '@/composables/useSoftDelete'
import { useSchoolYearStore } from '@/stores'
import type { Class } from '@/types/evaluation'

interface Props {
  visible: boolean
  classData?: Class | null
  isSubmitting?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: ClassFormData): void
}

interface ClassFormData {
  name: string
  description?: string
  level?: string
  subject?: string
  schoolYear?: string
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  classData: null,
  isSubmitting: false
})

const emit = defineEmits<Emits>()

// Composables
const { getCurrentSchoolYear } = useSoftDelete()
const schoolYearStore = useSchoolYearStore()

// State
const formData = ref<ClassFormData>({
  name: '',
  description: '',
  level: '',
  subject: '',
  schoolYear: getCurrentSchoolYear(),
  active: true
})

const errors = ref<Record<string, string>>({})
const error = ref<string>('')

// Computed
const isEditing = computed(() => !!props.classData)

const modalTitle = computed(() => {
  return isEditing.value ? 'Modifier la classe' : 'Nouvelle classe'
})

const modalSubtitle = computed(() => {
  if (isEditing.value && props.classData) {
    return props.classData.name
  }
  return 'Configuration d\'une nouvelle classe'
})

const description = computed(() => {
  return isEditing.value
    ? 'Modifiez les informations de la classe ci-dessous.'
    : 'Configurez les informations de votre nouvelle classe. Seul le nom est obligatoire.'
})

const saveButtonText = computed(() => {
  return isEditing.value ? 'Modifier' : 'Créer'
})

const savingText = computed(() => {
  return isEditing.value ? 'Modification...' : 'Création...'
})

const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 &&
         !errors.value.name &&
         !errors.value.schoolYear
})

const availableSchoolYears = computed(() => {
  return schoolYearStore.sortedSchoolYears || []
})

// Watchers
watch(() => props.visible, (visible) => {
  if (visible) {
    resetForm()
    if (props.classData) {
      formData.value = {
        name: props.classData.name,
        description: props.classData.description || '',
        level: props.classData.level || '',
        subject: props.classData.subject || '',
        schoolYear: props.classData.schoolYear || getCurrentSchoolYear(),
        active: props.classData.active ?? true
      }
    }
  }
})

// Methods
function resetForm() {
  formData.value = {
    name: '',
    description: '',
    level: '',
    subject: '',
    schoolYear: getCurrentSchoolYear(),
    active: true
  }
  errors.value = {}
  error.value = ''
}

function validateForm(): boolean {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Le nom de la classe est requis'
    return false
  }

  if (formData.value.name.trim().length < 2) {
    errors.value.name = 'Le nom doit contenir au moins 2 caractères'
    return false
  }

  // L'année scolaire est maintenant sélectionnée depuis une liste valide
  if (!formData.value.schoolYear) {
    errors.value.schoolYear = 'Veuillez sélectionner une année scolaire'
    return false
  }

  return true
}

function handleSubmit() {
  if (!validateForm()) {
    return
  }

  emit('submit', { ...formData.value })
}

function handleClose() {
  emit('close')
}

// Lifecycle
onMounted(async () => {
  await schoolYearStore.ensureLoaded()
})

</script>

<style scoped>
/* Dialog specific styles */
.dialog-description {
  padding: 0;
  margin-bottom: 8px;
}

.dialog-description p {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

/* Form styles */
.class-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 500);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

/* Material Design 3 Text Fields */
.form-input,
.form-textarea,
.form-select {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);

  width: 100%;
  padding: 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-small, 4px);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
  padding: 15px; /* Adjust padding when border gets thicker */
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.38;
  cursor: not-allowed;
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: var(--md-sys-color-error);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-select {
  cursor: pointer;
}

/* Checkbox styling */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.form-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--md-sys-color-primary);
  cursor: pointer;
}

.form-checkbox:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.checkbox-label {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  margin: 0;
}

/* Error styling */
.error-message {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-error);
  margin: 0;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--md-sys-color-error-container);
  border: 1px solid var(--md-sys-color-error);
  border-radius: var(--md-sys-shape-corner-small, 4px);
  color: var(--md-sys-color-on-error-container);
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  margin-top: 16px;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Footer styles */
.form-validation-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0 0;
  border-top: 1px solid var(--md-sys-color-outline-variant);
  margin-top: 16px;
}

.validation-text {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-indicator {
  color: var(--md-sys-color-error);
  font-weight: 500;
}

.preview-info {
  padding: 12px 16px;
  background: var(--md-sys-color-primary-container);
  border-radius: var(--md-sys-shape-corner-small, 4px);
  border: 1px solid var(--md-sys-color-primary);
}

.preview-text {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-primary-container);
  margin: 0;
}

.preview-text strong {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .class-form {
    gap: 20px;
  }

  .form-input,
  .form-textarea,
  .form-select {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

@media (max-width: 480px) {
  .class-form {
    gap: 16px;
  }

  .form-validation-info {
    gap: 8px;
  }
}
</style>