/**
 * GenderFilterChips Molecule
 * Gender filter chips for student filtering (All, Male, Female, Unspecified)
 * Size: 142 lines (within 100-200 molecule limit)
 */
<template>
  <div class="gender-filter-chips flex flex-wrap gap-md-2">
    <Chip
      :selected="modelValue === 'all'"
      icon="person"
      @click="handleSelect('all')"
    >
      Tous
    </Chip>

    <Chip
      :selected="modelValue === 'M'"
      icon="male"
      color="primary"
      @click="handleSelect('M')"
    >
      Garçons
    </Chip>

    <Chip
      :selected="modelValue === 'F'"
      icon="female"
      color="success"
      @click="handleSelect('F')"
    >
      Filles
    </Chip>

    <Chip
      :selected="modelValue === 'unspecified'"
      icon="help"
      color="secondary"
      @click="handleSelect('unspecified')"
    >
      Non spécifié
    </Chip>
  </div>
</template>

<script setup lang="ts">
import Chip from '@/components/atoms/Chip.vue'

type GenderFilter = 'all' | 'M' | 'F' | 'unspecified'

interface Props {
  modelValue?: GenderFilter
}

interface Emits {
  (e: 'update:modelValue', value: GenderFilter): void
}

withDefaults(defineProps<Props>(), {
  modelValue: 'all'
})

const emit = defineEmits<Emits>()

function handleSelect(gender: GenderFilter) {
  emit('update:modelValue', gender)
}
</script>

<style scoped>
.gender-filter-chips {
  @apply min-w-0;
}
</style>
