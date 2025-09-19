import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: false
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          supabase: ['@supabase/supabase-js'],
          views: [
            'src/views/CompetenciesView.vue',
            'src/views/AnalysisView.vue',
            'src/views/StudentsView.vue'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      srcDir: 'src',
      filename: 'sw/customServiceWorker.ts',
      strategies: 'injectManifest',
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST',
        rollupFormat: 'iife',
        swDest: 'dist/customServiceWorker.js'
      },
      manifest: {
        name: 'App Name - Vue 3 PWA',
        short_name: 'AppName',
        description: 'A minimal yet production-grade Vue 3 Progressive Web Application',
        theme_color: '#4A90E2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['productivity', 'business'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
