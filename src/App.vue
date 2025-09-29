<template>
  <div id="app">
    <RouterView />
    <NavigationRail />
    <BottomNavBar />
    <PwaInstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useClassStore } from '@/stores/classStore'

// Lazy load components that are not immediately visible
const NavigationRail = defineAsyncComponent(() => import('./components/NavigationRail.vue'))
const BottomNavBar = defineAsyncComponent(() => import('./components/BottomNavBar.vue'))
const PwaInstallPrompt = defineAsyncComponent({
  loader: () => import('./components/PwaInstallPrompt.vue'),
  delay: 200, // Show loading after 200ms
  timeout: 3000 // Timeout after 3s
})

const authStore = useAuthStore()
const classStore = useClassStore()

onMounted(() => {
  // Initialize class store
  classStore.initialize()

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    import('./registerSW')
  }
})

onBeforeUnmount(() => {
  authStore.stopAuthListener()
})
</script>

<style>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  box-sizing: border-box;
}

/* Small and Medium screens - Bottom Navigation */
@media (max-width: 839px) {
  #app {
    padding-bottom: 80px; /* MD3 bottom nav height */
    padding-left: 0;
  }
}

/* Large screens - Navigation Rail */
@media (min-width: 840px) {
  #app {
    padding-left: 80px; /* MD3 fixed rail width */
    padding-bottom: 0;
    transition: padding-left var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);
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
