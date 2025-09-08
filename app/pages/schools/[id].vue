<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-2 text-sm text-gray-500">Chargement de l'école...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center min-h-64 flex items-center justify-center">
      <div>
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="loadSchool"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>

    <!-- School Details -->
    <div v-else-if="schoolData">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <NuxtLink to="/schools" class="text-gray-400 hover:text-gray-500">
                  Écoles
                </NuxtLink>
              </li>
              <li>
                <div class="flex items-center">
                  <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span class="ml-4 text-sm font-medium text-gray-500">{{ schoolData.name }}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div class="mt-2 flex items-center">
            <BuildingOfficeIcon class="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ schoolData.name }}</h1>
              <p class="mt-1 text-sm text-gray-600">
                {{ getSchoolFullAddress(schoolData) }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <NuxtLink
            :to="`/classes?school_id=${schoolData.school_id}`"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <AcademicCapIcon class="w-4 h-4 mr-2" />
            Voir les classes
          </NuxtLink>
          
          <button
            @click="editSchool"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            Modifier l'école
          </button>
        </div>
      </div>

      <!-- School Info -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Informations</h2>
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div v-if="schoolData.uai">
            <dt class="text-sm font-medium text-gray-500">UAI</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ schoolData.uai }}</dd>
          </div>
          <div v-if="schoolData.city">
            <dt class="text-sm font-medium text-gray-500">Ville</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ schoolData.city }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Date de création</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(schoolData.created_at) }}</dd>
          </div>
        </dl>
      </div>

      <!-- School Stats -->
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
                    {{ getSchoolClassCount(schoolData) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink 
                :to="`/classes?school_id=${schoolData.school_id}`" 
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
                    {{ getSchoolStudentCount(schoolData) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink 
                :to="`/students?school_id=${schoolData.school_id}`" 
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
                <CalendarIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Date de création
                  </dt>
                  <dd class="text-lg font-semibold text-gray-900">
                    {{ formatDate(schoolData.created_at) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Classes List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">
              Classes de l'école ({{ getSchoolClassCount(schoolData) }})
            </h2>
            <NuxtLink
              :to="`/classes/new?school_id=${schoolData.school_id}`"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon class="w-4 h-4 mr-1" />
              Nouvelle classe
            </NuxtLink>
          </div>
        </div>

        <!-- Classes Grid -->
        <div v-if="schoolData.class && schoolData.class.length > 0" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="classItem in schoolData.class"
              :key="classItem.class_id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ classItem.label }}</h3>
                  <p class="text-sm text-gray-500">{{ classItem.level || 'Niveau non spécifié' }}</p>
                  <p class="text-sm text-gray-500">
                    {{ classItem.school_year?.label }} • {{ classItem.student_count?.[0]?.count || 0 }} élèves
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
            Cette école n'a pas encore de classes.
          </p>
          <div class="mt-6">
            <NuxtLink
              :to="`/classes/new?school_id=${schoolData.school_id}`"
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
    <SchoolModal
      :show="showEditModal"
      :school="schoolData"
      @close="showEditModal = false"
      @save="handleSchoolUpdate"
    />
  </div>
</template>

<script setup>
import { 
  BuildingOfficeIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UsersIcon,
  CalendarIcon,
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

// Get school ID from route
const route = useRoute()
const schoolId = route.params.id

// Composables
const schoolsStore = useSchools()
const {
  selectedSchool: schoolData,
  loading,
  error,
  fetchSchoolById,
  updateSchool,
  getSchoolFullAddress,
  getSchoolClassCount,
  getSchoolStudentCount
} = schoolsStore

// Local state
const showEditModal = ref(false)

// Methods
const loadSchool = async () => {
  await fetchSchoolById(schoolId)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const editSchool = () => {
  showEditModal.value = true
}

const handleSchoolUpdate = async (schoolDataUpdate) => {
  try {
    await updateSchool(schoolId, schoolDataUpdate)
    showEditModal.value = false
    await loadSchool() // Reload to get updated data
  } catch (err) {
    // Error is handled by the store
  }
}

// Set page title
useHead(() => ({
  title: `${schoolData.value?.name || 'École'} - Evaluations`
}))

// Initialize
onMounted(async () => {
  await loadSchool()
})
</script>