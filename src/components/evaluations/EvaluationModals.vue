<template>
  <!-- Fullscreen Dialog pour les évaluations -->
  <FullscreenDialog
    :model-value="visible"
    :title="dialogTitle"
    :save-button-text="saveButtonText"
    :saving-text="savingText"
    :save-disabled="isSaving || !isFormValid"
    :is-saving="isSaving"
    @close="$emit('close')"
    @save="handleSave"
  >
    <EvaluationForm
      v-model="formData"
      :is-editing="isEditing"
      @validity-change="isFormValid = $event"
    />
  </FullscreenDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FullscreenDialog from '@/components/FullscreenDialog.vue'
import EvaluationForm from './EvaluationForm.vue'

interface EvaluationFormData {
  name: string
  description: string
  frameworkId: string
  classIds: string[]
}

interface Props {
  visible: boolean
  isEditing?: boolean
  initialData?: EvaluationFormData
  isSaving?: boolean
  frameworkId: string
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: EvaluationFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  isSaving: false
})

const emit = defineEmits<Emits>()

// Form state
const formData = ref<EvaluationFormData>({
  name: '',
  description: '',
  frameworkId: props.frameworkId
})

const isFormValid = ref(false)

// Computed properties
const dialogTitle = computed(() => {
  return props.isEditing ? 'Modifier l\'évaluation' : 'Nouvelle évaluation'
})

const saveButtonText = computed(() => {
  return props.isEditing ? 'Modifier' : 'Créer'
})

const savingText = computed(() => {
  return props.isEditing ? 'Modification...' : 'Création...'
})

// Handle save
const handleSave = () => {
  if (isFormValid.value) {
    emit('save', { ...formData.value })
  }
}

// Watch for prop changes
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    if (props.initialData) {
      formData.value = { ...props.initialData }
    } else {
      formData.value = {
        name: '',
        description: '',
        frameworkId: props.frameworkId
      }
    }
  }
})

watch(() => props.frameworkId, (newFrameworkId) => {
  formData.value.frameworkId = newFrameworkId
})
</script>