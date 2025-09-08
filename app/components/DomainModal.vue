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
                    <FolderPlusIcon v-if="!domain" class="h-6 w-6 text-indigo-600" />
                    <PencilIcon v-else class="h-6 w-6 text-indigo-600" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      {{ domain ? 'Modifier le domaine' : 'Nouveau domaine' }}
                    </DialogTitle>
                  </div>
                </div>

                <!-- Form Fields -->
                <div class="mt-6 space-y-4">
                  <!-- Framework Selection -->
                  <div>
                    <label for="framework_id" class="block text-sm font-medium leading-6 text-gray-900">
                      Référentiel *
                    </label>
                    <div class="mt-1">
                      <select
                        id="framework_id"
                        v-model="form.framework_id"
                        required
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Sélectionner un référentiel</option>
                        <option v-for="framework in frameworks" :key="framework.framework_id" :value="framework.framework_id">
                          {{ framework.name }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Label -->
                  <div>
                    <label for="label" class="block text-sm font-medium leading-6 text-gray-900">
                      Libellé *
                    </label>
                    <div class="mt-1">
                      <input
                        id="label"
                        v-model="form.label"
                        type="text"
                        required
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Nom du domaine"
                      />
                    </div>
                  </div>

                  <!-- Code -->
                  <div>
                    <label for="code" class="block text-sm font-medium leading-6 text-gray-900">
                      Code
                    </label>
                    <div class="mt-1">
                      <input
                        id="code"
                        v-model="form.code"
                        type="text"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Code du domaine (optionnel)"
                      />
                    </div>
                  </div>

                  <!-- Sort Order -->
                  <div>
                    <label for="sort_order" class="block text-sm font-medium leading-6 text-gray-900">
                      Ordre d'affichage
                    </label>
                    <div class="mt-1">
                      <input
                        id="sort_order"
                        v-model.number="form.sort_order"
                        type="number"
                        min="0"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="0"
                      />
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
                      {{ domain ? 'Modifier' : 'Créer' }}
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
import { FolderPlusIcon, PencilIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  domain: {
    type: Object,
    default: null
  },
  frameworks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

// Form state
const form = ref({
  framework_id: '',
  label: '',
  code: '',
  sort_order: 0
})

const loading = ref(false)
const error = ref(null)

// Computed
const isFormValid = computed(() => {
  return form.value.framework_id !== '' && form.value.label.trim() !== ''
})

// Watch for domain prop changes
watch(() => props.domain, (newDomain) => {
  if (newDomain) {
    form.value = {
      framework_id: newDomain.framework_id || '',
      label: newDomain.label || '',
      code: newDomain.code || '',
      sort_order: newDomain.sort_order || 0
    }
  } else {
    // Reset form for new domain
    form.value = {
      framework_id: '',
      label: '',
      code: '',
      sort_order: 0
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
    // Prepare domain data
    const domainData = {
      framework_id: form.value.framework_id,
      label: form.value.label.trim(),
      code: form.value.code.trim() || null,
      sort_order: form.value.sort_order || 0
    }

    // Emit save event
    await emit('save', domainData)

  } catch (err) {
    error.value = err.message || 'Une erreur est survenue lors de l\'enregistrement'
  } finally {
    loading.value = false
  }
}
</script>