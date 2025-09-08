<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des domaines</h1>
        <p class="mt-1 text-sm text-gray-600">
          Organisez les domaines de compétences par référentiel
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          @click="showCreateModal = true"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Nouveau domaine
        </button>
      </div>
    </div>

    <!-- Framework Filter -->
    <div class="mt-8 bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Référentiel
          </label>
          <select
            v-model="selectedFrameworkId"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tous les référentiels</option>
            <option v-for="framework in frameworks" :key="framework.framework_id" :value="framework.framework_id">
              {{ framework.name }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="clearFilters"
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Effacer
          </button>
        </div>
      </div>
    </div>

    <!-- Domains List -->
    <div class="mt-6 bg-white shadow overflow-hidden rounded-lg">
      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Chargement des domaines...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-8 text-center">
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="fetchDomains"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredDomains.length === 0" class="p-8 text-center">
        <FolderIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun domaine trouvé</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ selectedFrameworkId ? 'Aucun domaine dans ce référentiel.' : 'Commencez par créer un domaine.' }}
        </p>
        <div class="mt-6">
          <button
            @click="showCreateModal = true"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Créer un domaine
          </button>
        </div>
      </div>

      <!-- Domains Table -->
      <div v-else class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domaine
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référentiel
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordre
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
            <tr v-for="domain in filteredDomains" :key="domain.domain_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ domain.label }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ domain.framework?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="domain.code" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ domain.code }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ domain.sort_order }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(domain.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="editDomain(domain)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(domain)"
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
    <DomainModal
      :show="showCreateModal || showEditModal"
      :domain="selectedDomainForEdit"
      :frameworks="frameworks"
      @close="closeModals"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      :title="'Supprimer le domaine'"
      :message="`Êtes-vous sûr de vouloir supprimer le domaine '${selectedDomainForDelete?.label}' ? Cette action supprimera aussi tous les champs et compétences associés.`"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { 
  PlusIcon,
  FolderIcon,
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
  title: 'Gestion des domaines - Evaluations'
})

// Composables
const competencesStore = useCompetences()

// Destructure reactive state from store
const {
  frameworks,
  domains,
  filteredDomains,
  loading,
  error,
  setFrameworkFilter,
  clearFilters,
  fetchFrameworks,
  fetchDomains,
  createDomain,
  updateDomain,
  deleteDomain
} = competencesStore

// Local reactive state
const selectedFrameworkId = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedDomainForEdit = ref(null)
const selectedDomainForDelete = ref(null)

// Watch framework filter and update filter
watch(selectedFrameworkId, (newValue) => {
  setFrameworkFilter(newValue || undefined)
})

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const editDomain = (domain) => {
  selectedDomainForEdit.value = domain
  showEditModal.value = true
}

const confirmDelete = (domain) => {
  selectedDomainForDelete.value = domain
  showDeleteModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedDomainForEdit.value = null
}

const handleSave = async (domainData) => {
  let success = false
  
  if (selectedDomainForEdit.value) {
    // Update existing domain
    const result = await updateDomain(selectedDomainForEdit.value.domain_id, domainData)
    success = !!result
  } else {
    // Create new domain
    const result = await createDomain(domainData)
    success = !!result
  }

  if (success) {
    closeModals()
  }
}

const handleDelete = async () => {
  if (selectedDomainForDelete.value) {
    const success = await deleteDomain(selectedDomainForDelete.value.domain_id)
    if (success) {
      showDeleteModal.value = false
      selectedDomainForDelete.value = null
    }
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchFrameworks(),
    fetchDomains()
  ])
})
</script>