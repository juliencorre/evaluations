/**
 * Authentication middleware
 * Redirects unauthenticated users to the login page
 * Can be applied to pages that require authentication
 */
import { useAuth } from '../../composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, loading } = useAuth()

  // Wait for auth initialization
  if (loading.value) {
    return
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/login',
      query: { 
        redirect: to.fullPath 
      }
    })
  }
})