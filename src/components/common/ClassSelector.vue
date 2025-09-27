<template>
  <div class="class-selector">
    <!-- Class Selection Button -->
    <button
      ref="selectorButton"
      class="class-selector-button"
      :class="{ 'is-open': isMenuOpen, 'has-error': error }"
      :disabled="loading"
      :aria-expanded="isMenuOpen"
      :aria-haspopup="true"
      aria-label="Sélectionner une classe"
      @click="toggleMenu"
    >
      <div class="selector-content">
        <!-- Loading State -->
        <div v-if="loading" class="selector-loading">
          <div class="loading-spinner"></div>
          <span class="selector-text">Chargement...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="selector-error">
          <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
          </svg>
          <span class="selector-text">Erreur</span>
        </div>

        <!-- No Classes State -->
        <div v-else-if="availableClasses.length === 0" class="selector-empty">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
          </svg>
          <span class="selector-text">Aucune classe</span>
        </div>

        <!-- Selected Class -->
        <div v-else class="selector-class">
          <div class="class-info">
            <div class="class-name">{{ selectedClass?.name || 'Sélectionner une classe' }}</div>
            <div v-if="selectedClass" class="class-details">
              {{ selectedClass.level || '' }}{{ selectedClass.level && selectedClass.subject ? ' • ' : '' }}{{ selectedClass.subject || '' }}
            </div>
          </div>
          <svg class="dropdown-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7,10L12,15L17,10H7Z" />
          </svg>
        </div>
      </div>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isMenuOpen"
      ref="menu"
      class="class-menu"
      role="listbox"
      :aria-labelledby="selectorButton"
    >
      <div class="menu-content">
        <!-- Menu Header -->
        <div class="menu-header">
          <h3 class="menu-title">Choisir une classe</h3>
          <button
            class="menu-close"
            aria-label="Fermer le menu"
            @click="closeMenu"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <!-- Classes List -->
        <div class="classes-list">
          <button
            v-for="classItem in availableClasses"
            :key="classItem.id"
            class="class-option"
            :class="{ 'is-selected': selectedClass?.id === classItem.id }"
            role="option"
            :aria-selected="selectedClass?.id === classItem.id"
            @click="selectClass(classItem)"
          >
            <div class="option-content">
              <div class="option-main">
                <div class="option-name">{{ classItem.name }}</div>
                <div class="option-details">
                  <span v-if="classItem.level">{{ classItem.level }}</span>
                  <span v-if="classItem.level && classItem.subject" class="separator">•</span>
                  <span v-if="classItem.subject">{{ classItem.subject }}</span>
                </div>
              </div>
              <div class="option-meta">
                <div class="school-year">{{ classItem.schoolYear }}</div>
                <svg v-if="selectedClass?.id === classItem.id" class="selected-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        <!-- Menu Actions -->
        <div class="menu-actions">
          <button class="action-button secondary" @click="manageClasses">
            <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Gérer les classes
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isMenuOpen"
      class="menu-backdrop"
      aria-hidden="true"
      @click="closeMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useClassStore } from '@/stores/classStore'
import type { Class } from '@/types/evaluation'

// Store
const classStore = useClassStore()

// Refs
const selectorButton = ref<HTMLButtonElement>()
const menu = ref<HTMLDivElement>()
const isMenuOpen = ref(false)

// Computed
const loading = computed(() => classStore.loading)
const error = computed(() => classStore.error)
const selectedClass = computed(() => classStore.selectedClass)
const availableClasses = computed(() => classStore.userClasses)

// Methods
async function toggleMenu() {
  if (loading.value) return

  if (isMenuOpen.value) {
    closeMenu()
  } else {
    await openMenu()
  }
}

async function openMenu() {
  isMenuOpen.value = true

  // Focus management
  await nextTick()
  if (menu.value) {
    const firstOption = menu.value.querySelector('.class-option') as HTMLElement
    if (firstOption) {
      firstOption.focus()
    }
  }
}

function closeMenu() {
  isMenuOpen.value = false

  // Return focus to button
  if (selectorButton.value) {
    selectorButton.value.focus()
  }
}

function selectClass(classItem: Class) {
  classStore.selectClass(classItem.id)
  closeMenu()
}

