<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Élèves par classe</h1>
        <p class="mt-1 text-sm text-gray-600">
          Consultez et gérez les élèves inscrits dans vos classes
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <NuxtLink
          to="/classes"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <AcademicCapIcon class="w-4 h-4 mr-2" />
          Gérer les classes
        </NuxtLink>
        <button
          @click="showCreateModal = true"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Nouvel élève
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
              placeholder="Nom, prénom..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- Class Filter (Primary Filter) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            <AcademicCapIcon class="w-4 h-4 inline mr-1" />
            Filtrer par classe *
          </label>
          <select
            v-model="selectedClassId"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Toutes les classes</option>
            <option v-for="cls in classes" :key="cls.class_id" :value="cls.class_id">
              {{ cls.label }} ({{ cls.level || 'Niveau non spécifié' }}) - {{ cls.student_count || 0 }} élèves
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
            <p class="text-sm font-medium text-gray-500">Classes actives</p>
            <p class="text-2xl font-semibold text-gray-900">{{ classes.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <UsersIcon class="w-8 h-8 text-green-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">
              {{ selectedClassId ? 'Élèves dans cette classe' : 'Total élèves' }}
            </p>
            <p class="text-2xl font-semibold text-gray-900">{{ studentsCount }}</p>
          </div>
        </div>
      </div>
      <div v-if="selectedClassId && selectedClass" class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span class="text-xs font-medium text-indigo-600">{{ selectedClass.level || 'N/A' }}</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Niveau</p>
            <p class="text-lg font-semibold text-gray-900">{{ selectedClass.label }}</p>
          </div>
        </div>
      </div>
      <div v-if="selectedClassId && selectedClass" class="bg-white shadow rounded-lg p-4">
        <div class="flex items-center">
          <UserIcon class="w-8 h-8 text-purple-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Enseignant</p>
            <p class="text-lg font-semibold text-gray-900 truncate">{{ getTeacherName(selectedClass.primary_teacher) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Students List -->
    <div class="mt-6 bg-white shadow overflow-hidden rounded-lg">
      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Chargement des élèves...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-8 text-center">
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="fetchStudents"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredStudents.length === 0" class="p-8 text-center">
        <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun élève trouvé</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery || selectedClassId ? 'Aucun élève ne correspond aux critères de recherche.' : 'Commencez par ajouter un élève.' }}
        </p>
        <div class="mt-6">
          <button
            @click="showCreateModal = true"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Ajouter un élève
          </button>
        </div>
      </div>

      <!-- Students Table -->
      <div v-else class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élève
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Classe
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Âge
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de création
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in filteredStudents" :key="student.student_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-indigo-700">
                        {{ getInitials(student) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getStudentFullName(student) }}
                    </div>
                    <div v-if="student.external_ref" class="text-sm text-gray-500">
                      Réf: {{ student.external_ref }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span v-if="getStudentCurrentClass(student)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getStudentCurrentClass(student)?.label }}
                </span>
                <span v-else class="text-gray-400">Non assigné</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getStudentAge(student) || '-' }} ans
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(student.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="editStudent(student)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(student)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <StudentModal
      :show="showCreateModal || showEditModal"
      :student="selectedStudentForEdit"
      :classes="classes"
      @close="closeModals"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      :title="'Supprimer l\'élève'"
      :message="`Êtes-vous sûr de vouloir supprimer l'élève ${selectedStudentForDelete ? getStudentFullName(selectedStudentForDelete) : ''} ? Cette action est irréversible.`"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  UsersIcon,
  AcademicCapIcon,
  UserIcon,
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
  title: 'Gestion des élèves - Evaluations'
})

// Composables
const studentsStore = useStudents()
const classesStore = useClasses()
const db = useDatabase()

// Destructure reactive state from store
const {
  filteredStudents,
  studentsCount,
  loading,
  error,
  getStudentFullName,
  getStudentAge,
  getStudentCurrentClass,
  setSearchFilter,
  setClassFilter,
  clearFilters,
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent
} = studentsStore

// Local reactive state
const searchQuery = ref('')
const selectedClassId = ref('')
const classes = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedStudentForEdit = ref(null)
const selectedStudentForDelete = ref(null)

// Computed properties
const selectedClass = computed(() => {
  if (!selectedClassId.value) return null
  return classes.value.find(cls => cls.class_id === selectedClassId.value)
})

const getTeacherName = (teacher) => {
  if (!teacher) return 'Non assigné'
  return teacher.first_name && teacher.last_name 
    ? `${teacher.first_name} ${teacher.last_name}`
    : teacher.email || 'Enseignant'
}

// Watch search query and update filter
watch(searchQuery, (newValue) => {
  setSearchFilter(newValue)
})

// Watch class filter and update filter
watch(selectedClassId, (newValue) => {
  setClassFilter(newValue || undefined)
})

// Methods
const getInitials = (student) => {
  return `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const editStudent = (student) => {
  selectedStudentForEdit.value = student
  showEditModal.value = true
}

const confirmDelete = (student) => {
  selectedStudentForDelete.value = student
  showDeleteModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedStudentForEdit.value = null
}

const handleSave = async (studentData) => {
  let success = false
  
  if (selectedStudentForEdit.value) {
    // Update existing student
    const result = await updateStudent(selectedStudentForEdit.value.student_id, studentData)
    success = !!result
  } else {
    // Create new student
    const result = await createStudent(studentData)
    success = !!result
  }

  if (success) {
    closeModals()
  }
}

const handleDelete = async () => {
  if (selectedStudentForDelete.value) {
    const success = await deleteStudent(selectedStudentForDelete.value.student_id)
    if (success) {
      showDeleteModal.value = false
      selectedStudentForDelete.value = null
    }
  }
}

// Load classes for filter with details
const loadClasses = async () => {
  await classesStore.fetchClasses()
  classes.value = classesStore.classes.value || []
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchStudents(),
    loadClasses()
  ])
})
</script>