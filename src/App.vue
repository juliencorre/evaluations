<template>
  <div id="app" :class="{ 'rail-expanded': isRailExpanded }">
    <RouterView />
    <AppHeader @rail-expanded="handleRailExpanded" />
    <PwaInstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref, defineAsyncComponent } from 'vue'

// Lazy load components that are not immediately visible
const AppHeader = defineAsyncComponent(() => import('./components/AppHeader.vue'))
const PwaInstallPrompt = defineAsyncComponent({
  loader: () => import('./components/PwaInstallPrompt.vue'),
  delay: 200, // Show loading after 200ms
  timeout: 3000 // Timeout after 3s
})

const isRailExpanded = ref(false)

function handleRailExpanded(expanded: boolean) {
  isRailExpanded.value = expanded
}

onMounted(() => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    import('./registerSW')
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* Space for bottom navigation */
}

/* Large Screen Layout - Navigation Rail */
@media (min-width: 1440px) {
  #app {
    padding-left: 45px; /* Mode compact : 45px seulement */
    padding-bottom: 0; /* Remove bottom padding */
    transition: padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  #app.rail-expanded {
    padding-left: 185px;
  }
}

body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

* {
  box-sizing: border-box;
}
</style>
