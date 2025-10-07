/**
 * Badge Atom
 * Material Design badge component for displaying status, counts, or labels
 * Size: 89 lines (within 50-100 atom limit)
 */
<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BadgeVariant =
  | 'success' | 'info' | 'warning' | 'danger' | 'neutral'
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'n-a'

interface Props {
  variant?: BadgeVariant
  size?: 'small' | 'medium' | 'large'
  outlined?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'medium',
  outlined: false
})

const badgeClasses = computed(() => {
  const classes = ['badge']

  // Size classes
  classes.push(`badge-${props.size}`)

  // Variant classes with Tailwind + Material Design
  const variantMap: Record<BadgeVariant, string> = {
    'success': 'bg-md-success-container text-md-on-success-container border-md-success',
    'info': 'bg-md-info-container text-md-on-info-container border-md-info',
    'warning': 'bg-md-warning-container text-md-on-warning-container border-md-warning',
    'danger': 'bg-md-error-container text-md-on-error-container border-md-error',
    'neutral': 'bg-md-surface-variant text-md-on-surface-variant border-md-outline',
    'a': 'bg-md-success-container text-md-on-success-container border-md-success',
    'b': 'bg-md-info-container text-md-on-info-container border-md-info',
    'c': 'bg-md-warning-container text-md-on-warning-container border-md-warning',
    'd': 'bg-md-error-container text-md-on-error-container border-md-error',
    'e': 'bg-md-error-container text-md-on-error-container border-md-error',
    'n-a': 'bg-md-surface-variant text-md-on-surface-variant border-md-outline'
  }

  classes.push(variantMap[props.variant])

  // Outlined variant
  if (props.outlined) {
    classes.push('badge-outlined')
  }

  return classes
})
</script>

<style scoped>
.badge {
  @apply inline-flex items-center justify-center;
  @apply rounded-md-xs;
  @apply font-medium;
  @apply transition-all duration-md-fast;
  @apply border;
  min-width: 2rem;
  text-align: center;
}

.badge-small {
  @apply px-md-2 py-md-1;
  @apply text-md-label-small;
}

.badge-medium {
  @apply px-md-3 py-md-1;
  @apply text-md-label-medium;
}

.badge-large {
  @apply px-md-4 py-md-2;
  @apply text-md-label-large;
}

.badge-outlined {
  background: transparent !important;
}
</style>
