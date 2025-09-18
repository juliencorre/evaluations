<template>
  <header class="app-header" :class="{ 'expanded': isExpanded }">
    <!-- Top App Bar -->
    <nav class="top-app-bar" role="navigation" aria-label="Navigation principale">
      <!-- Navigation Rail (Desktop) -->
      <div class="navigation-rail" :class="{ 'expanded': isExpanded }">
        <div class="brand-section">
          <!-- Menu toggle button -->
          <button
            class="rail-menu-button"
            aria-label="Toggle navigation menu"
            @click="toggleExpanded"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
            </svg>
            <svg class="chevron-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </button>
        </div>

        <div class="nav-destinations">
          <router-link
            to="/"
            class="nav-destination"
            :class="{ active: currentRouteName === ROUTE_NAMES.HOME }"
            :aria-current="currentRouteName === ROUTE_NAMES.HOME ? 'page' : undefined"
          >
            <div class="nav-indicator" aria-hidden="true"></div>
            <div class="nav-icon-container">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                />
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
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </div>
            <span class="nav-label">Élèves</span>
          </router-link>

          <router-link
            to="/competencies"
            class="nav-destination"
            :class="{ active: currentRouteName === ROUTE_NAMES.COMPETENCIES }"
            :aria-current="currentRouteName === ROUTE_NAMES.COMPETENCIES ? 'page' : undefined"
          >
            <div class="nav-indicator" aria-hidden="true"></div>
            <div class="nav-icon-container">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </div>
            <span class="nav-label">Compétences</span>
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
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
            </div>
            <span class="nav-label">Analyses</span>
          </router-link>

          <router-link
            to="/settings"
            class="nav-destination"
            :class="{ active: currentRouteName === ROUTE_NAMES.SETTINGS }"
            :aria-current="currentRouteName === ROUTE_NAMES.SETTINGS ? 'page' : undefined"
          >
            <div class="nav-indicator" aria-hidden="true"></div>
            <div class="nav-icon-container">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.11-.21-.36-.3-.58-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.14A.57.57 0 0 0 14.4 2h-4.8a.57.57 0 0 0-.56.5l-.36 2.14c-.59.24-1.12.56-1.62.94l-2.39-.96a.54.54 0 0 0-.58.22l-1.92 3.32c-.11.21-.06.48.12.62l2.03 1.58c-.05.31-.08.63-.08.94s.03.63.08.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.11.21.36.3.58.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.14c.04.28.28.5.56.5h4.8c.29 0 .53-.22.56-.5l.36-2.14c.59-.24 1.12-.56 1.62-.94l2.39.96c.22.09.47-.01.58-.22l1.92-3.32c.11-.21.06-.48-.12-.62zm-7.14 2.56a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
                />
              </svg>
            </div>
            <span class="nav-label">Paramètres</span>
          </router-link>
        </div>

        <div class="user-actions">
        </div>
      </div>

      <!-- Mobile Header - Hidden -->
      <div class="mobile-header" style="display: none;">
      </div>
    </nav>

    <!-- Navigation Drawer (Mobile) - Hidden -->
    <div style="display: none;">
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTE_NAMES } from '../router'

type AppRouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]

const route = useRoute()
const currentRouteName = computed<AppRouteName | undefined>(() => {
  return typeof route.name === 'string' ? (route.name as AppRouteName) : undefined
})

// State for expanded navigation rail
const isExpanded = ref(false)

// Emit events
const emit = defineEmits<{
  'rail-expanded': [expanded: boolean]
}>()

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

// Watch for changes and emit events
watch(isExpanded, (expanded) => {
  emit('rail-expanded', expanded)
}, { immediate: true })
</script>

<style scoped>
/* App Header */
.app-header {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--md-sys-color-surface-container, #f0f4f3);
}

