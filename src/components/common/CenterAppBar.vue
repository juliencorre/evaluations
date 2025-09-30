<template>
  <header class="app-bar" :class="{ 'app-bar--elevated': isScrolled }">
    <div class="app-bar__leading">
      <slot name="leading">
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

      </slot>
    </div>

    <div class="app-bar__title">
      <h1 class="app-bar__title-text">{{ title }}</h1>
    </div>

    <div class="app-bar__trailing">
      <slot name="trailing">
        <button
          v-if="showSearch"
          class="icon-button"
          aria-label="Rechercher"
          @click="$emit('search-click')"
        >
          <span class="material-symbols-outlined">search</span>
        </button>
        <SchoolYearIcon
          v-if="showSchoolYearSelector"
          :selected-year="schoolYearFilter.displayText.value"
          :all-years-selected="schoolYearFilter.isFilteringAllYears.value"
          @click="showSchoolYearDialog = true"
        />
        <UserMenu
          v-if="shouldDisplayUserMenu"
          @logout="$emit('logout')"
        />
      </slot>
    </div>

    <!-- School Year Selection Dialog -->
    <SchoolYearSelectionDialog
      :visible="showSchoolYearDialog"
      :initial-selection="getInitialSelection()"
      @close="showSchoolYearDialog = false"
      @select="handleSchoolYearSelection"
    />
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import UserMenu from './UserMenu.vue'
import SchoolYearIcon from './SchoolYearIcon.vue'
import SchoolYearSelectionDialog from './SchoolYearSelectionDialog.vue'
import { useAuthStore, isAuthenticated } from '@/stores/authStore'
import { getSchoolYearFilterStore } from '@/stores/schoolYearFilterStore'

interface Props {
  title: string
  isScrolled?: boolean
  showSearch?: boolean
  showUserMenu?: boolean
  showBackButton?: boolean
  showSchoolIcon?: boolean
  showSchoolYearSelector?: boolean
}

interface Emits {
  (e: 'search-click'): void
  (e: 'user-menu-click'): void
  (e: 'logout'): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  isScrolled: false,
  showSearch: true,
  showUserMenu: true,
  showBackButton: false,
  showSchoolIcon: false,
  showSchoolYearSelector: true
})

defineEmits<Emits>()

// State
const showSchoolYearDialog = ref(false)

// Stores
const authStore = useAuthStore()
const schoolYearFilter = getSchoolYearFilterStore()

// Computed
const shouldDisplayUserMenu = computed(
  () => props.showUserMenu && isAuthenticated.value && !authStore.isInitializing.value
)

// Methods
const getInitialSelection = () => {
  if (schoolYearFilter.isFilteringAllYears.value) {
    return 'all'
  }
  return schoolYearFilter.activeYearId.value
}

const handleSchoolYearSelection = (selection: { type: 'all' | 'single', yearId?: string, yearName?: string }) => {
  schoolYearFilter.setFilter(selection)
  showSchoolYearDialog.value = false
}

// Initialize filter on mount
onMounted(async () => {
  await schoolYearFilter.initialize()
})
</script>

<style scoped>
.app-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 var(--md-sys-spacing-2);
  background: color-mix(in srgb, var(--md-sys-color-surface) 80%, transparent);
  color: var(--md-sys-color-on-surface);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 900; /* Below navigation rail (1000) */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);
}

/* Adjust for navigation rail on large screens */
@media (min-width: 840px) {
  .app-bar {
    left: 80px; /* Account for navigation rail width */
  }
}

.app-bar--elevated {
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level2);
}

.app-bar__leading {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 48px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-spring);
  position: relative;
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
  width: 24px;
  height: 24px;
  z-index: 1;
}

.school-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: #1D1B20;
}

.school-icon .material-symbols-outlined {
  font-size: 24px;
}

.app-bar__title {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  min-width: 0;
  gap: 4px;
}

.app-bar__title-text {
  font-family: var(--md-sys-typescale-title-large-font);
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  line-height: var(--md-sys-typescale-title-large-line-height);
  color: #1D1B20;
  margin: 0;
  text-align: center;
}

.app-bar__trailing {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 0 4px;
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


@media (max-width: 599px) {
  .app-bar {
    padding: 0;
  }

  .app-bar__title-text {
    font-size: var(--md-sys-typescale-title-medium-size);
    line-height: var(--md-sys-typescale-title-medium-line-height);
  }

  .icon-button {
    width: 40px;
    height: 40px;
  }

  .icon-button .material-symbols-outlined {
    font-size: 24px;
  }

}
</style>