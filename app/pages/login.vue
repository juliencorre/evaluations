<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="auth-card">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">
          Se connecter
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Accédez à votre compte sécurisé
        </p>
      </div>

      <!-- Login Form -->
      <form @submit="onSubmit" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Adresse email
          </label>
          <input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            class="form-input"
            :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.email }"
            placeholder="votre@email.com"
          />
          <div v-if="errors.email" class="form-error">
            {{ errors.email }}
          </div>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              :type="showPassword ? 'text' : 'password'"
              class="form-input pr-10"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.password }"
              placeholder="Votre mot de passe"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              class="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
              <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div v-if="errors.password" class="form-error">
            {{ errors.password }}
          </div>
        </div>

        <!-- Remember me and Forgot password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="rememberMe"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="rememberMe" class="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>

          <div class="text-sm">
            <button
              type="button"
              @click="showForgotPassword = true"
              class="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Mot de passe oublié?
            </button>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Erreur de connexion
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ submitError }}
              </div>
            </div>
          </div>
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <CheckCircleIcon class="h-5 w-5 text-green-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Connexion réussie
              </h3>
              <div class="mt-2 text-sm text-green-700">
                {{ successMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- Submit button -->
        <div>
          <button
            type="submit"
            :disabled="isSubmitting || !meta.valid"
            class="btn-primary w-full"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </span>
            <span v-else>Se connecter</span>
          </button>
        </div>
      </form>

      <!-- Register link -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Pas encore de compte?
          <NuxtLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            Créer un compte
          </NuxtLink>
        </p>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div
      v-if="showForgotPassword"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
      @click.self="showForgotPassword = false"
    >
      <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Réinitialiser le mot de passe
          </h3>
          <p class="mt-2 text-sm text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form @submit="onResetPassword" class="space-y-4">
          <div>
            <input
              v-model="resetEmail"
              type="email"
              required
              class="form-input"
              placeholder="votre@email.com"
            />
          </div>

          <div v-if="resetError" class="text-sm text-red-600">
            {{ resetError }}
          </div>

          <div v-if="resetSuccess" class="text-sm text-green-600">
            {{ resetSuccess }}
          </div>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="showForgotPassword = false"
              class="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isResetting"
              class="btn-primary flex-1"
            >
              {{ isResetting ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '../../composables/useAuth'
import { getAuthErrorMessage, SUCCESS_MESSAGES } from '../../utils/errorMessages'

// Set page title
useHead({
  title: 'Connexion - Evaluations'
})

// Form validation schema
const schema = yup.object({
  email: yup.string()
    .required('L\'adresse email est obligatoire')
    .email('L\'adresse email n\'est pas valide'),
  password: yup.string()
    .required('Le mot de passe est obligatoire')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

// Use vee-validate with defineField
const { errors, meta, handleSubmit, defineField } = useForm({
  validationSchema: schema
})

// Form fields with vee-validate binding
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const rememberMe = ref(false)

// UI state
const showPassword = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

// Forgot password modal
const showForgotPassword = ref(false)
const resetEmail = ref('')
const resetError = ref('')
const resetSuccess = ref('')
const isResetting = ref(false)

// Auth composable
const { login, resetPassword } = useAuth()

// Form submission
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''
  
  try {
    const { data, error } = await login(values.email, values.password)
    
    if (error) {
      throw new Error(error)
    }
    
    successMessage.value = SUCCESS_MESSAGES.LOGIN_SUCCESS
    
    // Redirect to dashboard or home after successful login
    setTimeout(() => {
      navigateTo('/')
    }, 1500)
    
  } catch (error) {
    console.error('Login error:', error)
    
    submitError.value = getAuthErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
})

// Reset password submission
const onResetPassword = async (event) => {
  event.preventDefault()
  
  if (!resetEmail.value) {
    resetError.value = 'L\'adresse email est obligatoire'
    return
  }
  
  isResetting.value = true
  resetError.value = ''
  resetSuccess.value = ''
  
  try {
    const { error } = await resetPassword(resetEmail.value)
    
    if (error) {
      throw new Error(error)
    }
    
    resetSuccess.value = 'Un email de réinitialisation a été envoyé à votre adresse email.'
    
    // Close modal after 2 seconds
    setTimeout(() => {
      showForgotPassword.value = false
      resetEmail.value = ''
      resetSuccess.value = ''
    }, 2000)
    
  } catch (error) {
    console.error('Reset password error:', error)
    resetError.value = error.message || 'Une erreur est survenue lors de l\'envoi de l\'email'
  } finally {
    isResetting.value = false
  }
}

// Redirect if already logged in
const { isLoggedIn } = useAuth()
watchEffect(() => {
  if (isLoggedIn.value) {
    navigateTo('/')
  }
})
</script>