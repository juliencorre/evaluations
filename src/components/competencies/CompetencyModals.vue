<template>
  <!-- Fullscreen Dialog for Add/Edit -->
  <FullscreenDialog
    :visible="showEditDialog"
    :title="modalTitle"
    :save-button-text="saveButtonText"
    :save-disabled="!isFormValid"
    @close="closeDialog"
    @save="handleSave"
  >
    <CompetencyForm
      v-model="formData"
      :type="currentType"
      :context="currentContext"
      :result-types="resultTypes"
    />
  </FullscreenDialog>

  <!-- Confirmation Dialog for Delete -->
  <ConfirmationDialog
    :visible="showDeleteDialog"
    :title="deleteTitle"
    :message="deleteMessage"
    :warning-text="deleteWarning"
    @close="closeDialog"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullscreenDialog from '@/components/common/FullscreenDialog.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import CompetencyForm from './CompetencyForm.vue'
import type { ResultTypeConfig } from '@/types/competency'

interface CompetencyData {
  id?: string
  name: string
  description: string
  resultTypeConfigId?: string
}

interface ContextItem {
  id: string
  name: string
  description?: string
}

interface Context {
  domain?: ContextItem
  field?: ContextItem
  competency?: ContextItem
}

interface Props {
  resultTypes?: ResultTypeConfig[]
}

interface Emits {
  (e: 'save', data: { type: string; data: CompetencyData; context?: Context }): void
  (e: 'delete', data: { type: string; item: any; context?: Context }): void
}

withDefaults(defineProps<Props>(), {
  resultTypes: () => []
})

const emit = defineEmits<Emits>()

// Dialog states
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const currentType = ref<'domain' | 'field' | 'competency' | 'specificCompetency'>('domain')
const currentContext = ref<Context>()
const currentItem = ref<any>()

// Form data
const formData = ref<CompetencyData>({
  name: '',
  description: '',
  resultTypeConfigId: ''
})

// Computed properties
const modalTitle = computed(() => {
  const action = isEditing.value ? 'Modifier' : 'Ajouter'
  const typeNames = {
    domain: 'domaine',
    field: 'champ',
    competency: 'compétence',
    specificCompetency: 'sous-compétence'
  }
  return `${action} ${typeNames[currentType.value]}`
})

const saveButtonText = computed(() => {
  return isEditing.value ? 'Modifier' : 'Ajouter'
})

const isFormValid = computed(() => {
  return formData.value.name.trim() && formData.value.description.trim()
})

const deleteTitle = computed(() => {
  const typeNames = {
    domain: 'domaine',
    field: 'champ',
    competency: 'compétence',
    specificCompetency: 'sous-compétence'
  }
  return `Supprimer le ${typeNames[currentType.value]}`
})

const deleteMessage = computed(() => {
  if (!currentItem.value) return ''
  const name = currentItem.value.name
  const typeNames = {
    domain: 'domaine',
    field: 'champ',
    competency: 'compétence',
    specificCompetency: 'sous-compétence'
  }
  return `Êtes-vous sûr de vouloir supprimer le ${typeNames[currentType.value]} "${name}" ?`
})

const deleteWarning = computed(() => {
  const warnings = {
    domain: 'Cette action supprimera définitivement ce domaine et tous ses champs, compétences et évaluations associées.',
    field: 'Cette action supprimera définitivement ce champ et toutes ses compétences et évaluations associées.',
    competency: 'Cette action supprimera définitivement cette compétence et toutes ses sous-compétences et évaluations associées.',
    specificCompetency: 'Cette action supprimera définitivement cette sous-compétence et toutes les évaluations associées.'
  }
  return warnings[currentType.value]
})

// Public methods for opening dialogs
const openAddDialog = (type: string, context?: Context) => {
  currentType.value = type as any
  currentContext.value = context
  isEditing.value = false
  formData.value = {
    name: '',
    description: '',
    resultTypeConfigId: ''
  }
  showEditDialog.value = true
}

const openEditDialog = (type: string, item: any, context?: Context) => {
  currentType.value = type as any
  currentContext.value = context
  currentItem.value = item
  isEditing.value = true
  formData.value = {
    id: item.id,
    name: item.name || '',
    description: item.description || '',
    resultTypeConfigId: item.resultTypeConfigId || ''
  }
  showEditDialog.value = true
}

const openDeleteDialog = (type: string, item: any, context?: Context) => {
  currentType.value = type as any
  currentContext.value = context
  currentItem.value = item
  showDeleteDialog.value = true
}

const closeDialog = () => {
  showEditDialog.value = false
  showDeleteDialog.value = false
  currentItem.value = null
  currentContext.value = undefined
}

const handleSave = () => {
  if (isFormValid.value) {
    emit('save', {
      type: currentType.value,
      data: { ...formData.value },
      context: currentContext.value
    })
    closeDialog()
  }
}

const handleDelete = () => {
  emit('delete', {
    type: currentType.value,
    item: currentItem.value,
    context: currentContext.value
  })
  closeDialog()
}

// Expose methods for parent component
defineExpose({
  openAddDialog,
  openEditDialog,
  openDeleteDialog
})
</script>