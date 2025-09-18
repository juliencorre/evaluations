<template>
  <div class="md-outlined-text-field" :class="fieldClasses">
    <!-- Leading Icon -->
    <div v-if="leadingIcon" class="md-outlined-text-field__leading-icon">
      <span class="material-symbols-outlined">{{ leadingIcon }}</span>
    </div>

    <!-- Input Element -->
    <component
      :is="textarea ? 'textarea' : 'input'"
      :id="id"
      ref="inputElement"
      :value="displayValue"
      :type="type"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="placeholder"
      :rows="textarea ? rows : undefined"
      :maxlength="maxLength"
      :minlength="minLength"
      :pattern="pattern"
      :aria-label="ariaLabel"
      :aria-describedby="supportingTextId"
      class="md-outlined-text-field__input"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
      @keydown="onKeydown"
    />

    <!-- Trailing Icon -->
    <div v-if="trailingIcon" class="md-outlined-text-field__trailing-icon" @click="onTrailingIconClick">
      <span class="material-symbols-outlined">{{ trailingIcon }}</span>
    </div>

    <!-- Label -->
    <label
      :for="id"
      class="md-outlined-text-field__label"
      :class="{ 'floating': isFloating }"
    >
      {{ label }}{{ required ? ' *' : '' }}
    </label>

    <!-- Outline -->
    <div class="md-outlined-text-field__outline">
      <div class="md-outlined-text-field__outline-start"></div>
      <div class="md-outlined-text-field__outline-notch">
        <div class="md-outlined-text-field__outline-leading" :class="{ 'floating': isFloating }"></div>
        <div class="md-outlined-text-field__outline-trailing"></div>
      </div>
      <div class="md-outlined-text-field__outline-end"></div>
    </div>

    <!-- Supporting Text -->
    <div v-if="supportingText || errorText || showCharacterCount" class="md-outlined-text-field__supporting-text">
      <div :id="supportingTextId" class="md-outlined-text-field__supporting-text-content">
        <span v-if="hasError" class="error-text">{{ errorText }}</span>
        <span v-else>{{ supportingText }}</span>
      </div>
      <div v-if="showCharacterCount" class="md-outlined-text-field__character-count">
        {{ characterCount }}/{{ maxLength }}
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
  type?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  textarea?: boolean
  rows?: number
  supportingText?: string
  errorText?: string
  placeholder?: string
  leadingIcon?: string
  trailingIcon?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  ariaLabel?: string
  showCharacterCount?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false,
  textarea: false,
  rows: 3,
  placeholder: '',
  showCharacterCount: false,
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  keydown: [event: KeyboardEvent]
  'trailing-icon-click': []
}>()

const isFocused = ref(false)
const inputElement = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

const displayValue = computed(() => {
  return props.modelValue
})

const hasValue = computed(() => {
  return String(props.modelValue).length > 0
})

const hasError = computed(() => {
  return props.error || Boolean(props.errorText)
})

const isFloating = computed(() => {
  return isFocused.value || hasValue.value || Boolean(props.placeholder)
})

const characterCount = computed(() => {
  return String(props.modelValue).length
})

const supportingTextId = computed(() => {
  return `${props.id}-supporting-text`
})

const fieldClasses = computed(() => ({
  'md-outlined-text-field--disabled': props.disabled,
  'md-outlined-text-field--error': hasError.value,
  'md-outlined-text-field--focused': isFocused.value,
  'md-outlined-text-field--populated': hasValue.value,
  'md-outlined-text-field--with-leading-icon': Boolean(props.leadingIcon),
  'md-outlined-text-field--with-trailing-icon': Boolean(props.trailingIcon),
  'md-outlined-text-field--textarea': props.textarea
}))

const onFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const onBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  if (!target) {
    return
  }

  emit('update:modelValue', target.value)
  emit('input', event)
}

const onKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const onTrailingIconClick = () => {
  emit('trailing-icon-click')
}

// Méthodes publiques conformes Material Web
const focus = () => {
  inputElement.value?.focus()
}

const blur = () => {
  inputElement.value?.blur()
}

const select = () => {
  if (inputElement.value && 'select' in inputElement.value) {
    inputElement.value.select()
  }
}

const reportValidity = () => {
  if (inputElement.value && 'reportValidity' in inputElement.value) {
    return inputElement.value.reportValidity()
  }
  return true
}

defineExpose({
  focus,
  blur,
  select,
  reportValidity
})
</script>

<style scoped>
/* Material Design 3 Outlined Text Field */
/* Based on https://github.com/material-components/material-web/blob/main/docs/components/text-field.md */

