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
              <form @submit.prevent="handleSubmit">
                <div>
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                    <UserPlusIcon v-if="!student" class="h-6 w-6 text-indigo-600" />
                    <PencilIcon v-else class="h-6 w-6 text-indigo-600" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      {{ student ? 'Modifier l\'élève' : 'Nouvel élève' }}
                    </DialogTitle>
                  </div>
                </div>

                <!-- Form Fields -->
                <div class="mt-6 space-y-4">
                  <!-- First Name -->
                  <div>
                    <label for="first_name" class="block text-sm font-medium leading-6 text-gray-900">
                      Prénom *
                    </label>
                    <div class="mt-1">
                      <input
                        id="first_name"
                        v-model="form.first_name"
                        type="text"
                        required
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Prénom de l'élève"
                      />
                    </div>
                  </div>

                  <!-- Last Name -->
                  <div>
                    <label for="last_name" class="block text-sm font-medium leading-6 text-gray-900">
                      Nom *
                    </label>
                    <div class="mt-1">
                      <input
                        id="last_name"
                        v-model="form.last_name"
                        type="text"
                        required
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Nom de l'élève"
                      />
                    </div>
                  </div>

                  <!-- Birth Date -->
                  <div>
                    <label for="birth_date" class="block text-sm font-medium leading-6 text-gray-900">
                      Date de naissance
                    </label>
                    <div class="mt-1">
                      <input
                        id="birth_date"
                        v-model="form.birth_date"
                        type="date"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <!-- External Reference -->
                  <div>
                    <label for="external_ref" class="block text-sm font-medium leading-6 text-gray-900">
                      Référence externe
                    </label>
                    <div class="mt-1">
                      <input
                        id="external_ref"
                        v-model="form.external_ref"
                        type="text"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Numéro d'élève, INE, etc."
                      />
                    </div>
                  </div>

                  <!-- Class Assignment (only for new students) -->
                  <div v-if="!student && classes.length > 0">
                    <label for="class_id" class="block text-sm font-medium leading-6 text-gray-900">
                      Classe
                    </label>
                    <div class="mt-1">
                      <select
                        id="class_id"
                        v-model="selectedClassId"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Aucune classe pour le moment</option>
                        <option v-for="cls in classes" :key="cls.class_id" :value="cls.class_id">
                          {{ cls.label }}
                        </option>
                      </select>
                    </div>
                  </div>
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
                <div class="mt-6 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    :disabled="loading || !isFormValid"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2"
                  >
                    <span v-if="loading" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </span>
                    <span v-else>
                      {{ student ? 'Modifier' : 'Créer' }}
                    </span>
                  </button>
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { UserPlusIcon, PencilIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  student: {
    type: Object,
    default: null
  },
  classes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

// Form state
const form = ref({
  first_name: '',
  last_name: '',
  birth_date: '',
  external_ref: ''
})

const selectedClassId = ref('')
const loading = ref(false)
const error = ref(null)

// Computed
const isFormValid = computed(() => {
  return form.value.first_name.trim() !== '' && form.value.last_name.trim() !== ''
})

// Watch for student prop changes
watch(() => props.student, (newStudent) => {
  if (newStudent) {
    form.value = {
      first_name: newStudent.first_name || '',
      last_name: newStudent.last_name || '',
      birth_date: newStudent.birth_date || '',
      external_ref: newStudent.external_ref || ''
    }
  } else {
    // Reset form for new student
    form.value = {
      first_name: '',
      last_name: '',
      birth_date: '',
      external_ref: ''
    }
    selectedClassId.value = ''
  }
  error.value = null
}, { immediate: true })

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    // Prepare student data
    const studentData = {
      first_name: form.value.first_name.trim(),
      last_name: form.value.last_name.trim(),
      birth_date: form.value.birth_date || null,
      external_ref: form.value.external_ref.trim() || null
    }

    // Emit save event
    await emit('save', studentData)

    // If creating a new student and class is selected, handle enrollment
    if (!props.student && selectedClassId.value) {
      // This would need to be handled by the parent component
      // as we'd need the created student ID
    }

  } catch (err) {
    error.value = err.message || 'Une erreur est survenue lors de l\'enregistrement'
  } finally {
    loading.value = false
  }
}
</script>