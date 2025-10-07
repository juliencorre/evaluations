<template>
  <div ref="userMenuRef" class="user-menu">
    <button
      class="icon-button user-menu-button"
      aria-label="Menu utilisateur"
      :aria-expanded="isOpen"
      :disabled="isLoading || !signedIn"
      @click="toggleMenu"
    >
      <span class="material-symbols-outlined">more_vert</span>
    </button>

    <Transition name="menu">
      <div v-if="isOpen" class="menu-dropdown" @click.stop>
        <div class="menu-content">
          <div class="menu-header">
            <div class="user-info">
              <span class="material-symbols-outlined user-avatar">account_circle</span>
              <div class="user-details">
                <span class="user-name">{{ displayName }}</span>
                <span class="user-role">{{ userEmail }}</span>
                <span
                  v-if="!isEmailVerified"
                  class="user-warning"
                >
                  E-mail à confirmer
                </span>
              </div>
            </div>
          </div>

          <div class="menu-divider"></div>

          <p v-if="logoutError" class="logout-error" role="alert">{{ logoutError }}</p>

          <nav class="menu-items">

            <router-link
              to="/competencies"
              class="menu-item"
              @click="closeMenu"
            >
              <span class="material-symbols-outlined">psychology</span>
              <span class="menu-item-text">Compétences</span>
            </router-link>

            <router-link
              to="/types"
              class="menu-item"
              @click="closeMenu"
            >
              <span class="material-symbols-outlined">category</span>
              <span class="menu-item-text">Types de résultats</span>
            </router-link>

            <div class="menu-divider"></div>

            <router-link
              to="/settings"
              class="menu-item"
              @click="closeMenu"
            >
              <span class="material-symbols-outlined">settings</span>
              <span class="menu-item-text">Paramètres</span>
            </router-link>


            <button class="menu-item menu-item-button" type="button" @click="handleLogout">
              <span class="material-symbols-outlined">logout</span>
              <span class="menu-item-text">Déconnexion</span>
            </button>
          </nav>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore, isAuthenticated } from '@/stores/authStore'

interface Emits {
  (e: 'logout'): void
}

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const userMenuRef = ref<HTMLElement>()
const authStore = useAuthStore()
const logoutError = ref<string | null>(null)

const displayName = computed(() => authStore.displayName)
const userEmail = computed(() => authStore.userEmail)
const isEmailVerified = computed(() => authStore.isEmailVerified)
const isLoading = computed(() => authStore.isInitializing)
const signedIn = computed(() => isAuthenticated.value)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function handleClickOutside(event: Event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

async function handleLogout() {
  logoutError.value = null
  const { error } = await authStore.signOut()
  if (error) {
    logoutError.value = "La déconnexion a échoué. Merci de réessayer."
    return
  }

  emit('logout')
  closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-menu {
  position: relative;
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
  opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);
}

.icon-button:focus {
  outline: none;
}

.icon-button:focus::before {
  opacity: var(--md-icon-button-focus-state-layer-opacity, 0.12);
}

.icon-button .material-symbols-outlined {
  font-size: 24px;
  z-index: 1;
}

.user-menu-button {
  color: #49454F;
}

.user-menu-button .material-symbols-outlined {
  font-size: 24px;
}

/* Menu Dropdown */
.menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 280px;
  background: var(--md-sys-color-surface-container);
  border-radius: 12px;
  box-shadow:
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  z-index: 1100;
  overflow: hidden;
}

.menu-content {
  padding: 8px 0;
}

.menu-header {
  padding: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  font-size: 40px;
  color: var(--md-sys-color-primary);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-family: var(--md-sys-typescale-title-medium-font);
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  color: var(--md-sys-color-on-surface);
}

.user-role {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: var(--md-sys-typescale-body-medium-weight);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  color: var(--md-sys-color-on-surface-variant);
}

.user-warning {
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-error);
  font-weight: 600;
}

.menu-divider {
  height: 1px;
  background: var(--md-sys-color-outline-variant);
  margin: 8px 0;
}

.menu-items {
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.menu-item:hover {
  background: var(--md-sys-color-surface-container-high);
}

.menu-item:focus {
  outline: none;
  background: var(--md-sys-color-surface-container-high);
}

.menu-item .material-symbols-outlined {
  font-size: 24px;
  color: var(--md-sys-color-on-surface-variant);
}

.menu-item-text {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
}

.menu-item-button {
  text-align: left;
}

.logout-error {
  margin: 0 16px;
  padding: 8px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
  color: var(--md-sys-color-error);
  font-size: 0.875rem;
}

.user-menu-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transitions */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.menu-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Responsive */
@media (max-width: 599px) {
  .icon-button {
    width: 40px;
    height: 40px;
  }

  .icon-button .material-symbols-outlined {
    font-size: 24px;
  }

  .user-menu-button .material-symbols-outlined {
    font-size: 24px;
  }

  .menu-dropdown {
    min-width: 260px;
    right: -8px;
  }

  .user-avatar {
    font-size: 36px;
  }
}
</style>