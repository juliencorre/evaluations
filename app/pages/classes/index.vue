<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des classes</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gérez vos classes, élèves et enseignants
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          @click="showCreateModal = true"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Nouvelle classe
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-8 bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              placeholder="Nom de classe, enseignant..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- School Year Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Année scolaire
          </label>
          <select
            v-model="selectedSchoolYearId"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Toutes les années</option>
            <option v-for="year in schoolYears" :key="year.school_year_id" :value="year.school_year_id">
              {{ formatSchoolYear(year) }}
            </option>
          </select>
        </div>

        <!-- School Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            École
          </label>
          <select
            v-model="selectedSchoolId"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Toutes les écoles</option>
            <option v-for="school in schools" :key="school.school_id" :value="school.school_id">
              {{ school.name }}
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
          <AcademicCapIcon class="w-8 h-8 text-blue-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Total classes</p>
            <p class="text-2xl font-semibold text-gray-900">{{ classesCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <CalendarIcon class="w-8 h-8 text-green-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Cette année</p>
            <p class="text-2xl font-semibold text-gray-900">{{ currentYearClasses.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <UsersIcon class="w-8 h-8 text-yellow-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Total élèves</p>
            <p class="text-2xl font-semibold text-gray-900">{{ totalStudents }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <ChartBarIcon class="w-8 h-8 text-purple-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Moyenne par classe</p>
            <p class="text-2xl font-semibold text-gray-900">{{ averageStudentsPerClass }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Classes List -->
    <div class="mt-6 bg-white shadow overflow-hidden rounded-lg">
      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Chargement des classes...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-8 text-center">
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="fetchClasses"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredClasses.length === 0" class="p-8 text-center">
        <AcademicCapIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune classe trouvée</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery || selectedSchoolYearId ? 'Aucune classe ne correspond aux critères de recherche.' : 'Commencez par créer votre première classe.' }}
        </p>
        <div class="mt-6">
          <button
            @click="showCreateModal = true"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Créer une classe
          </button>
        </div>
      </div>

      <!-- Classes Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <div
          v-for="cls in filteredClasses"
          :key="cls.class_id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          @click="viewClass(cls)"
        >
          <div class="p-6">
            <!-- Class Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon class="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-medium text-gray-900">{{ cls.label }}</h3>
                  <p v-if="cls.level" class="text-sm text-gray-500">{{ cls.level }}</p>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center space-x-1">
                <button
                  @click.stop="editClass(cls)"
                  class="p-1 text-gray-400 hover:text-indigo-600"
                  title="Modifier"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click.stop="confirmDelete(cls)"
                  class="p-1 text-gray-400 hover:text-red-600"
                  title="Supprimer"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Class Info -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <UserIcon class="w-4 h-4 mr-2" />
                {{ getTeacherFullName(cls.primary_teacher) }}
              </div>
              
              <div class="flex items-center text-sm text-gray-600">
                <CalendarIcon class="w-4 h-4 mr-2" />
                {{ cls.school_year.label }}
              </div>
              
              <div v-if="cls.school" class="flex items-center text-sm text-gray-600">
                <BuildingOfficeIcon class="w-4 h-4 mr-2" />
                {{ cls.school.name }}
              </div>
            </div>

            <!-- Student Count -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="flex items-center">
                <UsersIcon class="w-4 h-4 text-gray-400 mr-1" />
                <span class="text-sm text-gray-600">
                  {{ cls.student_count || 0 }} élève{{ (cls.student_count || 0) > 1 ? 's' : '' }}
                </span>
              </div>
              
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <ClassModal
      :show="showCreateModal || showEditModal"
      :class-data="selectedClassForEdit"
      :school-years="schoolYears"
      :schools="schools"
      @close="closeModals"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      :title="'Supprimer la classe'"
      :message="`Êtes-vous sûr de vouloir supprimer la classe '${selectedClassForDelete?.label}' ? Cette action supprimera aussi toutes les inscriptions d'élèves et évaluations associées.`"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  AcademicCapIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

useHead({
  title: 'Gestion des classes - Evaluations'
})

// Composables
const classesStore = useClasses()

// Destructure reactive state from store
const {
  filteredClasses,
  classesCount,
  currentYearClasses,
  schoolYears,
  schools,
  loading,
  error,
  setSearchFilter,
  setSchoolYearFilter,
  setSchoolFilter,
  clearFilters,
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  getTeacherFullName,
  formatSchoolYear
} = classesStore

// Local reactive state
const searchQuery = ref('')
const selectedSchoolYearId = ref('')
const selectedSchoolId = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedClassForEdit = ref(null)
const selectedClassForDelete = ref(null)

// Computed stats
const totalStudents = computed(() => {
  return filteredClasses.value.reduce((sum, cls) => sum + (cls.student_count || 0), 0)
})

const averageStudentsPerClass = computed(() => {
  if (filteredClasses.value.length === 0) return 0
  return Math.round(totalStudents.value / filteredClasses.value.length)
})

// Watch filters
watch(searchQuery, (newValue) => {
  setSearchFilter(newValue)
})

watch(selectedSchoolYearId, (newValue) => {
  setSchoolYearFilter(newValue || undefined)
})

watch(selectedSchoolId, (newValue) => {
  setSchoolFilter(newValue || undefined)
})

// Methods
const viewClass = (cls) => {
  navigateTo(`/classes/${cls.class_id}`)
}

const editClass = (cls) => {
  selectedClassForEdit.value = cls
  showEditModal.value = true
}

const confirmDelete = (cls) => {
  selectedClassForDelete.value = cls
  showDeleteModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedClassForEdit.value = null
}

const handleSave = async (classData) => {
  let success = false
  
  if (selectedClassForEdit.value) {
    // Update existing class
    const result = await updateClass(selectedClassForEdit.value.class_id, classData)
    success = !!result
  } else {
    // Create new class
    const result = await createClass(classData)
    success = !!result
  }

  if (success) {
    closeModals()
  }
}

const handleDelete = async () => {
  if (selectedClassForDelete.value) {
    const success = await deleteClass(selectedClassForDelete.value.class_id)
    if (success) {
      showDeleteModal.value = false
      selectedClassForDelete.value = null
    }
  }
}

// Initialize
onMounted(async () => {
  await classesStore.initialize()
})
</script>