<template>
  <div id="app" :class="{ 'rail-expanded': isRailExpanded }">
    <RouterView />
    <AppHeader @rail-expanded="handleRailExpanded" />
    <PwaInstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'

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
  background-color: #ffffff;
}

* {
  box-sizing: border-box;
}
</style>