/* MD3 Design Tokens */
:root {
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #eaddff;
  --md-sys-color-on-primary-container: #21005d;
  --md-sys-color-surface: #fffbfe;
  --md-sys-color-on-surface: #1c1b1f;
  --md-sys-color-on-surface-variant: #49454f;
  --md-sys-color-outline: #79747e;
  --md-sys-color-outline-variant: #cac4d0;
  --md-sys-color-error: #ba1a1a;
  --md-sys-color-on-error: #ffffff;
  --md-sys-color-error-container: #ffdad6;
  --md-sys-color-on-error-container: #410002;

  /* Material 3 Text Field Tokens */
  --md-outlined-text-field-container-height: 56px;
  --md-outlined-text-field-container-shape: 4px;
  --md-outlined-text-field-outline-width: 1px;
  --md-outlined-text-field-focus-outline-width: 2px;
  --md-outlined-text-field-disabled-outline-opacity: 0.12;

  /* Typography tokens */
  --md-sys-typescale-body-large-font: 'Roboto';
  --md-sys-typescale-body-large-size: 16px;
  --md-sys-typescale-body-large-weight: 400;
  --md-sys-typescale-body-large-line-height: 24px;

  --md-sys-typescale-body-small-font: 'Roboto';
  --md-sys-typescale-body-small-size: 12px;
  --md-sys-typescale-body-small-weight: 400;
  --md-sys-typescale-body-small-line-height: 16px;
}

/* Base Container - Material 3 Outlined Text Field */
.md-outlined-text-field {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  min-height: var(--md-outlined-text-field-container-height);
  border-radius: var(--md-outlined-text-field-container-shape);
  background-color: transparent;
  vertical-align: top;
  font-family: var(--md-sys-typescale-body-large-font);

  /* Ensure proper stacking context */
  isolation: isolate;
}

/* Input Element - Material 3 Specifications */
.md-outlined-text-field__input {
  flex: 1;
  min-width: 0;
  min-height: inherit;
  max-height: 100%;
  width: 100%;
  resize: none;
  background: none;
  appearance: none;
  border: none;
  outline: none;
  padding: 16px;
  z-index: 1;

  /* Material 3 Typography - Body Large */
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);

  /* Material 3 Colors */
  color: var(--md-sys-color-on-surface);
  caret-color: var(--md-sys-color-primary);

  /* Remove autofill styling */
  -webkit-autofill,
  -webkit-autofill:hover,
  -webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--md-sys-color-surface) inset;
    -webkit-text-fill-color: var(--md-sys-color-on-surface);
  }
}

.md-outlined-text-field--textarea .md-outlined-text-field__input {
  min-height: 88px;
  resize: vertical;
  padding-top: 20px;
  padding-bottom: 20px;
}

/* Icons */
.md-outlined-text-field__leading-icon,
.md-outlined-text-field__trailing-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 16px 12px;
  color: var(--md-sys-color-on-surface-variant);
  z-index: 1;
}

.md-outlined-text-field__trailing-icon {
  cursor: pointer;
}

.md-outlined-text-field--with-leading-icon .md-outlined-text-field__input {
  padding-left: 0;
  margin-left: 0;
}

.md-outlined-text-field--with-trailing-icon .md-outlined-text-field__input {
  padding-right: 0;
  margin-right: 0;
}

/* Label - Material 3 Floating Label */
.md-outlined-text-field__label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);

  /* Material 3 Typography - Body Large for resting state */
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);

  /* Material 3 Colors */
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface);

  /* Layout and interaction */
  padding: 0 4px;
  pointer-events: none;
  transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
  transform-origin: left center;
  z-index: 1;
  max-width: calc(100% - 32px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-outlined-text-field--with-leading-icon .md-outlined-text-field__label {
  left: 52px;
  max-width: calc(100% - 68px);
}

.md-outlined-text-field__label.floating {
  top: 0;

  /* Material 3 Typography - Body Small for floating state */
  font-size: var(--md-sys-typescale-body-small-size);
  font-weight: var(--md-sys-typescale-body-small-weight);
  line-height: var(--md-sys-typescale-body-small-line-height);

  /* Transform to floating position */
  transform: translateY(-50%) scale(1);

  /* Maintain outline variant color in resting floating state */
  color: var(--md-sys-color-on-surface-variant);

  /* Adjust layout for smaller text */
  max-width: calc(100% - 32px);
  padding: 0 4px;
  margin: 0;
}

/* Outline - Material 3 Outline System */
.md-outlined-text-field__outline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: inherit;
  display: flex;

  /* Ensure outline is behind content but above background */
  z-index: 0;
}

.md-outlined-text-field__outline-start {
  width: 12px;
  border: var(--md-outlined-text-field-outline-width) solid var(--md-sys-color-outline);
  border-right: none;
  border-top-left-radius: inherit;
  border-bottom-left-radius: inherit;
  transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1), border-width 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-text-field__outline-notch {
  flex: 1;
  display: flex;
  border-top: var(--md-outlined-text-field-outline-width) solid var(--md-sys-color-outline);
  border-bottom: var(--md-outlined-text-field-outline-width) solid var(--md-sys-color-outline);
  transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1), border-width 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-text-field__outline-leading {
  width: 12px;
  border-top: var(--md-outlined-text-field-outline-width) solid var(--md-sys-color-outline);
  border-bottom: var(--md-outlined-text-field-outline-width) solid var(--md-sys-color-outline);
  transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-text-field__outline-leading.floating {
  border-top-color: transparent;
  border-bottom-color: transparent;
  width: 8px;
}

.md-outlined-text-field__outline-trailing {
  flex: 1;
  border-top: var(--md-outlined-text-field-outline-width) solid var(--md-sys-color-outline);
  border-bottom: var(--md-outlined-text-field-outline-width) solid var(--md-sys-color-outline);
  transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1), border-width 150ms cubic-bezier(0.2, 0, 0, 1);
}

