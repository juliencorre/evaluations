<template>
  <div class="auth-page">
    <!-- Container principal -->
    <div class="auth-container">
      <!-- Carte d'authentification -->
      <div class="auth-card">
        <!-- En-tête avec logo et titre -->
        <header class="auth-header">
          <div class="logo-container">
            <span class="material-symbols-outlined">school</span>
          </div>
          <h1 class="auth-title">Évaluations</h1>
          <p class="auth-subtitle">Plateforme de gestion des évaluations scolaires</p>
        </header>

        <!-- Navigation par onglets -->
        <nav class="tab-navigation" role="tablist">
          <button
            class="tab-button"
            :class="{ 'tab-active': activeTab === 'signin' }"
            role="tab"
            :aria-selected="activeTab === 'signin'"
            @click="switchTab('signin')"
          >
            Connexion
          </button>
          <button
            class="tab-button"
            :class="{ 'tab-active': activeTab === 'signup' }"
            role="tab"
            :aria-selected="activeTab === 'signup'"
            @click="switchTab('signup')"
          >
            Inscription
          </button>
        </nav>

        <!-- Messages d'erreur globaux -->
        <div v-if="initializationFailed" class="alert alert-error" role="alert">
          <span class="material-symbols-outlined">error</span>
          <div class="alert-content">
            <p>{{ initializationError || "Impossible de vérifier le service d'authentification." }}</p>
            <button
              class="button button-outlined"
              :disabled="isInitializing"
              @click="handleRetryInitialization"
            >
              {{ isInitializing ? 'Nouvelle tentative...' : 'Réessayer' }}
            </button>
          </div>
        </div>

        <div v-else-if="initializationMessage" class="alert alert-info" role="status">
          <span class="material-symbols-outlined">info</span>
          <p>{{ initializationMessage }}</p>
        </div>

        <!-- Contenu des formulaires -->
        <main class="auth-content">
          <Transition name="slide-fade" mode="out-in">
            <!-- Formulaire de connexion -->
            <form
              v-if="activeTab === 'signin'"
              key="signin"
              class="auth-form"
              autocomplete="on"
              @submit.prevent="handleSignIn"
            >
              <!-- Messages de retour -->
              <div v-if="feedback.signin.message && !isSubmitting" class="alert alert-success" role="status">
                <span class="material-symbols-outlined">check_circle</span>
                <p>{{ feedback.signin.message }}</p>
              </div>

              <div v-if="feedback.signin.error && !isSubmitting" class="alert alert-error" role="alert">
                <span class="material-symbols-outlined">error</span>
                <p>{{ feedback.signin.error }}</p>
              </div>

              <!-- Vérification email -->
              <div
                v-if="needsEmailVerification && !isSubmitting"
                class="verification-card"
                role="region"
                aria-live="polite"
              >
                <div class="verification-icon">
                  <span class="material-symbols-outlined">mark_email_unread</span>
                </div>
                <div class="verification-content">
                  <h2>Vérification requise</h2>
                  <p>
                    Votre adresse e-mail <strong>{{ verificationEmail || signInForm.email }}</strong>
                    doit être vérifiée avant de pouvoir vous connecter.
                  </p>
                  <button
                    type="button"
                    class="button button-outlined"
                    :disabled="isResendingVerification"
                    @click="handleResendVerification"
                  >
                    {{ isResendingVerification ? 'Envoi en cours...' : 'Renvoyer l\'e-mail' }}
                  </button>
                  <p v-if="verificationFeedback" class="success-text">{{ verificationFeedback }}</p>
                  <p v-if="verificationError" class="error-text">{{ verificationError }}</p>
                </div>
              </div>

              <!-- Champs du formulaire -->
              <div class="form-fields">
                <!-- Email -->
                <div class="input-group">
                  <div
                    class="text-field"
                    :class="{
                      'text-field-error': !!feedback.signin.fieldErrors.email,
                      'text-field-focused': emailFocused,
                      'text-field-filled': Boolean(signInForm.email)
                    }"
                  >
                    <label class="text-field-label" for="signin-email">Adresse e-mail</label>
                    <div class="text-field-container">
                      <span class="text-field-icon material-symbols-outlined">mail</span>
                      <input
                        id="signin-email"
                        v-model.trim="signInForm.email"
                        class="text-field-input"
                        type="email"
                        name="email"
                        autocomplete="email"
                        required
                        :disabled="isFormDisabled"
                        :aria-invalid="!!feedback.signin.fieldErrors.email"
                        @focus="emailFocused = true"
                        @blur="emailFocused = false"
                      />
                    </div>
                    <div v-if="feedback.signin.fieldErrors.email" class="text-field-error-text">
                      {{ feedback.signin.fieldErrors.email }}
                    </div>
                  </div>
                </div>

                <!-- Mot de passe -->
                <div class="input-group">
                  <div
                    class="text-field"
                    :class="{
                      'text-field-error': !!feedback.signin.fieldErrors.password,
                      'text-field-focused': passwordFocused,
                      'text-field-filled': Boolean(signInForm.password)
                    }"
                  >
                    <label class="text-field-label" for="signin-password">Mot de passe</label>
                    <div class="text-field-container">
                      <span class="text-field-icon material-symbols-outlined">lock</span>
                      <input
                        id="signin-password"
                        v-model="signInForm.password"
                        class="text-field-input"
                        :type="showSignInPassword ? 'text' : 'password'"
                        name="current-password"
                        autocomplete="current-password"
                        minlength="8"
                        required
                        :disabled="isFormDisabled"
                        :aria-invalid="!!feedback.signin.fieldErrors.password"
                        @focus="passwordFocused = true"
                        @blur="passwordFocused = false"
                      />
                      <button
                        type="button"
                        class="text-field-trailing-icon"
                        :aria-label="showSignInPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                        @click="showSignInPassword = !showSignInPassword"
                      >
                        <span class="material-symbols-outlined">
                          {{ showSignInPassword ? 'visibility_off' : 'visibility' }}
                        </span>
                      </button>
                    </div>
                    <div v-if="feedback.signin.fieldErrors.password" class="text-field-error-text">
                      {{ feedback.signin.fieldErrors.password }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions secondaires -->
              <div class="form-actions">
                <label class="checkbox-container">
                  <input type="checkbox" class="checkbox-input">
                  <span class="checkbox-checkmark"></span>
                  <span class="checkbox-label">Se souvenir de moi</span>
                </label>
                <button type="button" class="link-button" @click="switchTab('forgot')">
                  Mot de passe oublié ?
                </button>
              </div>

              <!-- Bouton principal -->
              <button
                class="button button-filled"
                type="submit"
                :disabled="!canSubmitSignIn || isFormDisabled"
              >
                <span v-if="isSubmitting" class="loading-spinner"></span>
                {{ isSubmitting ? 'Connexion en cours...' : 'Se connecter' }}
              </button>

            </form>

            <!-- Formulaire d'inscription -->
            <form
              v-else-if="activeTab === 'signup' && !signUpSuccess"
              key="signup"
              class="auth-form"
              autocomplete="on"
              @submit.prevent="handleSignUp"
            >
              <!-- Messages -->
              <div v-if="feedback.signup.message && !isSubmitting" class="alert alert-success" role="status">
                <span class="material-symbols-outlined">check_circle</span>
                <p>{{ feedback.signup.message }}</p>
              </div>

              <div v-if="feedback.signup.error && !isSubmitting" class="alert alert-error" role="alert">
                <span class="material-symbols-outlined">error</span>
                <p>{{ feedback.signup.error }}</p>
              </div>

              <!-- Champs -->
              <div class="form-fields">
                <!-- Email -->
                <div class="input-group">
                  <div
                    class="text-field"
                    :class="{
                      'text-field-error': !!feedback.signup.fieldErrors.email,
                      'text-field-focused': signUpEmailFocused,
                      'text-field-filled': Boolean(signUpForm.email)
                    }"
                  >
                    <label class="text-field-label" for="signup-email">Adresse e-mail</label>
                    <div class="text-field-container">
                      <span class="text-field-icon material-symbols-outlined">mail</span>
                      <input
                        id="signup-email"
                        v-model.trim="signUpForm.email"
                        class="text-field-input"
                        type="email"
                        name="new-email"
                        autocomplete="email"
                        required
                        :disabled="isFormDisabled"
                        :aria-invalid="!!feedback.signup.fieldErrors.email"
                        @focus="signUpEmailFocused = true"
                        @blur="signUpEmailFocused = false; validateSignUpEmail()"
                        @input="emailValidationResult = null; feedback.signup.fieldErrors.email = ''"
                      />
                      <!-- Indicateur de validation en cours -->
                      <div v-if="isValidatingEmail" class="text-field-trailing-icon">
                        <span class="loading-spinner-small"></span>
                      </div>
                      <!-- Indicateur de validation réussie -->
                      <div v-else-if="emailValidationResult?.allowed" class="text-field-trailing-icon text-success">
                        <span class="material-symbols-outlined">check_circle</span>
                      </div>
                    </div>
                    <div v-if="feedback.signup.fieldErrors.email" class="text-field-error-text">
                      {{ feedback.signup.fieldErrors.email }}
                    </div>
                  </div>
                </div>

                <!-- Mot de passe -->
                <div class="input-group">
                  <div
                    class="text-field"
                    :class="{
                      'text-field-error': !!feedback.signup.fieldErrors.password,
                      'text-field-focused': signUpPasswordFocused,
                      'text-field-filled': Boolean(signUpForm.password)
                    }"
                  >
                    <label class="text-field-label" for="signup-password">Mot de passe</label>
                    <div class="text-field-container">
                      <span class="text-field-icon material-symbols-outlined">lock</span>
                      <input
                        id="signup-password"
                        v-model="signUpForm.password"
                        class="text-field-input"
                        :type="showSignUpPassword ? 'text' : 'password'"
                        name="new-password"
                        autocomplete="new-password"
                        minlength="12"
                        required
                        :disabled="isFormDisabled"
                        :aria-invalid="!!feedback.signup.fieldErrors.password"
                        @focus="signUpPasswordFocused = true"
                        @blur="signUpPasswordFocused = false"
                      />
                      <button
                        type="button"
                        class="text-field-trailing-icon"
                        @click="showSignUpPassword = !showSignUpPassword"
                      >
                        <span class="material-symbols-outlined">
                          {{ showSignUpPassword ? 'visibility_off' : 'visibility' }}
                        </span>
                      </button>
                    </div>
                    <div v-if="feedback.signup.fieldErrors.password" class="text-field-error-text">
                      {{ feedback.signup.fieldErrors.password }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Indicateur de force du mot de passe -->
              <div class="password-strength">
                <div class="password-strength-label">
                  <span>Force du mot de passe</span>
                  <span class="password-strength-percentage" :class="passwordValidation.level">
                    {{ passwordValidation.strength }}%
                  </span>
                </div>
                <div class="password-strength-bar">
                  <div
                    class="password-strength-fill"
                    :class="passwordValidation.level"
                    :style="{ width: passwordValidation.strength + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Critères du mot de passe -->
              <ul class="password-requirements">
                <li :class="{ 'requirement-fulfilled': passwordValidation.length }">
                  <span class="material-symbols-outlined">
                    {{ passwordValidation.length ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  Au moins 12 caractères
                </li>
                <li :class="{ 'requirement-fulfilled': passwordValidation.letters }">
                  <span class="material-symbols-outlined">
                    {{ passwordValidation.letters ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  Inclure des lettres
                </li>
                <li :class="{ 'requirement-fulfilled': passwordValidation.numbers }">
                  <span class="material-symbols-outlined">
                    {{ passwordValidation.numbers ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  Inclure des chiffres
                </li>
                <li :class="{ 'requirement-fulfilled': passwordValidation.special }">
                  <span class="material-symbols-outlined">
                    {{ passwordValidation.special ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  Caractères spéciaux
                </li>
              </ul>

              <button
                class="button button-filled"
                type="submit"
                :disabled="!canSubmitSignUp || isFormDisabled"
              >
                <span v-if="isSubmitting" class="loading-spinner"></span>
                {{ isSubmitting ? 'Création du compte...' : 'Créer mon compte' }}
              </button>
            </form>

            <!-- Succès inscription -->
            <div
              v-else-if="activeTab === 'signup' && signUpSuccess"
              key="signup-success"
              class="success-state"
            >
              <div class="success-icon">
                <span class="material-symbols-outlined">mark_email_read</span>
              </div>
              <h2>Confirmez votre adresse e-mail</h2>
              <p>
                Un lien sécurisé a été envoyé à <strong>{{ lastRegisteredEmail || signUpForm.email }}</strong>.
                Cliquez dessus pour activer votre compte.
              </p>
              <div class="success-actions">
                <button class="button button-outlined" @click="restartSignUpFlow">
                  Créer un autre compte
                </button>
                <button class="button button-filled" @click="switchTab('signin')">
                  Aller à la connexion
                </button>
              </div>
            </div>

            <!-- Formulaire mot de passe oublié -->
            <form
              v-else-if="activeTab === 'forgot' && !forgotSuccess"
              key="forgot"
              class="auth-form"
              @submit.prevent="handlePasswordReset"
            >
              <div class="form-header">
                <h2>Réinitialiser le mot de passe</h2>
                <p>Indiquez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>
              </div>

              <div v-if="feedback.forgot.message && !isSubmitting" class="alert alert-success">
                <span class="material-symbols-outlined">check_circle</span>
                <p>{{ feedback.forgot.message }}</p>
              </div>

              <div v-if="feedback.forgot.error && !isSubmitting" class="alert alert-error">
                <span class="material-symbols-outlined">error</span>
                <p>{{ feedback.forgot.error }}</p>
              </div>

              <div class="form-fields">
                <div class="input-group">
                  <div
                    class="text-field"
                    :class="{
                      'text-field-error': !!feedback.forgot.fieldErrors.email,
                      'text-field-focused': resetEmailFocused,
                      'text-field-filled': Boolean(resetEmail)
                    }"
                  >
                    <label class="text-field-label" for="reset-email">Adresse e-mail</label>
                    <div class="text-field-container">
                      <span class="text-field-icon material-symbols-outlined">mail</span>
                      <input
                        id="reset-email"
                        v-model.trim="resetEmail"
                        class="text-field-input"
                        type="email"
                        name="recovery-email"
                        autocomplete="email"
                        required
                        :disabled="isFormDisabled"
                        @focus="resetEmailFocused = true"
                        @blur="resetEmailFocused = false"
                      />
                    </div>
                    <div v-if="feedback.forgot.fieldErrors.email" class="text-field-error-text">
                      {{ feedback.forgot.fieldErrors.email }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="link-button" @click="switchTab('signin')">
                  Retour à la connexion
                </button>
              </div>

              <button
                class="button button-filled"
                type="submit"
                :disabled="!resetEmail || isFormDisabled"
              >
                <span v-if="isSubmitting" class="loading-spinner"></span>
                {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien' }}
              </button>
            </form>

            <!-- Succès mot de passe oublié -->
            <div
              v-else-if="activeTab === 'forgot' && forgotSuccess"
              key="forgot-success"
              class="success-state"
            >
              <div class="success-icon">
                <span class="material-symbols-outlined">mark_email_read</span>
              </div>
              <h2>Vérifiez votre boîte de réception</h2>
              <p>
                Si un compte est associé à <strong>{{ resetEmail }}</strong>,
                un e-mail de réinitialisation vous a été envoyé.
              </p>
              <div class="success-actions">
                <button class="button button-outlined" @click="restartForgotFlow">
                  Envoyer un autre e-mail
                </button>
                <button class="button button-filled" @click="switchTab('signin')">
                  Retour à la connexion
                </button>
              </div>
            </div>
          </Transition>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import type { AuthError } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/authStore'
import { emailValidationService } from '@/services/emailValidationService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

type AuthTab = 'signin' | 'signup' | 'forgot'

// État réactif
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
const isValidatingEmail = ref(false)
const emailValidationResult = ref<{ allowed: boolean; message: string } | null>(null)

// États de focus pour les champs
const emailFocused = ref(false)
const passwordFocused = ref(false)
const signUpEmailFocused = ref(false)
const signUpPasswordFocused = ref(false)
const resetEmailFocused = ref(false)

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
      email: null,
      password: null
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

const signInForm = reactive({
  email: getInitialEmail(),
  password: ''
})

const signUpForm = reactive({
  email: getInitialEmail(),
  password: ''
})

const resetEmail = ref(getInitialEmail())

const isInitializing = computed(() => authStore.isInitializing.value)
const isFormDisabled = computed(() => isSubmitting.value || isInitializing.value)

// Validation en temps réel
const emailValidation = computed(() => {
  const email = signInForm.email || signUpForm.email
  if (!email) return { isValid: false, message: '' }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)

  return {
    isValid,
    message: isValid ? 'Adresse e-mail valide' : 'Format d\'adresse e-mail invalide'
  }
})

const passwordValidation = computed(() => {
  const password = signUpForm.password
  const hasLength = password.length >= 12
  const hasLetters = /[A-Za-zÀ-ÿ]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  let strength = 0
  if (hasLength) strength += 25
  if (hasLetters) strength += 25
  if (hasNumbers) strength += 25
  if (hasSpecial) strength += 25

  return {
    length: hasLength,
    letters: hasLetters,
    numbers: hasNumbers,
    special: hasSpecial,
    strength,
    level: strength < 50 ? 'weak' : strength < 75 ? 'medium' : 'strong'
  }
})

const canSubmitSignIn = computed(() => {
  return Boolean(signInForm.email && signInForm.password.length >= 8)
})

const canSubmitSignUp = computed(() => {
  const { length, letters, numbers, special } = passwordValidation.value
  return Boolean(signUpForm.email) && length && letters && numbers && special
})

// Fonctions utilitaires
function getInitialTab() {
  const mode = route.query.mode
  if (mode === 'signup') return 'signup' as const
  if (mode === 'forgot') return 'forgot' as const
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

function getErrorDetails(error: AuthError | Error) {
  const lowered = error.message?.toLowerCase?.() ?? ''
  if (
    lowered.includes('email not confirmed') ||
    lowered.includes('email_not_confirmed') ||
    lowered.includes('email confirmation required')
  ) {
    return {
      category: 'emailNotConfirmed' as const,
      message: 'Votre adresse e-mail n\'est pas encore vérifiée.'
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
      message: 'Trop de demandes. Veuillez patienter quelques minutes.'
    }
  }
  if (lowered.includes('already registered')) {
    return {
      category: 'alreadyRegistered' as const,
      message: 'Un compte existe déjà avec cette adresse e-mail.'
    }
  }
  return {
    category: 'generic' as const,
    message: "Une erreur est survenue. Merci de réessayer."
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

// Gestionnaires d'événements
async function handleSignIn() {
  resetFeedback('signin')
  if (!canSubmitSignIn.value) return

  isSubmitting.value = true
  const { error } = await authStore.signInWithPassword(signInForm.email, signInForm.password)
  isSubmitting.value = false

  if (error) {
    if (isEmailVerificationRequired(error)) {
      needsEmailVerification.value = true
      verificationEmail.value = signInForm.email.trim()
      feedback.signin.error = "Votre adresse e-mail n'est pas encore vérifiée."
      return
    }

    const details = getErrorDetails(error)
    if (details.category === 'invalidCredentials') {
      feedback.signin.fieldErrors.password = details.message
    } else {
      feedback.signin.error = details.message
    }
    return
  }

  feedback.signin.message = 'Connexion réussie. Redirection en cours...'
  signInForm.password = ''
  await router.replace(redirectPath.value)
}

// Fonction pour valider l'email en temps réel
async function validateSignUpEmail() {
  const email = signUpForm.email.trim()

  // Reset de la validation précédente
  emailValidationResult.value = null
  feedback.signup.fieldErrors.email = ''

  // Validation du format d'abord
  const formatValidation = emailValidationService.validateEmailFormat(email)
  if (!formatValidation.valid) {
    feedback.signup.fieldErrors.email = formatValidation.message || 'Format d\'email invalide'
    return
  }

  // Validation côté serveur si le format est correct
  if (email) {
    isValidatingEmail.value = true
    try {
      const result = await emailValidationService.validateEmail(email)
      emailValidationResult.value = result

      if (!result.allowed) {
        feedback.signup.fieldErrors.email = result.message
      }
    } catch (error) {
      console.error('Erreur lors de la validation de l\'email:', error)
      feedback.signup.fieldErrors.email = 'Erreur lors de la validation de l\'email'
    } finally {
      isValidatingEmail.value = false
    }
  }
}

async function handleSignUp() {
  resetFeedback('signup')

  // Valider l'email avant de procéder
  await validateSignUpEmail()

  if (!canSubmitSignUp.value || !emailValidationResult.value?.allowed) {
    feedback.signup.error = 'Veuillez vérifier les informations saisies.'
    return
  }

  isSubmitting.value = true
  const { error } = await authStore.signUpWithEmail({
    email: signUpForm.email,
    password: signUpForm.password
  })
  isSubmitting.value = false

  if (error) {
    const details = getErrorDetails(error)
    if (details.category === 'alreadyRegistered') {
      feedback.signup.fieldErrors.email = details.message
    } else {
      feedback.signup.error = details.message
    }
    return
  }

  signUpSuccess.value = true
  lastRegisteredEmail.value = signUpForm.email
  signInForm.email = signUpForm.email
  signUpForm.password = ''
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
    feedback.forgot.error = details.message
    return
  }

  forgotSuccess.value = true
}

async function handleResendVerification() {
  verificationFeedback.value = null
  verificationError.value = null

  const email = (verificationEmail.value || signInForm.email).trim()
  if (!email) {
    verificationError.value = "Merci d'indiquer votre adresse e-mail."
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

  verificationFeedback.value = "Un nouveau message de confirmation a été envoyé."
}

async function handleRetryInitialization() {
  initializationFailed.value = false
  initializationError.value = null
  try {
    await authStore.retryInitialization()
    initializationMessage.value = "Connexion rétablie."
  } catch (error) {
    const details = getErrorDetails(error instanceof Error ? error : new Error('Erreur'))
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
    if (tab !== 'signup') signUpSuccess.value = false
    if (tab !== 'forgot') forgotSuccess.value = false
  }

  resetFeedback(tab)
  initializationMessage.value = null
  if (tab !== 'signin') resetVerificationState()

  activeTab.value = tab
  const nextQuery: LocationQueryRaw = { ...route.query }

  if (tab === 'signin') {
    delete nextQuery.mode
  } else {
    nextQuery.mode = tab
  }

  void router.replace({ query: nextQuery })
}

// Cycle de vie
onMounted(async () => {
  try {
    await authStore.ensureInitialized()
    initializationFailed.value = false
  } catch (error) {
    const details = getErrorDetails(error instanceof Error ? error : new Error('Erreur'))
    initializationError.value = details.message
    initializationFailed.value = true
  }
})

// Watchers
watch(() => route.query.mode, (mode) => {
  const nextTab: AuthTab = mode === 'signup' ? 'signup' : mode === 'forgot' ? 'forgot' : 'signin'
  if (activeTab.value !== nextTab) {
    if (nextTab !== 'signup') signUpSuccess.value = false
    if (nextTab !== 'forgot') forgotSuccess.value = false
  }
  activeTab.value = nextTab
  resetFeedback(nextTab)
  if (nextTab !== 'signin') resetVerificationState()
})

watch(() => route.query.email, (email) => {
  if (typeof email === 'string') {
    signInForm.email = email
    signUpForm.email = email
    resetEmail.value = email
  }
})

watch(() => authStore.lastError.value, (error) => {
  if (error) {
    if (isEmailVerificationRequired(error)) {
      needsEmailVerification.value = true
      verificationEmail.value = verificationEmail.value || signInForm.email.trim()
      feedback.signin.error = "Votre adresse e-mail n'est pas encore vérifiée."
      return
    }

    resetVerificationState()
    const details = getErrorDetails(error)
    if (details.category === 'invalidCredentials') {
      feedback.signin.fieldErrors.password = details.message
    } else {
      feedback.signin.error = details.message
    }
  }
})
</script>

<style scoped>
/* ===== TOKENS MATERIAL DESIGN 3 ===== */
:root {
  /* Surface Colors */
  --md-sys-color-surface: #fefbff;
  --md-sys-color-surface-variant: #e8e0e8;
  --md-sys-color-surface-container: #f3f0f4;
  --md-sys-color-surface-container-high: #ede0e8;
  --md-sys-color-surface-container-highest: #e8e0e8;

  /* Primary Colors */
  --md-sys-color-primary: #6440d6;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #e4ddff;
  --md-sys-color-on-primary-container: #1e0060;

  /* Secondary Colors */
  --md-sys-color-secondary: #5d5d74;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #e1dffc;
  --md-sys-color-on-secondary-container: #19182d;

  /* Tertiary Colors */
  --md-sys-color-tertiary: #7e525e;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #ffd9e2;
  --md-sys-color-on-tertiary-container: #31101c;

  /* Error Colors */
  --md-sys-color-error: #ba1a1a;
  --md-sys-color-on-error: #ffffff;
  --md-sys-color-error-container: #ffdad6;
  --md-sys-color-on-error-container: #410002;

  /* Neutral Colors */
  --md-sys-color-outline: #7a757f;
  --md-sys-color-outline-variant: #cbc4cf;
  --md-sys-color-on-surface: #1c1b1f;
  --md-sys-color-on-surface-variant: #4d444c;
  --md-sys-color-inverse-surface: #312f33;
  --md-sys-color-inverse-on-surface: #f4f0f4;

  /* Success Colors (Extension) */
  --md-sys-color-success: #00A86B;
  --md-sys-color-on-success: #ffffff;
  --md-sys-color-success-container: #c8f2d8;
  --md-sys-color-on-success-container: #002114;

  /* Shadows & Effects */
  --md-sys-elevation-level0: none;
  --md-sys-elevation-level1: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level2: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level3: 0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level4: 0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level5: 0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15);

  /* Typography */
  --md-sys-typescale-display-large-size: 57px;
  --md-sys-typescale-display-medium-size: 45px;
  --md-sys-typescale-display-small-size: 36px;
  --md-sys-typescale-headline-large-size: 32px;
  --md-sys-typescale-headline-medium-size: 28px;
  --md-sys-typescale-headline-small-size: 24px;
  --md-sys-typescale-title-large-size: 22px;
  --md-sys-typescale-title-medium-size: 16px;
  --md-sys-typescale-title-small-size: 14px;
  --md-sys-typescale-body-large-size: 16px;
  --md-sys-typescale-body-medium-size: 14px;
  --md-sys-typescale-body-small-size: 12px;
  --md-sys-typescale-label-large-size: 14px;
  --md-sys-typescale-label-medium-size: 12px;
  --md-sys-typescale-label-small-size: 11px;

  /* Motion */
  --md-sys-motion-easing-legacy: cubic-bezier(0.4, 0.0, 0.2, 1);
  --md-sys-motion-easing-linear: cubic-bezier(0.0, 0.0, 1, 1);
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0.0, 0, 1.0);
  --md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0, 1, 1);
  --md-sys-motion-easing-standard-decelerate: cubic-bezier(0, 0, 0, 1);
  --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0.0, 0, 1.0);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.05, 0.7, 0.1, 1.0);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.3, 0.0, 0.8, 0.15);

  /* Duration */
  --md-sys-motion-duration-short1: 50ms;
  --md-sys-motion-duration-short2: 100ms;
  --md-sys-motion-duration-short3: 150ms;
  --md-sys-motion-duration-short4: 200ms;
  --md-sys-motion-duration-medium1: 250ms;
  --md-sys-motion-duration-medium2: 300ms;
  --md-sys-motion-duration-medium3: 350ms;
  --md-sys-motion-duration-medium4: 400ms;
  --md-sys-motion-duration-long1: 450ms;
  --md-sys-motion-duration-long2: 500ms;
  --md-sys-motion-duration-long3: 550ms;
  --md-sys-motion-duration-long4: 600ms;
  --md-sys-motion-duration-extra-long1: 700ms;
  --md-sys-motion-duration-extra-long2: 800ms;
  --md-sys-motion-duration-extra-long3: 900ms;
  --md-sys-motion-duration-extra-long4: 1000ms;
}

/* ===== LAYOUT ===== */
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--md-sys-color-surface) 0%, var(--md-sys-color-surface-container) 100%);
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: var(--md-sys-color-on-surface);
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: var(--md-sys-color-surface);
  border-radius: 28px;
  padding: 40px 32px;
  box-shadow: var(--md-sys-elevation-level3);
  border: 1px solid var(--md-sys-color-outline-variant);
  position: relative;
  overflow: hidden;
}

/* ===== HEADER ===== */
.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  width: 72px;
  height: 72px;
  background: var(--md-sys-color-primary);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: var(--md-sys-elevation-level2);
  position: relative;
  overflow: hidden;
}

.logo-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
}

.logo-container .material-symbols-outlined {
  font-size: 36px;
  color: var(--md-sys-color-on-primary);
  font-weight: 400;
  position: relative;
  z-index: 1;
}

.auth-title {
  margin: 0 0 8px;
  font-size: var(--md-sys-typescale-headline-medium-size);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  line-height: 1.2;
}

.auth-subtitle {
  margin: 0;
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.4;
  font-weight: 400;
}

/* ===== NAVIGATION TABS ===== */
.tab-navigation {
  display: flex;
  background: var(--md-sys-color-surface-container);
  border-radius: 100px;
  padding: 4px;
  margin-bottom: 32px;
  position: relative;
}

.tab-button {
  flex: 1;
  padding: 10px 24px;
  border: none;
  border-radius: 100px;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
  font-size: var(--md-sys-typescale-label-large-size);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  position: relative;
  z-index: 2;
}

.tab-button:hover:not(.tab-active) {
  background: var(--md-sys-color-surface-container-high);
}

.tab-button.tab-active {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  box-shadow: var(--md-sys-elevation-level1);
}

/* ===== ALERTS ===== */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  font-size: var(--md-sys-typescale-body-small-size);
  margin-bottom: 20px;
  font-weight: 500;
  border: 1px solid;
}

