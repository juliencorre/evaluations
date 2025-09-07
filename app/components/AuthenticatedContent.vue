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

    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../../composables/useAuth'

// Use the authentication composable
const { user, isLoggedIn, userProfile, loading } = useAuth()
</script>