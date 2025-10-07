<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <div class="card-content">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'elevated' | 'filled' | 'outlined'
  padding?: 'none' | 'small' | 'medium' | 'large'
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'elevated',
  padding: 'medium',
  hoverable: false
})

const cardClasses = computed(() => [
  'md-card',
  `md-card--${props.variant}`,
  `md-card--padding-${props.padding}`,
  {
    'md-card--hoverable': props.hoverable
  }
])
</script>

<style scoped>
.md-card {
  background: var(--md-sys-color-surface, white);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.md-card--elevated {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.md-card--filled {
  background: var(--md-sys-color-surface-variant, #f5f5f5);
}

.md-card--outlined {
  border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}

.md-card--hoverable:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), 0 4px 8px 2px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.md-card--padding-none .card-content {
  padding: 0;
}

.md-card--padding-small .card-content {
  padding: 12px;
}

.md-card--padding-medium .card-content {
  padding: 16px;
}

.md-card--padding-large .card-content {
  padding: 24px;
}

.card-header {
  padding: 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}

.card-content {
  padding: 16px;
}

.card-footer {
  padding: 16px;
  border-top: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}
</style>