.alert-error {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: var(--md-sys-color-error);
}

.alert-success {
  background: var(--md-sys-color-success-container);
  color: var(--md-sys-color-on-success-container);
  border-color: var(--md-sys-color-success);
}

.alert-info {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-color: var(--md-sys-color-primary);
}

.alert-content {
  flex: 1;
}

.alert .material-symbols-outlined {
  font-size: 20px;
  margin-top: 2px;
}

/* ===== FORMS ===== */
.auth-content {
  min-height: 200px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-header {
  text-align: center;
  margin-bottom: 8px;
}

.form-header h2 {
  margin: 0 0 8px;
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.form-header p {
  margin: 0;
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.4;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
}

/* ===== TEXT FIELDS (Material Design 3 Outlined) ===== */
.text-field {
  position: relative;
  border-radius: 4px;
}

.text-field-container {
  position: relative;
  display: flex;
  align-items: center;
}

.text-field-input {
  width: 100%;
  height: 56px;
  padding: 16px 16px 16px 48px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 4px;
  background: transparent;
  font-size: var(--md-sys-typescale-body-large-size);
  color: var(--md-sys-color-on-surface);
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  box-sizing: border-box;
  font-family: inherit;
}

.text-field-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
  padding-left: 47px; /* Ajustement pour compenser la bordure plus épaisse */
}

.text-field-label {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--md-sys-typescale-body-large-size);
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  background: var(--md-sys-color-surface);
  padding: 0 4px;
  z-index: 1;
}

