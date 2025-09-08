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
                    <CalendarIcon v-if="!schoolYear" class="h-6 w-6 text-indigo-600" />
                    <PencilIcon v-else class="h-6 w-6 text-indigo-600" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      {{ schoolYear ? 'Modifier l\'année scolaire' : 'Nouvelle année scolaire' }}
                    </DialogTitle>
                    <div v-if="!schoolYear" class="mt-2">
                      <p class="text-sm text-gray-500">
                        Définissez une nouvelle période scolaire avec ses dates de début et de fin.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Form Fields -->
                <div class="mt-6 space-y-4">
                  <!-- Year Label -->
                  <div>
                    <label for="label" class="block text-sm font-medium leading-6 text-gray-900">
                      Nom de l'année scolaire *
                    </label>
                    <div class="mt-1">
                      <input
                        id="label"
                        v-model="form.label"
                        type="text"
                        required
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="2023-2024, Année scolaire 2023-2024..."
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                      Par exemple : "2023-2024" ou "Année scolaire 2023-2024"
                    </p>
                  </div>

                  <!-- Start Date -->
                  <div>
                    <label for="starts_on" class="block text-sm font-medium leading-6 text-gray-900">
                      Date de début *
                    </label>
                    <div class="mt-1">
                      <input
                        id="starts_on"
                        v-model="form.starts_on"
                        type="date"
                        required
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                      Généralement début septembre
                    </p>
                  </div>

                  <!-- End Date -->
                  <div>
                    <label for="ends_on" class="block text-sm font-medium leading-6 text-gray-900">
                      Date de fin *
                    </label>
                    <div class="mt-1">
                      <input
                        id="ends_on"
                        v-model="form.ends_on"
                        type="date"
                        required
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                      Généralement fin juin ou début juillet
                    </p>
                  </div>

                  <!-- Date validation info -->
                  <div v-if="dateValidationMessage" :class="[
                    'p-3 rounded-md text-sm',
                    dateValidationValid ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                  ]">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <InformationCircleIcon class="h-5 w-5" :class="dateValidationValid ? 'text-green-400' : 'text-yellow-400'" />
                      </div>
                      <div class="ml-3">
                        <p>{{ dateValidationMessage }}</p>
                      </div>
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
                      {{ schoolYear ? 'Modifier' : 'Créer' }}
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
import { CalendarIcon, PencilIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  schoolYear: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

// Form state
const form = ref({
  label: '',
  starts_on: '',
  ends_on: ''
})

const loading = ref(false)
const error = ref(null)

// Computed
const isFormValid = computed(() => {
  return form.value.label.trim() !== '' && 
         form.value.starts_on !== '' && 
         form.value.ends_on !== '' &&
         new Date(form.value.starts_on) < new Date(form.value.ends_on)
})

const dateValidationMessage = computed(() => {
  if (!form.value.starts_on || !form.value.ends_on) {
    return null
  }

  const startDate = new Date(form.value.starts_on)
  const endDate = new Date(form.value.ends_on)
  
  if (startDate >= endDate) {
    return "La date de fin doit être postérieure à la date de début"
  }

  const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth())

  if (monthsDiff < 8) {
    return "Une année scolaire dure généralement entre 8 et 12 mois"
  }

  if (monthsDiff > 12) {
    return "Cette période semble très longue pour une année scolaire"
  }

  return `Durée: ${monthsDiff} mois (${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} jours)`
})

const dateValidationValid = computed(() => {
  if (!dateValidationMessage.value) return true
  return !dateValidationMessage.value.includes('doit être') && 
         !dateValidationMessage.value.includes('très longue')
})

// Watch for schoolYear prop changes
watch(() => props.schoolYear, (newSchoolYear) => {
  if (newSchoolYear) {
    form.value = {
      label: newSchoolYear.label || '',
      starts_on: newSchoolYear.starts_on || '',
      ends_on: newSchoolYear.ends_on || ''
    }
  } else {
    // Reset form for new school year
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    
    form.value = {
      label: `${currentYear}-${nextYear}`,
      starts_on: `${currentYear}-09-01`,
      ends_on: `${nextYear}-06-30`
    }
  }
  error.value = null
}, { immediate: true })

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    // Prepare school year data
    const schoolYearData = {
      label: form.value.label.trim(),
      starts_on: form.value.starts_on,
      ends_on: form.value.ends_on
    }

    // Emit save event
    await emit('save', schoolYearData)

  } catch (err) {
    error.value = err.message || 'Une erreur est survenue lors de l\'enregistrement'
  } finally {
    loading.value = false
  }
}
</script>