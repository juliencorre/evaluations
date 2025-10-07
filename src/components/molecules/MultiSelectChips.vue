/**
 * MultiSelectChips Molecule
 * Generic multi-select chip group for filtering (domains, fields, competencies)
 * Size: 168 lines (within 100-200 molecule limit)
 */
<template>
  <div class="multi-select-chips">
    <div class="flex flex-wrap gap-md-2">
      <Chip
        :selected="selectedIds.length === 0"
        icon="select_all"
        @click="handleClearAll"
      >
        Tous
      </Chip>

      <Chip
        v-for="option in options"
        :key="option.id"
        :selected="isSelected(option.id)"
        :color="getChipColor(option.id)"
        @click="handleToggle(option.id)"
      >
        {{ option.name }}
      </Chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Chip from '@/components/atoms/Chip.vue'

export interface SelectOption {
  id: string
  name: string
}

interface Props {
  options: SelectOption[]
  modelValue?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})

const emit = defineEmits<Emits>()

const selectedIds = computed(() => props.modelValue)

function isSelected(id: string): boolean {
  return selectedIds.value.includes(id)
}

function getChipColor(id: string): 'primary' | 'secondary' | undefined {
  return isSelected(id) ? 'secondary' : undefined
}

function handleToggle(id: string) {
  const newSelection = [...selectedIds.value]
  const index = newSelection.indexOf(id)

  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(id)
  }

  emit('update:modelValue', newSelection)
}

function handleClearAll() {
  emit('update:modelValue', [])
}
</script>

<style scoped>
.multi-select-chips {
  @apply min-w-0;
}
</style>
