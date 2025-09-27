<template>
  <div class="school-year-chip" @click="$emit('click')">
    <span class="material-symbols-outlined chip-icon">
      calendar_today
    </span>
    <span class="chip-label">{{ displayText }}</span>
    <span class="material-symbols-outlined chip-arrow">
      keyboard_arrow_down
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  selectedYear?: string | null
  allYearsSelected?: boolean
}

interface Emits {
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedYear: null,
  allYearsSelected: false
})

defineEmits<Emits>()

const displayText = computed(() => {
  if (props.allYearsSelected) {
    return 'Toutes les années'
  }
  return props.selectedYear || 'Année scolaire'
})
</script>

<style scoped>
.school-year-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  height: 32px;
  min-width: 120px;
  justify-content: center;
}

.school-year-chip:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
  box-shadow: var(--md-sys-elevation-level1);
}

.school-year-chip:active {
  background: var(--md-sys-color-surface-container-highest);
  transform: scale(0.98);
}

.chip-icon,
.chip-arrow {
  font-size: 16px;
  color: var(--md-sys-color-on-surface-variant);
  flex-shrink: 0;
}

.chip-label {
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: center;
}

/* Animation pour la flèche */
.school-year-chip:hover .chip-arrow {
  transform: rotate(180deg);
  transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
}

/* Responsive */
@media (max-width: 599px) {
  .school-year-chip {
    min-width: 100px;
    padding: 4px 8px;
    height: 28px;
  }

  .chip-icon,
  .chip-arrow {
    font-size: 14px;
  }

  .chip-label {
    font-size: var(--md-sys-typescale-label-small-size);
  }
}
</style>