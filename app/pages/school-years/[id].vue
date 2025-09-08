<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-2 text-sm text-gray-500">Chargement de l'année scolaire...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center min-h-64 flex items-center justify-center">
      <div>
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="loadSchoolYear"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>

    <!-- School Year Details -->
    <div v-else-if="schoolYearData">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <NuxtLink to="/school-years" class="text-gray-400 hover:text-gray-500">
                  Années scolaires
                </NuxtLink>
              </li>
              <li>
                <div class="flex items-center">
                  <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span class="ml-4 text-sm font-medium text-gray-500">{{ schoolYearData.label }}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div class="mt-2 flex items-center">
            <CalendarIcon class="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ schoolYearData.label }}</h1>
              <p class="mt-1 text-sm text-gray-600 flex items-center">
                <span>{{ formatSchoolYear(schoolYearData) }}</span>
                <span v-if="isCurrentSchoolYear(schoolYearData)" class="ml-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span class="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    Année actuelle
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <NuxtLink
            :to="`/classes?school_year_id=${schoolYearData.school_year_id}`"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <AcademicCapIcon class="w-4 h-4 mr-2" />
            Voir les classes
          </NuxtLink>
          
          <button
            @click="editSchoolYear"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            Modifier l'année
          </button>
        </div>
      </div>

      <!-- School Year Info -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Informations sur l'année</h2>
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Date de début</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(schoolYearData.starts_on) }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Date de fin</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(schoolYearData.ends_on) }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Statut</dt>
            <dd class="mt-1">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getSchoolYearStatus(schoolYearData) === 'current' ? 'bg-green-100 text-green-800' :
                getSchoolYearStatus(schoolYearData) === 'future' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ getSchoolYearStatus(schoolYearData) === 'current' ? 'Année en cours' :
                   getSchoolYearStatus(schoolYearData) === 'future' ? 'À venir' : 'Terminée' }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Durée</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ getYearDuration(schoolYearData) }} jours</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Date de création</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(schoolYearData.created_at) }}</dd>
          </div>
        </dl>
      </div>

      <!-- School Year Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <AcademicCapIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Classes
                  </dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    {{ getSchoolYearClassCount(schoolYearData) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink 
                :to="`/classes?school_year_id=${schoolYearData.school_year_id}`" 
                class="font-medium text-blue-600 hover:text-blue-500"
              >
                Gérer les classes
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UsersIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Élèves
                  </dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    {{ getSchoolYearStudentCount(schoolYearData) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink 
                :to="`/students?school_year_id=${schoolYearData.school_year_id}`" 
                class="font-medium text-green-600 hover:text-green-500"
              >
                Voir les élèves
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <BuildingOfficeIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Écoles
                  </dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    {{ getUniqueSchoolsCount(schoolYearData) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink 
                to="/schools" 
                class="font-medium text-purple-600 hover:text-purple-500"
              >
                Voir les écoles
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Classes List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">
              Classes {{ schoolYearData.label }} ({{ getSchoolYearClassCount(schoolYearData) }})
            </h2>
            <NuxtLink
              :to="`/classes/new?school_year_id=${schoolYearData.school_year_id}`"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon class="w-4 h-4 mr-1" />
              Nouvelle classe
            </NuxtLink>
          </div>
        </div>

        <!-- Classes Grid -->
        <div v-if="schoolYearData.class && schoolYearData.class.length > 0" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="classItem in schoolYearData.class"
              :key="classItem.class_id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ classItem.label }}</h3>
                  <p class="text-sm text-gray-500">{{ classItem.level || 'Niveau non spécifié' }}</p>
                  <p class="text-sm text-gray-500">
                    {{ classItem.school?.name || 'École non spécifiée' }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ classItem.student_count?.[0]?.count || 0 }} élèves
                  </p>
                </div>
                <NuxtLink
                  :to="`/classes/${classItem.class_id}`"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  <EyeIcon class="w-5 h-5" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty classes state -->
        <div v-else class="text-center py-12">
          <AcademicCapIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune classe</h3>
          <p class="mt-1 text-sm text-gray-500">
            Cette année scolaire n'a pas encore de classes.
          </p>
          <div class="mt-6">
            <NuxtLink
              :to="`/classes/new?school_year_id=${schoolYearData.school_year_id}`"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Créer une classe
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <SchoolYearModal
      :show="showEditModal"
      :school-year="schoolYearData"
      @close="showEditModal = false"
      @save="handleSchoolYearUpdate"
    />
  </div>
</template>

<script setup>
import { 
  CalendarIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PencilIcon,
  PlusIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Get school year ID from route
const route = useRoute()
const schoolYearId = route.params.id

// Composables
const schoolYearsStore = useSchoolYears()
const {
  selectedSchoolYear: schoolYearData,
  loading,
  error,
  fetchSchoolYearById,
  updateSchoolYear,
  formatSchoolYear,
  getSchoolYearStatus,
  getSchoolYearClassCount,
  getSchoolYearStudentCount,
  isCurrentSchoolYear
} = schoolYearsStore

// Local state
const showEditModal = ref(false)

// Methods
const loadSchoolYear = async () => {
  await fetchSchoolYearById(schoolYearId)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const getYearDuration = (year) => {
  const start = new Date(year.starts_on)
  const end = new Date(year.ends_on)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
}

const getUniqueSchoolsCount = (year) => {
  if (!year.class || year.class.length === 0) return 0
  
  const uniqueSchools = new Set()
  year.class.forEach(cls => {
    if (cls.school?.school_id) {
      uniqueSchools.add(cls.school.school_id)
    }
  })
  return uniqueSchools.size
}

const editSchoolYear = () => {
  showEditModal.value = true
}

const handleSchoolYearUpdate = async (schoolYearDataUpdate) => {
  try {
    await updateSchoolYear(schoolYearId, schoolYearDataUpdate)
    showEditModal.value = false
    await loadSchoolYear() // Reload to get updated data
  } catch (err) {
    // Error is handled by the store
  }
}

// Set page title
useHead(() => ({
  title: `${schoolYearData.value?.label || 'Année scolaire'} - Evaluations`
}))

// Initialize
onMounted(async () => {
  await loadSchoolYear()
})
</script>