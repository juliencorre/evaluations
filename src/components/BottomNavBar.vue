<template>
  <nav v-if="shouldRenderNavigation" class="bottom-nav-bar" role="navigation" aria-label="Navigation principale">
    <div class="nav-destinations">
      <router-link
        to="/welcome"
        class="nav-destination"
        :class="{ active: currentRouteName === ROUTE_NAMES.WELCOME || currentRouteName === ROUTE_NAMES.HOME }"
        :aria-current="(currentRouteName === ROUTE_NAMES.WELCOME || currentRouteName === ROUTE_NAMES.HOME) ? 'page' : undefined"
      >
        <div class="nav-indicator" aria-hidden="true"></div>
        <div class="nav-icon-container">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </div>
        <span class="nav-label">Accueil</span>
      </router-link>

      <router-link
        to="/classes"
        class="nav-destination"
        :class="{ active: currentRouteName === ROUTE_NAMES.CLASSES }"
        :aria-current="currentRouteName === ROUTE_NAMES.CLASSES ? 'page' : undefined"
      >
        <div class="nav-indicator" aria-hidden="true"></div>
        <div class="nav-icon-container">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM12 6.53L3 11l9 4.91L21 11l-9-4.47z" />
          </svg>
        </div>
        <span class="nav-label">Classes</span>
      </router-link>

      <router-link
        to="/evaluations"
        class="nav-destination"
        :class="{ active: currentRouteName === ROUTE_NAMES.EVALUATIONS || currentRouteName === ROUTE_NAMES.EVALUATION_DETAIL }"
        :aria-current="(currentRouteName === ROUTE_NAMES.EVALUATIONS || currentRouteName === ROUTE_NAMES.EVALUATION_DETAIL) ? 'page' : undefined"
      >
        <div class="nav-indicator" aria-hidden="true"></div>
        <div class="nav-icon-container">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 4H7v2h10V7h-5zm0 4H7v2h10v-2h-5zm0 4H7v2h7v-2h-5z" />
          </svg>
        </div>
        <span class="nav-label">Évaluations</span>
      </router-link>

      <router-link
        to="/students"
        class="nav-destination"
        :class="{ active: currentRouteName === ROUTE_NAMES.STUDENTS }"
        :aria-current="currentRouteName === ROUTE_NAMES.STUDENTS ? 'page' : undefined"
      >
        <div class="nav-indicator" aria-hidden="true"></div>
        <div class="nav-icon-container">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <span class="nav-label">Élèves</span>
      </router-link>

      <router-link
        to="/analysis"
        class="nav-destination"
        :class="{ active: currentRouteName === ROUTE_NAMES.ANALYSIS }"
        :aria-current="currentRouteName === ROUTE_NAMES.ANALYSIS ? 'page' : undefined"
      >
        <div class="nav-indicator" aria-hidden="true"></div>
        <div class="nav-icon-container">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
          </svg>
        </div>
        <span class="nav-label">Analyses</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore, isAuthenticated } from '@/stores/authStore'
import { ROUTE_NAMES, AppRouteName } from '@/router/route-names'

const route = useRoute()
const currentRouteName = computed<AppRouteName | undefined>(() => {
  return typeof route.name === 'string' ? (route.name as AppRouteName) : undefined
})

const authStore = useAuthStore()
const shouldRenderNavigation = computed(() => !authStore.isInitializing.value && isAuthenticated.value)
</script>

<style scoped>
/* Bottom Navigation Bar - Material Design 3 */
.bottom-nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px; /* MD3 spec height */
  background: var(--md-sys-color-surface-container);
  border-top: 1px solid var(--md-sys-color-surface-variant);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.08);
}

/* Hide on large screens (>= 840px) */
@media (min-width: 840px) {
  .bottom-nav-bar {
    display: none;
  }
}

/* Navigation destinations container */
.nav-destinations {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  max-width: 600px; /* Limit max width for better appearance on tablets */
  height: 100%;
  gap: 4px;
}

/* Individual destination */
.nav-destination {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 48px;
  max-width: 96px;
  height: 100%;
  padding: 12px 4px 16px 4px;
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  -webkit-tap-highlight-color: transparent;
}

/* Active indicator - pill behind icon */
.nav-indicator {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  width: 64px;
  height: 32px;
  background: var(--md-sys-color-secondary-container);
  border-radius: 16px;
  opacity: 0;
  transition: all var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);
  z-index: 0;
}

.nav-destination.active .nav-indicator {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

/* State layer for touch feedback */
.nav-destination::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  pointer-events: none;
}

.nav-destination:active::before {
  opacity: 0.12;
}

/* Icon container */
.nav-icon-container {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: currentColor;
  transition: transform var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
}

/* Active state - icon bounces slightly */
.nav-destination.active .nav-icon {
  color: var(--md-sys-color-on-secondary-container);
  transform: translateY(-2px);
}

/* Label */
.nav-label {
  position: relative;
  margin-top: 4px;
  font-family: var(--md-sys-typescale-label-medium-font-family);
  font-size: var(--md-sys-typescale-label-medium-font-size);
  font-weight: var(--md-sys-typescale-label-medium-font-weight);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-letter-spacing);
  color: currentColor;
  z-index: 1;
  transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
}

.nav-destination.active .nav-label {
  color: var(--md-sys-color-on-surface);
  font-weight: 600;
}

/* Tablet adjustments (600px - 839px) */
@media (min-width: 600px) and (max-width: 839px) {
  .nav-destinations {
    max-width: 720px;
    padding: 0 24px;
  }

  .nav-destination {
    max-width: 120px;
  }

  .nav-indicator {
    width: 80px;
  }
}

/* Small screen adjustments */
@media (max-width: 360px) {
  .nav-destination {
    min-width: 40px;
    padding: 12px 2px 16px 2px;
  }

  .nav-label {
    font-size: 11px;
  }

  .nav-indicator {
    width: 48px;
  }
}

/* Accessibility - Focus states */
.nav-destination:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: -2px;
  border-radius: 8px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .nav-destination,
  .nav-indicator,
  .nav-icon,
  .nav-label {
    transition: none;
  }
}
</style>