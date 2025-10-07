<template>
  <div class="filter-banner">
    <!-- Toggle Button -->
    <button
      class="filter-toggle"
      :aria-expanded="isExpanded"
      aria-label="Afficher/masquer les filtres"
      @click="isExpanded = !isExpanded"
    >
      <span class="material-symbols-outlined">filter_list</span>
      <span class="filter-toggle-text">Filtres</span>
      <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
      <span class="material-symbols-outlined expand-icon">{{ isExpanded ? 'expand_less' : 'expand_more' }}</span>
    </button>

    <!-- Expanded Filter Content -->
    <transition name="filter-expand">
      <div v-if="isExpanded" class="filter-content">
        <!-- Gender Filter -->
        <div class="filter-group">
          <label class="filter-label">Genre</label>
          <div class="filter-chips">
            <button
              v-for="gender in genderOptions"
              :key="gender.value"
              class="filter-chip"
              :class="{ active: selectedGender === gender.value }"
              @click="toggleGenderFilter(gender.value)"
            >
              {{ gender.label }}
            </button>
          </div>
        </div>

        <!-- Class Filter -->
        <div class="filter-group">
          <label class="filter-label">Classe</label>
          <select
            v-model="selectedClass"
            class="filter-select"
            @change="$emit('update:classFilter', selectedClass)"
          >
            <option value="">Toutes les classes</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.name }}{{ cls.schoolYear ? ` - ${cls.schoolYear}` : '' }}
            </option>
          </select>
        </div>

        <!-- Age Range Filter -->
        <div class="filter-group">
          <label class="filter-label">Tranche d'âge</label>
          <div class="filter-chips">
            <button
              v-for="range in ageRanges"
              :key="range.value"
              class="filter-chip"
              :class="{ active: selectedAgeRange === range.value }"
              @click="toggleAgeRangeFilter(range.value)"
            >
              {{ range.label }}
            </button>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <div class="filter-actions">
          <button
            v-if="activeFilterCount > 0"
            class="clear-filters-btn"
            @click="clearFilters"
          >
            <span class="material-symbols-outlined">clear</span>
            Effacer les filtres
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Class } from '@/types/evaluation'

interface Props {
  classes?: Class[]
  genderFilter?: string
  classFilter?: string
  ageRangeFilter?: string
}

interface Emits {
  (e: 'update:genderFilter', value: string): void
  (e: 'update:classFilter', value: string): void
  (e: 'update:ageRangeFilter', value: string): void
  (e: 'clear-filters'): void
}

const props = withDefaults(defineProps<Props>(), {
  classes: () => [],
  genderFilter: '',
  classFilter: '',
  ageRangeFilter: ''
})

const emit = defineEmits<Emits>()

// State
const isExpanded = ref(false)
const selectedGender = ref(props.genderFilter)
const selectedClass = ref(props.classFilter)
const selectedAgeRange = ref(props.ageRangeFilter)

// Options
const genderOptions = [
  { value: 'M', label: 'Garçons' },
  { value: 'F', label: 'Filles' }
]

const ageRanges = [
  { value: '6-8', label: '6-8 ans' },
  { value: '9-11', label: '9-11 ans' },
  { value: '12-14', label: '12-14 ans' },
  { value: '15+', label: '15+ ans' }
]

// Computed
const activeFilterCount = computed(() => {
  let count = 0
  if (selectedGender.value) count++
  if (selectedClass.value) count++
  if (selectedAgeRange.value) count++
  return count
})

// Methods
const toggleGenderFilter = (value: string) => {
  selectedGender.value = selectedGender.value === value ? '' : value
  emit('update:genderFilter', selectedGender.value)
}

const toggleAgeRangeFilter = (value: string) => {
  selectedAgeRange.value = selectedAgeRange.value === value ? '' : value
  emit('update:ageRangeFilter', selectedAgeRange.value)
}

const clearFilters = () => {
  selectedGender.value = ''
  selectedClass.value = ''
  selectedAgeRange.value = ''
  emit('update:genderFilter', '')
  emit('update:classFilter', '')
  emit('update:ageRangeFilter', '')
  emit('clear-filters')
}

// Watch for prop changes
watch(() => props.genderFilter, (newVal) => {
  selectedGender.value = newVal
})

watch(() => props.classFilter, (newVal) => {
  selectedClass.value = newVal
})

watch(() => props.ageRangeFilter, (newVal) => {
  selectedAgeRange.value = newVal
})
</script>

<style scoped>
.filter-banner {
  background: var(--md-sys-color-surface-variant);
  border-radius: 12px;
  margin: 0 auto 16px;
  width: min(100%, clamp(36rem, 80vw, 70rem));
  overflow: hidden;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: 500;
  transition: background-color 0.2s;
}

.filter-toggle:hover {
  background: var(--md-sys-color-surface-container-highest);
}

.filter-toggle:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: -2px;
}

.material-symbols-outlined {
  font-size: 24px;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.expand-icon {
  margin-left: auto;
  transition: transform 0.2s;
}

.filter-toggle-text {
  flex: 1;
  text-align: left;
}

.filter-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.filter-content {
  padding: 0 16px 16px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-of-type {
  margin-bottom: 16px;
}

.filter-label {
  display: block;
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  padding: 8px 16px;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: 8px;
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: var(--md-sys-color-surface-container-high);
}

.filter-chip.active {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-color: var(--md-sys-color-primary);
}

.filter-chip:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 8px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  cursor: pointer;
}

.filter-select:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-primary);
  border-radius: 20px;
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: var(--md-sys-color-primary-container);
}

.clear-filters-btn:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.clear-filters-btn .material-symbols-outlined {
  font-size: 20px;
}

/* Transition */
.filter-expand-enter-active,
.filter-expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.filter-expand-enter-from,
.filter-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 768px) {
  .filter-chips {
    flex-direction: column;
  }

  .filter-chip {
    width: 100%;
  }
}
</style>
