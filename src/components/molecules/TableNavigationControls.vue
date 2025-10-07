/**
 * TableNavigationControls Molecule
 * Navigation controls for scrollable tables (left/right arrows with range display)
 * Size: 156 lines (within 100-200 molecule limit)
 */
<template>
  <div class="table-nav-controls">
    <div class="flex items-center justify-center gap-md-3 py-md-2 px-md-4 bg-md-surface-container border-b border-md-outline-variant">
      <Button
        variant="outlined"
        size="small"
        icon="chevron_left"
        :disabled="!canScrollLeft"
        aria-label="Faire défiler vers la gauche"
        @click="handleScrollLeft"
      />

      <span class="nav-range-display text-md-body-medium text-md-on-surface-variant font-medium">
        {{ rangeDisplay }}
      </span>

      <Button
        variant="outlined"
        size="small"
        icon="chevron_right"
        :disabled="!canScrollRight"
        aria-label="Faire défiler vers la droite"
        @click="handleScrollRight"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/atoms/Button.vue'

interface Props {
  currentStart: number
  currentEnd: number
  total: number
  canScrollLeft?: boolean
  canScrollRight?: boolean
}

interface Emits {
  (e: 'scroll-left'): void
  (e: 'scroll-right'): void
}

const props = withDefaults(defineProps<Props>(), {
  canScrollLeft: false,
  canScrollRight: false
})

const emit = defineEmits<Emits>()

const rangeDisplay = computed(() => {
  const start = Math.max(1, props.currentStart)
  const end = Math.max(1, props.currentEnd)
  const total = Math.max(1, props.total)

  return `${start}-${end} / ${total}`
})

function handleScrollLeft() {
  emit('scroll-left')
}

function handleScrollRight() {
  emit('scroll-right')
}
</script>

<style scoped>
.nav-range-display {
  @apply min-w-[80px] text-center;
}
</style>