function manageClasses() {
  // TODO: Open class management modal/page
  console.log('Manage classes clicked')
  closeMenu()
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!isMenuOpen.value) return

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeMenu()
      break
    case 'ArrowDown':
      event.preventDefault()
      focusNextOption()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPreviousOption()
      break
    case 'Enter':
    case ' ': {
      event.preventDefault()
      const focused = document.activeElement as HTMLElement
      if (focused?.classList.contains('class-option')) {
        focused.click()
      }
      break
    }
  }
}

function focusNextOption() {
  if (!menu.value) return

  const options = menu.value.querySelectorAll('.class-option')
  const currentIndex = Array.from(options).indexOf(document.activeElement as HTMLElement)
  const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
  options[nextIndex]?.focus()
}

function focusPreviousOption() {
  if (!menu.value) return

  const options = menu.value.querySelectorAll('.class-option')
  const currentIndex = Array.from(options).indexOf(document.activeElement as HTMLElement)
  const previousIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
  options[previousIndex]?.focus()
}

// Click outside to close
function handleClickOutside(event: Event) {
  if (!isMenuOpen.value) return

  const target = event.target as HTMLElement
  if (!selectorButton.value?.contains(target) && !menu.value?.contains(target)) {
    closeMenu()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)

  // Initialize store if needed
  if (availableClasses.value.length === 0 && !loading.value) {
    classStore.loadClasses()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.class-selector {
  position: relative;
  z-index: 100;
}

.class-selector-button {
  display: flex;
  align-items: center;
  height: 40px;
  min-width: 200px;
  padding: 0 12px;
  background: var(--md-sys-color-surface-container-high);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

.class-selector-button:hover {
  background: var(--md-sys-color-surface-container-highest);
  border-color: var(--md-sys-color-outline);
}

.class-selector-button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.class-selector-button.is-open {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary-container);
}

.class-selector-button.has-error {
  border-color: var(--md-sys-color-error);
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.class-selector-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.selector-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.selector-loading,
.selector-error,
.selector-empty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--md-sys-color-outline-variant);
  border-top: 2px solid var(--md-sys-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.selector-text {
  font-size: 14px;
  font-weight: 500;
}

.selector-class {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.class-info {
  flex: 1;
  min-width: 0;
}

.class-name {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--md-sys-color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.class-details {
  font-size: 12px;
  color: var(--md-sys-color-on-surface-variant);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.class-selector-button.is-open .dropdown-icon {
  transform: rotate(180deg);
}

/* Menu */
.class-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--md-sys-color-surface-container);
  border-radius: 16px;
  box-shadow:
    0px 3px 12px rgba(0, 0, 0, 0.15),
    0px 1px 4px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 400px;
  overflow: hidden;
  animation: menuSlideIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes menuSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.menu-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.menu-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.menu-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 16px;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.menu-close:hover {
  background: var(--md-sys-color-surface-container-highest);
}

.menu-close svg {
  width: 20px;
  height: 20px;
}

.classes-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.class-option {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  font-family: inherit;
}

.class-option:hover {
  background: var(--md-sys-color-surface-container-high);
}

.class-option:focus {
  outline: none;
  background: var(--md-sys-color-surface-container-highest);
}

.class-option.is-selected {
  background: var(--md-sys-color-primary-container);
}

.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.option-main {
  flex: 1;
  min-width: 0;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  line-height: 1.3;
  margin-bottom: 2px;
}

.option-details {
  font-size: 12px;
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  align-items: center;
  gap: 4px;
}

.separator {
  color: var(--md-sys-color-outline);
}

.option-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.school-year {
  font-size: 11px;
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container-highest);
  padding: 2px 6px;
  border-radius: 4px;
}

.selected-icon {
  width: 16px;
  height: 16px;
  color: var(--md-sys-color-primary);
}

.menu-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 12px;
  color: var(--md-sys-color-on-surface);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.action-button:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline-variant);
}

.action-icon {
  width: 20px;
  height: 20px;
}

.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
}

/* Responsive */
@media (max-width: 600px) {
  .class-selector-button {
    min-width: 160px;
    height: 36px;
    font-size: 13px;
  }

  .class-menu {
    left: -50%;
    right: -50%;
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>