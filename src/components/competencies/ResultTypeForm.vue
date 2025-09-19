<template>
  <div class="result-type-form">
    <!-- Basic Information Section -->
    <ContentSection title="Informations générales">
      <div class="form-row">
        <TextFieldOutlined
          id="result-type-name"
          v-model="localData.name"
          label="Nom du type"
          placeholder="Ex: Échelle A-E, Acquis/Non acquis..."
          required
          :error-text="nameError"
          class="full-width"
          @input="emitChange"
        />
      </div>
    </ContentSection>

    <!-- Configuration Section -->
    <ContentSection title="Configuration">
      <div class="form-row">
        <div class="select-field">
          <label class="field-label">Type de résultat</label>
          <select
            v-model="localData.config.type"
            class="select-input"
            @change="handleTypeChange"
          >
            <option value="scale">Échelle (A, B, C, D, E)</option>
            <option value="boolean">Booléen (Oui/Non)</option>
            <option value="custom">Personnalisé</option>
          </select>
        </div>
      </div>
    </ContentSection>

    <!-- Values Section -->
    <ContentSection title="Valeurs possibles">
      <div class="values-container">
        <div
          v-for="(value, index) in localData.config.values"
          :key="index"
          class="value-row"
        >
          <TextFieldOutlined
            :id="`value-label-${index}`"
            v-model="value.label"
            label="Libellé"
            placeholder="Ex: A - Très bonne maîtrise"
            required
            class="label-field"
            @input="emitChange"
          />
          <TextFieldOutlined
            :id="`value-code-${index}`"
            v-model="value.value"
            label="Valeur"
            placeholder="Ex: A"
            required
            class="value-field"
            @input="emitChange"
          />
          <TextFieldOutlined
            :id="`value-pivot-${index}`"
            v-model="value.pivot_value"
            label="Note /10"
            type="number"
            placeholder="0"
            class="pivot-field"
            @input="emitChange"
          />
          <button
            type="button"
            class="remove-value-btn"
            :disabled="localData.config.values.length <= 1"
            @click="removeValue(index)"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>

        <button
          type="button"
          class="add-value-btn"
          @click="addValue"
        >
          <span class="material-symbols-outlined">add</span>
          Ajouter une valeur
        </button>
      </div>
    </ContentSection>

    <!-- Preview Section -->
    <ContentSection title="Aperçu">
      <div class="preview-container">
        <div class="preview-values">
          <div
            v-for="value in localData.config.values"
            :key="value.value"
            class="preview-value"
          >
            <span class="preview-label">{{ value.label || value.value }}</span>
            <span class="preview-score">{{ value.pivot_value || 0 }}/10</span>
          </div>
        </div>
      </div>
    </ContentSection>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TextFieldOutlined from '@/components/TextFieldOutlined.vue'
import ContentSection from '@/components/common/ContentSection.vue'
import type { ResultTypeConfig } from '@/types/evaluation'

interface Props {
  modelValue?: Partial<ResultTypeConfig>
  editing?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: Partial<ResultTypeConfig>): void
}

const props = withDefaults(defineProps<Props>(), {
  editing: false
})

const emit = defineEmits<Emits>()

// Local reactive data
const localData = ref<ResultTypeConfig>({
  id: '',
  name: '',
  config: {
    type: 'scale',
    values: []
  }
})

// Computed properties
const nameError = computed(() => {
  if (!localData.value.name?.trim()) {
    return 'Le nom est requis'
  }
  return ''
})

// Predefined templates for different types
const scaleTemplate = [
  { label: 'A - Très bonne maîtrise', value: 'A', pivot_value: 10 },
  { label: 'B - Maîtrise satisfaisante', value: 'B', pivot_value: 7.5 },
  { label: 'C - Maîtrise fragile', value: 'C', pivot_value: 5 },
  { label: 'D - Maîtrise insuffisante', value: 'D', pivot_value: 2.5 },
  { label: 'E - Maîtrise très insuffisante', value: 'E', pivot_value: 0 },
  { label: 'N/A - Non évalué', value: 'N/A', pivot_value: 0 }
]

