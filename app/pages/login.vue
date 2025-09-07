<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="auth-card">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">
          Se connecter
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Accédez à votre compte
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="onSubmit" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Adresse email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="form-input"
            placeholder="votre@email.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="form-input"
            placeholder="Votre mot de passe"
          />
        </div>

        <!-- Submit button -->
        <div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary w-full"
          >
            <span v-if="isSubmitting">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </button>
        </div>
      </form>

      <!-- Error message -->
      <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>

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
  </div>
</template>

<script setup>
// Set page title
useHead({
  title: 'Connexion - Evaluations'
})

// Auth composable
const { login, isLoggedIn } = useAuth()

// Form fields
const email = ref('')
const password = ref('')

// UI state
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Redirect if already logged in
watchEffect(() => {
  if (isLoggedIn.value) {
    navigateTo('/')
  }
})

// Form submission
const onSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const { data, error } = await login(email.value, password.value)
    
    if (error) {
      errorMessage.value = error
    } else {
      successMessage.value = 'Connexion réussie !'
      
      // Redirect to home or stored redirect URL
      const route = useRoute()
      const redirectTo = route.query.redirect || '/'
      setTimeout(() => navigateTo(redirectTo), 1000)
    }
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue'
  } finally {
    isSubmitting.value = false
  }
}
</script>