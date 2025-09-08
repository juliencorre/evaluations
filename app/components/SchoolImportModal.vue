<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <CloudArrowDownIcon class="h-6 w-6 text-blue-600" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    Importer les établissements scolaires
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Recherchez et importez des établissements depuis l'annuaire de l'éducation nationale
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <!-- Search Form -->
                <div class="mb-6">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label for="searchQuery" class="block text-sm font-medium text-gray-700">
                        Nom de l'établissement
                      </label>
                      <input
                        id="searchQuery"
                        v-model="searchQuery"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="École, lycée..."
                      />
                    </div>
                    <div>
                      <label for="searchCity" class="block text-sm font-medium text-gray-700">
                        Commune
                      </label>
                      <input
                        id="searchCity"
                        v-model="searchCity"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Paris, Lyon..."
                      />
                    </div>
                    <div>
                      <label for="searchDepartment" class="block text-sm font-medium text-gray-700">
                        Département
                      </label>
                      <input
                        id="searchDepartment"
                        v-model="searchDepartment"
                        type="text"
                        maxlength="3"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="75, 69..."
                      />
                    </div>
                  </div>
                  <div class="mt-4 flex justify-between">
                    <button
                      type="button"
                      @click="searchSchools"
                      :disabled="searchLoading"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <MagnifyingGlassIcon class="w-4 h-4 mr-2" />
                      <span v-if="searchLoading">Recherche...</span>
                      <span v-else>Rechercher</span>
                    </button>
                    <div class="text-sm text-gray-500" v-if="totalCount > 0">
                      {{ totalCount }} établissement(s) trouvé(s) au total
                    </div>
                  </div>
                </div>

                <!-- Error Display -->
                <div v-if="searchError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {{ searchError }}
                </div>

                <!-- Search Results -->
                <div v-if="searchResults.length > 0" class="mb-6">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium text-gray-900">
                      Résultats de recherche (Page {{ currentPage }} / {{ totalPages }})
                    </h4>
                    <div class="text-sm text-gray-500">
                      Affichage de {{ (currentPage - 1) * itemsPerPage + 1 }} à {{ Math.min(currentPage * itemsPerPage, totalCount) }} sur {{ totalCount }}
                    </div>
                  </div>
                  <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    <div class="divide-y divide-gray-200">
                      <div
                        v-for="school in searchResults"
                        :key="school.identifiant_de_l_etablissement"
                        class="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        @click="toggleSchoolSelection(school)"
                      >
                        <div class="flex items-center">
                          <input
                            type="checkbox"
                            :checked="selectedSchools.some(s => s.identifiant_de_l_etablissement === school.identifiant_de_l_etablissement)"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900">{{ school.nom_etablissement }}</p>
                            <p class="text-sm text-gray-500">
                              {{ school.identifiant_de_l_etablissement }} - {{ school.nom_commune }}
                              <span v-if="school.type_etablissement" class="ml-2 text-xs">
                                ({{ school.type_etablissement }})
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Selection Actions -->
                  <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <button
                        type="button"
                        @click="selectAll"
                        class="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Tout sélectionner
                      </button>
                      <span class="text-gray-300">|</span>
                      <button
                        type="button"
                        @click="clearSelection"
                        class="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Tout désélectionner
                      </button>
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ selectedSchools.length }} établissement(s) sélectionné(s)
                    </div>
                  </div>
                  
                  <!-- Pagination Controls -->
                  <div v-if="totalPages > 1" class="mt-4 flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      @click="searchSchools(currentPage - 1)"
                      :disabled="!hasPrevPage || searchLoading"
                      class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Précédent
                    </button>
                    
                    <div class="flex items-center space-x-1">
                      <button
                        v-for="page in Math.min(5, totalPages)"
                        :key="page"
                        type="button"
                        @click="searchSchools(page)"
                        :disabled="searchLoading"
                        :class="[
                          page === currentPage 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-50',
                          'px-3 py-1 text-sm font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
                        ]"
                      >
                        {{ page }}
                      </button>
                      
                      <span v-if="totalPages > 5" class="px-2 text-gray-500">...</span>
                      
                      <button
                        v-if="totalPages > 5"
                        type="button"
                        @click="searchSchools(totalPages)"
                        :disabled="searchLoading"
                        :class="[
                          totalPages === currentPage 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-50',
                          'px-3 py-1 text-sm font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
                        ]"
                      >
                        {{ totalPages }}
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      @click="searchSchools(currentPage + 1)"
                      :disabled="!hasNextPage || searchLoading"
                      class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>

                <!-- Import Results -->
                <div v-if="importResults" class="mb-4 p-4 border rounded-md" :class="{
                  'bg-green-50 border-green-200': importResults.errors === 0,
                  'bg-yellow-50 border-yellow-200': importResults.errors > 0 && importResults.success > 0,
                  'bg-red-50 border-red-200': importResults.success === 0 && importResults.errors > 0
                }">
                  <h4 class="font-medium mb-2">Résultat de l'importation</h4>
                  <p class="text-sm mb-2">
                    ✅ {{ importResults.success }} importé(s) avec succès
                    {{ importResults.errors > 0 ? `| ❌ ${importResults.errors} erreur(s)` : '' }}
                  </p>
                  <details v-if="importResults.details.length > 0" class="text-xs">
                    <summary class="cursor-pointer text-gray-600 hover:text-gray-800">
                      Voir les détails
                    </summary>
                    <div class="mt-2 max-h-32 overflow-y-auto bg-white p-2 rounded border">
                      <div v-for="detail in importResults.details" :key="detail" class="mb-1">
                        {{ detail }}
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  @click="importSelected"
                  :disabled="selectedSchools.length === 0 || importLoading"
                  class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                >
                  <span v-if="importLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importation...
                  </span>
                  <span v-else>
                    Importer ({{ selectedSchools.length }})
                  </span>
                </button>
                <button
                  type="button"
                  @click="$emit('close')"
                  :disabled="importLoading"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
                >
                  Fermer
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { CloudArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import type { EducationAPISchool } from '~/composables/useEducationAPI'

defineProps<{
  show: boolean
}>()

defineEmits<{
  close: []
}>()

// Composables
const { searchSchools: apiSearchSchools, importSchools, loading: apiLoading, error: apiError } = useEducationAPI()

// Search state
const searchQuery = ref('')
const searchCity = ref('')
const searchDepartment = ref('')
const searchResults = ref<EducationAPISchool[]>([])
const selectedSchools = ref<EducationAPISchool[]>([])
const searchLoading = ref(false)
const searchError = ref<string | null>(null)

// Pagination state
const currentPage = ref(1)
const totalCount = ref(0)
const itemsPerPage = 50

// Import state
const importLoading = ref(false)
const importResults = ref<{
  success: number
  errors: number
  details: string[]
} | null>(null)

// Methods
const searchSchools = async (page = 1) => {
  searchLoading.value = true
  searchError.value = null
  importResults.value = null
  currentPage.value = page
  
  try {
    const offset = (page - 1) * itemsPerPage
    const response = await apiSearchSchools({
      query: searchQuery.value || undefined,
      city: searchCity.value || undefined,
      department: searchDepartment.value || undefined,
      limit: itemsPerPage,
      offset: offset
    })
    
    if (response) {
      searchResults.value = response.results
      totalCount.value = response.total_count
    } else {
      searchResults.value = []
      totalCount.value = 0
      searchError.value = apiError.value || 'Erreur lors de la recherche'
    }
  } catch (error) {
    console.error('Search error:', error)
    searchError.value = 'Erreur lors de la recherche des établissements'
    searchResults.value = []
    totalCount.value = 0
  } finally {
    searchLoading.value = false
  }
}

// Computed for pagination
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage))
const hasNextPage = computed(() => currentPage.value < totalPages.value)
const hasPrevPage = computed(() => currentPage.value > 1)

const toggleSchoolSelection = (school: EducationAPISchool) => {
  const index = selectedSchools.value.findIndex(s => s.identifiant_de_l_etablissement === school.identifiant_de_l_etablissement)
  if (index >= 0) {
    selectedSchools.value.splice(index, 1)
  } else {
    selectedSchools.value.push(school)
  }
}

const selectAll = () => {
  selectedSchools.value = [...searchResults.value]
}

const clearSelection = () => {
  selectedSchools.value = []
}

const importSelected = async () => {
  if (selectedSchools.value.length === 0) return
  
  importLoading.value = true
  importResults.value = null
  
  try {
    const results = await importSchools(selectedSchools.value)
    importResults.value = results
    
    // Clear selection after successful import
    if (results && results.success > 0) {
      selectedSchools.value = []
      // Refresh the current page to show updated data
      await searchSchools(currentPage.value)
    }
  } catch (error) {
    console.error('Import error:', error)
    importResults.value = {
      success: 0,
      errors: selectedSchools.value.length,
      details: ['Erreur lors de l\'importation des établissements']
    }
  } finally {
    importLoading.value = false
  }
}
</script>