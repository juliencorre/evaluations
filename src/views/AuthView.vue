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

        <Transition name="fade" mode="out-in">
          <form
            v-if="activeTab === 'signin'"
            key="signin"
            class="auth-form"
            autocomplete="on"
            aria-labelledby="signin-tab"
            @submit.prevent="handleSignIn"
          >
            <p v-if="message && !isSubmitting" class="auth-message" role="status">{{ message }}</p>
            <p v-if="errorMessage && !isSubmitting" class="auth-error" role="alert">{{ errorMessage }}</p>

            <label class="auth-field">
              <span class="auth-label">Adresse e-mail</span>
              <input
                v-model.trim="signInForm.email"
                type="email"
                name="email"
                inputmode="email"
                autocomplete="email"
                required
                :disabled="isFormDisabled"
              />
            </label>

            <label class="auth-field">
              <span class="auth-label">Mot de passe</span>
              <input
                v-model="signInForm.password"
                :type="showSignInPassword ? 'text' : 'password'"
                name="current-password"
                autocomplete="current-password"
                minlength="8"
                required
                :disabled="isFormDisabled"
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

          <form
            v-else-if="activeTab === 'signup'"
            key="signup"
            class="auth-form"
            autocomplete="on"
            aria-labelledby="signup-tab"
            @submit.prevent="handleSignUp"
          >
            <p v-if="message && !isSubmitting" class="auth-message" role="status">{{ message }}</p>
            <p v-if="errorMessage && !isSubmitting" class="auth-error" role="alert">{{ errorMessage }}</p>

            <label class="auth-field">
              <span class="auth-label">Nom complet</span>
              <input
                v-model.trim="signUpForm.fullName"
                type="text"
                name="name"
                autocomplete="name"
                placeholder="Ex : Jeanne Dupont"
                :disabled="isFormDisabled"
              />
            </label>

            <label class="auth-field">
              <span class="auth-label">Adresse e-mail</span>
              <input
                v-model.trim="signUpForm.email"
                type="email"
                name="new-email"
                inputmode="email"
                autocomplete="email"
                required
                :disabled="isFormDisabled"
              />
            </label>

            <label class="auth-field">
              <span class="auth-label">Mot de passe</span>
              <input
                v-model="signUpForm.password"
                :type="showSignUpPassword ? 'text' : 'password'"
                name="new-password"
                autocomplete="new-password"
                minlength="12"
                required
                :disabled="isFormDisabled"
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
              <small class="field-hint">12 caractères minimum avec lettres et chiffres.</small>
            </label>

            <label class="auth-field">
              <span class="auth-label">Confirmation du mot de passe</span>
              <input
                v-model="signUpForm.confirmPassword"
                :type="showSignUpPassword ? 'text' : 'password'"
                name="confirm-password"
                autocomplete="new-password"
                required
                :disabled="isFormDisabled"
              />
            </label>

            <button
              class="auth-submit"
              type="submit"
              :disabled="!canSubmitSignUp || isFormDisabled"
            >
              <span class="material-symbols-outlined" aria-hidden="true">person_add</span>
              <span>{{ isSubmitting ? 'Création du compte...' : 'Créer mon compte' }}</span>
            </button>
          </form>

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

            <p v-if="message && !isSubmitting" class="auth-message" role="status">{{ message }}</p>
            <p v-if="errorMessage && !isSubmitting" class="auth-error" role="alert">{{ errorMessage }}</p>

            <label class="auth-field">
              <span class="auth-label">Adresse e-mail</span>
              <input
                v-model.trim="resetEmail"
                type="email"
                name="recovery-email"
                autocomplete="email"
                required
                :disabled="isFormDisabled"
              />
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
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import type { AuthError } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'signin' | 'signup' | 'forgot'>(getInitialTab())
const isSubmitting = ref(false)
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const showSignInPassword = ref(false)
const showSignUpPassword = ref(false)

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

const resetEmail = ref(getInitialEmail())

const isInitializing = computed(() => authStore.isInitializing.value)
const isFormDisabled = computed(() => isSubmitting.value || isInitializing.value)

