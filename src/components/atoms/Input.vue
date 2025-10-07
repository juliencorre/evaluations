<template>
  <div :class="containerClasses">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>

    <div class="input-wrapper">
      <span v-if="prefixIcon" class="input-prefix-icon">{{ prefixIcon }}</span>

      <input
        :id="inputId"
        ref="inputRef"
        v-model="localValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />

      <span v-if="suffixIcon" class="input-suffix-icon">{{ suffixIcon }}</span>
    </div>

    <span v-if="error" class="input-error">{{ error }}</span>
    <span v-else-if="hint" class="input-hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  hint?: string
  prefixIcon?: string
  suffixIcon?: string
  autocomplete?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const containerClasses = computed(() => [
  'input-container',
  {
    'input-container--error': props.error,
    'input-container--disabled': props.disabled
  }
])

const inputClasses = computed(() => [
  'md-input',
  {
    'md-input--focused': isFocused.value,
    'md-input--error': props.error,
    'md-input--with-prefix': props.prefixIcon,
    'md-input--with-suffix': props.suffixIcon
  }
])

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant, #666);
  letter-spacing: 0.5px;
}

.input-required {
  color: var(--md-sys-color-error, #d32f2f);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.md-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline, #ccc);
  border-radius: 4px;
  font-size: 14px;
  line-height: 20px;
  color: var(--md-sys-color-on-surface, #1d1d1d);
  background: var(--md-sys-color-surface, white);
  transition: all 0.2s ease;
}

.md-input::placeholder {
  color: var(--md-sys-color-on-surface-variant, #999);
}

.md-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary, #2196f3);
  box-shadow: 0 0 0 1px var(--md-sys-color-primary, #2196f3);
}

.md-input--error {
  border-color: var(--md-sys-color-error, #d32f2f);
}

.md-input--error:focus {
  box-shadow: 0 0 0 1px var(--md-sys-color-error, #d32f2f);
}

.md-input:disabled {
  background: var(--md-sys-color-surface-variant, #f5f5f5);
  cursor: not-allowed;
  opacity: 0.6;
}

.md-input--with-prefix {
  padding-left: 40px;
}

.md-input--with-suffix {
  padding-right: 40px;
}

.input-prefix-icon,
.input-suffix-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-on-surface-variant, #666);
}

.input-prefix-icon {
  left: 12px;
}

.input-suffix-icon {
  right: 12px;
}

.input-error {
  font-size: 12px;
  color: var(--md-sys-color-error, #d32f2f);
}

.input-hint {
  font-size: 12px;
  color: var(--md-sys-color-on-surface-variant, #666);
}
</style>