.text-field-focused .text-field-label,
.text-field-filled .text-field-label {
  top: 0;
  left: 44px;
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-primary);
}

.text-field-error .text-field-input {
  border-color: var(--md-sys-color-error);
}

.text-field-error .text-field-label {
  color: var(--md-sys-color-error);
}

.text-field-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: var(--md-sys-color-on-surface-variant);
  z-index: 2;
}

.text-field-trailing-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 20px;
  transition: background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  z-index: 2;
}

.text-field-trailing-icon:hover {
  background: var(--md-sys-color-surface-container);
}

.text-field-trailing-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--md-sys-color-on-surface-variant);
}

.success-icon {
  color: var(--md-sys-color-success) !important;
}

.text-field-error-text {
  margin-top: 4px;
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-error);
  padding-left: 16px;
}

/* ===== BUTTONS (Material Design 3) ===== */
.button {
  height: 40px;
  border-radius: 20px;
  font-weight: 500;
  font-size: var(--md-sys-typescale-label-large-size);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  min-width: 64px;
  padding: 0 24px;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.button-filled {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: var(--md-sys-elevation-level1);
}

.button-filled:hover:not(:disabled) {
  box-shadow: var(--md-sys-elevation-level2);
  background: color-mix(in srgb, var(--md-sys-color-primary) 92%, var(--md-sys-color-on-primary) 8%);
}

.button-filled:active:not(:disabled) {
  box-shadow: var(--md-sys-elevation-level1);
}

.button-outlined {
  background: transparent;
  border: 1px solid var(--md-sys-color-outline);
  color: var(--md-sys-color-primary);
}

.button-outlined:hover:not(:disabled) {
  background: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
  border-color: var(--md-sys-color-primary);
}

.button-outlined:active:not(:disabled) {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--md-sys-color-primary);
}

