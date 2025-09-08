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
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full" :class="[
                  syncInProgress ? 'bg-blue-100' : 
                  syncResult?.success ? 'bg-green-100' : 'bg-indigo-100'
                ]">
                  <ArrowPathIcon v-if="syncInProgress" class="h-6 w-6 text-blue-600 animate-spin" />
                  <CheckIcon v-else-if="syncResult?.success" class="h-6 w-6 text-green-600" />
                  <CloudArrowDownIcon v-else class="h-6 w-6 text-indigo-600" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    Synchronisation des établissements scolaires
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Cette opération va synchroniser votre base de données avec l'annuaire de l'éducation nationale.
                      Les établissements existants seront mis à jour et les nouveaux seront ajoutés.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Sync Options -->
              <div v-if="!syncInProgress && !syncResult" class="mt-6 space-y-4">
                <div>
                  <label for="syncDepartment" class="block text-sm font-medium text-gray-700">
                    Département (optionnel)
                  </label>
                  <div class="mt-1 flex items-center space-x-2">
                    <input
                      id="syncDepartment"
                      v-model="syncDepartment"
                      type="text"
                      maxlength="3"
                      placeholder="Ex: 49, 75, 2A... (vide = tous)"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <span class="text-xs text-gray-500">
                      Laissez vide pour synchroniser tous les départements
                    </span>
                  </div>
                </div>

                <div>
                  <label for="syncLimit" class="block text-sm font-medium text-gray-700">
                    Nombre maximum d'établissements
                  </label>
                  <div class="mt-1">
                    <select
                      id="syncLimit"
                      v-model="syncLimit"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option :value="1000">1 000 établissements</option>
                      <option :value="5000">5 000 établissements</option>
                      <option :value="10000">10 000 établissements</option>
                      <option :value="20000">20 000 établissements</option>
                      <option :value="50000">50 000 établissements</option>
                      <option :value="100000">Tous (peut être long)</option>
                    </select>
                  </div>
                </div>

                <div class="rounded-md bg-yellow-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" />
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-yellow-800">Attention</h3>
                      <div class="mt-2 text-sm text-yellow-700">
                        <ul class="list-disc pl-5 space-y-1">
                          <li>Cette opération peut prendre plusieurs minutes selon le nombre d'établissements</li>
                          <li>Ne fermez pas cette fenêtre pendant la synchronisation</li>
                          <li>Les données existantes seront mises à jour si nécessaire</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Progress Display -->
              <div v-if="syncInProgress" class="mt-6">
                <div class="text-center">
                  <p class="text-sm font-medium text-gray-900 mb-2">
                    Synchronisation en cours...
                  </p>
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-indigo-600 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">
                    Veuillez patienter, cette opération peut prendre quelques minutes
                  </p>
                </div>
              </div>

              <!-- Sync Results -->
              <div v-if="syncResult" class="mt-6">
                <div :class="[
                  'rounded-lg p-4',
                  syncResult.success ? 'bg-green-50' : 'bg-red-50'
                ]">
                  <h4 class="text-sm font-medium" :class="[
                    syncResult.success ? 'text-green-900' : 'text-red-900'
                  ]">
                    {{ syncResult.success ? 'Synchronisation terminée avec succès' : 'Erreur lors de la synchronisation' }}
                  </h4>
                  <p class="mt-1 text-sm" :class="[
                    syncResult.success ? 'text-green-700' : 'text-red-700'
                  ]">
                    {{ syncResult.message }}
                  </p>
                  
                  <div v-if="syncResult.success" class="mt-3 grid grid-cols-3 gap-4">
                    <div class="text-center">
                      <p class="text-2xl font-bold text-green-600">{{ syncResult.inserted }}</p>
                      <p class="text-xs text-gray-500">Ajoutées</p>
                    </div>
                    <div class="text-center">
                      <p class="text-2xl font-bold text-blue-600">{{ syncResult.updated }}</p>
                      <p class="text-xs text-gray-500">Mises à jour</p>
                    </div>
                    <div class="text-center">
                      <p class="text-2xl font-bold" :class="[
                        syncResult.errors > 0 ? 'text-red-600' : 'text-gray-400'
                      ]">{{ syncResult.errors }}</p>
                      <p class="text-xs text-gray-500">Erreurs</p>
                    </div>
                  </div>
                  
                  <!-- Error Details -->
                  <details v-if="syncResult.details && syncResult.details.length > 0" class="mt-4">
                    <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      Voir les détails ({{ syncResult.details.length }} messages)
                    </summary>
                    <div class="mt-2 max-h-40 overflow-y-auto bg-white p-2 rounded border text-xs">
                      <div v-for="(detail, index) in syncResult.details" :key="index" class="mb-1">
                        {{ detail }}
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  v-if="!syncInProgress && !syncResult"
                  type="button"
                  @click="startSync"
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto"
                >
                  <ArrowPathIcon class="w-4 h-4 mr-2" />
                  Lancer la synchronisation
                </button>
                
                <button
                  v-if="syncResult"
                  type="button"
                  @click="resetSync"
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto"
                >
                  Nouvelle synchronisation
                </button>
                
                <button
                  type="button"
                  @click="$emit('close')"
                  :disabled="syncInProgress"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
                >
                  {{ syncInProgress ? 'Synchronisation en cours...' : 'Fermer' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { 
  CloudArrowDownIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon, 
  CheckIcon 
} from '@heroicons/vue/24/outline'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  syncComplete: []
}>()

// State
const syncDepartment = ref('')
const syncLimit = ref(5000)
const syncInProgress = ref(false)
const syncResult = ref<{
  success: boolean
  message: string
  total?: number
  inserted?: number
  updated?: number
  errors?: number
  details?: string[]
} | null>(null)

// Methods
const startSync = async () => {
  syncInProgress.value = true
  syncResult.value = null
  
  try {
    const response = await $fetch('/api/education/sync-schools', {
      method: 'POST',
      body: {
        department: syncDepartment.value || undefined,
        limit: syncLimit.value
      }
    })
    
    syncResult.value = response
    
    // Emit event to refresh the schools list
    if (response.success) {
      emit('syncComplete')
    }
  } catch (error: any) {
    console.error('Sync error:', error)
    syncResult.value = {
      success: false,
      message: error.message || 'Erreur lors de la synchronisation'
    }
  } finally {
    syncInProgress.value = false
  }
}

const resetSync = () => {
  syncResult.value = null
  syncDepartment.value = ''
  syncLimit.value = 5000
}
</script>