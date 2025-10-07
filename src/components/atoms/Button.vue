<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled"
    @click="handleClick"
  >
    <span v-if="loading" class="button-spinner"></span>
    <span v-if="icon && !loading" class="button-icon">{{ icon }}</span>
    <span class="button-text"><slot /></span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
  size?: 'small' | 'medium' | 'large'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  icon?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'filled',
  size: 'medium',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const buttonClasses = computed(() => [
  'md-button',
  `md-button--${props.variant}`,
  `md-button--${props.size}`,
  {
    'md-button--disabled': props.disabled || props.loading,
    'md-button--loading': props.loading,
    'md-button--full-width': props.fullWidth,
    'md-button--with-icon': props.icon
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.md-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.md-button--filled {
  background: var(--md-sys-color-primary, #2196f3);
  color: var(--md-sys-color-on-primary, white);
}

.md-button--filled:hover:not(.md-button--disabled) {
  background: var(--md-sys-color-primary-container, #1976d2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.md-button--outlined {
  background: transparent;
  color: var(--md-sys-color-primary, #2196f3);
  border: 1px solid var(--md-sys-color-outline, #ccc);
}

.md-button--text {
  background: transparent;
  color: var(--md-sys-color-primary, #2196f3);
}

.md-button--elevated {
  background: var(--md-sys-color-surface-container-low, white);
  color: var(--md-sys-color-primary, #2196f3);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.md-button--tonal {
  background: var(--md-sys-color-secondary-container, #e3f2fd);
  color: var(--md-sys-color-on-secondary-container, #0d47a1);
}

.md-button--small {
  padding: 6px 16px;
  font-size: 13px;
}

.md-button--large {
  padding: 14px 32px;
  font-size: 15px;
}

.md-button--disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.md-button--full-width {
  width: 100%;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.button-icon {
  font-size: 18px;
}
</style>
