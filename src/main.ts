import './utils/consoleLogoControl'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router, preloadCriticalRoutes } from './router'
import './style.css'

// Create pinia store
const pinia = createPinia()

// Create and mount the app
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

// Performance optimizations
const performanceOptimizations = async () => {
  // Preload critical routes
  preloadCriticalRoutes()

  // Lazy load service worker registration and handler
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    const [, { initializeServiceWorkerHandler }] = await Promise.all([
      import('./registerSW'),  // This executes the registration
      import('./utils/serviceWorkerHandler')
    ])

    // Initialize service worker message handler
    initializeServiceWorkerHandler()
  }
}

// Run optimizations after initial app load
if ('requestIdleCallback' in window) {
  const rIC = (window as unknown as { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => void }).requestIdleCallback
  if (rIC) {
    rIC(performanceOptimizations, { timeout: 2000 })
  } else {
    setTimeout(performanceOptimizations, 0)
  }
} else {
  setTimeout(performanceOptimizations, 0)
}
