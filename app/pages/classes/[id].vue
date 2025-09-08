<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-2 text-sm text-gray-500">Chargement de la classe...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center min-h-64 flex items-center justify-center">
      <div>
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="loadClass"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>

    <!-- Class Details -->
    <div v-else-if="classData">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <NuxtLink to="/classes" class="text-gray-400 hover:text-gray-500">
                  Classes
                </NuxtLink>
              </li>
              <li>
                <div class="flex items-center">
                  <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span class="ml-4 text-sm font-medium text-gray-500">{{ classData.label }}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div class="mt-2 flex items-center">
            <AcademicCapIcon class="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ classData.label }}</h1>
              <p class="mt-1 text-sm text-gray-600">
                {{ classData.level }} • {{ classData.school_year.label }}
                <span v-if="classData.school"> • {{ classData.school.name }}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <button
            @click="showAddStudentModal = true"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlusIcon class="w-4 h-4 mr-2" />
            Ajouter un élève
          </button>
          
          <button
            @click="editClass"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            Modifier la classe
          </button>
        </div>
      </div>

      <!-- Class Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UsersIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Élèves inscrits
                  </dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    {{ classData.student_count || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UserIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Enseignant principal
                  </dt>
                  <dd class="text-lg font-semibold text-gray-900 truncate">
                    {{ getTeacherFullName(classData.primary_teacher) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClipboardDocumentListIcon class="h-8 w-8 text-yellow-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Évaluations
                  </dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    0
                  </dd>
                </dl>
              </div>
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
                    Créée le
                  </dt>
                  <dd class="text-lg font-semibold text-gray-900">
                    {{ formatDate(classData.created_at) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Students List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">
              Liste des élèves ({{ classData.students?.length || 0 }})
            </h2>
            <button
              @click="showAddStudentModal = true"
              type="button"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserPlusIcon class="w-4 h-4 mr-1" />
              Ajouter
            </button>
          </div>
        </div>

        <!-- Students Table -->
        <div v-if="classData.students && classData.students.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Élève
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de naissance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in classData.students" :key="student.student_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-indigo-700">
                          {{ getStudentInitials(student) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ student.first_name }} {{ student.last_name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.birth_date ? formatDate(student.birth_date) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.enrolment_date ? formatDate(student.enrolment_date) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.external_ref || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <NuxtLink
                      :to="`/students/${student.student_id}`"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </NuxtLink>
                    <button
                      @click="confirmRemoveStudent(student)"
                      class="text-red-600 hover:text-red-900"
                    >
                      <UserMinusIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty students state -->
        <div v-else class="text-center py-12">
          <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun élève inscrit</h3>
          <p class="mt-1 text-sm text-gray-500">
            Commencez par ajouter des élèves à cette classe.
          </p>
          <div class="mt-6">
            <button
              @click="showAddStudentModal = true"
              type="button"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlusIcon class="w-4 h-4 mr-2" />
              Ajouter un élève
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Class Modal -->
    <ClassModal
      :show="showEditModal"
      :class-data="classData"
      :school-years="schoolYears"
      :schools="schools"
      @close="showEditModal = false"
      @save="handleClassUpdate"
    />

    <!-- Add Student Modal -->
    <AddStudentToClassModal
      :show="showAddStudentModal"
      :class-id="classData?.class_id"
      @close="showAddStudentModal = false"
      @added="handleStudentAdded"
    />

    <!-- Remove Student Confirmation -->
    <ConfirmDeleteModal
      :show="showRemoveStudentModal"
      :title="'Retirer l\'élève de la classe'"
      :message="`Êtes-vous sûr de vouloir retirer ${studentToRemove?.first_name} ${studentToRemove?.last_name} de cette classe ?`"
      @confirm="handleRemoveStudent"
      @cancel="showRemoveStudentModal = false"
    />
  </div>
</template>

<script setup>
import { 
  AcademicCapIcon,
  ChevronRightIcon,
  UsersIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  PencilIcon,
  UserPlusIcon,
  EyeIcon,
  UserMinusIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Get class ID from route
const route = useRoute()
const classId = route.params.id

// Composables
const classesStore = useClasses()
const {
  selectedClass: classData,
  schoolYears,
  schools,
  loading,
  error,
  fetchClassById,
  getTeacherFullName,
  updateClass,
  removeStudentFromClass,
  fetchSchoolYears,
  fetchSchools
} = classesStore

// Local state
const showEditModal = ref(false)
const showAddStudentModal = ref(false)
const showRemoveStudentModal = ref(false)
const studentToRemove = ref(null)

// Methods
const loadClass = async () => {
  await fetchClassById(classId)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStudentInitials = (student) => {
  return `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase()
}

const editClass = () => {
  showEditModal.value = true
}

const handleClassUpdate = async (classDataUpdate) => {
  const success = await updateClass(classId, classDataUpdate)
  if (success) {
    showEditModal.value = false
    await loadClass() // Reload to get updated data
  }
}

const confirmRemoveStudent = (student) => {
  studentToRemove.value = student
  showRemoveStudentModal.value = true
}

const handleRemoveStudent = async () => {
  if (studentToRemove.value) {
    const success = await removeStudentFromClass(classId, studentToRemove.value.student_id)
    if (success) {
      showRemoveStudentModal.value = false
      studentToRemove.value = null
      await loadClass() // Reload to get updated student list
    }
  }
}

const handleStudentAdded = async () => {
  showAddStudentModal.value = false
  await loadClass() // Reload to get updated student list
}

// Set page title
useHead(() => ({
  title: `${classData.value?.label || 'Classe'} - Evaluations`
}))

// Initialize
onMounted(async () => {
  await Promise.all([
    loadClass(),
    fetchSchoolYears(),
    fetchSchools()
  ])
})
</script>