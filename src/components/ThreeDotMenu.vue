<template>
  <div ref="menuContainer" class="three-dot-menu">
    <!-- Three-dot menu button -->
    <button
      ref="menuButton"
      class="three-dot-button"
      :class="{ 'three-dot-button--open': isOpen }"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-controls="menuId"
      :aria-label="'Menu'"
      @click="toggleMenu"
      @keydown="handleButtonKeydown"
    >
      <span class="material-symbols-outlined three-dot-icon">more_vert</span>
    </button>

    <!-- Menu Surface -->
    <div
      v-if="isOpen"
      :id="menuId"
      ref="menuSurface"
      class="three-dot-menu-surface"
      role="menu"
      :aria-labelledby="menuId + '-button'"
      @keydown="handleMenuKeydown"
    >
      <div class="three-dot-menu-items">
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="three-dot-menu-item"
          :class="{ 'three-dot-menu-item--selected': item.selected }"
          role="menuitem"
          :tabindex="index === focusedIndex ? 0 : -1"
          @click="selectItem(item)"
          @mouseenter="focusedIndex = index"
        >
          <span v-if="item.icon" class="material-symbols-outlined three-dot-menu-item__icon">
            {{ item.icon }}
          </span>
          <span class="three-dot-menu-item__text">{{ item.label }}</span>
          <span v-if="item.selected" class="material-symbols-outlined three-dot-menu-item__check">
            check
          </span>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="three-dot-menu-backdrop"
      @click="closeMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

interface MenuItem {
  id?: string
  label: string
  icon?: string
  value: string | number | boolean
  selected?: boolean
}

interface Props {
  items: MenuItem[]
  modelValue?: string | number | boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  'item-selected': [item: MenuItem]
}>()

const isOpen = ref(false)
const focusedIndex = ref(-1)
const menuButton = ref<HTMLButtonElement | null>(null)
const menuSurface = ref<HTMLDivElement | null>(null)
const menuContainer = ref<HTMLDivElement | null>(null)

const menuId = computed(() => `three-dot-menu-${Math.random().toString(36).substr(2, 9)}`)

const toggleMenu = () => {
  if (isOpen.value) {
    closeMenu()
  } else {
    openMenu()
  }
}

const openMenu = async () => {
  isOpen.value = true
  focusedIndex.value = props.items.findIndex(item => item.selected) || 0

  await nextTick()

  // Check if menu goes off screen and adjust position
  if (menuSurface.value && menuContainer.value) {
    const containerRect = menuContainer.value.getBoundingClientRect()
    const menuRect = menuSurface.value.getBoundingClientRect()

    // Check if menu goes off right edge of screen
    if (containerRect.right - menuRect.width < 0) {
      menuSurface.value.style.right = 'auto'
      menuSurface.value.style.left = '0'
    }

    // Check if menu goes off bottom of screen
    if (containerRect.bottom + menuRect.height + 8 > window.innerHeight) {
      menuSurface.value.style.top = 'auto'
      menuSurface.value.style.bottom = 'calc(100% + 8px)'
    }
  }
}

const closeMenu = () => {
  isOpen.value = false
  focusedIndex.value = -1

  // Reset position styles for next opening
  if (menuSurface.value) {
    menuSurface.value.style.right = ''
    menuSurface.value.style.left = ''
    menuSurface.value.style.top = ''
    menuSurface.value.style.bottom = ''
  }

  menuButton.value?.focus()
}

const selectItem = (item: MenuItem) => {
  emit('update:modelValue', item.value)
  emit('item-selected', item)
  closeMenu()
}

const handleButtonKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
      event.preventDefault()
      openMenu()
      break
    case 'ArrowUp':
      event.preventDefault()
      openMenu()
      focusedIndex.value = props.items.length - 1
      break
  }
}

const handleMenuKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeMenu()
      break
    case 'ArrowDown':
      event.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, props.items.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (focusedIndex.value >= 0 && focusedIndex.value < props.items.length) {
        selectItem(props.items[focusedIndex.value])
      }
      break
    case 'Home':
      event.preventDefault()
      focusedIndex.value = 0
      break
    case 'End':
      event.preventDefault()
      focusedIndex.value = props.items.length - 1
      break
  }
}

const handleClickOutside = (event: Event) => {
  if (isOpen.value && menuContainer.value && !menuContainer.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Material Design 3 Three-Dot Menu Component */

.three-dot-menu {
  position: relative;
  display: inline-block;
}

/* Three-Dot Button - Material 3 Icon Button */
.three-dot-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
  outline: none;
}

.three-dot-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-surface-variant, #49454f);
  opacity: 0;
  border-radius: inherit;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.three-dot-button:hover::before {
  opacity: 0.08;
}

.three-dot-button:focus::before {
  opacity: 0.12;
}

.three-dot-button:active::before {
  opacity: 0.12;
}

.three-dot-button--open {
  background: var(--md-sys-color-surface-variant, #e7e0ec);
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.three-dot-icon {
  font-size: 20px;
  z-index: 1;
}

/* Menu Surface - Material 3 Menu */
.three-dot-menu-surface {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 112px;
  max-width: 280px;
  background: var(--md-sys-color-surface-container, #f3edf7);
  border-radius: 4px;
  box-shadow: var(--md-sys-elevation-level2,
    0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 1px 5px 0px rgba(0, 0, 0, 0.12)
  );
  z-index: 1000;
  overflow: hidden;
  animation: threeDotMenuOpen 0.2s cubic-bezier(0.2, 0, 0, 1);
  transform-origin: top right;
}

@keyframes threeDotMenuOpen {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.three-dot-menu-items {
  padding: 8px 0;
}

/* Menu Item - Material 3 Menu Item */
.three-dot-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 12px 16px;
  color: var(--md-sys-color-on-surface, #1d1b20);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  outline: none;
}

.three-dot-menu-item:hover {
  background: rgba(29, 27, 32, 0.08);
}

.three-dot-menu-item:focus {
  background: rgba(29, 27, 32, 0.12);
}

.three-dot-menu-item--selected {
  background: var(--md-sys-color-secondary-container, #e8def8);
  color: var(--md-sys-color-on-secondary-container, #1d192b);
}

.three-dot-menu-item__icon {
  font-size: 20px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.three-dot-menu-item--selected .three-dot-menu-item__icon {
  color: var(--md-sys-color-on-secondary-container, #1d192b);
}

.three-dot-menu-item__text {
  flex: 1;
  white-space: nowrap;
}

.three-dot-menu-item__check {
  font-size: 20px;
  color: var(--md-sys-color-on-secondary-container, #1d192b);
}

/* Backdrop */
.three-dot-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* Focus management */
.three-dot-button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary, #6750a4);
  outline-offset: 2px;
}

.three-dot-menu-item:focus-visible {
  outline: 2px solid var(--md-sys-color-primary, #6750a4);
  outline-offset: -2px;
}

/* Responsive */
@media (max-width: 768px) {
  .three-dot-menu-surface {
    max-width: calc(100vw - 32px);
  }
}
</style>