.link-button {
  background: none;
  border: none;
  color: var(--md-sys-color-primary);
  font-weight: 500;
  font-size: var(--md-sys-typescale-body-medium-size);
  cursor: pointer;
  padding: 8px 0;
  text-decoration: none;
  transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
}

.link-button:hover {
  text-decoration: underline;
  color: color-mix(in srgb, var(--md-sys-color-primary) 80%, black);
}


/* ===== LOADING SPINNER ===== */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-small {
  width: 12px;
  height: 12px;
  border: 1.5px solid transparent;
  border-top: 1.5px solid var(--md-sys-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== EMAIL VALIDATION STYLES ===== */
.text-success {
  color: var(--md-sys-color-tertiary);
}

.text-field-trailing-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* ===== VERIFICATION CARD ===== */
.verification-card {
  background: var(--md-sys-color-tertiary-container);
  border: 1px solid var(--md-sys-color-tertiary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
}

.verification-icon .material-symbols-outlined {
  font-size: 32px;
  color: var(--md-sys-color-on-tertiary-container);
}

.verification-content h2 {
  margin: 0 0 8px;
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: 600;
  color: var(--md-sys-color-on-tertiary-container);
}

.verification-content p {
  margin: 0 0 16px;
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-tertiary-container);
  line-height: 1.4;
}

.success-text {
  margin-top: 8px;
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-success);
}

.error-text {
  margin-top: 8px;
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-error);
}

