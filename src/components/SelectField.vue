<template>
  <div class="md-outlined-select-field" :class="fieldClasses">
    <!-- Select Element -->
    <select
      :id="id"
      ref="selectElement"
      v-model="selectValue"
      :required="required"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-describedby="supportingTextId"
      class="md-outlined-select-field__select"
      @focus="onFocus"
      @blur="onBlur"
      @change="onChange"
    >
      <option value="" disabled v-if="placeholder">{{ placeholder }}</option>
      <slot />
    </select>

    <!-- Label -->
    <label
      :for="id"
      class="md-outlined-select-field__label"
      :class="{ 'floating': isFloating }"
    >
      {{ label }}{{ required ? ' *' : '' }}
    </label>

    <!-- Dropdown Icon -->
    <div class="md-outlined-select-field__dropdown-icon">
      <span class="material-symbols-outlined">arrow_drop_down</span>
    </div>

    <!-- Outline -->
    <div class="md-outlined-select-field__outline">
      <div class="md-outlined-select-field__outline-start"></div>
      <div class="md-outlined-select-field__outline-notch">
        <div class="md-outlined-select-field__outline-leading" :class="{ 'floating': isFloating }"></div>
        <div class="md-outlined-select-field__outline-trailing"></div>
      </div>
      <div class="md-outlined-select-field__outline-end"></div>
    </div>

    <!-- Supporting Text -->
    <div v-if="supportingText || errorText" class="md-outlined-select-field__supporting-text">
      <div :id="supportingTextId" class="md-outlined-select-field__supporting-text-content">
        <span v-if="hasError" class="error-text">{{ errorText }}</span>
        <span v-else>{{ supportingText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string | number
  id: string
  label: string
  required?: boolean
  disabled?: boolean
  supportingText?: string
  errorText?: string
  placeholder?: string
  ariaLabel?: string
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  placeholder: '',
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  change: [event: Event]
}>()

const isFocused = ref(false)
const selectElement = ref<HTMLSelectElement | null>(null)

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasValue = computed(() => {
  return String(props.modelValue).length > 0 && props.modelValue !== ''
})

const hasError = computed(() => {
  return props.error || Boolean(props.errorText)
})

const isFloating = computed(() => {
  return isFocused.value || hasValue.value
})

const supportingTextId = computed(() => {
  return `${props.id}-supporting-text`
})

const fieldClasses = computed(() => ({
  'md-outlined-select-field--disabled': props.disabled,
  'md-outlined-select-field--error': hasError.value,
  'md-outlined-select-field--focused': isFocused.value,
  'md-outlined-select-field--populated': hasValue.value
}))

const onFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const onBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const onChange = (event: Event) => {
  emit('change', event)
}

// Méthodes publiques
const focus = () => {
  selectElement.value?.focus()
}

const blur = () => {
  selectElement.value?.blur()
}

defineExpose({
  focus,
  blur
})
</script>

<style scoped>
/* MD3 Design Tokens */
:root {
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-surface: #1d1b20;
  --md-sys-color-on-surface-variant: #49454f;
  --md-sys-color-outline: #79747e;
  --md-sys-color-error: #ba1a1a;
  --md-sys-color-surface: #ffffff;
  --md-outlined-select-field-container-height: 56px;
  --md-outlined-select-field-container-shape: 4px;
}

/* Base Container */
.md-outlined-select-field {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  min-height: var(--md-outlined-select-field-container-height);
  border-radius: var(--md-outlined-select-field-container-shape);
  background-color: transparent;
  vertical-align: top;
  font-family: 'Roboto', sans-serif;
}

/* Select Element */
.md-outlined-select-field__select {
  flex: 1;
  min-width: 0;
  min-height: inherit;
  width: 100%;
  background: none;
  appearance: none;
  border: none;
  outline: none;
  padding: 16px 40px 16px 16px;
  z-index: 1;
  font-family: inherit;
  font-size: 16px;
  line-height: 24px;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
}

/* Dropdown Icon */
.md-outlined-select-field__dropdown-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  z-index: 1;
  transition: transform 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-select-field--focused .md-outlined-select-field__dropdown-icon {
  transform: translateY(-50%) rotate(180deg);
}

/* Label */
.md-outlined-select-field__label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-family: inherit;
  font-size: 16px;
  line-height: 24px;
  color: var(--md-sys-color-on-surface-variant);
  background: #ffffff;
  padding: 0 8px;
  pointer-events: none;
  transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
  transform-origin: left center;
  z-index: 2;
  max-width: calc(100% - 64px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-outlined-select-field__label.floating {
  top: 0;
  font-size: 12px;
  line-height: 16px;
  transform: translateY(-50%) scale(0.75);
  color: var(--md-sys-color-primary);
  max-width: calc(133% - 64px);
  padding: 0 8px;
  margin: 0 -4px;
}

/* Outline */
.md-outlined-select-field__outline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: inherit;
  display: flex;
}

.md-outlined-select-field__outline-start {
  width: 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-right: none;
  border-top-left-radius: inherit;
  border-bottom-left-radius: inherit;
  transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1), border-width 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-select-field__outline-notch {
  flex: 1;
  display: flex;
  border-top: 1px solid var(--md-sys-color-outline);
  border-bottom: 1px solid var(--md-sys-color-outline);
  transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1), border-width 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-select-field__outline-leading {
  width: 12px;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-select-field__outline-leading.floating {
  border-top-color: transparent;
  border-bottom-color: transparent;
}

.md-outlined-select-field__outline-trailing {
  flex: 1;
  border-top: 1px solid var(--md-sys-color-outline);
  border-bottom: 1px solid var(--md-sys-color-outline);
  transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1), border-width 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-select-field__outline-end {
  width: 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-left: none;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
  transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1), border-width 150ms cubic-bezier(0.2, 0, 0, 1);
}

/* Supporting Text */
.md-outlined-select-field__supporting-text {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 4px;
  padding: 0 16px;
  font-size: 12px;
  line-height: 16px;
  color: var(--md-sys-color-on-surface-variant);
  min-height: 16px;
}

.md-outlined-select-field__supporting-text-content {
  flex: 1;
}

.error-text {
  color: var(--md-sys-color-error);
}

/* States */

/* Focused */
.md-outlined-select-field--focused .md-outlined-select-field__outline-start,
.md-outlined-select-field--focused .md-outlined-select-field__outline-end,
.md-outlined-select-field--focused .md-outlined-select-field__outline-trailing {
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
}

.md-outlined-select-field--focused .md-outlined-select-field__label.floating {
  color: var(--md-sys-color-primary);
}

/* Hover */
.md-outlined-select-field:hover:not(.md-outlined-select-field--focused):not(.md-outlined-select-field--disabled) .md-outlined-select-field__outline-start,
.md-outlined-select-field:hover:not(.md-outlined-select-field--focused):not(.md-outlined-select-field--disabled) .md-outlined-select-field__outline-end,
.md-outlined-select-field:hover:not(.md-outlined-select-field--focused):not(.md-outlined-select-field--disabled) .md-outlined-select-field__outline-trailing {
  border-color: var(--md-sys-color-on-surface);
}

/* Error */
.md-outlined-select-field--error .md-outlined-select-field__outline-start,
.md-outlined-select-field--error .md-outlined-select-field__outline-end,
.md-outlined-select-field--error .md-outlined-select-field__outline-trailing {
  border-color: var(--md-sys-color-error);
}

.md-outlined-select-field--error.md-outlined-select-field--focused .md-outlined-select-field__outline-start,
.md-outlined-select-field--error.md-outlined-select-field--focused .md-outlined-select-field__outline-end,
.md-outlined-select-field--error.md-outlined-select-field--focused .md-outlined-select-field__outline-trailing {
  border-color: var(--md-sys-color-error);
  border-width: 2px;
}

.md-outlined-select-field--error .md-outlined-select-field__label.floating {
  color: var(--md-sys-color-error);
}

/* Disabled */
.md-outlined-select-field--disabled {
  pointer-events: none;
}

.md-outlined-select-field--disabled .md-outlined-select-field__select {
  color: rgba(29, 27, 32, 0.38);
}

.md-outlined-select-field--disabled .md-outlined-select-field__label {
  color: rgba(73, 69, 79, 0.38);
}

.md-outlined-select-field--disabled .md-outlined-select-field__outline-start,
.md-outlined-select-field--disabled .md-outlined-select-field__outline-end,
.md-outlined-select-field--disabled .md-outlined-select-field__outline-trailing {
  border-color: rgba(121, 116, 126, 0.38);
}

.md-outlined-select-field--disabled .md-outlined-select-field__supporting-text {
  color: rgba(73, 69, 79, 0.38);
}

.md-outlined-select-field--disabled .md-outlined-select-field__dropdown-icon {
  color: rgba(73, 69, 79, 0.38);
}
</style>