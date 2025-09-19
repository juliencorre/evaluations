<template>
  <div class="competency-form">
    <!-- Section informations générales -->
    <div class="content-section">
      <h2 class="section-headline">Informations générales</h2>
      <p class="section-supporting-text">{{ sectionDescription }}</p>

      <div class="form-group">
        <label for="competency-name" class="form-label">Nom *</label>
        <input
          id="competency-name"
          v-model="localData.name"
          type="text"
          class="form-input"
          :placeholder="namePlaceholder"
          required
        />
      </div>

      <div class="form-group">
        <label for="competency-description" class="form-label">Description *</label>
        <textarea
          id="competency-description"
          v-model="localData.description"
          class="form-textarea"
          :placeholder="descriptionPlaceholder"
          rows="4"
          required
        ></textarea>
      </div>

      <!-- Type de résultat pour les sous-compétences -->
      <div v-if="type === 'specificCompetency'" class="form-group">
        <label for="result-type" class="form-label">Type de résultat</label>
        <select
          id="result-type"
          v-model="localData.resultTypeConfigId"
          class="form-select"
        >
          <option value="">Sélectionner un type</option>
          <option
            v-for="resultType in resultTypes"
            :key="resultType.id"
            :value="resultType.id"
          >
            {{ resultType.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Section contexte -->
    <div v-if="showContext" class="content-section">
      <h2 class="section-headline">Contexte</h2>
      <p class="section-supporting-text">
        Informations sur l'emplacement de cette {{ typeLabel }} dans la hiérarchie.
      </p>

      <div class="context-container">
        <div v-if="context?.domain" class="context-item">
          <span class="context-icon material-symbols-outlined">domain</span>
          <div class="context-details">
            <span class="context-label">Domaine</span>
            <span class="context-value">{{ context.domain.name }}</span>
          </div>
        </div>

        <div v-if="context?.field" class="context-item">
          <span class="context-icon material-symbols-outlined">topic</span>
          <div class="context-details">
            <span class="context-label">Champ</span>
            <span class="context-value">{{ context.field.name }}</span>
          </div>
        </div>

        <div v-if="context?.competency" class="context-item">
          <span class="context-icon material-symbols-outlined">psychology</span>
          <div class="context-details">
            <span class="context-label">Compétence</span>
            <span class="context-value">{{ context.competency.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ResultTypeConfig } from '@/types/evaluation'

interface CompetencyData {
  id?: string
  name: string
  description: string
  resultTypeConfigId?: string
}

interface ContextItem {
  id: string
  name: string
  description?: string
}

interface Context {
  domain?: ContextItem
  field?: ContextItem
  competency?: ContextItem
}

interface Props {
  type: 'domain' | 'field' | 'competency' | 'specificCompetency'
  modelValue: CompetencyData
  context?: Context
  resultTypes?: ResultTypeConfig[]
  showContext?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: CompetencyData): void
}

const props = withDefaults(defineProps<Props>(), {
  showContext: true,
  resultTypes: () => []
})

const emit = defineEmits<Emits>()

const localData = ref<CompetencyData>({ ...props.modelValue })

// Computed properties for dynamic content
const typeLabel = computed(() => {
  const labels = {
    domain: 'domaine',
    field: 'champ',
    competency: 'compétence',
    specificCompetency: 'sous-compétence'
  }
  return labels[props.type]
})

const sectionDescription = computed(() => {
  const descriptions = {
    domain: 'Saisissez les informations du domaine.',
    field: 'Saisissez les informations du champ.',
    competency: 'Saisissez les informations de la compétence.',
    specificCompetency: 'Saisissez les informations de la sous-compétence.'
  }
  return descriptions[props.type]
})

const namePlaceholder = computed(() => {
  const placeholders = {
    domain: 'ex: Mathématiques',
    field: 'ex: Géométrie',
    competency: 'ex: Calculer des aires',
    specificCompetency: 'ex: Aire du triangle'
  }
  return placeholders[props.type]
})

const descriptionPlaceholder = computed(() => {
  const placeholders = {
    domain: 'Décrivez le domaine de compétences...',
    field: 'Décrivez le champ de compétences...',
    competency: 'Décrivez la compétence et ses objectifs...',
    specificCompetency: 'Décrivez précisément cette sous-compétence...'
  }
  return placeholders[props.type]
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  localData.value = { ...newValue }
}, { deep: true })

// Watch for local changes and emit
watch(localData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>

<style scoped>
.competency-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-headline {
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.section-supporting-text {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 500);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface);
}

.form-input,
.form-textarea,
.form-select {
  padding: 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 4px;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface);
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 96px;
}

.form-select {
  cursor: pointer;
}

/* Context Section */
.context-container {
  background: var(--md-sys-color-surface-container-high);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  padding: 20px;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.context-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.context-item:first-child {
  padding-top: 0;
}

.context-icon {
  color: var(--md-sys-color-primary);
  font-size: 24px;
  flex-shrink: 0;
}

.context-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.context-label {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 12px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 500);
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.context-value {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 500);
  color: var(--md-sys-color-on-surface);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
}

/* Responsive */
@media (max-width: 768px) {
  .competency-form {
    gap: 24px;
  }

  .content-section {
    gap: 12px;
  }

  .context-container {
    padding: 16px;
  }

  .context-item {
    gap: 12px;
  }

  .context-icon {
    font-size: 20px;
  }
}
</style>