watch(
  () => route.query.mode,
  (mode) => {
    if (mode === 'signup') {
      activeTab.value = 'signup'
    } else if (mode === 'forgot') {
      activeTab.value = 'forgot'
    } else {
      activeTab.value = 'signin'
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
      errorMessage.value = translateError(error)
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

const canSubmitSignIn = computed(() => {
  return Boolean(signInForm.email && signInForm.password.length >= 8)
})

const passwordHasLetters = computed(() => /[A-Za-zÀ-ÿ]/.test(signUpForm.password))
const passwordHasNumbers = computed(() => /\d/.test(signUpForm.password))

const canSubmitSignUp = computed(() => {
  return (
    Boolean(signUpForm.email) &&
    signUpForm.password.length >= 12 &&
    passwordHasLetters.value &&
    passwordHasNumbers.value &&
    signUpForm.password === signUpForm.confirmPassword
  )
})

function translateError(error: AuthError | Error) {
  const message = error.message?.toLowerCase?.() ?? ''
  if (message.includes('invalid login')) {
    return 'Adresse e-mail ou mot de passe invalide.'
  }
  if (message.includes('email rate limit')) {
    return 'Vous avez demandé trop d\'e-mails sur une courte période. Veuillez patienter quelques minutes.'
  }
  if (message.includes('password')) {
    return 'Le mot de passe ne respecte pas les critères de sécurité requis.'
  }
  if (message.includes('already registered')) {
    return 'Un compte existe déjà avec cette adresse e-mail. Vous pouvez vous connecter directement.'
  }
  return "Une erreur est survenue. Merci de réessayer ou de contacter le support si le problème persiste."
}

function resetFeedback() {
  message.value = null
  errorMessage.value = null
  authStore.resetError()
}

async function handleSignIn() {
  resetFeedback()
  if (!canSubmitSignIn.value) {
    return
  }

  isSubmitting.value = true
  const { error } = await authStore.signInWithPassword(signInForm.email, signInForm.password)
  isSubmitting.value = false

  if (error) {
    errorMessage.value = translateError(error)
    return
  }

  message.value = 'Connexion réussie. Redirection en cours...'
  signInForm.password = ''
  await router.replace(redirectPath.value)
}

async function handleSignUp() {
  resetFeedback()
  if (!canSubmitSignUp.value) {
    errorMessage.value = 'Veuillez vérifier les informations saisies.'
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
    errorMessage.value = translateError(error)
    return
  }

  message.value =
    'Votre compte a été créé. Un e-mail de confirmation vient de vous être envoyé pour sécuriser votre inscription.'
  signInForm.email = signUpForm.email
  signUpForm.fullName = signUpForm.fullName.trim()
  signUpForm.password = ''
  signUpForm.confirmPassword = ''
  activeTab.value = 'signin'
}

async function handlePasswordReset() {
  resetFeedback()
  if (!resetEmail.value) {
    errorMessage.value = 'Merci d\'indiquer votre adresse e-mail.'
    return
  }

  isSubmitting.value = true
  const { error } = await authStore.sendPasswordReset(resetEmail.value)
  isSubmitting.value = false

  if (error) {
    errorMessage.value = translateError(error)
    return
  }

  message.value =
    'Si cette adresse correspond à un compte existant, un e-mail de réinitialisation vient d\'être envoyé.'
}

function switchTab(tab: 'signin' | 'signup' | 'forgot') {
  resetFeedback()
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
  gap: 32px;
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
  border-radius: 24px;
  box-shadow: var(--md-sys-elevation-level2);
  padding: clamp(24px, 4vw, 40px);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-high);
  padding: 4px;
}

.auth-tab {
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.auth-tab[aria-selected='true'] {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.auth-label {
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.auth-field input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-field input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 24%, transparent);
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 45px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
}

.field-hint {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.875rem;
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
  padding: 0;
}

.auth-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 18px;
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
  box-shadow: var(--md-sys-elevation-level2);
}

.auth-message {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  color: var(--md-sys-color-primary);
  border-radius: 12px;
  padding: 12px 16px;
}

.auth-error {
  background: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
  color: var(--md-sys-color-error);
  border-radius: 12px;
  padding: 12px 16px;
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

  .auth-aside {
    display: none;
  }
}

@media (max-width: 600px) {
  .auth-panel {
    padding: 24px 16px;
  }

  .auth-card {
    padding: 20px;
  }
}
</style>
