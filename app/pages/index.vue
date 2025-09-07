<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Welcome Section -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Bienvenue sur Evaluations
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Votre plateforme d'évaluation sécurisée et moderne
        </p>
      </div>

      <!-- User Status - Client Only -->
      <ClientOnly>
        <AuthenticatedContent />
        <template #fallback>
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-sm text-gray-500">Chargement...</p>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
// Set page title
useHead({
  title: 'Accueil - Evaluations'
})
</script>