<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Années scolaires</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gérez les périodes scolaires et leurs classes associées
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          @click="showCreateModal = true"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Nouvelle année
        </button>
      </div>
    </div>

    <!-- Current School Year Highlight -->
    <div v-if="currentSchoolYear" class="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <div class="flex items-center">
        <CalendarIcon class="w-6 h-6 text-indigo-600 mr-3" />
        <div>
          <h3 class="text-lg font-medium text-indigo-900">Année scolaire actuelle</h3>
          <p class="text-sm text-indigo-700">
            {{ currentSchoolYear.label }} ({{ formatSchoolYear(currentSchoolYear) }})
          </p>
        </div>
        <div class="ml-auto">
          <NuxtLink
            :to="`/school-years/${currentSchoolYear.school_year_id}`"
            class="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Voir les détails
          </NuxtLink>
        </div>
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
              placeholder="Nom de l'année..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            v-model="selectedStatus"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Toutes les années</option>
            <option value="current">Année actuelle</option>
            <option value="future">Années futures</option>
            <option value="past">Années passées</option>
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
          <CalendarIcon class="w-8 h-8 text-blue-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Total années</p>
            <p class="text-2xl font-semibold text-gray-900">{{ totalSchoolYearsCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <ClockIcon class="w-8 h-8 text-green-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Année actuelle</p>
            <p class="text-lg font-semibold text-gray-900">{{ currentSchoolYear ? 'Oui' : 'Non définie' }}</p>
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

    <!-- School Years List -->
    <div class="mt-6">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Chargement des années scolaires...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="fetchSchoolYears"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredSchoolYears.length === 0" class="text-center py-12">
        <CalendarIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune année scolaire trouvée</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery || selectedStatus !== 'all' ? 'Aucune année ne correspond aux critères de recherche.' : 'Commencez par ajouter une année scolaire.' }}
        </p>
        <div class="mt-6">
          <button
            @click="showCreateModal = true"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Ajouter une année scolaire
          </button>
        </div>
      </div>

      <!-- School Years Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="year in filteredSchoolYears"
          :key="year.school_year_id"
          :class="[
            'bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow',
            isCurrentSchoolYear(year) ? 'ring-2 ring-indigo-500' : ''
          ]"
        >
          <div class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div :class="[
                  'w-3 h-3 rounded-full mr-3',
                  getSchoolYearStatus(year) === 'current' ? 'bg-green-400' :
                  getSchoolYearStatus(year) === 'future' ? 'bg-blue-400' : 'bg-gray-400'
                ]"></div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{{ year.label }}</h3>
                  <p class="text-sm text-gray-500">{{ formatSchoolYear(year) }}</p>
                </div>
              </div>
              <div class="flex space-x-1">
                <button
                  @click="viewSchoolYear(year)"
                  class="text-indigo-600 hover:text-indigo-900"
                  title="Voir les détails"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
                <button
                  @click="editSchoolYear(year)"
                  class="text-gray-600 hover:text-gray-900"
                  title="Modifier"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button
                  @click="confirmDelete(year)"
                  class="text-red-600 hover:text-red-900"
                  title="Supprimer"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div class="mt-4">
              <div :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getSchoolYearStatus(year) === 'current' ? 'bg-green-100 text-green-800' :
                getSchoolYearStatus(year) === 'future' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ getSchoolYearStatus(year) === 'current' ? 'Année actuelle' :
                   getSchoolYearStatus(year) === 'future' ? 'À venir' : 'Terminée' }}
              </div>
              
              <div v-if="isCurrentSchoolYear(year)" class="mt-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <StarIcon class="w-3 h-3 mr-1" />
                  Année active
                </span>
              </div>
            </div>
            
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-md">
                <div class="text-lg font-semibold text-gray-900">{{ getSchoolYearClassCount(year) }}</div>
                <div class="text-sm text-gray-500">Classes</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-md">
                <div class="text-lg font-semibold text-gray-900">{{ getSchoolYearStudentCount(year) }}</div>
                <div class="text-sm text-gray-500">Élèves</div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="text-xs text-gray-500">
                Du {{ formatDate(year.starts_on) }} au {{ formatDate(year.ends_on) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <SchoolYearModal
      :show="showCreateModal || showEditModal"
      :school-year="selectedSchoolYearForEdit"
      @close="closeModals"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      :title="'Supprimer l\'année scolaire'"
      :message="`Êtes-vous sûr de vouloir supprimer l'année scolaire ${selectedSchoolYearForDelete?.label} ? Cette action supprimera également toutes les classes associées et est irréversible.`"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

useHead({
  title: 'Années scolaires - Evaluations'
})

// Composables
const schoolYearsStore = useSchoolYears()

// Destructure reactive state from store
const {
  filteredSchoolYears,
  schoolYearsCount,
  totalSchoolYearsCount,
  currentSchoolYear,
  loading,
  error,
  fetchSchoolYears,
  createSchoolYear,
  updateSchoolYear,
  deleteSchoolYear,
  setSearchFilter,
  setStatusFilter,
  clearFilters,
  formatSchoolYear,
  getSchoolYearStatus,
  getSchoolYearClassCount,
  getSchoolYearStudentCount,
  isCurrentSchoolYear
} = schoolYearsStore

// Local reactive state
const searchQuery = ref('')
const selectedStatus = ref('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedSchoolYearForEdit = ref(null)
const selectedSchoolYearForDelete = ref(null)

// Computed properties for total stats
const totalClassCount = computed(() => {
  return filteredSchoolYears.value.reduce((total, year) => total + getSchoolYearClassCount(year), 0)
})

const totalStudentCount = computed(() => {
  return filteredSchoolYears.value.reduce((total, year) => total + getSchoolYearStudentCount(year), 0)
})

// Watch search query and update filter
watch(searchQuery, (newValue) => {
  setSearchFilter(newValue)
})

// Watch status filter and update filter
watch(selectedStatus, (newValue) => {
  setStatusFilter(newValue)
})

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const viewSchoolYear = (year) => {
  navigateTo(`/school-years/${year.school_year_id}`)
}

const editSchoolYear = (year) => {
  selectedSchoolYearForEdit.value = year
  showEditModal.value = true
}

const confirmDelete = (year) => {
  selectedSchoolYearForDelete.value = year
  showDeleteModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedSchoolYearForEdit.value = null
}

const handleSave = async (schoolYearData) => {
  let success = false
  
  if (selectedSchoolYearForEdit.value) {
    // Update existing school year
    try {
      await updateSchoolYear(selectedSchoolYearForEdit.value.school_year_id, schoolYearData)
      success = true
    } catch (err) {
      // Error is handled by the store
    }
  } else {
    // Create new school year
    try {
      await createSchoolYear(schoolYearData)
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
  if (selectedSchoolYearForDelete.value) {
    try {
      await deleteSchoolYear(selectedSchoolYearForDelete.value.school_year_id)
      showDeleteModal.value = false
      selectedSchoolYearForDelete.value = null
    } catch (err) {
      // Error is handled by the store
    }
  }
}

// Initialize
onMounted(async () => {
  await fetchSchoolYears()
})
</script>