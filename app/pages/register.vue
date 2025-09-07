<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="auth-card">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Rejoignez notre plateforme sécurisée d'évaluation
        </p>
      </div>

      <!-- Registration Form -->
      <form @submit="onSubmit" class="space-y-6">
        <!-- Full Name -->
        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">
            Nom complet *
          </label>
          <input
            id="fullName"
            v-model="fullName"
            v-bind="fullNameAttrs"
            type="text"
            class="form-input"
            :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.fullName }"
            placeholder="Votre nom complet"
          />
          <div v-if="errors.fullName" class="form-error">
            {{ errors.fullName }}
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Adresse email *
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
            Mot de passe *
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              :type="showPassword ? 'text' : 'password'"
              class="form-input pr-10"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.password }"
              placeholder="Mot de passe sécurisé"
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
          <!-- Password strength indicator -->
          <div class="mt-2">
            <div class="flex items-center space-x-1">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="passwordStrengthColor"
                  :style="{ width: `${passwordStrengthWidth}%` }"
                ></div>
              </div>
              <span class="text-xs text-gray-500">{{ passwordStrengthText }}</span>
            </div>
          </div>
        </div>

        <!-- Terms and Privacy -->
        <div class="flex items-center">
          <input
            id="terms"
            v-model="acceptTerms"
            v-bind="acceptTermsAttrs"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            J'accepte les 
            <NuxtLink to="/terms" class="text-indigo-600 hover:text-indigo-500">
              conditions d'utilisation
            </NuxtLink>
            et la 
            <NuxtLink to="/privacy" class="text-indigo-600 hover:text-indigo-500">
              politique de confidentialité
            </NuxtLink>
            *
          </label>
        </div>
        <div v-if="errors.acceptTerms" class="form-error">
          {{ errors.acceptTerms }}
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Erreur lors de l'inscription
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
                Inscription réussie
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
              Création en cours...
            </span>
            <span v-else>Créer mon compte</span>
          </button>
        </div>
      </form>

      <!-- Login link -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Vous avez déjà un compte?
          <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Se connecter
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '../../composables/useAuth'
import { getAuthErrorMessage, SUCCESS_MESSAGES, FORM_ERRORS } from '../../utils/errorMessages'

// Set page title
useHead({
  title: 'Inscription - Evaluations'
})

// Form validation schema
const schema = yup.object({
  fullName: yup.string()
    .required('Le nom complet est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: yup.string()
    .required('L\'adresse email est obligatoire')
    .email('L\'adresse email n\'est pas valide'),
  password: yup.string()
    .required('Le mot de passe est obligatoire')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
  acceptTerms: yup.boolean()
    .required('Vous devez accepter les conditions d\'utilisation')
    .isTrue('Vous devez accepter les conditions d\'utilisation')
})

// Use vee-validate with defineField
const { errors, meta, handleSubmit, defineField } = useForm({
  validationSchema: schema
})

// Form fields with vee-validate binding
const [fullName, fullNameAttrs] = defineField('fullName')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [acceptTerms, acceptTermsAttrs] = defineField('acceptTerms')

// UI state
const showPassword = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

// Auth composable
const { register } = useAuth()

// Password strength computation
const passwordStrength = computed(() => {
  if (!password.value) return 0
  
  let score = 0
  const pwd = password.value
  
  // Length
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  
  // Character types
  if (/[a-z]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[@$!%*?&]/.test(pwd)) score++
  
  return score
})

const passwordStrengthWidth = computed(() => {
  return (passwordStrength.value / 6) * 100
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return 'bg-red-500'
  if (strength <= 4) return 'bg-yellow-500'
  return 'bg-green-500'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return 'Faible'
  if (strength <= 4) return 'Moyen'
  return 'Fort'
})

// Form submission
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''
  
  try {
    const { data, error } = await register(
      values.email,
      values.password,
      {
        full_name: values.fullName
      }
    )
    
    if (error) {
      throw new Error(error)
    }
    
    successMessage.value = SUCCESS_MESSAGES.REGISTRATION_SUCCESS
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigateTo('/login')
    }, 3000)
    
  } catch (error) {
    console.error('Registration error:', error)
    submitError.value = getAuthErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
})

// Redirect if already logged in
const { isLoggedIn } = useAuth()
watchEffect(() => {
  if (isLoggedIn.value) {
    navigateTo('/')
  }
})
</script>