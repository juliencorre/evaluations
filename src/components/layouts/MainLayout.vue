<template>
  <div class="main-layout">
    <NavigationBar
      v-if="showNavigation"
      :title="navigationTitle"
      variant="elevated"
      position="sticky"
    >
      <template #brand>
        <slot name="navigation-brand" />
      </template>

      <template #center>
        <slot name="navigation-center" />
      </template>

      <template #actions>
        <slot name="navigation-actions" />
      </template>
    </NavigationBar>

    <div class="main-container">
      <aside v-if="$slots.sidebar" class="main-sidebar">
        <slot name="sidebar" />
      </aside>

      <main class="main-content">
        <slot />
      </main>

      <aside v-if="$slots.aside" class="main-aside">
        <slot name="aside" />
      </aside>
    </div>

    <footer v-if="$slots.footer" class="main-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import NavigationBar from '../organisms/NavigationBar.vue'

interface Props {
  navigationTitle?: string
  showNavigation?: boolean
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  navigationTitle: 'Application',
  showNavigation: true,
  maxWidth: '1400px'
})
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-background, #fafafa);
}

.main-container {
  display: flex;
  flex: 1;
  max-width: v-bind(maxWidth);
  width: 100%;
  margin: 0 auto;
  gap: 24px;
  padding: 24px;
}

.main-sidebar {
  width: 250px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.main-aside {
  width: 300px;
  flex-shrink: 0;
}

.main-footer {
  padding: 24px;
  border-top: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
  background: var(--md-sys-color-surface, white);
}

@media (max-width: 1024px) {
  .main-sidebar {
    width: 200px;
  }

  .main-aside {
    display: none;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 16px;
    gap: 16px;
  }

  .main-sidebar {
    display: none;
  }
}
</style>
