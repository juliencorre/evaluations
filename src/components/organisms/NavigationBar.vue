<template>
  <nav :class="navClasses">
    <div class="nav-container">
      <div class="nav-brand">
        <slot name="brand">
          <h1 class="nav-title">{{ title }}</h1>
        </slot>
      </div>

      <div v-if="$slots.center" class="nav-center">
        <slot name="center" />
      </div>

      <div class="nav-actions">
        <slot name="actions" />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  variant?: 'filled' | 'elevated' | 'transparent'
  position?: 'fixed' | 'sticky' | 'static'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  variant: 'filled',
  position: 'static'
})

const navClasses = computed(() => [
  'navigation-bar',
  `navigation-bar--${props.variant}`,
  `navigation-bar--${props.position}`
])
</script>

<style scoped>
.navigation-bar {
  width: 100%;
  background: var(--md-sys-color-surface, white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  z-index: 100;
}

.navigation-bar--elevated {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08);
}

.navigation-bar--transparent {
  background: transparent;
  box-shadow: none;
}

.navigation-bar--fixed {
  position: fixed;
  top: 0;
  left: 0;
}

.navigation-bar--sticky {
  position: sticky;
  top: 0;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 16px;
  gap: 16px;
}

.nav-brand {
  flex-shrink: 0;
}

.nav-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1d1d1d);
  margin: 0;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 8px 12px;
  }

  .nav-center {
    display: none;
  }
}
</style>
