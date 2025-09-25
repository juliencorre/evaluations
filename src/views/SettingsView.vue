<template>
  <div class="settings-dialog">
    <!-- Dialog Header -->
    <header class="dialog-header">
      <button
        class="dialog-close-button"
        aria-label="Fermer les paramètres"
        @click="handleClose"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <h1 class="dialog-title">Paramètres</h1>

      <div class="dialog-spacer"></div>
    </header>

    <!-- Dialog Content -->
    <main class="dialog-content" role="main">
      <SettingsSection
        id="appearance-settings"
        title="Apparence"
      >
        <ul class="md3-list" role="list">
          <li class="md3-list-item" role="listitem">
            <div class="md3-list-item__content">
              <div class="md3-list-item__headline">Mode sombre</div>
            </div>
            <div class="md3-list-item__trailing">
              <SettingsSwitch
                id="dark-mode-switch"
                v-model="darkModeModel"
                aria-describedby="appearance-settings-title"
              />
            </div>
          </li>
        </ul>
      </SettingsSection>

      <SettingsSection
        id="console-settings"
        title="Console"
      >
        <ul class="md3-list" role="list">
          <li class="md3-list-item" role="listitem">
            <div class="md3-list-item__content">
              <div class="md3-list-item__headline">Afficher les logos</div>
            </div>
            <div class="md3-list-item__trailing">
              <SettingsSwitch
                id="console-logos-switch"
                v-model="consoleLogoModel"
                aria-describedby="console-settings-title"
              />
            </div>
          </li>
        </ul>
      </SettingsSection>

      <SettingsSection
        id="account-settings"
        title="Compte"
        description="Actualisez vos informations personnelles et renforcez la sécurité de votre accès."
      >
        <section class="account-section" aria-live="polite">
          <div v-if="accountMessage" class="account-feedback account-feedback--success">
            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            <span>{{ accountMessage }}</span>
          </div>
          <div v-if="accountError" class="account-feedback account-feedback--error" role="alert">
            <span class="material-symbols-outlined" aria-hidden="true">error</span>
            <span>{{ accountError }}</span>
          </div>

          <div class="account-grid">
            <form class="settings-form" @submit.prevent="handleProfileSubmit">
              <h3 class="settings-form__title">Identité</h3>
              <p class="settings-form__description">
                Ce nom sera utilisé dans les exports et communications.
              </p>
              <label class="settings-field">
                <span class="settings-label">Nom complet</span>
                <input
                  v-model="profileForm.fullName"
                  type="text"
                  name="full-name"
                  autocomplete="name"
                  required
                />
              </label>
              <button
                type="submit"
                class="settings-button"
                :disabled="!canUpdateProfile || isUpdatingProfile"
              >
                {{ isUpdatingProfile ? 'Enregistrement...' : 'Mettre à jour le profil' }}
              </button>
            </form>

            <form class="settings-form" @submit.prevent="handlePasswordSubmit">
              <h3 class="settings-form__title">Mot de passe</h3>
              <p class="settings-form__description">
                Utilisez un mot de passe unique de 12 caractères minimum avec lettres et chiffres.
              </p>
              <label class="settings-field">
                <span class="settings-label">Nouveau mot de passe</span>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  name="new-password"
                  autocomplete="new-password"
                  minlength="12"
                  required
                />
              </label>
              <label class="settings-field">
                <span class="settings-label">Confirmation</span>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  name="confirm-password"
                  autocomplete="new-password"
                  minlength="12"
                  required
                />
              </label>
              <button
                type="submit"
                class="settings-button"
                :disabled="!canUpdatePassword || isUpdatingPassword"
              >
                {{ isUpdatingPassword ? 'Mise à jour...' : 'Modifier le mot de passe' }}
              </button>
            </form>
          </div>

          <div class="verification-panel">
            <h3 class="settings-form__title">Sécurité de l'adresse e-mail</h3>
            <p class="verification-email">Adresse de connexion : <strong>{{ userEmail }}</strong></p>
            <p v-if="isEmailVerified" class="verification-status verification-status--success">
              Votre adresse e-mail est vérifiée.
            </p>
            <div v-else class="verification-status verification-status--warning">
              <p>Votre adresse e-mail n'est pas encore vérifiée.</p>
              <button
                type="button"
                class="text-button"
                :disabled="isResendingVerification"
                @click="handleResendVerification"
              >
                {{ isResendingVerification ? 'Envoi en cours...' : "Renvoyer l'e-mail de confirmation" }}
              </button>
            </div>
          </div>
        </section>
      </SettingsSection>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settingsStore'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import SettingsSwitch from '@/components/settings/SettingsSwitch.vue'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const { showConsoleLogos, setShowConsoleLogos, isDarkThemeEnabled, setThemePreference } = useSettingsStore()
const authStore = useAuthStore()

const isConsoleLogoEnabled = computed(() => showConsoleLogos.value)
const isDarkModeEnabled = computed(() => isDarkThemeEnabled.value)

const darkModeModel = computed({
  get: () => isDarkModeEnabled.value,
  set: (value: boolean) => setThemePreference(value ? 'dark' : 'light')
})

const consoleLogoModel = computed({
  get: () => isConsoleLogoEnabled.value,
  set: (value: boolean) => setShowConsoleLogos(value)
})

