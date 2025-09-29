<template>
  <nav v-if="shouldRenderNavigation" class="navigation-rail" role="navigation" aria-label="Navigation principale">
    <!-- Optional FAB Section (top of rail) -->
    <div class="rail-fab-container">
      <!-- FAB can be added here if needed -->
    </div>

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

    <div class="user-actions">
      <!-- User actions will be added here if needed -->
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
/* Navigation Rail - Material Design 3 */
.navigation-rail {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 80px; /* MD3 fixed width */
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--md-sys-color-surface);
  border-right: 1px solid var(--md-sys-color-surface-variant);
  z-index: 1000;
  padding: 0;
}

/* Only show on large screens (>= 840px) */
@media (max-width: 839px) {
  .navigation-rail {
    display: none;
  }
}

/* FAB container at top */
.rail-fab-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 100%;
}

/* Navigation destinations container */
.nav-destinations {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 0 0 auto;
  width: 100%;
  padding: 0;
  align-items: center;
}

/* Individual destination */
.nav-destination {
  position: relative;
  width: 80px;
  height: 56px; /* MD3 spec height with label */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0 16px 0;
  margin: 0;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* Active indicator - pill shape behind icon */
.nav-indicator {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  width: 56px;
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

/* State layer for hover/pressed */
.nav-destination::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 32px;
  background: var(--md-sys-color-on-surface);
  opacity: 0;
  border-radius: 16px;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  z-index: 0;
  pointer-events: none;
}

.nav-destination:hover::before {
  opacity: 0.08;
}

.nav-destination:active::before {
  opacity: 0.12;
}

/* Don't show hover state on active items */
.nav-destination.active:hover::before,
.nav-destination.active:active::before {
  opacity: 0;
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
  transition: color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
}

/* Active state colors */
.nav-destination.active {
  color: var(--md-sys-color-on-surface);
}

.nav-destination.active .nav-icon {
  color: var(--md-sys-color-on-secondary-container);
}

/* Label */
.nav-label {
  position: relative;
  font-family: var(--md-sys-typescale-label-medium-font-family);
  font-size: var(--md-sys-typescale-label-medium-font-size);
  font-weight: var(--md-sys-typescale-label-medium-font-weight);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-letter-spacing);
  color: currentColor;
  white-space: nowrap;
  text-align: center;
  margin: 0;
  z-index: 1;
  transition: all var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
}

.nav-destination.active .nav-label {
  color: var(--md-sys-color-on-surface);
  font-weight: 600;
}

/* User actions at bottom */
.user-actions {
  margin-top: auto;
  padding: 16px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Focus states */
.nav-destination:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
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