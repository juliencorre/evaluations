<template>
  <div class="result-selector" :class="{ 'open': isOpen }">
    <div
      class="selector-trigger"
      :class="{ 'has-value': selectedValue }"
      @click="toggleSelector"
    >
      <span class="current-value">
        {{ displayValue || placeholder }}
      </span>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </div>

    <Transition name="dropdown">
      <div v-if="isOpen" class="selector-dropdown" @click.stop>
        <div class="options-container">
          <button
            v-for="option in options"
            :key="option.value"
            :class="{
              'selected': option.value === selectedValue,
              [`level-${option.value.toLowerCase()}`]: true
            }"
            class="option-button"
            @click="selectOption(option)"
          >
            <div class="option-content">
              <span class="option-label">{{ option.label }}</span>
              <span v-if="option.pivot_value !== undefined" class="option-value">
                {{ option.pivot_value }}/10
              </span>
            </div>
            <svg v-if="option.value === selectedValue" class="check-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ResultTypeConfigValue } from '@/types/evaluation'

interface Props {
  options: ResultTypeConfigValue[]
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', option: ResultTypeConfigValue): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Sélectionner...',
  disabled: false
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const selectorRef = ref<HTMLElement>()

const selectedValue = computed(() => props.modelValue)

const displayValue = computed(() => {
  if (!selectedValue.value) return ''
  const option = props.options.find(opt => opt.value === selectedValue.value)
  return option?.label || selectedValue.value
})

function toggleSelector() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function selectOption(option: ResultTypeConfigValue) {
  emit('update:modelValue', option.value)
  emit('change', option)
  isOpen.value = false
}

function closeSelector() {
  isOpen.value = false
}

function handleClickOutside(event: Event) {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    closeSelector()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.result-selector {
  position: relative;
  width: 100%;
  min-width: 120px;
}

.selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 8px 12px;
  background: var(--md-sys-color-surface-container-high);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-medium, 8px);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  user-select: none;
}

.selector-trigger:hover {
  background: var(--md-sys-color-surface-container-highest);
  border-color: var(--md-sys-color-primary);
}

.selector-trigger.has-value {
  border-color: var(--md-sys-color-primary);
}

.current-value {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-sys-typescale-body-medium-weight);
  color: var(--md-sys-color-on-surface);
  flex: 1;
  text-align: left;
}

.chevron-icon {
  width: 20px;
  height: 20px;
  color: var(--md-sys-color-on-surface-variant);
  transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  flex-shrink: 0;
}

.result-selector.open .chevron-icon {
  transform: rotate(180deg);
}

.selector-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium, 8px);
  box-shadow: var(--md-sys-elevation-level2);
  overflow: hidden;
}

.options-container {
  max-height: 240px;
  overflow-y: auto;
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

.option-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.option-button:last-child {
  border-bottom: none;
}

.option-button:hover {
  background: var(--md-sys-color-surface-container-high);
}

.option-button.selected {
  background: var(--md-sys-color-primary-container);
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.option-label {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  color: var(--md-sys-color-on-surface);
  line-height: 1.2;
}

.option-value {
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  margin-top: 2px;
}

.check-icon {
  width: 20px;
  height: 20px;
  color: var(--md-sys-color-primary);
  flex-shrink: 0;
}

/* Level-specific styles for visual feedback */
.option-button.level-a {
  border-left: 4px solid var(--md-sys-color-tertiary);
}

.option-button.level-b {
  border-left: 4px solid var(--md-sys-color-primary);
}

.option-button.level-c {
  border-left: 4px solid var(--md-sys-color-secondary);
}

.option-button.level-d {
  border-left: 4px solid var(--md-sys-color-error);
}

.option-button.level-e {
  border-left: 4px solid var(--md-sys-color-error-container);
}

.option-button.level-oui {
  border-left: 4px solid var(--md-sys-color-tertiary);
}

.option-button.level-non {
  border-left: 4px solid var(--md-sys-color-error);
}

.option-button.level-n-a {
  border-left: 4px solid var(--md-sys-color-outline);
}

/* Dropdown animation */
.dropdown-enter-active {
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
}

.dropdown-leave-active {
  transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-emphasized);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scaleY(0.8);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scaleY(0.9);
}

/* Responsive design */
@media (max-width: 768px) {
  .selector-dropdown {
    position: fixed;
    top: auto;
    bottom: 20px;
    left: 20px;
    right: 20px;
    margin-top: 0;
    max-height: 50vh;
  }

  .option-button {
    min-height: 56px;
    padding: 16px;
  }
}

/* Disabled state */
.result-selector[disabled] .selector-trigger {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--md-sys-color-surface-variant);
}
</style>