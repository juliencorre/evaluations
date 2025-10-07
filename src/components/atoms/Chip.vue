<template>
  <div :class="chipClasses" @click="handleClick">
    <span v-if="icon" class="chip-icon">{{ icon }}</span>
    <span class="chip-label"><slot /></span>
    <button
      v-if="removable"
      type="button"
      class="chip-remove"
      @click.stop="handleRemove"
      aria-label="Remove"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'filled' | 'outlined' | 'elevated'
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning'
  size?: 'small' | 'medium'
  icon?: string
  removable?: boolean
  selected?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'filled',
  color: 'primary',
  size: 'medium',
  removable: false,
  selected: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'remove'): void
}>()

const chipClasses = computed(() => [
  'md-chip',
  `md-chip--${props.variant}`,
  `md-chip--${props.color}`,
  `md-chip--${props.size}`,
  {
    'md-chip--selected': props.selected,
    'md-chip--disabled': props.disabled,
    'md-chip--clickable': !props.disabled
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}

const handleRemove = () => {
  if (!props.disabled) {
    emit('remove')
  }
}
</script>

<style scoped>
.md-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  cursor: default;
  transition: all 0.2s ease;
  user-select: none;
}

.md-chip--clickable {
  cursor: pointer;
}

.md-chip--filled {
  background: var(--md-sys-color-surface-variant, #e0e0e0);
  color: var(--md-sys-color-on-surface-variant, #1d1d1d);
}

.md-chip--outlined {
  background: transparent;
  border: 1px solid var(--md-sys-color-outline, #ccc);
  color: var(--md-sys-color-on-surface, #1d1d1d);
}

.md-chip--elevated {
  background: var(--md-sys-color-surface-container-low, white);
  color: var(--md-sys-color-on-surface, #1d1d1d);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.md-chip--primary.md-chip--filled {
  background: var(--md-sys-color-primary-container, #e3f2fd);
  color: var(--md-sys-color-on-primary-container, #0d47a1);
}

.md-chip--secondary.md-chip--filled {
  background: var(--md-sys-color-secondary-container, #f3e5f5);
  color: var(--md-sys-color-on-secondary-container, #4a148c);
}

.md-chip--error.md-chip--filled {
  background: var(--md-sys-color-error-container, #ffebee);
  color: var(--md-sys-color-on-error-container, #b71c1c);
}

.md-chip--success.md-chip--filled {
  background: #e8f5e9;
  color: #2e7d32;
}

.md-chip--warning.md-chip--filled {
  background: #fff3e0;
  color: #e65100;
}

.md-chip--selected {
  background: var(--md-sys-color-secondary-container, #e3f2fd);
  color: var(--md-sys-color-on-secondary-container, #0d47a1);
}

.md-chip--small {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 12px;
}

.md-chip--disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.md-chip--clickable:hover:not(.md-chip--disabled) {
  filter: brightness(0.95);
}

.chip-icon {
  font-size: 16px;
  line-height: 1;
}

.chip-label {
  line-height: 1;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 4px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: currentColor;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease;
}

.chip-remove:hover {
  background: rgba(0, 0, 0, 0.1);
}
</style>
