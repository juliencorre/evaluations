<template>
  <RouterView />
  <PwaInstallPrompt />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'

onMounted(() => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    import('./registerSW')
  }
})
</script>
