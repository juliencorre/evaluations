import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['node_modules', 'dist', 'e2e/**'],
    coverage: {
      reporter: ['text', 'json', 'html']
    },
    env: {
      VITEST: 'true',
      NODE_ENV: 'test'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
