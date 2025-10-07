/**
 * Toggle Atom
 * Material Design toggle/collapse button
 * Size: 75 lines (within 50-100 atom limit)
 */
<template>
  <button
    :class="toggleClasses"
    :aria-label="ariaLabel"
    :aria-expanded="expanded"
    @click="handleClick"
  >
    <Icon :icon="icon" :size="iconSize" />
    <span v-if="label" class="toggle-label">{{ label }}</span>
    <span v-if="count !== undefined" class="toggle-count">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

interface Props {
  expanded?: boolean
  icon?: string
  label?: string
  count?: number
  iconSize?: 'small' | 'medium' | 'large'
  ariaLabel?: string
}

interface Emits {
  (e: 'toggle'): void
}

withDefaults(defineProps<Props>(), {
  expanded: false,
  icon: 'expand_more',
  iconSize: 'medium'
})

const emit = defineEmits<Emits>()

const toggleClasses = computed(() => [
  'toggle-button',
  'flex items-center gap-md-2',
  'px-md-4 py-md-3',
  'rounded-md-button',
  'bg-md-surface hover:bg-md-surface-variant',
  'text-md-on-surface',
  'transition-all duration-md-medium',
  'cursor-pointer',
  'border border-md-outline',
  'md-state-layer'
])

function handleClick() {
  emit('toggle')
}
</script>

<style scoped>
.toggle-label {
  @apply text-md-body-medium font-medium;
}

.toggle-count {
  @apply inline-flex items-center justify-center;
  @apply min-w-[20px] h-[20px] px-md-2;
  @apply bg-md-primary text-md-on-primary;
  @apply rounded-md-full;
  @apply text-md-label-small font-medium;
}
</style>
