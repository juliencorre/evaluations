<template>
  <header class="app-header">
    <!-- Top App Bar -->
    <nav class="top-app-bar" role="navigation" aria-label="Navigation principale">
      <!-- Navigation Rail (Desktop) -->
      <div class="navigation-rail">
        <div class="brand-section">
          <h1 class="brand-title">Évaluations</h1>
        </div>

        <div class="nav-destinations">
          <router-link to="/" class="nav-destination" :class="{ active: $route.name === 'home' }" aria-current="page">
            <div class="nav-indicator"></div>
            <div class="nav-icon-container">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <span class="nav-label">Tableaux</span>
          </router-link>

          <router-link to="/students" class="nav-destination" :class="{ active: $route.name === 'students' }">
            <div class="nav-indicator"></div>
            <div class="nav-icon-container">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span class="nav-label">Élèves</span>
          </router-link>

          <router-link to="/competencies" class="nav-destination" :class="{ active: $route.name === 'competencies' }">
            <div class="nav-indicator"></div>
            <div class="nav-icon-container">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="nav-label">Compétences</span>
          </router-link>

          <a href="#" class="nav-destination">
            <div class="nav-indicator"></div>
            <div class="nav-icon-container">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <span class="nav-label">Analyses</span>
          </a>
        </div>

        <div class="user-actions">
          <button class="icon-button" type="button" aria-label="Paramètres">
            <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>

          <button class="user-avatar" type="button" aria-label="Profil utilisateur">
            <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Header -->
      <div class="mobile-header">
        <button
          class="nav-drawer-button"
          type="button"
          aria-label="Ouvrir le menu de navigation"
          @click="toggleMobileMenu"
        >
          <svg class="menu-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
          </svg>
        </button>

        <h1 class="mobile-title">Évaluations</h1>

        <button class="mobile-user-avatar" type="button" aria-label="Profil">
          <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z"/>
          </svg>
        </button>
      </div>
    </nav>

    <!-- Navigation Drawer (Mobile) -->
    <div class="navigation-drawer" :class="{ 'is-open': isMobileMenuOpen }" @click="closeMobileMenu">
      <div class="drawer-content" @click.stop>
        <div class="drawer-header">
          <h2 class="drawer-title">Navigation</h2>
          <button class="close-button" @click="closeMobileMenu" aria-label="Fermer le menu">
            <svg class="close-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>

        <nav class="drawer-nav">
          <router-link to="/" class="drawer-destination" :class="{ active: $route.name === 'home' }" @click="closeMobileMenu">
            <div class="drawer-icon-container">
              <svg class="drawer-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <span class="drawer-label">Tableaux d'évaluation</span>
          </router-link>

          <router-link to="/students" class="drawer-destination" :class="{ active: $route.name === 'students' }" @click="closeMobileMenu">
            <div class="drawer-icon-container">
              <svg class="drawer-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span class="drawer-label">Élèves</span>
          </router-link>

          <router-link to="/competencies" class="drawer-destination" :class="{ active: $route.name === 'competencies' }" @click="closeMobileMenu">
            <div class="drawer-icon-container">
              <svg class="drawer-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="drawer-label">Compétences</span>
          </router-link>

          <a href="#" class="drawer-destination" @click="closeMobileMenu">
            <div class="drawer-icon-container">
              <svg class="drawer-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <span class="drawer-label">Analyses</span>
          </a>
        </nav>

        <div class="drawer-divider"></div>

        <div class="drawer-actions">
          <button class="drawer-action" @click="closeMobileMenu">
            <div class="drawer-icon-container">
              <svg class="drawer-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </div>
            <span class="drawer-label">Paramètres</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Scrim (Mobile overlay) -->
    <div class="drawer-scrim" :class="{ 'is-visible': isMobileMenuOpen }" @click="closeMobileMenu"></div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<style scoped>
/* Material Design 3 Variables */
:root {
  --md-sys-color-primary: #006A6B;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #6FF7F5;
  --md-sys-color-on-primary-container: #002020;
  --md-sys-color-secondary-container: #CCE8E7;
  --md-sys-color-on-secondary-container: #041F1F;
  --md-sys-color-surface: #FEFEFE;
  --md-sys-color-on-surface: #1B1C1C;
  --md-sys-color-surface-container: #F0F4F3;
  --md-sys-color-surface-container-low: #F5F9F8;
  --md-sys-color-surface-variant: #DBE4E4;
  --md-sys-color-on-surface-variant: #3F4948;
  --md-sys-color-outline: #6F7978;
  --md-sys-color-outline-variant: #BFC8C7;
  --md-elevation-level-0: none;
  --md-elevation-level-1: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);
  --md-elevation-level-2: 0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);
}

