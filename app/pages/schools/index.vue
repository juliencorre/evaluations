<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des écoles</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gérez les établissements scolaires de votre organisation
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          @click="showCreateModal = true"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Nouvelle école
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-8 bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Rechercher
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
              <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom, ville, UAI..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- City Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ville
          </label>
          <select
            v-model="selectedCity"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Toutes les villes</option>
            <option v-for="city in availableCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex items-end space-x-2">
          <button
            @click="clearFilters"
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Effacer
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <BuildingOfficeIcon class="w-8 h-8 text-blue-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Total écoles</p>
            <p class="text-2xl font-semibold text-gray-900">{{ totalSchoolsCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <MapPinIcon class="w-8 h-8 text-green-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Villes</p>
            <p class="text-2xl font-semibold text-gray-900">{{ availableCities.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <AcademicCapIcon class="w-8 h-8 text-yellow-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Classes totales</p>
            <p class="text-2xl font-semibold text-gray-900">{{ totalClassCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <UsersIcon class="w-8 h-8 text-purple-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Élèves totaux</p>
            <p class="text-2xl font-semibold text-gray-900">{{ totalStudentCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Schools Grid -->
    <div class="mt-6">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Chargement des écoles...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="fetchSchools"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredSchools.length === 0" class="text-center py-12">
        <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune école trouvée</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery || selectedCity ? 'Aucune école ne correspond aux critères de recherche.' : 'Commencez par ajouter une école.' }}
        </p>
        <div class="mt-6">
          <button
            @click="showCreateModal = true"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Ajouter une école
          </button>
        </div>
      </div>

      <!-- Schools Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="school in filteredSchools"
          :key="school.school_id"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <BuildingOfficeIcon class="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <h3 class="text-lg font-medium text-gray-900 truncate">{{ school.name }}</h3>
                  <p class="text-sm text-gray-500">{{ getSchoolFullAddress(school) }}</p>
                </div>
              </div>
              <div class="flex space-x-1">
                <button
                  @click="viewSchool(school)"
                  class="text-indigo-600 hover:text-indigo-900"
                  title="Voir les détails"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
                <button
                  @click="editSchool(school)"
                  class="text-gray-600 hover:text-gray-900"
                  title="Modifier"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button
                  @click="confirmDelete(school)"
                  class="text-red-600 hover:text-red-900"
                  title="Supprimer"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-md">
                <div class="text-lg font-semibold text-gray-900">{{ getSchoolClassCount(school) }}</div>
                <div class="text-sm text-gray-500">Classes</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-md">
                <div class="text-lg font-semibold text-gray-900">{{ getSchoolStudentCount(school) }}</div>
                <div class="text-sm text-gray-500">Élèves</div>
              </div>
            </div>

            <div v-if="school.uai" class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex items-center text-sm text-gray-600">
                <BuildingOfficeIcon class="w-4 h-4 mr-2" />
                UAI: {{ school.uai }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <SchoolModal
      :show="showCreateModal || showEditModal"
      :school="selectedSchoolForEdit"
      @close="closeModals"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      :title="'Supprimer l\'école'"
      :message="`Êtes-vous sûr de vouloir supprimer l'école ${selectedSchoolForDelete?.name} ? Cette action supprimera également toutes les classes associées et est irréversible.`"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  AcademicCapIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

useHead({
  title: 'Gestion des écoles - Evaluations'
})

// Composables
const schoolsStore = useSchools()

// Destructure reactive state from store
const {
  filteredSchools,
  schoolsCount,
  totalSchoolsCount,
  availableCities,
  loading,
  error,
  fetchSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  setSearchFilter,
  setCityFilter,
  clearFilters,
  getSchoolFullAddress,
  getSchoolClassCount,
  getSchoolStudentCount
} = schoolsStore

// Local reactive state
const searchQuery = ref('')
const selectedCity = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedSchoolForEdit = ref(null)
const selectedSchoolForDelete = ref(null)

// Computed properties for total stats
const totalClassCount = computed(() => {
  return filteredSchools.value.reduce((total, school) => total + getSchoolClassCount(school), 0)
})

const totalStudentCount = computed(() => {
  return filteredSchools.value.reduce((total, school) => total + getSchoolStudentCount(school), 0)
})

// Watch search query and update filter
watch(searchQuery, (newValue) => {
  setSearchFilter(newValue)
})

// Watch city filter and update filter
watch(selectedCity, (newValue) => {
  setCityFilter(newValue || '')
})

// Methods
const viewSchool = (school) => {
  navigateTo(`/schools/${school.school_id}`)
}

const editSchool = (school) => {
  selectedSchoolForEdit.value = school
  showEditModal.value = true
}

const confirmDelete = (school) => {
  selectedSchoolForDelete.value = school
  showDeleteModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedSchoolForEdit.value = null
}

const handleSave = async (schoolData) => {
  let success = false
  
  if (selectedSchoolForEdit.value) {
    // Update existing school
    try {
      await updateSchool(selectedSchoolForEdit.value.school_id, schoolData)
      success = true
    } catch (err) {
      // Error is handled by the store
    }
  } else {
    // Create new school
    try {
      await createSchool(schoolData)
      success = true
    } catch (err) {
      // Error is handled by the store
    }
  }

  if (success) {
    closeModals()
  }
}

const handleDelete = async () => {
  if (selectedSchoolForDelete.value) {
    try {
      await deleteSchool(selectedSchoolForDelete.value.school_id)
      showDeleteModal.value = false
      selectedSchoolForDelete.value = null
    } catch (err) {
      // Error is handled by the store
    }
  }
}

// Initialize
onMounted(async () => {
  await fetchSchools()
})
</script>