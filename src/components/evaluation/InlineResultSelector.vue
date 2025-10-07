<template>
  <!-- Portal pour affichage au-dessus du tableau -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="selectorRef"
      class="inline-result-selector-overlay"
      :style="overlayStyle"
    >
      <div class="select-dropdown" @click.stop>
        <div class="options-container">
          <button
            v-for="option in options"
            :key="option.value"
            :class="{
              'selected': option.value === selectedValue,
              [`level-${option.value.toLowerCase()}`]: true
            }"
            class="select-option"
            @click.stop="selectOption(option)"
          >
            <div class="option-content">
              <span class="option-label">{{ option.label }}</span>
              <span v-if="showPivotValue && option.pivot_value !== undefined" class="option-value">
                {{ option.pivot_value }}/10
              </span>
            </div>
            <svg v-if="option.value === selectedValue" class="check-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { ResultTypeConfigValue } from '@/types/evaluation'

interface Props {
  options: ResultTypeConfigValue[]
  selectedValue?: string
  showPivotValue?: boolean
  triggerElement?: HTMLElement
}

interface Emits {
  (e: 'select', option: ResultTypeConfigValue): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  showPivotValue: true
})

const emit = defineEmits<Emits>()

const isOpen = ref(true)
const selectorRef = ref<HTMLElement>()
const overlayPosition = ref({ top: 0, left: 0, width: 200 })

const overlayStyle = computed(() => ({
  position: 'fixed' as const,
  top: `${overlayPosition.value.top}px`,
  left: `${overlayPosition.value.left}px`,
  width: `${overlayPosition.value.width}px`,
  zIndex: 9999
}))

function calculatePosition() {
  if (!props.triggerElement) return

  const rect = props.triggerElement.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  // Calcul de la largeur optimale basée sur le contenu
  const longestLabel = props.options.reduce((longest, option) => {
    const labelLength = option.label.length + (props.showPivotValue && option.pivot_value !== undefined ? 6 : 0) // +6 pour " (X/10)"
    return labelLength > longest.length ? { length: labelLength, text: option.label } : longest
  }, { length: 0, text: '' })

  // Estimation approximative : 8px par caractère + padding + icône de check
  const estimatedWidth = Math.max(longestLabel.length * 8 + 64, 120) // Minimum 120px
  const dropdownWidth = Math.min(estimatedWidth, 300) // Maximum 300px

  // Dimensions du dropdown
  const dropdownHeight = Math.min(props.options.length * 52, 280) // 52px par option

  // Position par défaut : sous l'élément
  let top = rect.bottom + 4
  let left = rect.left

  // Si pas assez de place en bas, afficher au-dessus
  if (top + dropdownHeight > viewportHeight - 20) {
    top = rect.top - dropdownHeight - 4
  }

  // Si toujours pas assez de place, centrer verticalement
  if (top < 20) {
    top = Math.max(20, (viewportHeight - dropdownHeight) / 2)
  }

  // Ajuster horizontalement si nécessaire
  if (left + dropdownWidth > viewportWidth - 20) {
    left = viewportWidth - dropdownWidth - 20
  }

  if (left < 20) {
    left = 20
  }

  overlayPosition.value = {
    top: Math.round(top),
    left: Math.round(left),
    width: dropdownWidth
  }
}

function selectOption(option: ResultTypeConfigValue) {
  emit('select', option)
  closeSelector()
}

function closeSelector() {
  isOpen.value = false
  emit('close')
}

function handleClickOutside(event: Event) {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    closeSelector()
  }
}

function handleEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeSelector()
  }
}

onMounted(async () => {
  await nextTick()
  calculatePosition()

  // Ajouter les listeners
  document.addEventListener('click', handleClickOutside, true)
  document.addEventListener('keydown', handleEscapeKey)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  document.removeEventListener('keydown', handleEscapeKey)
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition, true)
})
</script>

<style scoped>
.inline-result-selector-overlay {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-large, 12px);
  box-shadow: var(--md-sys-elevation-level3);
  overflow: hidden;
  animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scaleY(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

.select-dropdown {
  max-height: 280px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.options-container {
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--md-sys-color-outline-variant) transparent;
}

.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: transparent;
}

.options-container::-webkit-scrollbar-thumb {
  background: var(--md-sys-color-outline-variant);
  border-radius: 3px;
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  position: relative;
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: var(--md-sys-color-surface-container-high);
}

.select-option.selected {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0; /* Permet la contraction */
}

.option-label {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-sys-typescale-body-medium-weight);
  color: var(--md-sys-color-on-surface);
  line-height: 1.2;
  white-space: nowrap; /* Évite le retour à la ligne */
}

.select-option.selected .option-label {
  color: var(--md-sys-color-on-primary-container);
  font-weight: 600;
}

.option-value {
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  margin-top: 2px;
}

.select-option.selected .option-value {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.8;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: var(--md-sys-color-on-primary-container);
  flex-shrink: 0;
}

/* Level-specific visual indicators */
.select-option.level-a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--md-sys-color-tertiary);
}

.select-option.level-b::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--md-sys-color-primary);
}

.select-option.level-c::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--md-sys-color-secondary);
}

.select-option.level-d::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--md-sys-color-error);
}

.select-option.level-e::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--md-sys-color-error-container);
}

.select-option.level-oui::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--md-sys-color-tertiary);
}

.select-option.level-non::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--md-sys-color-error);
}

.select-option.level-n-a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--md-sys-color-outline);
}

/* Responsive adjustments for small table cells */
@media (max-width: 768px) {
  .select-option {
    min-height: 40px;
    padding: 6px 8px;
  }

  .option-label {
    font-size: 14px;
  }

  .option-value {
    font-size: 12px;
  }

  .check-icon {
    width: 14px;
    height: 14px;
  }
}
</style>