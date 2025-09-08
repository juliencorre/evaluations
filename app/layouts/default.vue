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
            
            <!-- Main Navigation -->
            <ClientOnly>
              <div v-if="isLoggedIn" class="hidden md:ml-10 md:flex md:space-x-8">
                <!-- Administration Dropdown -->
                <div class="relative">
                  <button
                    @click="showAdminMenu = !showAdminMenu"
                    class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center"
                  >
                    Administration
                    <ChevronDownIcon class="ml-1 h-4 w-4" />
                  </button>
                  
                  <div 
                    v-if="showAdminMenu" 
                    class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  >
                    <div class="py-1">
                      <NuxtLink 
                        to="/schools" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="showAdminMenu = false"
                      >
                        Écoles
                      </NuxtLink>
                      <NuxtLink 
                        to="/school-years" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="showAdminMenu = false"
                      >
                        Années scolaires
                      </NuxtLink>
                    </div>
                  </div>
                </div>

                <NuxtLink 
                  to="/classes" 
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                  active-class="border-indigo-500 text-gray-900"
                >
                  Classes
                </NuxtLink>
                
                <NuxtLink 
                  to="/students" 
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                  active-class="border-indigo-500 text-gray-900"
                >
                  Élèves
                </NuxtLink>
                
                <!-- Competences Dropdown -->
                <div class="relative">
                  <button
                    @click="showCompetencesMenu = !showCompetencesMenu"
                    class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center"
                  >
                    Référentiels
                    <ChevronDownIcon class="ml-1 h-4 w-4" />
                  </button>
                  
                  <div 
                    v-if="showCompetencesMenu" 
                    class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  >
                    <div class="py-1">
                      <NuxtLink 
                        to="/competences/domains" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="showCompetencesMenu = false"
                      >
                        Domaines
                      </NuxtLink>
                      <NuxtLink 
                        to="/competences/fields" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="showCompetencesMenu = false"
                      >
                        Champs
                      </NuxtLink>
                      <NuxtLink 
                        to="/competences" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="showCompetencesMenu = false"
                      >
                        Compétences
                      </NuxtLink>
                    </div>
                  </div>
                </div>
                
                <!-- Evaluations Dropdown -->
                <div class="relative">
                  <button
                    @click="showEvaluationsMenu = !showEvaluationsMenu"
                    class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center"
                  >
                    Evaluations
                    <ChevronDownIcon class="ml-1 h-4 w-4" />
                  </button>
                  
                  <div 
                    v-if="showEvaluationsMenu" 
                    class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  >
                    <div class="py-1">
                      <NuxtLink 
                        to="/evaluations/rubrics" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="showEvaluationsMenu = false"
                      >
                        Barèmes
                      </NuxtLink>
                      <NuxtLink 
                        to="/evaluations/templates" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="showEvaluationsMenu = false"
                      >
                        Modèles
                      </NuxtLink>
                      <NuxtLink 
                        to="/evaluations/sessions" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="showEvaluationsMenu = false"
                      >
                        Sessions
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </ClientOnly>
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

    <!-- Mobile Navigation -->
    <ClientOnly>
      <div v-if="isLoggedIn" class="md:hidden bg-white border-b border-gray-200">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <!-- Mobile Administration Section -->
          <div class="px-3 py-2">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Administration
            </div>
            <div class="mt-1 space-y-1">
              <NuxtLink 
                to="/schools"
                class="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Écoles
              </NuxtLink>
              <NuxtLink 
                to="/school-years"
                class="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Années scolaires
              </NuxtLink>
            </div>
          </div>

          <NuxtLink 
            to="/classes"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Classes
          </NuxtLink>
          
          <NuxtLink 
            to="/students"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Élèves
          </NuxtLink>
          
          <!-- Mobile Competences Section -->
          <div class="px-3 py-2">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Référentiels
            </div>
            <div class="mt-1 space-y-1">
              <NuxtLink 
                to="/competences/domains"
                class="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Domaines
              </NuxtLink>
              <NuxtLink 
                to="/competences/fields"
                class="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Champs
              </NuxtLink>
              <NuxtLink 
                to="/competences"
                class="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Compétences
              </NuxtLink>
            </div>
          </div>
          
          <!-- Mobile Evaluations Section -->
          <div class="px-3 py-2">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Evaluations
            </div>
            <div class="mt-1 space-y-1">
              <NuxtLink 
                to="/evaluations/rubrics"
                class="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Barèmes
              </NuxtLink>
              <NuxtLink 
                to="/evaluations/templates"
                class="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Modèles
              </NuxtLink>
              <NuxtLink 
                to="/evaluations/sessions"
                class="block px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Sessions
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>

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

<script setup>
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

// Get auth state
const { isLoggedIn } = useAuth()

// Navigation state
const showAdminMenu = ref(false)
const showCompetencesMenu = ref(false)
const showEvaluationsMenu = ref(false)

// Close dropdowns when clicking outside
const closeDropdowns = () => {
  showAdminMenu.value = false
  showCompetencesMenu.value = false
  showEvaluationsMenu.value = false
}

// Close dropdowns on route change
const route = useRoute()
watch(() => route.path, () => {
  closeDropdowns()
})

// Close dropdowns when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    // Check if click is outside dropdowns
    if (!e.target.closest('.relative')) {
      closeDropdowns()
    }
  })
})
</script>