<template>
  <div class="auth-layout">
    <section class="auth-panel" role="main">
      <header class="auth-header">
        <div class="auth-brand">
          <span class="material-symbols-outlined" aria-hidden="true">verified_user</span>
          <div class="auth-brand-text">
            <h1 class="auth-title">Connexion sécurisée</h1>
            <p class="auth-subtitle">Gérez vos évaluations en toute confiance</p>
          </div>
        </div>
      </header>

      <div class="auth-card" :aria-busy="isSubmitting || isInitializing">
        <div class="auth-tabs" role="tablist" aria-label="Choix du formulaire d'authentification">
          <button
            id="signin-tab"
            class="auth-tab"
            role="tab"
            :tabindex="activeTab === 'signin' ? 0 : -1"
            :aria-selected="activeTab === 'signin'"
            @click="switchTab('signin')"
          >
            Connexion
          </button>
          <button
            id="signup-tab"
            class="auth-tab"
            role="tab"
            :tabindex="activeTab === 'signup' ? 0 : -1"
            :aria-selected="activeTab === 'signup'"
            @click="switchTab('signup')"
          >
            Inscription
          </button>
        </div>

        <div
          v-if="initializationFailed"
          class="auth-initialization-error"
          role="alert"
        >
          <p>
            {{
              initializationError ||
                "Impossible de vérifier le service d'authentification. Vérifiez votre connexion et réessayez."
            }}
          </p>
          <button
            type="button"
            class="auth-secondary-action"
            :disabled="isInitializing"
            @click="handleRetryInitialization"
          >
            <span class="material-symbols-outlined" aria-hidden="true">refresh</span>
            <span>{{ isInitializing ? 'Nouvelle tentative...' : 'Réessayer la connexion sécurisée' }}</span>
          </button>
        </div>

        <p v-else-if="initializationMessage" class="auth-initialization-info" role="status">
          {{ initializationMessage }}
        </p>

        <Transition name="fade" mode="out-in">
          <form
            v-if="activeTab === 'signin'"
            key="signin"
            class="auth-form"
            autocomplete="on"
            aria-labelledby="signin-tab"
          @submit.prevent="handleSignIn"
        >
            <p
              v-if="feedback.signin.message && !isSubmitting"
              class="auth-message"
              role="status"
            >
              {{ feedback.signin.message }}
            </p>
            <p
              v-if="feedback.signin.error && !isSubmitting"
              class="auth-error"
              role="alert"
            >
              {{ feedback.signin.error }}
            </p>
            <section
              v-if="needsEmailVerification && !isSubmitting"
              class="auth-verification-card"
              aria-live="polite"
            >
              <h2 class="auth-verification-title">
                <span class="material-symbols-outlined" aria-hidden="true">mark_email_unread</span>
                Vérification requise
              </h2>
              <p class="auth-verification-text">
                Votre adresse e-mail
                <strong>{{ verificationEmail || signInForm.email }}</strong>
                doit être vérifiée avant de pouvoir vous connecter. Consultez votre boîte de réception et cliquez sur le
                lien de confirmation.
              </p>
              <button
                type="button"
                class="auth-secondary-action tonal"
                :disabled="isResendingVerification"
                @click="handleResendVerification"
              >
                <span class="material-symbols-outlined" aria-hidden="true">forward_to_inbox</span>
                <span>{{ isResendingVerification ? 'Nouvel envoi en cours...' : 'Renvoyer l\'e-mail de confirmation' }}</span>
              </button>
              <p v-if="verificationFeedback" class="auth-message" role="status">{{ verificationFeedback }}</p>
              <p v-if="verificationError" class="auth-error" role="alert">{{ verificationError }}</p>
            </section>

            <label
              class="md-text-field"
              :class="{ 'has-error': !!feedback.signin.fieldErrors.email, 'has-value': Boolean(signInForm.email) }"
            >
              <span class="md-text-field__label">Adresse e-mail</span>
              <input
                v-model.trim="signInForm.email"
                type="email"
                name="email"
                inputmode="email"
                autocomplete="email"
                placeholder=" "
                required
                :disabled="isFormDisabled"
                :aria-invalid="!!feedback.signin.fieldErrors.email"
                :aria-describedby="feedback.signin.fieldErrors.email ? signInEmailSupportId : undefined"
              />
              <span
                v-if="feedback.signin.fieldErrors.email"
                :id="signInEmailSupportId"
                class="md-text-field__supporting"
              >
                {{ feedback.signin.fieldErrors.email }}
              </span>
            </label>

            <label
              class="md-text-field password-field"
              :class="{ 'has-error': !!feedback.signin.fieldErrors.password, 'has-value': Boolean(signInForm.password) }"
            >
              <span class="md-text-field__label">Mot de passe</span>
              <input
                v-model="signInForm.password"
                :type="showSignInPassword ? 'text' : 'password'"
                name="current-password"
                autocomplete="current-password"
                minlength="8"
                placeholder=" "
                required
                :disabled="isFormDisabled"
                :aria-invalid="!!feedback.signin.fieldErrors.password"
                :aria-describedby="feedback.signin.fieldErrors.password ? signInPasswordSupportId : undefined"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="showSignInPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                @click="showSignInPassword = !showSignInPassword"
              >
                <span class="material-symbols-outlined" aria-hidden="true">
                  {{ showSignInPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              <span
                v-if="feedback.signin.fieldErrors.password"
                :id="signInPasswordSupportId"
                class="md-text-field__supporting"
              >
                {{ feedback.signin.fieldErrors.password }}
              </span>
            </label>

            <div class="auth-links">
              <button type="button" class="link-button" @click="switchTab('forgot')">
                Mot de passe oublié ?
              </button>
            </div>

            <button
              class="auth-submit"
              type="submit"
              :disabled="!canSubmitSignIn || isFormDisabled"
            >
              <span class="material-symbols-outlined" aria-hidden="true">login</span>
              <span>{{ isSubmitting ? 'Connexion en cours...' : 'Se connecter' }}</span>
            </button>
          </form>

          <section
            v-else-if="activeTab === 'signup' && signUpSuccess"
            key="signup-success"
            class="auth-success-card"
            role="status"
            aria-live="polite"
          >
            <span class="material-symbols-outlined auth-success-icon" aria-hidden="true">mark_email_read</span>
            <h2>Confirmez votre adresse e-mail</h2>
            <p>
              Un lien sécurisé vient d'être envoyé à
              <strong>{{ lastRegisteredEmail || signUpForm.email }}</strong>.
              Cliquez dessus pour activer votre compte, puis revenez vous connecter.
            </p>
            <button type="button" class="auth-secondary-action tonal" @click="restartSignUpFlow">
              <span class="material-symbols-outlined" aria-hidden="true">person_add</span>
              <span>Créer un autre compte</span>
            </button>
            <button type="button" class="auth-submit" @click="switchTab('signin')">
              <span class="material-symbols-outlined" aria-hidden="true">login</span>
              <span>Aller à la connexion</span>
            </button>
          </section>
          <form
            v-else-if="activeTab === 'signup'"
            key="signup-form"
            class="auth-form"
            autocomplete="on"
            aria-labelledby="signup-tab"
            @submit.prevent="handleSignUp"
          >
            <p
              v-if="feedback.signup.message && !isSubmitting"
              class="auth-message"
              role="status"
            >
              {{ feedback.signup.message }}
            </p>
            <p
              v-if="feedback.signup.error && !isSubmitting"
              class="auth-error"
              role="alert"
            >
              {{ feedback.signup.error }}
            </p>

            <label class="md-text-field" :class="{ 'has-value': Boolean(signUpForm.fullName) }">
              <span class="md-text-field__label">Nom complet</span>
              <input
                v-model.trim="signUpForm.fullName"
                type="text"
                name="name"
                autocomplete="name"
                placeholder=" "
                :disabled="isFormDisabled"
              />
              <span class="md-text-field__supporting">Optionnel — affiché dans vos notifications.</span>
            </label>

            <label
              class="md-text-field"
              :class="{
                'has-error': !!feedback.signup.fieldErrors.email,
                'has-value': Boolean(signUpForm.email)
              }"
            >
              <span class="md-text-field__label">Adresse e-mail</span>
              <input
                v-model.trim="signUpForm.email"
                type="email"
                name="new-email"
                inputmode="email"
                autocomplete="email"
                placeholder=" "
                required
                :disabled="isFormDisabled"
                :aria-invalid="!!feedback.signup.fieldErrors.email"
                :aria-describedby="feedback.signup.fieldErrors.email ? signUpEmailSupportId : undefined"
              />
              <span
                v-if="feedback.signup.fieldErrors.email"
                :id="signUpEmailSupportId"
                class="md-text-field__supporting"
              >
                {{ feedback.signup.fieldErrors.email }}
              </span>
            </label>

            <label
              class="md-text-field password-field"
              :class="{
                'has-error': !!feedback.signup.fieldErrors.password,
                'has-value': Boolean(signUpForm.password)
              }"
            >
              <span class="md-text-field__label">Mot de passe</span>
              <input
                v-model="signUpForm.password"
                :type="showSignUpPassword ? 'text' : 'password'"
                name="new-password"
                autocomplete="new-password"
                minlength="12"
                placeholder=" "
                required
                :disabled="isFormDisabled"
                :aria-invalid="!!feedback.signup.fieldErrors.password"
                :aria-describedby="joinIds(
                  feedback.signup.fieldErrors.password ? signUpPasswordSupportId : null,
                  passwordRequirementsId
                )"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="showSignUpPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                @click="showSignUpPassword = !showSignUpPassword"
              >
                <span class="material-symbols-outlined" aria-hidden="true">
                  {{ showSignUpPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              <span
                v-if="feedback.signup.fieldErrors.password"
                :id="signUpPasswordSupportId"
                class="md-text-field__supporting"
              >
                {{ feedback.signup.fieldErrors.password }}
              </span>
              <ul :id="passwordRequirementsId" class="password-guidelines" aria-live="polite">
                <li :class="{ fulfilled: passwordValidation.length }">
                  <span class="material-symbols-outlined" aria-hidden="true">
                    {{ passwordValidation.length ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  Au moins 12 caractères.
                </li>
                <li :class="{ fulfilled: passwordValidation.letters }">
                  <span class="material-symbols-outlined" aria-hidden="true">
                    {{ passwordValidation.letters ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  Inclure des lettres.
                </li>
                <li :class="{ fulfilled: passwordValidation.numbers }">
                  <span class="material-symbols-outlined" aria-hidden="true">
                    {{ passwordValidation.numbers ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  Inclure des chiffres.
                </li>
                <li :class="{ fulfilled: passwordValidation.matches }">
                  <span class="material-symbols-outlined" aria-hidden="true">
                    {{ passwordValidation.matches ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  Confirmation identique.
                </li>
              </ul>
            </label>

            <label
              class="md-text-field"
              :class="{
                'has-error': !!feedback.signup.fieldErrors.confirmPassword,
                'has-value': Boolean(signUpForm.confirmPassword)
              }"
            >
              <span class="md-text-field__label">Confirmation du mot de passe</span>
              <input
                v-model="signUpForm.confirmPassword"
                :type="showSignUpPassword ? 'text' : 'password'"
                name="confirm-password"
                autocomplete="new-password"
                placeholder=" "
                required
                :disabled="isFormDisabled"
                :aria-invalid="!!feedback.signup.fieldErrors.confirmPassword"
                :aria-describedby="feedback.signup.fieldErrors.confirmPassword ? signUpConfirmSupportId : undefined"
              />
              <span
                v-if="feedback.signup.fieldErrors.confirmPassword"
                :id="signUpConfirmSupportId"
                class="md-text-field__supporting"
              >
                {{ feedback.signup.fieldErrors.confirmPassword }}
              </span>
            </label>

            <button
              class="auth-submit"
              type="submit"
              :disabled="isFormDisabled"
            >
              <span class="material-symbols-outlined" aria-hidden="true">person_add</span>
              <span>{{ isSubmitting ? 'Création du compte...' : 'Créer mon compte' }}</span>
            </button>
          </form>

          <section
            v-else-if="activeTab === 'forgot' && forgotSuccess"
            key="forgot-success"
            class="auth-success-card"
            role="status"
            aria-live="polite"
          >
            <span class="material-symbols-outlined auth-success-icon" aria-hidden="true">mark_email_read</span>
            <h2>Vérifiez votre boîte de réception</h2>
            <p>
              Si un compte est associé à
              <strong>{{ resetEmail }}</strong>, un e-mail de réinitialisation vient de vous être envoyé. Suivez le lien pour
              définir un nouveau mot de passe.
            </p>
            <button type="button" class="auth-secondary-action tonal" @click="restartForgotFlow">
              <span class="material-symbols-outlined" aria-hidden="true">refresh</span>
              <span>Envoyer un autre e-mail</span>
            </button>
            <button type="button" class="auth-submit" @click="switchTab('signin')">
              <span class="material-symbols-outlined" aria-hidden="true">login</span>
              <span>Retour à la connexion</span>
            </button>
          </section>
          <form
            v-else
            key="forgot"
            class="auth-form"
            autocomplete="on"
            aria-labelledby="forgot-password-title"
            @submit.prevent="handlePasswordReset"
          >
            <h2 id="forgot-password-title" class="auth-secondary-title">Réinitialiser le mot de passe</h2>
            <p class="auth-description">
              Indiquez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé.
            </p>

            <p
              v-if="feedback.forgot.message && !isSubmitting"
              class="auth-message"
              role="status"
            >
              {{ feedback.forgot.message }}
            </p>
            <p
              v-if="feedback.forgot.error && !isSubmitting"
              class="auth-error"
              role="alert"
            >
              {{ feedback.forgot.error }}
            </p>

            <label
              class="md-text-field"
              :class="{
                'has-error': !!feedback.forgot.fieldErrors.email,
                'has-value': Boolean(resetEmail)
              }"
            >
              <span class="md-text-field__label">Adresse e-mail</span>
              <input
                v-model.trim="resetEmail"
                type="email"
                name="recovery-email"
                autocomplete="email"
                placeholder=" "
                required
                :disabled="isFormDisabled"
                :aria-invalid="!!feedback.forgot.fieldErrors.email"
                :aria-describedby="feedback.forgot.fieldErrors.email ? forgotEmailSupportId : undefined"
              />
              <span
                v-if="feedback.forgot.fieldErrors.email"
                :id="forgotEmailSupportId"
                class="md-text-field__supporting"
              >
                {{ feedback.forgot.fieldErrors.email }}
              </span>
            </label>

            <div class="auth-links">
              <button type="button" class="link-button" @click="switchTab('signin')">
                Retour à la connexion
              </button>
            </div>

            <button
              class="auth-submit"
              type="submit"
              :disabled="!resetEmail || isFormDisabled"
            >
              <span class="material-symbols-outlined" aria-hidden="true">mail</span>
              <span>{{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien' }}</span>
            </button>
          </form>
        </Transition>
      </div>
    </section>

    <aside class="auth-aside" aria-hidden="true">
      <div class="auth-illustration">
        <h2>Une plateforme conçue pour les enseignants</h2>
        <ul>
          <li>Suivi précis des compétences et des progrès</li>
          <li>Partage sécurisé des évaluations</li>
          <li>Accès protégé et conforme RGPD</li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import type { AuthError } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

type AuthTab = 'signin' | 'signup' | 'forgot'

const activeTab = ref<AuthTab>(getInitialTab())
const isSubmitting = ref(false)
const initializationMessage = ref<string | null>(null)
const initializationError = ref<string | null>(null)
const needsEmailVerification = ref(false)
const verificationEmail = ref('')
const isResendingVerification = ref(false)
const verificationFeedback = ref<string | null>(null)
const verificationError = ref<string | null>(null)
const showSignInPassword = ref(false)
const showSignUpPassword = ref(false)
const initializationFailed = ref(false)
const signUpSuccess = ref(false)
const forgotSuccess = ref(false)
const lastRegisteredEmail = ref('')

interface FormFeedback {
  message: string | null
  error: string | null
  fieldErrors: Record<string, string | null>
}

const feedback = reactive<Record<AuthTab, FormFeedback>>({
  signin: {
    message: null,
    error: null,
    fieldErrors: {
      email: null,
      password: null
    }
  },
  signup: {
    message: null,
    error: null,
    fieldErrors: {
      fullName: null,
      email: null,
      password: null,
      confirmPassword: null
    }
  },
  forgot: {
    message: null,
    error: null,
    fieldErrors: {
      email: null
    }
  }
})

const signInEmailSupportId = 'signin-email-support'
const signInPasswordSupportId = 'signin-password-support'
const signUpEmailSupportId = 'signup-email-support'
const signUpPasswordSupportId = 'signup-password-support'
const signUpConfirmSupportId = 'signup-confirm-support'
const forgotEmailSupportId = 'forgot-email-support'

const signInForm = reactive({
  email: getInitialEmail(),
  password: ''
})

const signUpForm = reactive({
  fullName: '',
  email: getInitialEmail(),
  password: '',
  confirmPassword: ''
})

const passwordRequirementsId = 'signup-password-requirements'

const resetEmail = ref(getInitialEmail())

const isInitializing = computed(() => authStore.isInitializing.value)
const isFormDisabled = computed(() => isSubmitting.value || isInitializing.value)

onMounted(async () => {
  try {
    await authStore.ensureInitialized()
    initializationFailed.value = false
    initializationError.value = null
  } catch (error) {
    console.error('Failed to initialize authentication', error)
    const normalizedError = error instanceof Error ? error : new Error('Échec de l\'initialisation de la session')
    const details = getErrorDetails(normalizedError)
    initializationError.value = details.message
    initializationFailed.value = true
  }
})

watch(
  () => route.query.mode,
  (mode) => {
    const nextTab: AuthTab = mode === 'signup' ? 'signup' : mode === 'forgot' ? 'forgot' : 'signin'
    if (activeTab.value !== nextTab) {
      if (nextTab !== 'signup') {
        signUpSuccess.value = false
      }
      if (nextTab !== 'forgot') {
        forgotSuccess.value = false
      }
    }
    activeTab.value = nextTab
    resetFeedback(nextTab)
    if (nextTab !== 'signin') {
      resetVerificationState()
    }
  }
)

watch(
  () => route.query.email,
  (email) => {
    if (typeof email === 'string') {
      signInForm.email = email
      signUpForm.email = email
      resetEmail.value = email
    }
  }
)

watch(
  () => authStore.lastError.value,
  (error) => {
    if (error) {
      if (isEmailVerificationRequired(error)) {
        needsEmailVerification.value = true
        verificationEmail.value = verificationEmail.value || signInForm.email.trim()
        verificationFeedback.value = null
        verificationError.value = null
        feedback.signin.fieldErrors.password = null
        feedback.signin.error =
          "Votre adresse e-mail n'est pas encore vérifiée. Cliquez sur le lien de confirmation reçu pour activer votre compte."
        return
      }

      resetVerificationState()
      const details = getErrorDetails(error)
      if (details.category === 'invalidCredentials') {
        feedback.signin.fieldErrors.password = details.message
        feedback.signin.error = null
      } else {
        feedback.signin.error = details.message
      }
    }
  }
)

function getInitialTab() {
  const mode = route.query.mode
  if (mode === 'signup') {
    return 'signup' as const
  }
  if (mode === 'forgot') {
    return 'forgot' as const
  }
  return 'signin' as const
}

function getInitialEmail() {
  const email = route.query.email
  return typeof email === 'string' ? email : ''
}

const sanitizeRedirectPath = (value: unknown) => {
  const candidate = Array.isArray(value) ? value[0] : value
  if (typeof candidate === 'string' && candidate.startsWith('/')) {
    return candidate
  }
  return '/welcome'
}

const redirectPath = computed(() => sanitizeRedirectPath(route.query.redirect))

function joinIds(...ids: Array<string | null | undefined>) {
  const combined = ids.filter((value): value is string => Boolean(value)).join(' ')
  return combined || undefined
}

const canSubmitSignIn = computed(() => {
  return Boolean(signInForm.email && signInForm.password.length >= 8)
})

const passwordValidation = computed(() => ({
  length: signUpForm.password.length >= 12,
  letters: /[A-Za-zÀ-ÿ]/.test(signUpForm.password),
  numbers: /\d/.test(signUpForm.password),
  matches: signUpForm.password === signUpForm.confirmPassword && signUpForm.password.length > 0
}))

const canSubmitSignUp = computed(() => {
  return Boolean(signUpForm.email) && Object.values(passwordValidation.value).every(Boolean)
})

const missingSignUpRequirements = computed(() => {
  if (canSubmitSignUp.value) {
    return []
  }

  const messages: string[] = []
  if (!signUpForm.email) {
    messages.push('Indiquez une adresse e-mail valide.')
  }
  if (!passwordValidation.value.length) {
    messages.push('Le mot de passe doit contenir au moins 12 caractères.')
  }
  if (!passwordValidation.value.letters) {
    messages.push('Ajoutez au moins une lettre à votre mot de passe.')
  }
  if (!passwordValidation.value.numbers) {
    messages.push('Ajoutez au moins un chiffre à votre mot de passe.')
  }
  if (!passwordValidation.value.matches) {
    messages.push('La confirmation doit correspondre au mot de passe.')
  }

  return messages
})

function getErrorDetails(error: AuthError | Error) {
  const lowered = error.message?.toLowerCase?.() ?? ''
  if (
    lowered.includes('email not confirmed') ||
    lowered.includes('email_not_confirmed') ||
    lowered.includes('email confirmation required')
  ) {
    return {
      category: 'emailNotConfirmed' as const,
      message: 'Votre adresse e-mail n\'est pas encore vérifiée. Vérifiez votre boîte de réception.'
    }
  }
  if (lowered.includes('invalid login') || lowered.includes('invalid email or password')) {
    return {
      category: 'invalidCredentials' as const,
      message: 'Adresse e-mail ou mot de passe invalide.'
    }
  }
  if (lowered.includes('email rate limit')) {
    return {
      category: 'rateLimited' as const,
      message: 'Vous avez demandé trop d\'e-mails sur une courte période. Veuillez patienter quelques minutes.'
    }
  }
  if (lowered.includes('already registered')) {
    return {
      category: 'alreadyRegistered' as const,
      message: 'Un compte existe déjà avec cette adresse e-mail. Vous pouvez vous connecter directement.'
    }
  }
  if (lowered.includes('password')) {
    return {
      category: 'passwordPolicy' as const,
      message: 'Le mot de passe ne respecte pas les critères de sécurité requis.'
    }
  }
  return {
    category: 'generic' as const,
    message: "Une erreur est survenue. Merci de réessayer ou de contacter le support si le problème persiste."
  }
}

function resetFeedback(target?: AuthTab) {
  const tabs: AuthTab[] = target ? [target] : ['signin', 'signup', 'forgot']
  tabs.forEach((tab) => {
    feedback[tab].message = null
    feedback[tab].error = null
    Object.keys(feedback[tab].fieldErrors).forEach((field) => {
      feedback[tab].fieldErrors[field] = null
    })
  })

  if (!target || target === 'signin') {
    authStore.resetError()
    resetVerificationState()
  }
}

function resetVerificationState() {
  needsEmailVerification.value = false
  verificationEmail.value = ''
  verificationFeedback.value = null
  verificationError.value = null
}

function isEmailVerificationRequired(error: AuthError | Error) {
  const message = error.message?.toLowerCase?.() ?? ''
  return (
    message.includes('email not confirmed') ||
    message.includes('email_not_confirmed') ||
    message.includes('email confirmation required')
  )
}

async function handleSignIn() {
  resetFeedback('signin')
  if (!canSubmitSignIn.value) {
    return
  }

  isSubmitting.value = true
  const { error } = await authStore.signInWithPassword(signInForm.email, signInForm.password)
  isSubmitting.value = false

  if (error) {
    if (isEmailVerificationRequired(error)) {
      needsEmailVerification.value = true
      verificationEmail.value = signInForm.email.trim()
      verificationFeedback.value = null
      verificationError.value = null
      feedback.signin.error =
        "Votre adresse e-mail n'est pas encore vérifiée. Cliquez sur le lien de confirmation reçu pour activer votre compte."
      return
    }

    resetVerificationState()
    const details = getErrorDetails(error)
    if (details.category === 'invalidCredentials') {
      feedback.signin.fieldErrors.password = details.message
      feedback.signin.error = null
    } else {
      feedback.signin.error = details.message
    }
    return
  }

  resetVerificationState()
  feedback.signin.message = 'Connexion réussie. Redirection en cours...'
  signInForm.password = ''
  await router.replace(redirectPath.value)
}

async function handleSignUp() {
  resetFeedback('signup')
  if (!canSubmitSignUp.value) {
    feedback.signup.error =
      missingSignUpRequirements.value.join(' ') || 'Veuillez vérifier les informations saisies.'
    if (!signUpForm.email) {
      feedback.signup.fieldErrors.email = 'Indiquez une adresse e-mail valide.'
    }
    if (!passwordValidation.value.length) {
      feedback.signup.fieldErrors.password = 'Le mot de passe doit contenir au moins 12 caractères.'
    } else if (!passwordValidation.value.letters || !passwordValidation.value.numbers) {
      feedback.signup.fieldErrors.password = 'Ajoutez des lettres et des chiffres pour renforcer votre mot de passe.'
    }
    if (!passwordValidation.value.matches) {
      feedback.signup.fieldErrors.confirmPassword = 'La confirmation doit correspondre au mot de passe.'
    }
    return
  }

  isSubmitting.value = true
  const { error } = await authStore.signUpWithEmail({
    email: signUpForm.email,
    password: signUpForm.password,
    fullName: signUpForm.fullName
  })
  isSubmitting.value = false

  if (error) {
    const details = getErrorDetails(error)
    if (details.category === 'alreadyRegistered') {
      feedback.signup.fieldErrors.email = details.message
      feedback.signup.error = null
    } else if (details.category === 'passwordPolicy') {
      feedback.signup.fieldErrors.password = details.message
      feedback.signup.error = null
    } else {
      feedback.signup.error = details.message
    }
    return
  }

  feedback.signup.message =
    'Votre compte a été créé. Un e-mail de confirmation vient de vous être envoyé pour sécuriser votre inscription.'
  signUpSuccess.value = true
  lastRegisteredEmail.value = signUpForm.email
  signInForm.email = signUpForm.email
  signUpForm.fullName = signUpForm.fullName.trim()
  signUpForm.password = ''
  signUpForm.confirmPassword = ''
}

async function handlePasswordReset() {
  resetFeedback('forgot')
  if (!resetEmail.value) {
    feedback.forgot.fieldErrors.email = 'Merci d\'indiquer votre adresse e-mail.'
    return
  }

  isSubmitting.value = true
  const { error } = await authStore.sendPasswordReset(resetEmail.value)
  isSubmitting.value = false

  if (error) {
    const details = getErrorDetails(error)
    if (details.category === 'generic') {
      feedback.forgot.error = details.message
    } else {
      feedback.forgot.fieldErrors.email = details.message
    }
    return
  }

  feedback.forgot.message =
    'Si cette adresse correspond à un compte existant, un e-mail de réinitialisation vient d\'être envoyé.'
  forgotSuccess.value = true
}

async function handleResendVerification() {
  verificationFeedback.value = null
  verificationError.value = null

  const email = (verificationEmail.value || signInForm.email).trim()
  if (!email) {
    verificationError.value = "Merci d'indiquer votre adresse e-mail avant de demander un nouvel envoi."
    return
  }

  isResendingVerification.value = true
  const { error } = await authStore.resendEmailVerification(email)
  isResendingVerification.value = false

  if (error) {
    const details = getErrorDetails(error)
    verificationError.value = details.message
    return
  }

  verificationFeedback.value =
    "Un nouveau message de confirmation vient d'être envoyé. Pensez à vérifier vos courriers indésirables."
}

async function handleRetryInitialization() {
  initializationFailed.value = false
  initializationError.value = null
  initializationMessage.value = null
  resetFeedback(activeTab.value)
  try {
    await authStore.retryInitialization()
    initializationMessage.value = "Connexion au service d'authentification rétablie."
  } catch (error) {
    console.error('Retrying authentication initialization failed', error)
    const normalizedError = error instanceof Error ? error : new Error("Nouvelle tentative d'initialisation échouée")
    const details = getErrorDetails(normalizedError)
    initializationError.value = details.message
    initializationFailed.value = true
  }
}

function restartSignUpFlow() {
  signUpSuccess.value = false
  resetFeedback('signup')
}

function restartForgotFlow() {
  forgotSuccess.value = false
  resetFeedback('forgot')
}

function switchTab(tab: AuthTab) {
  if (activeTab.value !== tab) {
    if (tab !== 'signup') {
      signUpSuccess.value = false
    }
    if (tab !== 'forgot') {
      forgotSuccess.value = false
    }
  }

  resetFeedback(tab)
  initializationMessage.value = null
  if (tab !== 'signin') {
    resetVerificationState()
  }

  activeTab.value = tab
  const nextQuery: LocationQueryRaw = {}

  Object.entries(route.query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      nextQuery[key] = value.filter((entry): entry is string => typeof entry === 'string')
    } else if (typeof value === 'string') {
      nextQuery[key] = value
    } else if (value === null) {
      nextQuery[key] = null
    }
  })
  if (tab === 'signin') {
    delete nextQuery.mode
  } else {
    nextQuery.mode = tab
  }

  void router.replace({ query: nextQuery })
}
</script>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 520px) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--md-sys-color-surface);
}

.auth-panel {
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 4vw, 64px);
  gap: clamp(24px, 3vw, 40px);
}

.auth-header {
  display: flex;
  justify-content: center;
}

.auth-brand {
  display: flex;
  gap: 16px;
  align-items: center;
}

.auth-brand .material-symbols-outlined {
  font-size: 40px;
  color: var(--md-sys-color-primary);
}

.auth-brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-title {
  font-family: var(--md-sys-typescale-headline-small-font);
  font-size: var(--md-sys-typescale-headline-small-size);
  margin: 0;
  color: var(--md-sys-color-on-surface);
}

.auth-subtitle {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.auth-card {
  background: var(--md-sys-color-surface-container);
  border-radius: 28px;
  box-shadow: var(--md-sys-elevation-level2);
  padding: clamp(24px, 4vw, 44px);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.auth-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-high);
  padding: 4px;
  gap: 4px;
}

.auth-tab {
  position: relative;
  border: none;
  border-radius: 18px;
  padding: 12px 16px;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.auth-tab::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 6px;
  height: 3px;
  border-radius: 999px;
  background: transparent;
  transition: background-color 0.2s ease;
}

.auth-tab[aria-selected='true'] {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.auth-tab[aria-selected='true']::after {
  background: var(--md-sys-color-primary);
}

.auth-tab:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.md-text-field {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 14px;
  gap: 6px;
}

.md-text-field input {
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 22px 16px 10px;
  background: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
  font-size: 1rem;
  box-shadow: inset 0 0 0 1px var(--md-sys-color-outline);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

.md-text-field.password-field input {
  padding-right: 52px;
}

.md-text-field__label {
  position: absolute;
  left: 16px;
  top: 26px;
  color: var(--md-sys-color-on-surface-variant);
  transform-origin: top left;
  transition: transform 0.2s ease, color 0.2s ease;
  pointer-events: none;
}

.md-text-field.has-value .md-text-field__label,
.md-text-field:focus-within .md-text-field__label {
  transform: translateY(-14px) scale(0.85);
  color: var(--md-sys-color-primary);
}

.md-text-field.has-error .md-text-field__label {
  color: var(--md-sys-color-error);
}

.md-text-field input:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--md-sys-color-primary);
}

.md-text-field.has-error input {
  box-shadow: inset 0 0 0 2px var(--md-sys-color-error);
}

.md-text-field__supporting {
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
}

.md-text-field.has-error .md-text-field__supporting {
  color: var(--md-sys-color-error);
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 28px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 999px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.password-toggle:hover {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
}

.password-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent);
}

.password-guidelines {
  list-style: none;
  padding: 10px 0 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}

.password-guidelines li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.85rem;
}

.password-guidelines li.fulfilled {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.password-guidelines .material-symbols-outlined {
  font-size: 18px;
}

.auth-links {
  display: flex;
  justify-content: flex-end;
}

.link-button {
  border: none;
  background: none;
  color: var(--md-sys-color-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  border-radius: 8px;
}

.link-button:hover {
  text-decoration: underline;
}

.link-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent);
}

.auth-initialization-error {
  display: grid;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--md-sys-color-error) 18%, transparent);
  color: var(--md-sys-color-on-error);
}

