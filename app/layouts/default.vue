<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Evaluations</h1>
            </NuxtLink>
          </div>
          
          <!-- Auth Navigation -->
          <ClientOnly>
            <AuthNavigation />
            <template #fallback>
              <div class="flex items-center space-x-4">
                <div class="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                <div class="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            © 2023 Evaluations App. Tous droits réservés.
          </div>
          <div class="flex space-x-6 text-sm text-gray-500">
            <NuxtLink to="/privacy" class="hover:text-gray-700">
              Politique de confidentialité
            </NuxtLink>
            <NuxtLink to="/terms" class="hover:text-gray-700">
              Conditions d'utilisation
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>