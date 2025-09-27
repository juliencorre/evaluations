<template>
  <FullscreenDialog
    :visible="visible"
    title="Partager les résultats"
    subtitle="Envoyer le PDF des résultats par email"
    save-button-text="Envoyer"
    :save-disabled="!isFormValid || isSending"
    :is-saving="isSending"
    saving-text="Envoi en cours..."
    @close="$emit('close')"
    @save="handleSendEmail"
  >
    <div class="share-form">
      <!-- Email Recipients Section -->
      <div class="form-section">
        <h3 class="section-title">Destinataires</h3>
        <p class="section-description">
          Saisissez une ou plusieurs adresses email séparées par des virgules ou des espaces
        </p>
        
        <div class="email-input-container">
          <textarea
            v-model="emailAddresses"
            class="email-textarea"
            placeholder="exemple@ecole.fr, autre@education.gouv.fr"
            rows="3"
            :disabled="isSending"
            @input="validateEmails"
          />
          <div v-if="emailValidationErrors.length > 0" class="validation-errors">
            <div v-for="error in emailValidationErrors" :key="error" class="error-message">
              {{ error }}
            </div>
          </div>
          <div v-if="validEmails.length > 0" class="valid-emails">
            <div class="email-tags">
              <span
                v-for="email in validEmails"
                :key="email"
                class="email-tag"
              >
                {{ email }}
                <button
                  class="remove-email"
                  :disabled="isSending"
                  @click="removeEmail(email)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Section -->
      <div class="form-section">
        <h3 class="section-title">Message (optionnel)</h3>
        <p class="section-description">
          Ajoutez un message personnel qui sera inclus dans l'email
        </p>
        
        <textarea
          v-model="message"
          class="message-textarea"
          placeholder="Bonjour,&#10;&#10;Vous trouverez ci-joint les résultats de l'évaluation.&#10;&#10;Cordialement"
          rows="6"
          :disabled="isSending"
          maxlength="1000"
        />
        <div class="character-count">
          {{ message.length }}/1000 caractères
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="evaluationInfo" class="form-section">
        <h3 class="section-title">Aperçu du document</h3>
        <div class="document-preview">
          <div class="preview-item">
            <strong>Évaluation:</strong> {{ evaluationInfo.name }}
          </div>
          <div v-if="evaluationInfo.description" class="preview-item">
            <strong>Description:</strong> {{ evaluationInfo.description }}
          </div>
          <div class="preview-item">
            <strong>Nombre d'élèves:</strong> {{ evaluationInfo.studentsCount }}
          </div>
          <div class="preview-item">
            <strong>Nombre de compétences:</strong> {{ evaluationInfo.competenciesCount }}
          </div>
          <div class="preview-item">
            <strong>Date de génération:</strong> {{ new Date().toLocaleDateString('fr-FR') }}
          </div>
        </div>
      </div>
    </div>
  </FullscreenDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FullscreenDialog from './FullscreenDialog.vue'
import { emailValidationService } from '@/services/emailValidationService'

interface Props {
  visible: boolean
  evaluationInfo?: {
    name: string
    description?: string
    studentsCount: number
    competenciesCount: number
  }
}

interface Emits {
  (e: 'close'): void
  (e: 'send-email', data: {
    emails: string[]
    message: string
  }): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<Emits>()

// Form state
const emailAddresses = ref('')
const message = ref(`Bonjour,

Vous trouverez ci-joint les résultats de l'évaluation.

Cordialement`)
const isSending = ref(false)

// Email validation
const validEmails = ref<string[]>([])
const emailValidationErrors = ref<string[]>([])

// Computed properties
const isFormValid = computed(() => {
  return validEmails.value.length > 0 && emailValidationErrors.value.length === 0
})

// Methods
const validateEmails = () => {
  const inputText = emailAddresses.value.trim()
  if (!inputText) {
    validEmails.value = []
    emailValidationErrors.value = []
    return
  }

  // Parse emails from text (split by comma, semicolon, or spaces)
  const emailList = inputText
    .split(/[,;\s]+/)
    .map(email => email.trim())
    .filter(email => email.length > 0)

  const valid: string[] = []
  const errors: string[] = []

  emailList.forEach(email => {
    const validation = emailValidationService.validateEmailFormat(email)
    if (validation.valid) {
      if (!valid.includes(email)) {
        valid.push(email)
      }
    } else {
      if (validation.message) {
        errors.push(`${email}: ${validation.message}`)
      }
    }
  })

  validEmails.value = valid
  emailValidationErrors.value = errors
}

const removeEmail = (emailToRemove: string) => {
  validEmails.value = validEmails.value.filter(email => email !== emailToRemove)
  
  // Update the text area to reflect the change
  const remainingEmails = validEmails.value.join(', ')
  emailAddresses.value = remainingEmails
}

const handleSendEmail = async () => {
  if (!isFormValid.value) return

  isSending.value = true
  
  try {
    emit('send-email', {
      emails: validEmails.value,
      message: message.value.trim()
    })
  } finally {
    isSending.value = false
  }
}

// Watch for dialog close to reset form
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    // Reset form when dialog closes
    emailAddresses.value = ''
    message.value = `Bonjour,

Vous trouverez ci-joint les résultats de l'évaluation.

Cordialement`
    validEmails.value = []
    emailValidationErrors.value = []
    isSending.value = false
  }
})

// Initial validation on mount
validateEmails()
</script>

<style scoped>
.share-form {
  padding: 0 8px;
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
}

.section-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 16px 0;
}

.email-input-container {
  margin-bottom: 16px;
}

.email-textarea,
.message-textarea {
  width: 100%;
  min-height: 88px;
  padding: 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 4px;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  resize: vertical;
  transition: border-color 0.2s ease;
}

.email-textarea:focus,
.message-textarea:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
}

.email-textarea:disabled,
.message-textarea:disabled {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  cursor: not-allowed;
}

.validation-errors {
  margin-top: 8px;
}

.error-message {
  color: var(--md-sys-color-error);
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  margin-bottom: 4px;
}

.valid-emails {
  margin-top: 16px;
}

.email-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.email-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
}

.remove-email {
  background: none;
  border: none;
  color: var(--md-sys-color-on-secondary-container);
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.remove-email:hover {
  background-color: var(--md-sys-color-on-secondary-container);
  color: var(--md-sys-color-secondary-container);
}

.remove-email:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.character-count {
  text-align: right;
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  color: var(--md-sys-color-on-surface-variant);
  margin-top: 4px;
}

.document-preview {
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 8px;
  padding: 16px;
}

.preview-item {
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 8px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-item strong {
  color: var(--md-sys-color-on-surface);
}

@media (max-width: 768px) {
  .share-form {
    padding: 0 4px;
  }
  
  .form-section {
    margin-bottom: 24px;
  }
}
</style>