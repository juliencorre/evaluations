<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Offline icon -->
      <div class="text-center">
        <div class="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
          <CloudSlashIcon class="h-10 w-10 text-gray-400" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Vous êtes hors ligne
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Impossible de se connecter au réseau. Vérifiez votre connexion internet.
        </p>
      </div>

      <!-- Offline features -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Fonctionnalités disponibles hors ligne
        </h3>
        
        <ul class="space-y-3">
          <li class="flex items-center">
            <CheckCircleIcon class="h-5 w-5 text-green-500 mr-3" />
            <span class="text-sm text-gray-700">Consultation des pages déjà visitées</span>
          </li>
          <li class="flex items-center">
            <CheckCircleIcon class="h-5 w-5 text-green-500 mr-3" />
            <span class="text-sm text-gray-700">Interface utilisateur complète</span>
          </li>
          <li class="flex items-center">
            <ExclamationTriangleIcon class="h-5 w-5 text-yellow-500 mr-3" />
            <span class="text-sm text-gray-700">Authentification (connexion requise)</span>
          </li>
          <li class="flex items-center">
            <ExclamationTriangleIcon class="h-5 w-5 text-yellow-500 mr-3" />
            <span class="text-sm text-gray-700">Synchronisation des données</span>
          </li>
        </ul>
      </div>

      <!-- Cached data info -->
      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex">
          <InformationCircleIcon class="h-5 w-5 text-blue-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              Données en cache
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>
                Vos données seront automatiquement synchronisées dès que la connexion sera rétablie.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="space-y-3">
        <button
          @click="tryReload"
          :disabled="isReloading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isReloading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Reconnexion...
          </span>
          <span v-else>Réessayer la connexion</span>
        </button>
        
        <NuxtLink
          to="/"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retour à l'accueil
        </NuxtLink>
      </div>

      <!-- Connection status -->
      <div class="text-center">
        <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
             :class="isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
          <div class="w-2 h-2 rounded-full mr-2"
               :class="isOnline ? 'bg-green-400' : 'bg-red-400'"></div>
          {{ isOnline ? 'En ligne' : 'Hors ligne' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  CloudSlashIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon 
} from '@heroicons/vue/24/outline'
import { useOnline } from '@vueuse/core'

// Set page title and meta
useHead({
  title: 'Hors ligne - Evaluations',
  meta: [
    { name: 'description', content: 'Page hors ligne de l\'application Evaluations' }
  ]
})

// Network status
const isOnline = useOnline()
const isReloading = ref(false)

// Try to reload the page
const tryReload = async () => {
  isReloading.value = true
  
  try {
    // Check if we can reach the server
    const response = await fetch('/', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    
    if (response.ok) {
      // If online, navigate to home
      await navigateTo('/')
    } else {
      throw new Error('Still offline')
    }
  } catch (error) {
    // Show temporary message if still offline
    setTimeout(() => {
      isReloading.value = false
    }, 1000)
  }
}

// Auto-redirect when back online
watch(isOnline, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      navigateTo('/')
    }, 1000)
  }
})

// Prevent caching this page
definePageMeta({
  ssr: false
})
</script>