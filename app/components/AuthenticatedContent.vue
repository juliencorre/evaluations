<template>
  <div>
    <div v-if="loading" class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-sm text-gray-500">Chargement...</p>
    </div>

    <div v-else-if="isLoggedIn" class="text-center space-y-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Bienvenue, {{ userProfile.full_name || 'Utilisateur' }}!
        </h3>
        <p class="text-sm text-gray-600 mb-4">
          Vous êtes connecté avec l'email: {{ user?.email }}
        </p>
        <div class="space-y-2">
          <button class="btn-primary w-full">
            Accéder au tableau de bord
          </button>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Commencer maintenant
        </h3>
        <div class="space-y-3">
          <NuxtLink to="/register" class="btn-primary w-full block text-center">
            Créer un compte
          </NuxtLink>
          <NuxtLink to="/login" class="btn-secondary w-full block text-center">
            Se connecter
          </NuxtLink>
        </div>
      </div>

      <!-- Features -->
      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-md font-medium text-gray-900 mb-3">
          Fonctionnalités
        </h4>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-center">
            <svg class="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Authentification sécurisée
          </li>
          <li class="flex items-center">
            <svg class="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Interface moderne et intuitive
          </li>
          <li class="flex items-center">
            <svg class="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Conforme RGPD
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use the authentication composable
const { user, isLoggedIn, userProfile, loading } = useAuth()
</script>