<template>
  <!-- Portal pour affichage au-dessus du tableau -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="inputRef"
      class="inline-numeric-input-overlay"
      :style="overlayStyle"
    >
      <div class="numeric-input-container" @click.stop>
        <div class="input-wrapper">
          <input
            ref="numericInput"
            v-model="inputValue"
            type="number"
            min="0"
            :step="step"
            class="numeric-input"
            placeholder="Saisir un nombre entier"
            @keydown="handleKeydown"
            @blur="handleBlur"
          />
          <div class="input-actions">
            <button
              type="button"
              class="action-button save-button"
              :disabled="!isValidValue"
              @click="saveValue"
            >
              ✓
            </button>
            <button
              type="button"
              class="action-button cancel-button"
              @click="cancel"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="value-info">
          <span v-if="isValidValue" class="score-preview">
            → {{ calculateScore(Number(inputValue)) }}/10
          </span>
          <span v-else class="range-text">Entier positif</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  initialValue?: string | number
  minValue?: number
  maxValue?: number
  step?: number
  triggerElement?: HTMLElement
}

interface Emits {
  (e: 'save', value: string): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  step: 1
})

const emit = defineEmits<Emits>()

const isOpen = ref(true)
const inputRef = ref<HTMLElement>()
const numericInput = ref<HTMLInputElement>()
const inputValue = ref(String(props.initialValue || ''))
const overlayPosition = ref({ top: 0, left: 0, width: 180 })

const overlayStyle = computed(() => ({
  position: 'fixed' as const,
  top: `${overlayPosition.value.top}px`,
  left: `${overlayPosition.value.left}px`,
  width: `${overlayPosition.value.width}px`,
  zIndex: 9999
}))

const isValidValue = computed(() => {
  const value = Number(inputValue.value)
  // For free numeric input, just check if it's a valid integer
  return !isNaN(value) && Number.isInteger(value) && value >= 0
})

function calculateScore(value: number): number {
  // For free numeric input, score is based on 10-point scale
  // Each point = 1 point on the scale, max 10
  return Math.min(value, 10)
}

function calculatePosition() {
  if (!props.triggerElement) return

  const rect = props.triggerElement.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  const inputHeight = 85
  const inputWidth = 180 // Reduced width for better fit

  // Position par défaut : sous l'élément, aligné à droite de la cellule
  let top = rect.bottom + 4
  let left = rect.right - inputWidth // Align to right edge of trigger element

  // Si pas assez de place en bas, afficher au-dessus
  if (top + inputHeight > viewportHeight - 20) {
    top = rect.top - inputHeight - 4
  }

  // Si toujours pas assez de place, centrer verticalement
  if (top < 20) {
    top = Math.max(20, (viewportHeight - inputHeight) / 2)
  }

  // Ajuster horizontalement si nécessaire
  if (left + inputWidth > viewportWidth - 20) {
    left = viewportWidth - inputWidth - 20
  }

  if (left < 20) {
    left = 20
  }

  overlayPosition.value = {
    top: Math.round(top),
    left: Math.round(left),
    width: inputWidth
  }
}

function saveValue() {
  if (isValidValue.value) {
    emit('save', inputValue.value)
    closeInput()
  }
}

function cancel() {
  closeInput()
}

function closeInput() {
  isOpen.value = false
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (isValidValue.value) {
      saveValue()
    }
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
  }
}

function handleBlur() {
  // Delay closing to allow clicking buttons
  setTimeout(() => {
    if (isOpen.value) {
      cancel()
    }
  }, 150)
}

function handleClickOutside(event: Event) {
  if (inputRef.value && !inputRef.value.contains(event.target as Node)) {
    cancel()
  }
}

onMounted(async () => {
  await nextTick()
  calculatePosition()

  // Focus the input
  if (numericInput.value) {
    numericInput.value.focus()
    numericInput.value.select()
  }

  // Add listeners
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition, true)
})
</script>

<style scoped>
.inline-numeric-input-overlay {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-large, 12px);
  box-shadow: var(--md-sys-elevation-level3);
  overflow: hidden;
  animation: inputSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes inputSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scaleY(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

.numeric-input-container {
  padding: 12px;
}

.input-wrapper {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.numeric-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-small);
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: 14px;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface);
  transition: border-color 0.2s ease;
  min-width: 0; /* Allow input to shrink */
}

.numeric-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.action-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--md-sys-shape-corner-small);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.save-button {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.save-button:hover:not(:disabled) {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.save-button:disabled {
  background: var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-button {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.cancel-button:hover {
  background: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
}

.value-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: var(--md-sys-color-on-surface-variant);
}

.range-text {
  font-weight: 500;
  line-height: 1.2;
}

.score-preview {
  color: var(--md-sys-color-primary);
  font-weight: 600;
  line-height: 1.2;
}
</style>