const booleanTemplate = [
  { label: 'Oui - Acquis', value: 'Oui', pivot_value: 10 },
  { label: 'Non - Non acquis', value: 'Non', pivot_value: 0 },
  { label: 'N/A - Non évalué', value: 'N/A', pivot_value: 0 }
]

// Methods
const handleTypeChange = () => {
  if (!props.editing) {
    // Only auto-populate for new types
    switch (localData.value.config?.type) {
      case 'scale':
        localData.value.config.values = [...scaleTemplate]
        break
      case 'boolean':
        localData.value.config.values = [...booleanTemplate]
        break
      case 'custom':
        localData.value.config.values = [
          { label: '', value: '', pivot_value: 0 }
        ]
        break
    }
  }
  emitChange()
}

const addValue = () => {
  if (!localData.value.config?.values) {
    localData.value.config = { type: 'custom', values: [] }
  }
  localData.value.config.values.push({
    label: '',
    value: '',
    pivot_value: 0
  })
  emitChange()
}

const removeValue = (index: number) => {
  if (localData.value.config?.values && localData.value.config.values.length > 1) {
    localData.value.config.values.splice(index, 1)
    emitChange()
  }
}

// Initialize form data
const initializeForm = () => {
  if (props.modelValue) {
    localData.value = {
      id: props.modelValue.id || '',
      name: props.modelValue.name || '',
      description: props.modelValue.description,
      created_at: props.modelValue.created_at,
      updated_at: props.modelValue.updated_at,
      type: props.modelValue.type || 'scale',
      config: {
        type: props.modelValue.config?.type || 'scale',
        values: props.modelValue.config?.values ? [...props.modelValue.config.values] : []
      }
    }
  }

  // Set default values for new types
  if (!props.editing && (!localData.value.config?.values || localData.value.config.values.length === 0)) {
    handleTypeChange()
  }
}

// Emit changes manually when needed
const emitChange = () => {
  // Ensure all required fields have valid values
  const cleanedData = {
    ...localData.value,
    config: {
      ...localData.value.config,
      values: localData.value.config.values.map(v => ({
        label: v.label || '',
        value: v.value || '',
        pivot_value: v.pivot_value || 0
      }))
    }
  }
  emit('update:modelValue', cleanedData)
}

// No watchers to avoid recursion

onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.result-type-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.full-width {
  flex: 1;
}

/* Select Field */
.select-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.field-label {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-sys-typescale-body-medium-weight);
  color: var(--md-sys-color-on-surface);
}

.select-input {
  min-height: 56px;
  padding: 16px;
  background: var(--md-sys-color-surface-container-highest);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  color: var(--md-sys-color-on-surface);
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.select-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
}

/* Values Container */
.values-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.value-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  background: var(--md-sys-color-surface-container-lowest);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
}

.label-field {
  flex: 2;
}

.value-field {
  flex: 1;
  min-width: 100px;
}

.pivot-field {
  flex: 0 0 120px;
}

.remove-value-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  color: var(--md-sys-color-error);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.remove-value-btn:hover:not(:disabled) {
  background: var(--md-sys-color-error-container);
}

.remove-value-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.add-value-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: none;
  border: 2px dashed var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  color: var(--md-sys-color-primary);
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.add-value-btn:hover {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
}

/* Preview */
.preview-container {
  padding: 16px;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
}

.preview-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-shape-corner-small);
}

.preview-label {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface);
}

.preview-score {
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 768px) {
  .value-row {
    flex-direction: column;
    gap: 12px;
  }

  .label-field,
  .value-field,
  .pivot-field {
    flex: 1;
    min-width: auto;
  }

  .form-row {
    flex-direction: column;
  }
}
</style>