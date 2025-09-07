<template>
  <div class="flex items-center space-x-4">
    <template v-if="isLoggedIn">
      <span class="text-sm text-gray-700">
        Bienvenue, {{ userProfile?.full_name || user?.email }}
      </span>
      <button 
        @click="handleLogout"
        class="text-sm text-gray-500 hover:text-gray-700 font-medium"
        :disabled="loading"
      >
        Déconnexion
      </button>
    </template>
    
    <template v-else>
      <NuxtLink 
        to="/login"
        class="text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        Connexion
      </NuxtLink>
      <NuxtLink 
        to="/register"
        class="btn-primary text-sm"
      >
        Inscription
      </NuxtLink>
    </template>
  </div>
</template>

<script setup>
// Initialize authentication
const { user, isLoggedIn, userProfile, logout, loading } = useAuth()

/**
 * Handle user logout
 */
const handleLogout = async () => {
  const { error } = await logout()
  if (error) {
    console.error('Logout failed:', error)
  }
}
</script>