/* Large Screen Navigation Rail (Left Side) */
@media (min-width: 1440px) {
  .app-header {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: auto;
    width: 80px;
    background: var(--md-sys-color-surface-container, #f0f4f3);
    box-shadow:
      1px 0px 3px 1px rgba(0, 0, 0, 0.15),
      1px 0px 2px 0px rgba(0, 0, 0, 0.3);
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app-header.expanded {
    width: 220px; /* Expanded width */
  }

  .top-app-bar {
    height: 100%;
    width: 100%;
    background: var(--md-sys-color-surface-container, #f0f4f3);
    box-shadow: none;
  }

  .navigation-rail {
    flex-direction: column;
    padding: 24px 12px;
    height: 100%;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .navigation-rail.expanded {
    align-items: flex-start;
    padding: 24px 16px;
  }

  .brand-section {
    margin-bottom: 24px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .navigation-rail.expanded .brand-section {
    justify-content: flex-start;
  }

  .user-actions {
    margin-top: auto;
  }
}

/* Menu Button - Only visible on large screens with rail */
.rail-menu-button {
  display: none !important; /* Force hidden by default */
}

@media (min-width: 1440px) {
  .rail-menu-button {
    display: flex !important; /* Force visible only on large screens */
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: none;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    position: relative;
    overflow: hidden;
  }

  .rail-menu-button:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  }

  .rail-menu-button .menu-icon,
  .rail-menu-button .chevron-icon {
    width: 24px;
    height: 24px;
    position: absolute;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .rail-menu-button .chevron-icon {
    opacity: 0;
    transform: rotate(0deg);
  }

  .navigation-rail.expanded .rail-menu-button .menu-icon {
    opacity: 0;
  }

  .navigation-rail.expanded .rail-menu-button .chevron-icon {
    opacity: 1;
    transform: rotate(180deg);
  }

  .nav-destinations {
    flex-direction: column;
    gap: 12px;
    flex: 0 !important;
    width: auto;
    justify-content: flex-start !important;
    align-items: center;
  }

  .nav-destination {
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
    border-radius: 16px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin: 0 auto;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    --nav-item-padding-inline: 0px;
    --nav-item-padding-block: 12px;
    --nav-indicator-width: 56px;
    --nav-indicator-height: 32px;
    --nav-indicator-left: 50%;
    --nav-indicator-translate-x: -50%;
  }

  .navigation-rail.expanded .nav-destination {
    width: 100%;
    margin: 0;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    --nav-item-padding-inline: 16px;
    --nav-item-padding-block: 12px;
    --nav-indicator-width: 100%;
    --nav-indicator-height: 48px;
    --nav-indicator-left: 50%;
    --nav-indicator-translate-x: -50%;
  }

  .nav-label {
    display: none;
    font-size: 14px;
    font-weight: 500;
    color: currentColor;
    white-space: nowrap;
    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .navigation-rail.expanded .nav-label {
    display: block;
    opacity: 1;
  }

  .navigation-rail.expanded .nav-indicator {
    border-radius: 24px;
  }

  .nav-icon-container {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .user-actions {
    margin-top: auto;
  }
}

/* Bottom App Bar */
.top-app-bar {
  background: var(--md-sys-color-surface-container, #f0f4f3);
  box-shadow:
    0px -1px 3px 1px rgba(0, 0, 0, 0.15),
    0px -1px 2px 0px rgba(0, 0, 0, 0.3);
  width: 100%;
  position: relative;
}

/* Navigation Rail (Desktop) */
.navigation-rail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  min-height: 64px;
  width: 100%;
  background: var(--md-sys-color-surface-container, #f0f4f3);
}

.brand-section {
  flex-shrink: 0;
}

.brand-title {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 1.375rem;
  font-weight: 400;
  line-height: 1.75rem;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.nav-destinations {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
}

.nav-destination {
  --nav-icon-size: 32px;
  --nav-item-padding-inline: 12px;
  --nav-item-padding-block: 6px;
  --nav-indicator-width: 56px;
  --nav-indicator-height: 32px;
  --nav-indicator-left: 50%;
  --nav-indicator-translate-x: -50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--nav-item-padding-block) var(--nav-item-padding-inline);
  min-width: 64px;
  min-height: 56px;
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  border-radius: 16px;
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  letter-spacing: 0.5px;
  position: relative;
  transition:
    color 0.2s cubic-bezier(0.2, 0, 0, 1),
    background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.nav-destination:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.nav-destination:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.nav-destination.active {
  color: var(--md-sys-color-on-secondary-container);
}

.nav-destination.active .nav-icon {
  color: var(--md-sys-color-on-secondary-container);
}

.nav-destination.active .nav-label {
  color: var(--md-sys-color-on-secondary-container);
  font-weight: 700;
}

.nav-indicator {
  position: absolute;
  top: calc(var(--nav-item-padding-block) + (var(--nav-icon-size) / 2));
  left: var(--nav-indicator-left);
  width: var(--nav-indicator-width);
  height: var(--nav-indicator-height);
  background: var(--md-sys-color-secondary-container);
  border-radius: 16px;
  opacity: 0;
  transform: translateX(var(--nav-indicator-translate-x)) translateY(-50%) scaleX(0);
  transform-origin: center;
  transition:
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.nav-destination.active .nav-indicator {
  opacity: 1;
  transform: translateX(var(--nav-indicator-translate-x)) translateY(-50%) scaleX(1);
}

.nav-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--nav-icon-size);
  height: var(--nav-icon-size);
  z-index: 1;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: currentColor;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.nav-label {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-align: center;
  z-index: 1;
  position: relative;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.icon-button:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  color: var(--md-sys-color-on-surface);
}

.icon-button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.action-icon {
  width: 24px;
  height: 24px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--md-sys-color-primary-container);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  color: var(--md-sys-color-on-primary-container);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.user-avatar:hover {
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-primary-container) 92%,
    var(--md-sys-color-on-primary-container) 8%
  );
}

.user-avatar:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.avatar-icon {
  width: 18px;
  height: 18px;
}

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  min-height: 64px;
  width: 100%;
  background: var(--md-sys-color-surface);
}

.nav-drawer-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: none;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  color: var(--md-sys-color-on-surface);
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.nav-drawer-button:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.nav-drawer-button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.menu-icon {
  width: 24px;
  height: 24px;
}

.mobile-title {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 1.375rem;
  font-weight: 400;
  line-height: 1.75rem;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.mobile-user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--md-sys-color-primary-container);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  color: var(--md-sys-color-on-primary-container);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.mobile-user-avatar:hover {
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-primary-container) 92%,
    var(--md-sys-color-on-primary-container) 8%
  );
}

.mobile-user-avatar:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

/* Navigation Drawer (Mobile) */
.navigation-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 360px;
  max-width: 80vw;
  background: var(--md-sys-color-surface) !important;
  background-color: var(--md-sys-color-surface) !important;
  box-shadow:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  z-index: 1100;
  transform: translateX(-100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  visibility: hidden;
}

.navigation-drawer.is-open {
  transform: translateX(0);
  visibility: visible;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  background: var(--md-sys-color-surface);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
}

.drawer-title {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.close-button:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  color: var(--md-sys-color-on-surface);
}

.close-button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.close-icon {
  width: 24px;
  height: 24px;
}

.drawer-nav {
  flex: 1;
  padding: 12px 0;
  background: var(--md-sys-color-surface);
}

.drawer-destination {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  gap: 12px;
  min-height: 56px;
  border-radius: 0 28px 28px 0;
  margin-right: 12px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.drawer-destination:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  color: var(--md-sys-color-on-surface);
}

.drawer-destination:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.drawer-destination.active {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.drawer-destination.active .drawer-icon {
  color: var(--md-sys-color-on-secondary-container);
}

.drawer-destination.active .drawer-label {
  font-weight: 600;
  color: var(--md-sys-color-on-secondary-container);
}

.drawer-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.drawer-icon {
  width: 24px;
  height: 24px;
  color: currentColor;
}

.drawer-label {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
}

.drawer-divider {
  border: none;
  border-top: 1px solid var(--md-sys-color-outline-variant);
  margin: 8px 24px;
}

.drawer-actions {
  padding: 12px 0 24px 0;
  background: var(--md-sys-color-surface);
}

.drawer-action {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: none;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  gap: 12px;
  min-height: 56px;
  width: 100%;
  cursor: pointer;
  text-align: left;
  border-radius: 0 28px 28px 0;
  margin-right: 12px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.drawer-action:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
  color: var(--md-sys-color-on-surface);
}

.drawer-action:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

/* Scrim (Mobile overlay) */
.drawer-scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1050;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-scrim.is-visible {
  opacity: 1;
  visibility: visible;
}

/* Responsive Design */
@media (min-width: 600px) and (max-width: 1439px) {
  .nav-destinations {
    gap: 16px;
  }

  .nav-destination {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 12px;
    min-width: 104px;
    --nav-item-padding-inline: 16px;
    --nav-item-padding-block: 8px;
    --nav-indicator-left: calc(var(--nav-item-padding-inline) + (var(--nav-icon-size) / 2));
    --nav-indicator-width: 64px;
  }

  .nav-label {
    text-align: left;
  }
}

@media (max-width: 599px) {
  .navigation-rail {
    padding: 0 16px;
  }

  .nav-destinations {
    gap: 12px;
  }

  .nav-destination {
    min-width: 56px;
    --nav-item-padding-inline: 8px;
    --nav-item-padding-block: 4px;
    --nav-indicator-width: 56px;
  }

  .nav-label {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .navigation-rail {
    padding: 0 8px;
  }

  .nav-destinations {
    gap: 8px;
  }

  .nav-destination {
    min-width: 48px;
    --nav-item-padding-inline: 6px;
    --nav-icon-size: 28px;
    --nav-indicator-width: 48px;
    --nav-indicator-height: 28px;
  }

  .nav-label {
    font-size: 0.5rem;
    line-height: 0.75rem;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
  }
}

/* Dark Theme */
html[data-theme='dark'] .navigation-drawer,
html[data-theme='dark'] .drawer-content {
  background: var(--md-sys-color-surface-container);
}

html:not([data-theme]) .navigation-drawer,
html:not([data-theme]) .drawer-content {
  background: var(--md-sys-color-surface-container);
}

/* Focus States for Accessibility */
@media (prefers-reduced-motion: no-preference) {
  .nav-destination,
  .drawer-destination,
  .icon-button,
  .user-avatar,
  .mobile-user-avatar,
  .nav-drawer-button,
  .close-button,
  .drawer-action {
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
