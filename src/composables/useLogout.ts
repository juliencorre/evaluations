import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ROUTE_NAMES } from '@/router/route-names'

export function useLogout() {
  const router = useRouter()

  const logout = async () => {
    try {
      const authStore = useAuthStore()

      console.log('[useLogout] Début de la déconnexion')

      // Effacer la session utilisateur
      const { error } = await authStore.signOut()

      if (error) {
        console.error('[useLogout] Erreur lors de la déconnexion:', error)
        // Même en cas d'erreur, on continue le processus de déconnexion
      } else {
        console.log('[useLogout] Déconnexion réussie côté serveur')
      }

      // Forcer la navigation vers la page de connexion
      console.log('[useLogout] Redirection vers la page de connexion')

      // Utiliser replace pour éviter de pouvoir revenir en arrière
      await router.replace({
        name: ROUTE_NAMES.AUTH,
        query: { from: 'logout' }
      })

      console.log('[useLogout] Navigation terminée')

      return { success: !error, error }
    } catch (err) {
      console.error('[useLogout] Erreur inattendue lors de la déconnexion:', err)

      // En cas d'erreur inattendue, forcer quand même la redirection
      try {
        await router.replace({
          name: ROUTE_NAMES.AUTH,
          query: { from: 'logout', error: 'unexpected' }
        })
      } catch (navError) {
        console.error('[useLogout] Erreur lors de la navigation:', navError)
        // Dernier recours : recharger la page
        window.location.href = '/auth'
      }

      return { success: false, error: err }
    }
  }

  return {
    logout
  }
}