const profileForm = reactive({
  fullName: ''
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const accountMessage = ref<string | null>(null)
const accountError = ref<string | null>(null)
const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)
const isResendingVerification = ref(false)

const displayName = computed(() => authStore.displayName.value)
const userEmail = computed(() => authStore.userEmail.value)
const isEmailVerified = computed(() => authStore.isEmailVerified.value)

watch(displayName, (value) => {
  profileForm.fullName = value
}, { immediate: true })

const trimmedFullName = computed(() => profileForm.fullName.trim())

const passwordHasLetters = computed(() => /[A-Za-zÀ-ÿ]/.test(passwordForm.newPassword))
const passwordHasNumbers = computed(() => /\d/.test(passwordForm.newPassword))

const canUpdateProfile = computed(() => {
  return trimmedFullName.value.length >= 2 && trimmedFullName.value !== displayName.value.trim()
})

const canUpdatePassword = computed(() => {
  return (
    passwordForm.newPassword.length >= 12 &&
    passwordHasLetters.value &&
    passwordHasNumbers.value &&
    passwordForm.newPassword === passwordForm.confirmPassword
  )
})

const resetAccountFeedback = () => {
  accountMessage.value = null
  accountError.value = null
  authStore.resetError()
}

// Type guard for error objects with a string message
function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

const translateAccountError = (error: unknown) => {
  if (hasErrorMessage(error)) {
    const message = error.message.toLowerCase()
    if (message.includes('password')) {
      return 'Le mot de passe doit comporter au moins 12 caractères, avec lettres et chiffres.'
    }
    if (message.includes('rate limit')) {
      return 'Vous avez récemment effectué cette action. Merci de patienter avant de réessayer.'
    }
    if (message.includes('email')) {
      return 'Nous n\'avons pas pu mettre à jour l\'adresse e-mail pour le moment.'
    }
  }
  return 'Une erreur est survenue. Merci de réessayer.'
}

const handleProfileSubmit = async () => {
  resetAccountFeedback()
  if (!canUpdateProfile.value) {
    accountError.value = 'Aucun changement à enregistrer.'
    return
  }

  isUpdatingProfile.value = true
  const { error } = await authStore.updateProfile({ fullName: trimmedFullName.value })
  isUpdatingProfile.value = false

  if (error) {
    accountError.value = translateAccountError(error)
    return
  }

  accountMessage.value = 'Votre profil a été mis à jour avec succès.'
}

const handlePasswordSubmit = async () => {
  resetAccountFeedback()
  if (!canUpdatePassword.value) {
    accountError.value = 'Le mot de passe doit comporter 12 caractères minimum, avec lettres et chiffres, et correspondre à la confirmation.'
    return
  }

  isUpdatingPassword.value = true
  const { error } = await authStore.updateProfile({ password: passwordForm.newPassword })
  isUpdatingPassword.value = false

  if (error) {
    accountError.value = translateAccountError(error)
    return
  }

  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  accountMessage.value = 'Votre mot de passe a été mis à jour.'
}

const handleResendVerification = async () => {
  resetAccountFeedback()
  isResendingVerification.value = true
  const { error } = await authStore.resendEmailVerification()
  isResendingVerification.value = false

  if (error) {
    accountError.value = translateAccountError(error)
    return
  }

  accountMessage.value = 'Un nouvel e-mail de confirmation vient de vous être envoyé.'
}

// Event handlers
const handleClose = () => {
  router.back()
}
</script>

<style scoped>
/* Full Dialog Container */
.settings-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  background: var(--md-sys-color-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Dialog Header */
.dialog-header {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 4px;
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  flex-shrink: 0;
}

.dialog-close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  margin: 8px;
}

.dialog-close-button:hover {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  color: var(--md-sys-color-on-surface);
}

.dialog-close-button:focus {
  outline: none;
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}

.dialog-close-button .material-symbols-outlined {
  font-size: 24px;
}

.dialog-title {
  flex: 1;
  text-align: center;
  font-family: var(--md-sys-typescale-title-large-font);
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  line-height: var(--md-sys-typescale-title-large-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.dialog-spacer {
  width: 48px;
  height: 48px;
  margin: 8px;
}

/* Dialog Content */
.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 24px 80px;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

@media (max-width: 768px) {
  .dialog-content {
    padding: 24px 16px 80px;
  }
}

@media (max-width: 480px) {
  .dialog-content {
    padding: 24px 12px 80px;
  }

  .dialog-title {
    font-size: var(--md-sys-typescale-title-medium-size);
    line-height: var(--md-sys-typescale-title-medium-line-height);
  }
}

/* Material Design 3 Lists */
.md3-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--md-sys-color-surface);
}

.md3-list-item {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 8px 16px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.md3-list-item:hover {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.md3-list-item:focus {
  outline: none;
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}

.md3-list-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding-right: 16px;
}

.md3-list-item__headline {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
}

.md3-list-item__trailing {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.account-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.account-feedback {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
}

.account-feedback--success {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  color: var(--md-sys-color-primary);
}

.account-feedback--error {
  background: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
  color: var(--md-sys-color-error);
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level1);
}

.settings-form__title {
  margin: 0;
  font-size: 1.125rem;
  color: var(--md-sys-color-on-surface);
}

.settings-form__description {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.95rem;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-field input {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 1rem;
}

.settings-field input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent);
}

.settings-label {
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.settings-button {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 999px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.settings-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.settings-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: var(--md-sys-elevation-level2);
}

.verification-panel {
  padding: 20px;
  border-radius: 16px;
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level1);
}

.verification-email {
  margin: 0 0 8px;
  color: var(--md-sys-color-on-surface);
}

.verification-status {
  margin: 0;
  font-weight: 600;
}

.verification-status--success {
  color: var(--md-sys-color-secondary);
}

.verification-status--warning {
  color: var(--md-sys-color-error);
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-button {
  border: none;
  background: none;
  color: var(--md-sys-color-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.text-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .account-grid {
    grid-template-columns: 1fr;
  }

  .settings-form,
  .verification-panel {
    padding: 16px;
  }
}
</style>