/* ===== PASSWORD STRENGTH ===== */
.password-strength {
  margin: 16px 0;
}

.password-strength-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
}

.password-strength-percentage {
  font-weight: 600;
}

.password-strength-percentage.weak { color: var(--md-sys-color-error); }
.password-strength-percentage.medium { color: #ff9800; }
.password-strength-percentage.strong { color: var(--md-sys-color-success); }

.password-strength-bar {
  height: 4px;
  background: var(--md-sys-color-surface-variant);
  border-radius: 2px;
  overflow: hidden;
}

.password-strength-fill {
  height: 100%;
  transition: width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
  border-radius: 2px;
}

.password-strength-fill.weak { background: var(--md-sys-color-error); }
.password-strength-fill.medium { background: #ff9800; }
.password-strength-fill.strong { background: var(--md-sys-color-success); }

/* ===== PASSWORD REQUIREMENTS ===== */
.password-requirements {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
}

.password-requirements li.requirement-fulfilled {
  color: var(--md-sys-color-success);
}

.password-requirements .material-symbols-outlined {
  font-size: 16px;
}

/* ===== SUCCESS STATE ===== */
.success-state {
  text-align: center;
  padding: 24px 0;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--md-sys-color-success-container);
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-icon .material-symbols-outlined {
  font-size: 40px;
  color: var(--md-sys-color-on-success-container);
}

.success-state h2 {
  margin: 0 0 16px;
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.success-state p {
  margin: 0 0 24px;
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.4;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== TRANSITIONS ===== */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .auth-page {
    padding: 16px;
  }

  .auth-card {
    padding: 32px 24px;
    border-radius: 20px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .success-actions {
    flex-direction: column;
  }
}

/* ===== DARK MODE SUPPORT ===== */
@media (prefers-color-scheme: dark) {
  :root {
    --md-sys-color-surface: #111318;
    --md-sys-color-on-surface: #e4e1e6;
    --md-sys-color-surface-variant: #47454a;
    --md-sys-color-on-surface-variant: #c8c5ca;
    --md-sys-color-surface-container: #1d1b20;
    --md-sys-color-surface-container-high: #28262b;
    --md-sys-color-surface-container-highest: #322f35;
    --md-sys-color-outline: #918f94;
    --md-sys-color-outline-variant: #47454a;
    --md-sys-color-primary: #c7bfff;
    --md-sys-color-on-primary: #2e0080;
    --md-sys-color-primary-container: #4521b8;
    --md-sys-color-on-primary-container: #e4ddff;
  }
}

/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité clavier */
.button:focus-visible,
.text-field-input:focus-visible,
.link-button:focus-visible,
.tab-button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}
</style>