.md-outlined-text-field__outline-end {
  width: 12px;
  border: var(--md-outlined-text-field-outline-width) solid var(--md-sys-color-outline);
  border-left: none;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
  transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1), border-width 150ms cubic-bezier(0.2, 0, 0, 1);
}

/* Supporting Text - Material 3 Typography */
.md-outlined-text-field__supporting-text {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 4px;
  padding: 0 16px;

  /* Material 3 Typography - Body Small */
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  font-weight: var(--md-sys-typescale-body-small-weight);
  line-height: var(--md-sys-typescale-body-small-line-height);

  color: var(--md-sys-color-on-surface-variant);
  min-height: 16px;
}

.md-outlined-text-field__supporting-text-content {
  flex: 1;
}

.md-outlined-text-field__character-count {
  color: var(--md-sys-color-on-surface-variant);
  margin-left: 16px;
}

.error-text {
  color: var(--md-sys-color-error);
}

/* States */

/* Focused State - Material 3 Focus Indicators */
.md-outlined-text-field--focused .md-outlined-text-field__outline-start,
.md-outlined-text-field--focused .md-outlined-text-field__outline-end,
.md-outlined-text-field--focused .md-outlined-text-field__outline-trailing {
  border-color: var(--md-sys-color-primary);
  border-width: var(--md-outlined-text-field-focus-outline-width);
}

/* Focused label color only when floating and focused */
.md-outlined-text-field--focused .md-outlined-text-field__label.floating {
  color: var(--md-sys-color-primary);
}

/* Leading section adjustments for focus */
.md-outlined-text-field--focused .md-outlined-text-field__outline-leading {
  border-top-width: var(--md-outlined-text-field-focus-outline-width);
  border-bottom-width: var(--md-outlined-text-field-focus-outline-width);
}

/* Hover */
.md-outlined-text-field:hover:not(.md-outlined-text-field--focused):not(.md-outlined-text-field--disabled) .md-outlined-text-field__outline-start,
.md-outlined-text-field:hover:not(.md-outlined-text-field--focused):not(.md-outlined-text-field--disabled) .md-outlined-text-field__outline-end,
.md-outlined-text-field:hover:not(.md-outlined-text-field--focused):not(.md-outlined-text-field--disabled) .md-outlined-text-field__outline-trailing {
  border-color: var(--md-sys-color-on-surface);
}

/* Error */
.md-outlined-text-field--error .md-outlined-text-field__outline-start,
.md-outlined-text-field--error .md-outlined-text-field__outline-end,
.md-outlined-text-field--error .md-outlined-text-field__outline-trailing {
  border-color: var(--md-sys-color-error);
}

.md-outlined-text-field--error.md-outlined-text-field--focused .md-outlined-text-field__outline-start,
.md-outlined-text-field--error.md-outlined-text-field--focused .md-outlined-text-field__outline-end,
.md-outlined-text-field--error.md-outlined-text-field--focused .md-outlined-text-field__outline-trailing {
  border-color: var(--md-sys-color-error);
  border-width: 2px;
}

.md-outlined-text-field--error .md-outlined-text-field__label.floating {
  color: var(--md-sys-color-error);
}

.md-outlined-text-field--error .md-outlined-text-field__input {
  caret-color: var(--md-sys-color-error);
}

/* Disabled State - Material 3 Disabled Opacity */
.md-outlined-text-field--disabled {
  pointer-events: none;
}

.md-outlined-text-field--disabled .md-outlined-text-field__input {
  color: var(--md-sys-color-on-surface);
  opacity: 0.38;
}

.md-outlined-text-field--disabled .md-outlined-text-field__label {
  color: var(--md-sys-color-on-surface);
  opacity: 0.38;
}

.md-outlined-text-field--disabled .md-outlined-text-field__outline-start,
.md-outlined-text-field--disabled .md-outlined-text-field__outline-end,
.md-outlined-text-field--disabled .md-outlined-text-field__outline-trailing,
.md-outlined-text-field--disabled .md-outlined-text-field__outline-leading {
  border-color: var(--md-sys-color-on-surface);
  opacity: var(--md-outlined-text-field-disabled-outline-opacity);
}

.md-outlined-text-field--disabled .md-outlined-text-field__supporting-text {
  color: var(--md-sys-color-on-surface);
  opacity: 0.38;
}

.md-outlined-text-field--disabled .md-outlined-text-field__leading-icon,
.md-outlined-text-field--disabled .md-outlined-text-field__trailing-icon {
  color: var(--md-sys-color-on-surface);
  opacity: 0.38;
}
</style>