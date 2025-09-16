<template>
  <div v-if="showPrompt" class="pwa-install-prompt">
    <div class="prompt-content">
      <h3>Installer l'application</h3>
      <p>Installez cette app pour une meilleure expérience !</p>
      <div class="prompt-actions">
        <button class="install-btn" @click="install">Installer</button>
        <button class="dismiss-btn" @click="dismiss">Plus tard</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
let deferredPrompt: unknown = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showPrompt.value = true
  })

  window.addEventListener('appinstalled', () => {
    showPrompt.value = false
    deferredPrompt = null
  })
})

const install = async () => {
  if (deferredPrompt && typeof deferredPrompt === 'object' && 'prompt' in deferredPrompt) {
    ;(deferredPrompt as { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }).prompt()
    const { outcome } = await (deferredPrompt as { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }).userChoice
    
    if (outcome === 'accepted') {
      showPrompt.value = false
    }
    
    deferredPrompt = null
  }
}

const dismiss = () => {
  showPrompt.value = false
}
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 20px;
  z-index: 1000;
  max-width: 400px;
  margin: 0 auto;
}

.prompt-content h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.prompt-content p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
}

.prompt-actions {
  display: flex;
  gap: 10px;
}

.install-btn {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  flex: 1;
}

.install-btn:hover {
  background: #357ABD;
}

.dismiss-btn {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  flex: 1;
}

.dismiss-btn:hover {
  background: #f5f5f5;
}

@media (max-width: 480px) {
  .pwa-install-prompt {
    bottom: 10px;
    left: 10px;
    right: 10px;
  }
  
  .prompt-actions {
    flex-direction: column;
  }
}
</style>