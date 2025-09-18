import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
      'generate-icons.js',
      'lighthouserc.js'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue']
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'writable',
        require: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        ServiceWorker: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
        ExtendableMessageEvent: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        DragEvent: 'readonly',
        localStorage: 'readonly',
        Blob: 'readonly',
        confirm: 'readonly',
        Event: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        KeyboardEvent: 'readonly',
        FocusEvent: 'readonly',
        FileReader: 'readonly',
        alert: 'readonly'
      }
    },
    plugins: {
      vue,
      '@typescript-eslint': typescript
    },
    rules: {
      ...vue.configs['vue3-recommended'].rules,
      ...typescript.configs.recommended.rules,
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
]
