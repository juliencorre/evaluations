<template>
  <span :class="iconClasses" :style="iconStyles" role="img" :aria-label="ariaLabel">
    {{ icon }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  size?: number | 'small' | 'medium' | 'large'
  color?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const iconClasses = computed(() => [
  'md-icon',
  typeof props.size === 'string' ? `md-icon--${props.size}` : ''
])

const iconStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (typeof props.size === 'number') {
    styles.fontSize = `${props.size}px`
  }

  if (props.color) {
    styles.color = props.color
  }

  return styles
})
</script>

<style scoped>
.md-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  line-height: 1;
  user-select: none;
}

.md-icon--small {
  font-size: 18px;
}

.md-icon--medium {
  font-size: 24px;
}

.md-icon--large {
  font-size: 32px;
}
</style>
