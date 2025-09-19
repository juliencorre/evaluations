<template>
  <label class="md3-switch">
    <input
      :id="id"
      type="checkbox"
      role="switch"
      :checked="modelValue"
      :aria-checked="ariaChecked"
      :aria-describedby="ariaDescribedby"
      @change="handleChange"
    />
    <span class="md3-switch__track">
      <span class="md3-switch__handle"></span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: string
  modelValue: boolean
  ariaDescribedby?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const ariaChecked = computed<'true' | 'false'>(() =>
  props.modelValue ? 'true' : 'false'
)

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }

  emit('update:modelValue', target.checked)
}
</script>

<style scoped>
.md3-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.md3-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.md3-switch__track {
  position: relative;
  width: 52px;
  height: 32px;
  background: color-mix(in srgb, var(--md-sys-color-surface-variant, #dbe4e4) 80%, transparent);
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  transition:
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-outline-variant, #bfc8c7) 60%, transparent);
}

.md3-switch__handle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--md-sys-color-surface);
  box-shadow:
    0px 1px 3px rgba(0, 0, 0, 0.15),
    0px 1px 2px rgba(0, 0, 0, 0.3);
  transform: translateX(0);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.md3-switch input:checked + .md3-switch__track {
  background: var(--md-sys-color-primary, #006a6b);
  box-shadow: none;
}

.md3-switch input:checked + .md3-switch__track .md3-switch__handle {
  transform: translateX(20px);
  background: var(--md-sys-color-on-primary);
}

.md3-switch input:focus-visible + .md3-switch__track {
  outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary, #006a6b) 40%, transparent);
  outline-offset: 4px;
}

.md3-switch input:disabled + .md3-switch__track {
  cursor: not-allowed;
  opacity: 0.38;
}
</style>