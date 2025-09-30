<template>
  <!-- Add Result Type Modal -->
  <FullscreenDialog
    :visible="showAddModal"
    title="Nouveau type de résultat"
    save-button-text="Créer"
    :save-disabled="!isAddFormValid"
    @close="closeAddModal"
    @save="handleAddSave"
  >
    <ResultTypeForm
      :model-value="addFormData"
      :editing="false"
      @update:model-value="updateAddFormData"
    />
  </FullscreenDialog>

  <!-- Edit Result Type Modal -->
  <FullscreenDialog
    :visible="showEditModal"
    title="Modifier le type de résultat"
    save-button-text="Modifier"
    :save-disabled="!isEditFormValid"
    @close="closeEditModal"
    @save="handleEditSave"
  >
    <ResultTypeForm
      :model-value="editFormData"
      :editing="true"
      @update:model-value="updateEditFormData"
    />
  </FullscreenDialog>

  <!-- Delete Confirmation Dialog -->
  <ConfirmationDialog
    :visible="showDeleteModal"
    :title="deleteTitle"
    :message="deleteMessage"
    warning-text="Cette action supprimera définitivement ce type de résultat. Les compétences qui l'utilisent devront être reconfigurées."
    @close="closeDeleteModal"
    @confirm="handleDeleteConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullscreenDialog from '@/components/common/FullscreenDialog.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import ResultTypeForm from './ResultTypeForm.vue'
import type { ResultTypeConfig } from '@/types/evaluation'

interface Emits {
  (e: 'save', data: { type: Partial<ResultTypeConfig>; isEditing: boolean }): void
  (e: 'delete', type: ResultTypeConfig): void
}

const emit = defineEmits<Emits>()

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Form data
const addFormData = ref<Partial<ResultTypeConfig>>({
  id: '',
  name: '',
  type: 'scale',
  config: {
    values: []
  }
})

const editFormData = ref<Partial<ResultTypeConfig>>({
  id: '',
  name: '',
  type: 'scale',
  config: {
    values: []
  }
})
const currentDeleteItem = ref<ResultTypeConfig | null>(null)

// Computed properties
const isAddFormValid = computed(() => {
  const hasName = addFormData.value.name?.trim()

  // For all types, check values array (numeric now has predefined values too)
  return hasName &&
         addFormData.value.config?.values &&
         addFormData.value.config.values.length > 0
})

const isEditFormValid = computed(() => {
  const hasName = editFormData.value.name?.trim()

  // For all types, check values array (numeric now has predefined values too)
  return hasName &&
         editFormData.value.config?.values &&
         editFormData.value.config.values.length > 0
})

const deleteTitle = computed(() =>
  `Supprimer "${currentDeleteItem.value?.name || ''}"`)

const deleteMessage = computed(() =>
  `Êtes-vous sûr de vouloir supprimer le type de résultat "${currentDeleteItem.value?.name || ''}" ?`)

// Public methods
const openAddModal = () => {
  addFormData.value = {
    id: '',
    name: '',
    type: 'scale',
    config: {
      values: []
    }
  }
  showAddModal.value = true
}

const openEditModal = (type: ResultTypeConfig) => {
  editFormData.value = {
    id: type.id || '',
    name: type.name || '',
    type: type.type || 'scale',
    config: {
      values: type.config?.values ? [...type.config.values] : [],
      minValue: type.config?.minValue,
      maxValue: type.config?.maxValue
    }
  }
  showEditModal.value = true
}

const openDeleteModal = (type: ResultTypeConfig) => {
  currentDeleteItem.value = type
  showDeleteModal.value = true
}

// Modal handlers
const closeAddModal = () => {
  showAddModal.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  currentDeleteItem.value = null
}

const handleAddSave = () => {
  if (isAddFormValid.value) {
    emit('save', {
      type: addFormData.value as ResultTypeConfig,
      isEditing: false
    })
    closeAddModal()
  }
}

const handleEditSave = () => {
  if (isEditFormValid.value) {
    emit('save', {
      type: editFormData.value as ResultTypeConfig,
      isEditing: true
    })
    closeEditModal()
  }
}

const handleDeleteConfirm = () => {
  if (currentDeleteItem.value) {
    emit('delete', currentDeleteItem.value)
    closeDeleteModal()
  }
}

// Update methods to prevent recursion
const updateAddFormData = (data: Partial<ResultTypeConfig>) => {
  // Only update if there are actual changes
  if (JSON.stringify(data) !== JSON.stringify(addFormData.value)) {
    addFormData.value = data
  }
}

const updateEditFormData = (data: Partial<ResultTypeConfig>) => {
  // Only update if there are actual changes
  if (JSON.stringify(data) !== JSON.stringify(editFormData.value)) {
    editFormData.value = data
  }
}

// Expose methods for parent component
defineExpose({
  openAddModal,
  openEditModal,
  openDeleteModal
})
</script>