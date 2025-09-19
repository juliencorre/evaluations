<template>
  <!-- Fullscreen Dialog for Add/Edit Student -->
  <FullscreenDialog
    :visible="showStudentDialog"
    :title="modalTitle"
    :save-button-text="saveButtonText"
    :saving-text="savingText"
    :save-disabled="!isFormValid || isSaving"
    :is-saving="isSaving"
    @close="closeDialogs"
    @save="handleSave"
  >
    <StudentForm
      v-model:student="formData"
      :is-editing="isEditing"
    />
  </FullscreenDialog>

  <!-- Confirmation Dialog for Delete -->
  <ConfirmationDialog
    :visible="showDeleteDialog"
    title="Supprimer l'élève"
    :message="deleteMessage"
    warning-text="Cette action est irréversible et supprimera toutes les données associées à cet élève."
    confirm-text="Supprimer"
    cancel-text="Annuler"
    @close="closeDialogs"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullscreenDialog from '@/components/common/FullscreenDialog.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import StudentForm from './StudentForm.vue'
import type { Student } from '@/types/evaluation'

interface Props {
  isSaving?: boolean
  isDeleting?: boolean
}

interface Emits {
  (e: 'save-student', student: Student): void
  (e: 'delete-student', student: Student): void
}

withDefaults(defineProps<Props>(), {
  isSaving: false,
  isDeleting: false
})

const emit = defineEmits<Emits>()

// Dialog states
const showStudentDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const studentToDelete = ref<Student | null>(null)

// Form data
const formData = ref<Student>({
  id: '',
  firstName: '',
  lastName: '',
  displayName: ''
})

// Computed properties
const modalTitle = computed(() => {
  return isEditing.value ? 'Modifier l\'élève' : 'Nouvel élève'
})

const saveButtonText = computed(() => {
  return isEditing.value ? 'Modifier' : 'Ajouter'
})

const savingText = computed(() => {
  return isEditing.value ? 'Modification...' : 'Ajout...'
})

const isFormValid = computed(() => {
  return formData.value.firstName.trim() && formData.value.lastName.trim()
})

const deleteMessage = computed(() => {
  if (!studentToDelete.value) return ''
  return `Êtes-vous sûr de vouloir supprimer ${studentToDelete.value.firstName} ${studentToDelete.value.lastName} ?`
})

// Public methods for opening dialogs
const openAddDialog = () => {
  isEditing.value = false
  formData.value = {
    id: '',
    firstName: '',
    lastName: '',
    displayName: ''
  }
  showStudentDialog.value = true
}

const openEditDialog = (student: Student) => {
  isEditing.value = true
  formData.value = { ...student }
  showStudentDialog.value = true
}

const openDeleteDialog = (student: Student) => {
  studentToDelete.value = student
  showDeleteDialog.value = true
}

const closeDialogs = () => {
  showStudentDialog.value = false
  showDeleteDialog.value = false
  studentToDelete.value = null
  formData.value = {
    id: '',
    firstName: '',
    lastName: '',
    displayName: ''
  }
}

const handleSave = () => {
  if (isFormValid.value) {
    emit('save-student', { ...formData.value })
  }
}

const handleDelete = () => {
  if (studentToDelete.value) {
    emit('delete-student', studentToDelete.value)
  }
}

// Expose methods for parent component
defineExpose({
  openAddDialog,
  openEditDialog,
  openDeleteDialog,
  closeDialogs
})
</script>