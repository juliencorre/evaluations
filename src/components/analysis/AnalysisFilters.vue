<template>
  <div class="analysis-filters">
    <div class="filters-header">
      <h3 class="filters-title">Filtres</h3>
      <button
        v-if="hasActiveFilters"
        class="reset-filters-button"
        @click="resetFilters"
        title="Réinitialiser tous les filtres"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
        Réinitialiser
      </button>
    </div>

    <!-- Classes Filter -->
    <div class="filter-group">
      <label class="filter-label">
        <svg class="filter-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM12 6.53L3 11l9 4.91L21 11l-9-4.47z" />
        </svg>
        Classes
      </label>
      <div class="filter-options">
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              :checked="allClassesSelected"
              :indeterminate="someClassesSelected"
              @change="toggleAllClasses"
            />
            <span>Toutes les classes</span>
          </label>
        </div>
        <div v-if="!allClassesSelected" class="class-list">
          <label
            v-for="classItem in availableClasses"
            :key="classItem.id"
            class="checkbox-label"
          >
            <input
              type="checkbox"
              :value="classItem.id"
              :checked="selectedClassIds.includes(classItem.id)"
              @change="toggleClass(classItem.id)"
            />
            <span>{{ classItem.name }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- School Years Filter -->
    <div class="filter-group">
      <label class="filter-label">
        <svg class="filter-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z" />
        </svg>
        Années scolaires
      </label>
      <div class="filter-options">
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              :checked="allYearsSelected"
              :indeterminate="someYearsSelected"
              @change="toggleAllYears"
            />
            <span>Toutes les années</span>
          </label>
        </div>
        <div v-if="!allYearsSelected" class="year-list">
          <label
            v-for="year in availableYears"
            :key="year.id"
            class="checkbox-label"
          >
            <input
              type="checkbox"
              :value="year.id"
              :checked="selectedYearIds.includes(year.id)"
              @change="toggleYear(year.id)"
            />
            <span>{{ year.name }}</span>
            <span v-if="year.is_current" class="current-badge">Actuelle</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Apply Button -->
    <div class="filter-actions">
      <button class="apply-filters-button" @click="applyFilters">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        Appliquer les filtres
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface ClassItem {
  id: string
  name: string
}

interface SchoolYear {
  id: string
  name: string
  is_current: boolean
}

interface Props {
  availableClasses: ClassItem[]
  availableYears: SchoolYear[]
  modelValue?: {
    classIds: string[]
    yearIds: string[]
  }
}

interface Emits {
  (e: 'update:modelValue', value: { classIds: string[]; yearIds: string[] }): void
  (e: 'apply'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ classIds: [], yearIds: [] })
})

const emit = defineEmits<Emits>()

// State
const selectedClassIds = ref<string[]>(props.modelValue.classIds)
const selectedYearIds = ref<string[]>(props.modelValue.yearIds)

// Computed
const allClassesSelected = computed(() => {
  return selectedClassIds.value.length === 0 ||
         selectedClassIds.value.length === props.availableClasses.length
})

const someClassesSelected = computed(() => {
  return selectedClassIds.value.length > 0 &&
         selectedClassIds.value.length < props.availableClasses.length
})

const allYearsSelected = computed(() => {
  return selectedYearIds.value.length === 0 ||
         selectedYearIds.value.length === props.availableYears.length
})

const someYearsSelected = computed(() => {
  return selectedYearIds.value.length > 0 &&
         selectedYearIds.value.length < props.availableYears.length
})

const hasActiveFilters = computed(() => {
  return selectedClassIds.value.length > 0 || selectedYearIds.value.length > 0
})

// Methods
const toggleAllClasses = () => {
  if (allClassesSelected.value) {
    selectedClassIds.value = []
  } else {
    selectedClassIds.value = props.availableClasses.map(c => c.id)
  }
}

const toggleClass = (classId: string) => {
  const index = selectedClassIds.value.indexOf(classId)
  if (index > -1) {
    selectedClassIds.value.splice(index, 1)
  } else {
    selectedClassIds.value.push(classId)
  }
}

const toggleAllYears = () => {
  if (allYearsSelected.value) {
    selectedYearIds.value = []
  } else {
    selectedYearIds.value = props.availableYears.map(y => y.id)
  }
}

const toggleYear = (yearId: string) => {
  const index = selectedYearIds.value.indexOf(yearId)
  if (index > -1) {
    selectedYearIds.value.splice(index, 1)
  } else {
    selectedYearIds.value.push(yearId)
  }
}

const resetFilters = () => {
  selectedClassIds.value = []
  selectedYearIds.value = []
  applyFilters()
}

const applyFilters = () => {
  emit('update:modelValue', {
    classIds: selectedClassIds.value,
    yearIds: selectedYearIds.value
  })
  emit('apply')
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  selectedClassIds.value = newValue.classIds
  selectedYearIds.value = newValue.yearIds
}, { deep: true })
</script>

<style scoped>
.analysis-filters {
  background: var(--md-sys-color-surface-container-low);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-title {
  font-family: var(--md-sys-typescale-title-medium-font-family);
  font-size: var(--md-sys-typescale-title-medium-font-size);
  font-weight: var(--md-sys-typescale-title-medium-font-weight);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.reset-filters-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 8px;
  color: var(--md-sys-color-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-filters-button:hover {
  background: var(--md-sys-color-primary-container);
}

.reset-filters-button svg {
  width: 18px;
  height: 18px;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--md-sys-typescale-label-large-font-family);
  font-size: var(--md-sys-typescale-label-large-font-size);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 12px;
}

.filter-icon {
  width: 20px;
  height: 20px;
  color: var(--md-sys-color-primary);
}

.filter-options {
  padding-left: 28px;
}

.checkbox-group {
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  font-size: 14px;
  color: var(--md-sys-color-on-surface);
}

.checkbox-label:hover {
  background: var(--md-sys-color-surface-container);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--md-sys-color-primary);
}

.class-list,
.year-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--md-sys-color-surface);
  border-radius: 8px;
}

.current-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.apply-filters-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.apply-filters-button:hover {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.apply-filters-button svg {
  width: 18px;
  height: 18px;
}

/* Scrollbar styling */
.class-list::-webkit-scrollbar,
.year-list::-webkit-scrollbar {
  width: 6px;
}

.class-list::-webkit-scrollbar-track,
.year-list::-webkit-scrollbar-track {
  background: var(--md-sys-color-surface-variant);
  border-radius: 3px;
}

.class-list::-webkit-scrollbar-thumb,
.year-list::-webkit-scrollbar-thumb {
  background: var(--md-sys-color-outline);
  border-radius: 3px;
}

.class-list::-webkit-scrollbar-thumb:hover,
.year-list::-webkit-scrollbar-thumb:hover {
  background: var(--md-sys-color-on-surface-variant);
}

/* Responsive */
@media (max-width: 768px) {
  .analysis-filters {
    padding: 16px;
  }

  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .reset-filters-button {
    width: 100%;
    justify-content: center;
  }

  .apply-filters-button {
    width: 100%;
    justify-content: center;
  }
}
</style>