import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: false, // Disable CSS code splitting to inline critical CSS
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          supabase: ['@supabase/supabase-js'],
          charts: ['chart.js'],
          pdf: ['jspdf', 'html2canvas'],
          views: [
            'src/views/CompetenciesView.vue',
            'src/views/AnalysisView.vue',
            'src/views/StudentsView.vue'
          ]
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.')
          const extType = info?.[info.length - 1]
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? '')) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (extType === 'css') {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
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
