// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@vee-validate/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Private keys (only available on server-side)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    
    // Public keys (exposed to client-side)
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'your_supabase_project_url',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key',
    }
  },

  app: {
    head: {
      title: 'Evaluations App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Secure evaluation platform with modern authentication' }
      ]
    }
  }
})
