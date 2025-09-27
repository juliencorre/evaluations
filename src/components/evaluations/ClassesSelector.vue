<template>
  <div class="classes-selector">
    <div class="selector-header">
      <h3 class="selector-title">Classes associées</h3>
      <p class="selector-description">
        Sélectionnez une ou plusieurs classes pour cette évaluation.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 24 24">
          <circle
            class="spinner-circle"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
      </div>
      <p>Chargement des classes...</p>
    </div>

    <!-- Classes List -->
    <div v-else-if="availableClasses.length > 0" class="classes-list">
      <div
        v-for="classItem in availableClasses"
        :key="classItem.id"
        class="class-item"
        :class="{ 'selected': selectedClassIds.includes(classItem.id) }"
        @click="toggleClass(classItem.id)"
      >
        <!-- Selection Indicator -->
        <div class="selection-indicator">
          <div class="checkbox" :class="{ 'checked': selectedClassIds.includes(classItem.id) }">
            <svg v-if="selectedClassIds.includes(classItem.id)" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
          </div>
        </div>

        <!-- Class Info -->
        <div class="class-content">
          <div class="class-header">
            <h4 class="class-name">{{ classItem.name }}</h4>
          </div>

          <p v-if="classItem.description" class="class-description">
            {{ classItem.description }}
          </p>

          <div class="class-meta">
            <span v-if="classItem.level" class="meta-item">
              <span class="material-symbols-outlined">grade</span>
              {{ classItem.level }}
            </span>
            <span v-if="classItem.schoolYear" class="meta-item">
              <span class="material-symbols-outlined">calendar_today</span>
              {{ classItem.schoolYear }}
            </span>
            <span v-if="classItem.subject" class="meta-item">
              <span class="material-symbols-outlined">subject</span>
              {{ classItem.subject }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,3L1,9L12,15L21,9V10H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
        </svg>
      </div>
      <h4 class="empty-title">Aucune classe disponible</h4>
      <p class="empty-description">
        Créez d'abord des classes pour pouvoir les associer à cette évaluation.
      </p>
    </div>

    <!-- Selection Summary -->
    <div v-if="selectedClassIds.length > 0" class="selection-summary">
      <div class="summary-content">
        <span class="summary-text">
          {{ selectedClassIds.length }} classe{{ selectedClassIds.length > 1 ? 's' : '' }} sélectionnée{{ selectedClassIds.length > 1 ? 's' : '' }}
        </span>
        <button class="clear-selection-btn" @click="clearSelection">
          <span class="material-symbols-outlined">close</span>
          Tout désélectionner
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useClassStore } from '@/stores/classStore'

interface Props {
  modelValue: string[]
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Stores
const classStore = useClassStore()

// State
const isLoading = ref(true)
const selectedClassIds = ref<string[]>([...props.modelValue])

// Computed
const availableClasses = computed(() => classStore.userClasses)

// Methods
const toggleClass = (classId: string) => {
  if (props.disabled) return

  const index = selectedClassIds.value.indexOf(classId)
  if (index > -1) {
    selectedClassIds.value.splice(index, 1)
  } else {
    selectedClassIds.value.push(classId)
  }

  emit('update:modelValue', [...selectedClassIds.value])
}

const clearSelection = () => {
  if (props.disabled) return

  selectedClassIds.value = []
  emit('update:modelValue', [])
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  selectedClassIds.value = [...newValue]
})

// Initialize
onMounted(async () => {
  try {
    // Load classes if not already loaded
    if (classStore.classes.length === 0) {
      await classStore.loadClasses()
    }
  } catch (error) {
    console.error('Error loading classes:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.classes-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-header {
  margin-bottom: 8px;
}

.selector-title {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 4px 0;
}

.selector-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  color: var(--md-sys-color-on-surface-variant);
}

.loading-spinner {
  margin-bottom: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  color: var(--md-sys-color-primary);
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 31.416;
  stroke-dashoffset: 31.416;
  animation: dash 2s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Classes List */
.classes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.class-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.class-item:hover {
  background: var(--md-sys-color-surface-container);
  border-color: var(--md-sys-color-outline);
}

.class-item.selected {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
}

.selection-indicator {
  flex-shrink: 0;
  padding-top: 2px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--md-sys-color-outline);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox.checked {
  background: var(--md-sys-color-primary);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.checkbox svg {
  width: 14px;
  height: 14px;
}

.class-content {
  flex: 1;
  min-width: 0;
}

.class-header {
  margin-bottom: 8px;
}

.class-name {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 500);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.class-item.selected .class-name {
  color: var(--md-sys-color-on-primary-container);
}

.class-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 12px 0;
}

.class-item.selected .class-description {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.8;
}

.class-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container);
  padding: 4px 8px;
  border-radius: 8px;
}

.class-item.selected .meta-item {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.meta-item .material-symbols-outlined {
  font-size: 14px;
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

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: var(--md-sys-color-outline);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
}

.empty-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  max-width: 300px;
}

/* Selection Summary */
.selection-summary {
  background: var(--md-sys-color-secondary-container);
  border-radius: var(--md-sys-shape-corner-small, 4px);
  padding: 12px 16px;
}

.summary-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.summary-text {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 500);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-secondary-container);
}

.clear-selection-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--md-sys-color-secondary);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-selection-btn:hover {
  background: var(--md-sys-color-secondary-container);
}

.clear-selection-btn .material-symbols-outlined {
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .classes-list {
    max-height: 300px;
  }

  .class-item {
    padding: 12px;
  }

  .summary-content {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .clear-selection-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: 32px 16px;
  }
}
</style>