.auth-initialization-error p {
  margin: 0;
  font-weight: 600;
}

.auth-initialization-info {
  margin: 0;
  padding: 12px 16px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent);
  color: var(--md-sys-color-primary);
  font-weight: 500;
}

.auth-verification-card {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: 24px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.auth-verification-title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.auth-verification-text {
  margin: 0;
  line-height: 1.5;
}

.auth-verification-text strong {
  color: var(--md-sys-color-on-secondary-container);
}

.auth-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.auth-secondary-action.tonal {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.auth-secondary-action:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-secondary-action:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: var(--md-sys-elevation-level2);
}

.auth-secondary-action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent);
}

.auth-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 22px;
  border-radius: 999px;
  border: none;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.auth-submit:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: var(--md-sys-elevation-level3);
}

.auth-submit:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent);
}

.auth-message,
.auth-error {
  padding: 14px 18px;
  border-radius: 18px;
  border-left: 4px solid;
  font-weight: 500;
  margin: 0;
}

.auth-message {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  color: var(--md-sys-color-primary);
  border-color: var(--md-sys-color-primary);
}

.auth-error {
  background: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
  color: var(--md-sys-color-error);
  border-color: var(--md-sys-color-error);
}

.auth-secondary-title {
  margin: 0;
  font-size: 1.3rem;
  color: var(--md-sys-color-on-surface);
}

.auth-description {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.auth-success-card {
  display: grid;
  gap: 16px;
  padding: 28px;
  border-radius: 28px;
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  text-align: center;
}

.auth-success-card h2 {
  margin: 0;
  font-size: 1.4rem;
}

.auth-success-card p {
  margin: 0;
  line-height: 1.6;
}

.auth-success-icon {
  font-size: 42px;
}

.auth-aside {
  background: linear-gradient(160deg, color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent) 0%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 5vw, 64px);
}

.auth-illustration {
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: var(--md-sys-color-on-surface);
}

.auth-illustration h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
}

.auth-illustration ul {
  margin: 0;
  padding: 0 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-panel {
    padding-inline: clamp(20px, 5vw, 48px);
  }

  .auth-aside {
    display: none;
  }
}

@media (max-width: 720px) {
  .auth-panel {
    padding: 24px 16px 32px;
  }

  .auth-card {
    padding: 24px;
    border-radius: 24px;
    gap: 24px;
  }

  .auth-tabs {
    grid-template-columns: 1fr;
  }

  .auth-submit {
    width: 100%;
  }

  .auth-secondary-action {
    justify-content: center;
  }
}
</style>
