<template>
  <div class="auth-callback">
    <div class="auth-callback-card" role="status" :aria-live="status === 'error' ? 'assertive' : 'polite'">
      <span class="material-symbols-outlined callback-icon" :class="status">
        {{ status === 'error' ? 'error' : status === 'success' ? 'check_circle' : 'sync' }}
      </span>
      <h1 class="callback-title">
        {{ status === 'error' ? 'Échec de la connexion' : 'Connexion en cours' }}
      </h1>
      <p class="callback-message">{{ statusMessage }}</p>
      <button
        v-if="status === 'error'"
        type="button"
        class="callback-button"
        @click="goBackToAuth"
      >
        Retourner à l'écran de connexion
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { ROUTE_NAMES } from '@/router/route-names'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref<'loading' | 'success' | 'error'>('loading')
const statusMessage = ref('Vérification de votre session sécurisée...')

const sanitizeRedirectPath = (value: unknown) => {
  const candidate = Array.isArray(value) ? value[0] : value
  if (typeof candidate === 'string' && candidate.startsWith('/')) {
    return candidate
  }
  return '/welcome'
}

const redirectTarget = sanitizeRedirectPath(route.query.redirect)

const exchangeTokenFromUrl = async () => {
  const hasCodeParam = typeof route.query.code === 'string'
  const hasAccessTokenHash = typeof window !== 'undefined' && window.location.hash.includes('access_token')

  if (hasCodeParam || hasAccessTokenHash) {
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
    if (error) {
      throw error
    }
  }
}

onMounted(async () => {
  try {
    if (typeof route.query.error_description === 'string') {
      throw new Error(route.query.error_description)
    }

    await exchangeTokenFromUrl()
    await authStore.ensureInitialized()

    status.value = 'success'
    statusMessage.value = 'Authentification réussie. Vous allez être redirigé(e)...'

    setTimeout(async () => {
      await router.replace(redirectTarget)
    }, 800)
  } catch (error) {
    console.error('Erreur lors de la récupération de la session Supabase', error)
    status.value = 'error'
    statusMessage.value =
      "Nous n'avons pas pu finaliser la connexion. Le lien a peut-être expiré ou a déjà été utilisé."
  }
})

function goBackToAuth() {
  void router.replace({ name: ROUTE_NAMES.AUTH, query: { redirect: redirectTarget } })
}
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-sys-color-surface);
  padding: 24px;
}

.auth-callback-card {
  background: var(--md-sys-color-surface-container);
  border-radius: 24px;
  padding: clamp(24px, 4vw, 40px);
  max-width: 420px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--md-sys-elevation-level2);
}

.callback-icon {
  font-size: 48px;
  color: var(--md-sys-color-primary);
  animation: spin 1.4s linear infinite;
}

.callback-icon.success {
  animation: none;
  color: var(--md-sys-color-secondary);
}

.callback-icon.error {
  animation: none;
  color: var(--md-sys-color-error);
}

.callback-title {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font-size: 1.5rem;
}

.callback-message {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.callback-button {
  align-self: center;
  padding: 12px 18px;
  border-radius: 999px;
  border: none;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font-weight: 600;
  cursor: pointer;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
