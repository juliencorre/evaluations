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
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <UserPlusIcon class="h-6 w-6 text-green-600" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    Ajouter un élève à la classe
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Vous pouvez ajouter un élève existant ou créer un nouvel élève.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Tabs -->
              <div class="mt-6">
                <nav class="flex space-x-4" aria-label="Tabs">
                  <button
                    @click="activeTab = 'existing'"
                    :class="[
                      activeTab === 'existing' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-500 hover:text-gray-700',
                      'px-3 py-2 font-medium text-sm rounded-md'
                    ]"
                  >
                    Élève existant
                  </button>
                  <button
                    @click="activeTab = 'new'"
                    :class="[
                      activeTab === 'new' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-500 hover:text-gray-700',
                      'px-3 py-2 font-medium text-sm rounded-md'
                    ]"
                  >
                    Nouvel élève
                  </button>
                </nav>
              </div>

              <!-- Existing Student Tab -->
              <div v-if="activeTab === 'existing'" class="mt-6">
                <!-- Search -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Rechercher un élève
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Nom, prénom..."
                      class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <!-- Student List -->
                <div class="max-h-60 overflow-y-auto">
                  <div v-if="loadingStudents" class="text-center py-4">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <p class="mt-2 text-sm text-gray-500">Chargement des élèves...</p>
                  </div>

                  <div v-else-if="filteredAvailableStudents.length === 0" class="text-center py-4">
                    <UsersIcon class="mx-auto h-8 w-8 text-gray-400" />
                    <p class="mt-2 text-sm text-gray-500">
                      {{ searchQuery ? 'Aucun élève trouvé' : 'Aucun élève disponible' }}
                    </p>
                  </div>

                  <div v-else class="space-y-2">
                    <div
                      v-for="student in filteredAvailableStudents"
                      :key="student.student_id"
                      :class="[
                        'p-3 border rounded-md cursor-pointer transition-colors',
                        selectedStudent?.student_id === student.student_id
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      ]"
                      @click="selectedStudent = student"
                    >
                      <div class="flex items-center">
                        <div class="flex-shrink-0">
                          <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span class="text-xs font-medium text-indigo-600">
                              {{ getStudentInitials(student) }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-gray-900">
                            {{ student.first_name }} {{ student.last_name }}
                          </p>
                          <p v-if="student.birth_date" class="text-xs text-gray-500">
                            Né(e) le {{ formatDate(student.birth_date) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- New Student Tab -->
              <div v-if="activeTab === 'new'" class="mt-6">
                <form @submit.prevent="createAndAddStudent" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Prénom *
                    </label>
                    <input
                      v-model="newStudentForm.first_name"
                      type="text"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Prénom de l'élève"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Nom *
                    </label>
                    <input
                      v-model="newStudentForm.last_name"
                      type="text"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Nom de l'élève"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Date de naissance
                    </label>
                    <input
                      v-model="newStudentForm.birth_date"
                      type="date"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Référence externe
                    </label>
                    <input
                      v-model="newStudentForm.external_ref"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Numéro d'élève, INE, etc."
                    />
                  </div>
                </form>
              </div>

              <!-- Error Display -->
              <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Erreur</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>{{ error }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  @click="handleAdd"
                  :disabled="loading || !canAdd"
                  type="button"
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2"
                >
                  <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ajout...
                  </span>
                  <span v-else>
                    {{ activeTab === 'existing' ? 'Ajouter à la classe' : 'Créer et ajouter' }}
                  </span>
                </button>
                <button
                  type="button"
                  @click="$emit('close')"
                  :disabled="loading"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-1 sm:mt-0"
                >
                  Annuler
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { UserPlusIcon, MagnifyingGlassIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  classId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'added'])

// Composables
const classesStore = useClasses()
const studentsStore = useStudents()

const { addStudentToClass } = classesStore
const { fetchStudents, createStudent } = studentsStore

// Local state
const activeTab = ref('existing')
const searchQuery = ref('')
const selectedStudent = ref(null)
const availableStudents = ref([])
const loadingStudents = ref(false)
const loading = ref(false)
const error = ref(null)

// New student form
const newStudentForm = ref({
  first_name: '',
  last_name: '',
  birth_date: '',
  external_ref: ''
})

// Computed
const filteredAvailableStudents = computed(() => {
  if (!searchQuery.value) return availableStudents.value
  
  const search = searchQuery.value.toLowerCase()
  return availableStudents.value.filter(student => 
    student.first_name.toLowerCase().includes(search) ||
    student.last_name.toLowerCase().includes(search)
  )
})

const canAdd = computed(() => {
  if (activeTab.value === 'existing') {
    return selectedStudent.value !== null
  } else {
    return newStudentForm.value.first_name.trim() !== '' && 
           newStudentForm.value.last_name.trim() !== ''
  }
})

// Methods
const getStudentInitials = (student) => {
  return `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const loadAvailableStudents = async () => {
  if (!props.show) return
  
  loadingStudents.value = true
  try {
    // Get all students
    const response = await studentsStore.fetchStudents()
    
    // Filter out students already in this class
    // This would need to be implemented based on the current class students
    availableStudents.value = studentsStore.students.value || []
  } catch (err) {
    console.error('Error loading students:', err)
  } finally {
    loadingStudents.value = false
  }
}

const handleAdd = async () => {
  if (activeTab.value === 'existing') {
    await addExistingStudent()
  } else {
    await createAndAddStudent()
  }
}

const addExistingStudent = async () => {
  if (!selectedStudent.value || !props.classId) return
  
  loading.value = true
  error.value = null
  
  try {
    const success = await addStudentToClass(props.classId, selectedStudent.value.student_id)
    
    if (success) {
      emit('added')
      selectedStudent.value = null
      searchQuery.value = ''
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors de l\'ajout de l\'élève'
  } finally {
    loading.value = false
  }
}

const createAndAddStudent = async () => {
  if (!props.classId) return
  
  loading.value = true
  error.value = null
  
  try {
    // Create new student
    const newStudent = await createStudent({
      first_name: newStudentForm.value.first_name.trim(),
      last_name: newStudentForm.value.last_name.trim(),
      birth_date: newStudentForm.value.birth_date || null,
      external_ref: newStudentForm.value.external_ref.trim() || null
    })
    
    if (!newStudent) {
      error.value = 'Erreur lors de la création de l\'élève'
      return
    }
    
    // Add to class
    const success = await addStudentToClass(props.classId, newStudent.student_id)
    
    if (success) {
      emit('added')
      // Reset form
      newStudentForm.value = {
        first_name: '',
        last_name: '',
        birth_date: '',
        external_ref: ''
      }
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors de la création et de l\'ajout de l\'élève'
  } finally {
    loading.value = false
  }
}

// Watch for modal open/close
watch(() => props.show, (newValue) => {
  if (newValue) {
    loadAvailableStudents()
    error.value = null
    selectedStudent.value = null
    searchQuery.value = ''
    activeTab.value = 'existing'
  }
})
</script>