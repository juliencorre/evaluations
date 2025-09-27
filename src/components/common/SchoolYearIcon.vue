<template>
  <button
    class="school-year-icon"
    :aria-label="`Année scolaire sélectionnée: ${displayText}. Cliquer pour changer.`"
    @click="$emit('click')"
  >
    <span class="material-symbols-outlined">calendar_today</span>
    <span v-if="showBadge" class="year-badge">
      {{ badgeText }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  selectedYear?: string | null
  allYearsSelected?: boolean
  showBadge?: boolean
}

interface Emits {
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedYear: null,
  allYearsSelected: false,
  showBadge: true
})

defineEmits<Emits>()

const displayText = computed(() => {
  if (props.allYearsSelected) {
    return 'Toutes les années'
  }
  return props.selectedYear || 'Année scolaire'
})

const badgeText = computed(() => {
  if (props.allYearsSelected) {
    return '∞'
  }
  if (props.selectedYear) {
    // Extraire l'année de fin (ex: "2024-2025" → "25")
    const match = props.selectedYear.match(/(\d{4})-(\d{4})/)
    if (match) {
      return match[2].slice(-2) // Prendre les 2 derniers chiffres de l'année de fin
    }
  }
  return '?'
})
</script>

<style scoped>
.school-year-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  position: relative;
}

.school-year-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.school-year-icon:hover::before {
  opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
}

.school-year-icon:focus {
  outline: none;
}

.school-year-icon:focus::before {
  opacity: var(--md-icon-button-focus-state-layer-opacity, 0.12);
}

.school-year-icon:active::before {
  opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);
}

.school-year-icon .material-symbols-outlined {
  font-size: 24px;
  z-index: 1;
  position: relative;
}

.year-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 16px;
  height: 16px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  z-index: 2;
  border: 2px solid var(--md-sys-color-surface);
  box-sizing: border-box;
  line-height: 1;
}

/* État actif quand "toutes les années" est sélectionné */
.school-year-icon[aria-label*="Toutes les années"] {
  color: var(--md-sys-color-primary);
}

.school-year-icon[aria-label*="Toutes les années"] .year-badge {
  background: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary);
}

/* Responsive */
@media (max-width: 599px) {
  .school-year-icon {
    width: 40px;
    height: 40px;
  }

  .school-year-icon .material-symbols-outlined {
    font-size: 24px;
  }

  .year-badge {
    top: 4px;
    right: 4px;
    min-width: 14px;
    height: 14px;
    border-radius: 7px;
    font-size: 9px;
    padding: 0 3px;
  }
}

/* Focus visible pour l'accessibilité */
.school-year-icon:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

/* Animation du badge */
.year-badge {
  animation: badgeAppear 0.2s var(--md-sys-motion-easing-emphasized);
}

@keyframes badgeAppear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>