/* App Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #FFFFFF;
}

/* Top App Bar */
.top-app-bar {
  background: #FFFFFF;
  box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);
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
  background: #FFFFFF;
}

.brand-section {
  flex-shrink: 0;
}

.brand-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.375rem;
  font-weight: 400;
  line-height: 1.75rem;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.nav-destinations {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-destination {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 12px;
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  border-radius: 16px;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  letter-spacing: 0.5px;
  gap: 4px;
  min-width: 64px;
  min-height: 56px;
  transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
  position: relative;
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
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 32px;
  background: var(--md-sys-color-secondary-container);
  border-radius: 16px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.2, 0.0, 0, 1.0);
  z-index: 0;
}

.nav-destination.active .nav-indicator {
  opacity: 1;
}

.nav-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  z-index: 2;
  position: relative;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: currentColor;
}

.nav-label {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-align: center;
  z-index: 2;
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
  transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
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
  transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
}

.user-avatar:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-primary-container) 92%, var(--md-sys-color-on-primary-container) 8%);
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
  background: #FFFFFF;
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
  transition: background-color 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
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
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
}

.mobile-user-avatar:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-primary-container) 92%, var(--md-sys-color-on-primary-container) 8%);
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
  background: #FFFFFF !important;
  background-color: #FFFFFF !important;
  box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);
  z-index: 1100;
  transform: translateX(-100%);
  transition: transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
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
  background: #FFFFFF;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #E0E0E0;
  background: #FFFFFF;
}

.drawer-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
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
  background: #FFFFFF;
}

.drawer-destination {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  gap: 12px;
  min-height: 56px;
  border-radius: 0 28px 28px 0;
  margin-right: 12px;
  transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
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
  background: #FFFFFF;
}

.drawer-action {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: none;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
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
  transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.drawer-scrim.is-visible {
  opacity: 1;
  visibility: visible;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .navigation-rail {
    padding: 0 16px;
  }

  .nav-destinations {
    gap: 2px;
  }

  .nav-destination {
    min-width: 56px;
    padding: 4px 8px;
  }
}

@media (max-width: 768px) {
  .navigation-rail {
    display: none;
  }

  .mobile-header {
    display: flex;
    background: #FFFFFF;
  }

  .top-app-bar {
    min-height: 64px;
    background: #FFFFFF;
  }

  .navigation-drawer {
    background: #FFFFFF !important;
  }

  .drawer-content {
    background: #FFFFFF !important;
  }
}

@media (max-width: 480px) {
  .mobile-header {
    padding: 0 12px;
    min-height: 56px;
    background: #FFFFFF !important;
  }

  .mobile-title {
    font-size: 1.25rem;
    line-height: 1.5rem;
  }

  .navigation-drawer {
    width: 320px;
    background: #FFFFFF !important;
  }

  .drawer-content {
    background: #FFFFFF !important;
  }

  .drawer-header {
    padding: 12px 20px;
    background: #FFFFFF !important;
  }

  .drawer-nav {
    background: #FFFFFF !important;
  }

  .drawer-actions {
    background: #FFFFFF !important;
  }

  .drawer-destination,
  .drawer-action {
    padding: 10px 20px;
    min-height: 48px;
  }
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  :root {
    --md-sys-color-primary: #4DD6D4;
    --md-sys-color-on-primary: #003738;
    --md-sys-color-primary-container: #004F50;
    --md-sys-color-on-primary-container: #6FF7F5;
    --md-sys-color-secondary-container: #1E3535;
    --md-sys-color-on-secondary-container: #CCE8E7;
    --md-sys-color-surface: #0E1515;
    --md-sys-color-on-surface: #E1E3E2;
    --md-sys-color-surface-container: #1A2020;
    --md-sys-color-surface-container-low: #161B1B;
    --md-sys-color-surface-variant: #3F4948;
    --md-sys-color-on-surface-variant: #BFC8C7;
    --md-sys-color-outline: #899392;
    --md-sys-color-outline-variant: #3F4948;
  }

  .navigation-drawer {
    background: #1A1C1C;
  }

  .drawer-content {
    background: #1A1C1C;
  }
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
    transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>