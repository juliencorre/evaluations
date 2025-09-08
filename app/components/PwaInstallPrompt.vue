<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="showPrompt" class="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div class="max-w-sm mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
          <div class="p-4">
            <div class="flex items-start space-x-3">
              <!-- App Icon -->
              <div class="flex-shrink-0">
                <img 
                  src="/pwa-64x64.png" 
                  alt="App Icon" 
                  class="w-10 h-10 rounded-lg"
                >
              </div>
              
              <!-- Content -->
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-900">
                  Installer l'application
                </h3>
                <p class="text-xs text-gray-600 mt-1">
                  Ajoutez Evaluations à votre écran d'accueil pour un accès rapide et une meilleure expérience.
                </p>
                
                <!-- Features -->
                <ul class="text-xs text-gray-500 mt-2 space-y-1">
                  <li class="flex items-center">
                    <CheckIcon class="w-3 h-3 text-green-500 mr-1" />
                    Accès hors ligne
                  </li>
                  <li class="flex items-center">
                    <CheckIcon class="w-3 h-3 text-green-500 mr-1" />
                    Notifications push
                  </li>
                  <li class="flex items-center">
                    <CheckIcon class="w-3 h-3 text-green-500 mr-1" />
                    Lancement rapide
                  </li>
                </ul>
              </div>
              
              <!-- Close button -->
              <button
                @click="dismissPrompt"
                class="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
            
            <!-- Actions -->
            <div class="flex space-x-2 mt-4">
              <button
                @click="installPwa"
                :disabled="isInstalling"
                class="flex-1 bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isInstalling" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Installation...
                </span>
                <span v-else>Installer</span>
              </button>
              
              <button
                @click="dismissPrompt"
                class="flex-1 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

// State
const showPrompt = ref(false)
const isInstalling = ref(false)
const deferredPrompt = ref(null)

// Props
defineProps({
  autoShow: {
    type: Boolean,
    default: true
  }
})

// Events
const emit = defineEmits(['installed', 'dismissed'])

// Check if app is already installed
const isAppInstalled = () => {
  if (!import.meta.client) return false
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://') ||
         localStorage.getItem('pwa-dismissed') === 'true'
}

// Install PWA
const installPwa = async () => {
  if (!deferredPrompt.value) return
  
  isInstalling.value = true
  
  try {
    // Show the installation prompt
    const result = await deferredPrompt.value.prompt()
    
    // Wait for the user's response
    const choiceResult = await deferredPrompt.value.userChoice
    
    if (choiceResult.outcome === 'accepted') {
      console.log('PWA installation accepted')
      emit('installed')
      if (import.meta.client) {
        localStorage.setItem('pwa-installed', 'true')
      }
    } else {
      console.log('PWA installation dismissed')
      emit('dismissed')
    }
    
    // Clear the deferredPrompt
    deferredPrompt.value = null
    showPrompt.value = false
    
  } catch (error) {
    console.error('PWA installation failed:', error)
  } finally {
    isInstalling.value = false
  }
}

// Dismiss prompt
const dismissPrompt = () => {
  showPrompt.value = false
  if (import.meta.client) {
    localStorage.setItem('pwa-dismissed', 'true')
    
    // Set timeout to show again later (optional)
    setTimeout(() => {
      localStorage.removeItem('pwa-dismissed')
    }, 7 * 24 * 60 * 60 * 1000) // 7 days
  }
  
  emit('dismissed')
}

// Event handlers (named functions to avoid Nuxt 4.1.1 transform issues)
let handleBeforeInstallPrompt = null
let handleAppInstalled = null

const initPwaListeners = () => {
  // Only run on client side
  if (!import.meta.client) return
  
  // Check if already installed or dismissed
  if (isAppInstalled()) {
    return
  }
  
  // Listen for install prompt
  handleBeforeInstallPrompt = (e) => {
    console.log('PWA install prompt available')
    
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault()
    
    // Store the event for later use
    deferredPrompt.value = e
    
    // Show our custom prompt after a delay
    setTimeout(() => {
      if (props.autoShow && import.meta.client && !localStorage.getItem('pwa-dismissed')) {
        showPrompt.value = true
      }
    }, 3000) // Show after 3 seconds
  }
  
  // Listen for app installed event
  handleAppInstalled = () => {
    console.log('PWA was installed')
    showPrompt.value = false
    if (import.meta.client) {
      localStorage.setItem('pwa-installed', 'true')
    }
    emit('installed')
  }
  
  if (import.meta.client) {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
  }
}

const cleanupPwaListeners = () => {
  if (import.meta.client && handleBeforeInstallPrompt && handleAppInstalled) {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  }
}

// Initialize listeners
onMounted(initPwaListeners)

// Cleanup listeners
onUnmounted(cleanupPwaListeners)

// Expose methods for parent components
defineExpose({
  show: () => {
    if (!isAppInstalled() && deferredPrompt.value) {
      showPrompt.value = true
    }
  },
  hide: () => {
    showPrompt.value = false
  }
})
</script>