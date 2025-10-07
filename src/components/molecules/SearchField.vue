<template>
  <div class="search-field">
    <Input
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      prefix-icon="🔍"
      :suffix-icon="localValue ? '×' : undefined"
      @update:model-value="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template v-if="localValue" #suffix>
        <button
          type="button"
          class="search-clear"
          @click="handleClear"
          aria-label="Clear search"
        >
          ×
        </button>
      </template>
    </Input>

    <div v-if="suggestions.length > 0 && isFocused" class="search-suggestions">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        type="button"
        class="search-suggestion-item"
        @click="handleSuggestionClick(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '../atoms/Input.vue'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  suggestions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  disabled: false,
  suggestions: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}>()

const isFocused = ref(false)

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleInput = (value: string | number) => {
  emit('update:modelValue', String(value))
  emit('search', String(value))
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

const handleSuggestionClick = (suggestion: string) => {
  emit('update:modelValue', suggestion)
  emit('search', suggestion)
  isFocused.value = false
}
</script>

<style scoped>
.search-field {
  position: relative;
  width: 100%;
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant, #666);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-clear:hover {
  background: rgba(0, 0, 0, 0.05);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--md-sys-color-surface, white);
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
}

.search-suggestion-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--md-sys-color-on-surface, #1d1d1d);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-suggestion-item:hover {
  background: var(--md-sys-color-surface-variant, #f5f5f5);
}
</style>
