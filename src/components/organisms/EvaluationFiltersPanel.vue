/**
 * EvaluationFiltersPanel Organism
 * Complete filters panel for evaluation table (gender, domains, fields, competencies)
 * Size: 238 lines (within 200-400 organism limit)
 */
<template>
  <div
    class="evaluation-filters-panel bg-md-surface-container-low border-b border-md-outline-variant transition-all duration-md-medium"
    :class="{ 'collapsed': !expanded }"
  >
    <!-- Header -->
    <div
      class="filters-header flex items-center justify-between px-md-4 py-md-3 cursor-pointer select-none hover:bg-md-surface-container transition-colors duration-md-short"
      @click="handleToggle"
    >
      <div class="flex items-center gap-md-2">
        <Icon icon="filter_list" color="primary" />
        <span class="text-md-title-medium font-medium text-md-on-surface">
          Filtres
        </span>
        <Badge v-if="activeFiltersCount > 0" variant="b" size="small">
          {{ activeFiltersCount }}
        </Badge>
      </div>

      <Button
        variant="text"
        size="small"
        :icon="expanded ? 'expand_less' : 'expand_more'"
        :aria-label="expanded ? 'Masquer les filtres' : 'Afficher les filtres'"
      />
    </div>

    <!-- Content -->
    <div
      v-show="expanded"
      class="filters-content px-md-4 pb-md-4 space-y-md-4 animate-slideDown"
    >
      <!-- Gender Filter -->
      <div class="filter-group">
        <label class="filter-label text-md-body-medium font-medium text-md-on-surface-variant mb-md-3 block">
          Genre des élèves
        </label>
        <GenderFilterChips
          :model-value="genderFilter"
          @update:model-value="handleGenderChange"
        />
      </div>

      <!-- Domains Filter -->
      <div v-if="availableDomains.length > 0" class="filter-group">
        <label class="filter-label text-md-body-medium font-medium text-md-on-surface-variant mb-md-3 block">
          Domaines
        </label>
        <MultiSelectChips
          :options="availableDomains"
          :model-value="selectedDomains"
          @update:model-value="handleDomainsChange"
        />
      </div>

      <!-- Fields Filter -->
      <div v-if="availableFields.length > 0" class="filter-group">
        <label class="filter-label text-md-body-medium font-medium text-md-on-surface-variant mb-md-3 block">
          Champs
        </label>
        <MultiSelectChips
          :options="availableFields"
          :model-value="selectedFields"
          @update:model-value="handleFieldsChange"
        />
      </div>

      <!-- Competencies Filter -->
      <div v-if="availableCompetencies.length > 0" class="filter-group">
        <label class="filter-label text-md-body-medium font-medium text-md-on-surface-variant mb-md-3 block">
          Compétences
        </label>
        <MultiSelectChips
          :options="availableCompetencies"
          :model-value="selectedCompetencies"
          @update:model-value="handleCompetenciesChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/atoms/Icon.vue'
import Badge from '@/components/atoms/Badge.vue'
import Button from '@/components/atoms/Button.vue'
import GenderFilterChips from '@/components/molecules/GenderFilterChips.vue'
import MultiSelectChips, { type SelectOption } from '@/components/molecules/MultiSelectChips.vue'

type GenderFilter = 'all' | 'M' | 'F' | 'unspecified'

interface Props {
  expanded?: boolean
  genderFilter?: GenderFilter
  selectedDomains?: string[]
  selectedFields?: string[]
  selectedCompetencies?: string[]
  availableDomains?: SelectOption[]
  availableFields?: SelectOption[]
  availableCompetencies?: SelectOption[]
}

interface Emits {
  (e: 'update:expanded', value: boolean): void
  (e: 'update:genderFilter', value: GenderFilter): void
  (e: 'update:selectedDomains', value: string[]): void
  (e: 'update:selectedFields', value: string[]): void
  (e: 'update:selectedCompetencies', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  genderFilter: 'all',
  selectedDomains: () => [],
  selectedFields: () => [],
  selectedCompetencies: () => [],
  availableDomains: () => [],
  availableFields: () => [],
  availableCompetencies: () => []
})

const emit = defineEmits<Emits>()

const activeFiltersCount = computed(() => {
  let count = 0
  if (props.genderFilter !== 'all') count++
  if (props.selectedDomains.length > 0) count++
  if (props.selectedFields.length > 0) count++
  if (props.selectedCompetencies.length > 0) count++
  return count
})

function handleToggle() {
  emit('update:expanded', !props.expanded)
}

function handleGenderChange(value: GenderFilter) {
  emit('update:genderFilter', value)
}

function handleDomainsChange(value: string[]) {
  emit('update:selectedDomains', value)
}

function handleFieldsChange(value: string[]) {
  emit('update:selectedFields', value)
}

function handleCompetenciesChange(value: string[]) {
  emit('update:selectedCompetencies', value)
}
</script>

<style scoped>
.evaluation-filters-panel.collapsed .filters-content {
  display: none;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
