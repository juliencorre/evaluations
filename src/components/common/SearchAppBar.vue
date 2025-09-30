<template>
  <header class="search-app-bar" :class="{ 'search-app-bar--elevated': isScrolled }">
    <!-- Leading Logo -->
    <div class="search-app-bar__leading">
      <button
        v-if="showBackButton"
        class="back-button"
        aria-label="Retour"
        @click="$emit('back')"
      >
        <svg class="back-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </button>
      <button
        v-else
        class="app-logo-button"
        :aria-label="logoAriaLabel"
        @click="$emit('logo-click')"
      >
        <span class="material-symbols-outlined app-logo-icon">{{ logoIcon }}</span>
      </button>
      <slot name="leading"></slot>
    </div>

    <!-- Center Search Field -->
    <div class="search-app-bar__center">
      <div class="search-field">
        <span class="material-symbols-outlined search-field__icon" aria-hidden="true">search</span>
        <input
          :value="searchValue"
          type="search"
          :placeholder="placeholder"
          class="search-field__input"
          :aria-label="ariaLabel"
          @input="$emit('update:search-value', ($event.target as HTMLInputElement)?.value ?? '')"
        />
        <button
          v-if="searchValue"
          class="search-field__clear"
          aria-label="Effacer la recherche"
          @click="$emit('clear-search')"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>

    <!-- Trailing Actions -->
    <div class="search-app-bar__trailing">
      <UserMenu
        v-if="shouldDisplayUserMenu"
        @logout="$emit('logout')"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UserMenu from './UserMenu.vue'
import { useAuthStore, isAuthenticated } from '@/stores/authStore'

interface Props {
  searchValue: string
  placeholder?: string
  ariaLabel?: string
  logoIcon?: string
  logoAriaLabel?: string
  isScrolled?: boolean
  showBackButton?: boolean
}
interface Emits {
  (e: 'update:search-value', value: string): void
  (e: 'clear-search'): void
  (e: 'logo-click'): void
  (e: 'logout'): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Rechercher...',
  ariaLabel: 'Rechercher',
  logoIcon: 'school',
  logoAriaLabel: 'Accueil',
  isScrolled: false,
  showBackButton: false
})

defineEmits<Emits>()

// Debug
console.log('SearchAppBar showBackButton:', props.showBackButton)

const authStore = useAuthStore()
const shouldDisplayUserMenu = computed(
  () => isAuthenticated.value && !authStore.isInitializing.value
)
</script>

<style scoped>
/* Material 3 Search App Bar */
.search-app-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 8px 4px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  position: fixed;
  top: 0;
  left: 80px; /* Start after navigation rail */
  right: 0;
  z-index: 1000;
  transition: all var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
}

/* On small screens, start from left edge */
@media (max-width: 839px) {
  .search-app-bar {
    left: 0;
  }
}

.search-app-bar--elevated {
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level2);
}

/* Leading section with logo */
.search-app-bar__leading {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.app-logo-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: #1D1B20;
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  position: relative;
}

.app-logo-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-primary);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.app-logo-button:hover::before {
  opacity: var(--md-filled-button-hover-state-layer-opacity);
}

.app-logo-button:focus {
  outline: none;
}

.app-logo-button:focus::before {
  opacity: var(--md-filled-button-focus-state-layer-opacity);
}

.app-logo-button:active::before {
  opacity: var(--md-filled-button-pressed-state-layer-opacity);
}

.app-logo-icon {
  font-size: 24px;
  z-index: 1;
}

/* Center search field */
.search-app-bar__center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 560px;
  height: 48px;
  padding: 0 16px;
  background: var(--md-sys-color-surface-container-highest);
  border-radius: var(--md-sys-shape-corner-extra-large);
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.search-field:focus-within {
  background: var(--md-sys-color-surface-container-high);
  box-shadow: 0 0 0 2px var(--md-sys-color-primary);
}

.search-field__icon {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 24px;
  flex-shrink: 0;
}

.search-field__input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--md-sys-typescale-body-large-font-family);
  font-size: var(--md-sys-typescale-body-large-font-size);
  font-weight: var(--md-sys-typescale-body-large-font-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-letter-spacing);
  color: var(--md-sys-color-on-surface);
  outline: none;
}

.search-field__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.search-field__input::-webkit-search-cancel-button {
  display: none;
}

.search-field__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  flex-shrink: 0;
  position: relative;
}

.search-field__clear::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.search-field__clear:hover::before {
  opacity: var(--md-text-button-hover-state-layer-opacity);
}

.search-field__clear:focus::before {
  opacity: var(--md-text-button-focus-state-layer-opacity);
}

.search-field__clear:active::before {
  opacity: var(--md-text-button-pressed-state-layer-opacity);
}

.search-field__clear .material-symbols-outlined {
  font-size: 24px;
}

/* Trailing section with actions */
.search-app-bar__trailing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: #49454F;
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  position: relative;
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.icon-button:hover::before {
  opacity: var(--md-icon-button-hover-state-layer-opacity);
}

.icon-button:focus {
  outline: none;
}

.icon-button:focus::before {
  opacity: var(--md-icon-button-focus-state-layer-opacity);
}

.icon-button .material-symbols-outlined {
  font-size: 24px;
  z-index: 1;
}


/* Large screens - show all trailing icons */
@media (min-width: 1280px) {
  .search-app-bar__trailing {
    gap: 8px;
  }
}

/* Medium screens - limit trailing icons */
@media (max-width: 1279px) and (min-width: 768px) {
  .search-app-bar__trailing .icon-button:nth-child(n+3) {
    display: none;
  }
}

/* Small screens - responsive layout */
@media (max-width: 767px) {
  .search-app-bar {
    padding: 8px 0;
  }

  .search-app-bar__leading {
    padding: 0 8px;
  }

  .search-app-bar__center {
    padding: 0 8px;
  }

  .search-app-bar__trailing {
    padding: 0 8px;
  }

  .search-app-bar__trailing .icon-button:not(:first-child) {
    display: none;
  }

  .app-logo-button,
  .icon-button,
  .back-button {
    width: 40px;
    height: 40px;
  }

  .app-logo-icon {
    font-size: 24px;
  }

  .icon-button .material-symbols-outlined {
    font-size: 24px;
  }

  .search-field {
    height: 40px;
    padding: 0 12px;
  }

  .search-field__icon {
    font-size: 24px;
  }

  .search-field__input {
    font-size: 14px;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .search-app-bar__center {
    padding: 0 4px;
  }

  .search-field {
    padding: 0 8px;
    gap: 8px;
  }
}

.back-button {
  display: flex !important;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: #1D1B20 !important;
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-spring);
  position: relative;
  opacity: 1 !important;
  visibility: visible !important;
}

.back-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.back-button:hover::before {
  opacity: var(--md-icon-button-hover-state-layer-opacity);
}

.back-button:focus {
  outline: none;
}

.back-button:focus::before {
  opacity: var(--md-icon-button-focus-state-layer-opacity);
}

.back-icon {
  width: 24px !important;
  height: 24px !important;
  z-index: 1;
  fill: #1D1B20 !important;
  color: #1D1B20 !important;
  opacity: 1 !important;
  visibility: visible !important;
}</style>

