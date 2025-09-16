<template>
  <div id="app">
    <AppHeader />
    <RouterView />
    <PwaInstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'

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
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
</style>
