<template>
  <div class="md-menu-container">
    <!-- Menu Button -->
    <button
      ref="menuButton"
      class="md-menu-button"
      :class="{ 'md-menu-button--open': isOpen }"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-controls="menuId"
      @click="toggleMenu"
      @keydown="handleKeydown"
    >
      <span class="material-symbols-outlined md-menu-button__icon">{{ icon }}</span>
      <span class="md-menu-button__label">{{ label }}</span>
      <span class="material-symbols-outlined md-menu-button__dropdown">
        {{ isOpen ? 'expand_less' : 'expand_more' }}
      </span>
    </button>

    <!-- Menu Surface -->
    <div
      v-if="isOpen"
      :id="menuId"
      ref="menuSurface"
      class="md-menu-surface"
      role="menu"
      :aria-labelledby="menuId + '-button'"
      @keydown="handleMenuKeydown"
    >
      <div class="md-menu-items">
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="md-menu-item"
          :class="{ 'md-menu-item--selected': item.selected }"
          role="menuitem"
          :tabindex="index === focusedIndex ? 0 : -1"
          @click="selectItem(item)"
          @mouseenter="focusedIndex = index"
        >
          <span v-if="item.icon" class="material-symbols-outlined md-menu-item__icon">
            {{ item.icon }}
          </span>
          <span class="md-menu-item__text">{{ item.label }}</span>
          <span v-if="item.selected" class="material-symbols-outlined md-menu-item__check">
            check
          </span>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="md-menu-backdrop"
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
  label: string
  icon: string
  items: MenuItem[]
  modelValue?: string | number | boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  'item-selected': [item: MenuItem]
}>()

const isOpen = ref(false)
const focusedIndex = ref(-1)
const menuButton = ref<HTMLButtonElement | null>(null)
const menuSurface = ref<HTMLDivElement | null>(null)

const menuId = computed(() => `menu-${Math.random().toString(36).substr(2, 9)}`)

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

  // Position menu
  if (menuSurface.value && menuButton.value) {
    const buttonRect = menuButton.value.getBoundingClientRect()
    const menuRect = menuSurface.value.getBoundingClientRect()

    // Position below button
    menuSurface.value.style.top = `${buttonRect.bottom + 8}px`
    menuSurface.value.style.left = `${buttonRect.left}px`

    // Adjust if menu goes off screen
    if (buttonRect.left + menuRect.width > window.innerWidth) {
      menuSurface.value.style.left = `${window.innerWidth - menuRect.width - 16}px`
    }

    if (buttonRect.bottom + menuRect.height + 8 > window.innerHeight) {
      menuSurface.value.style.top = `${buttonRect.top - menuRect.height - 8}px`
    }
  }
}

const closeMenu = () => {
  isOpen.value = false
  focusedIndex.value = -1
  menuButton.value?.focus()
}

const selectItem = (item: MenuItem) => {
  emit('update:modelValue', item.value)
  emit('item-selected', item)
  closeMenu()
}

const handleKeydown = (event: KeyboardEvent) => {
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
  if (isOpen.value &&
      !menuButton.value?.contains(event.target as Node) &&
      !menuSurface.value?.contains(event.target as Node)) {
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
/* Material Design 3 Menu Component */

.md-menu-container {
  position: relative;
  display: inline-block;
}

/* Menu Button */
.md-menu-button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 20px;
  color: var(--md-sys-color-on-surface, #1d1b20);
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

.md-menu-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-surface, #1d1b20);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.md-menu-button:hover::before {
  opacity: 0.08;
}

.md-menu-button:focus::before {
  opacity: 0.12;
}

.md-menu-button:active::before {
  opacity: 0.12;
}

.md-menu-button--open {
  background: var(--md-sys-color-surface-variant, #e7e0ec);
}

.md-menu-button__icon {
  font-size: 20px;
  z-index: 1;
}

.md-menu-button__label {
  flex: 1;
  text-align: left;
  z-index: 1;
}

.md-menu-button__dropdown {
  font-size: 20px;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
  z-index: 1;
}

/* Menu Surface */
.md-menu-surface {
  position: fixed;
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
  animation: menuOpen 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes menuOpen {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.md-menu-items {
  padding: 8px 0;
}

/* Menu Item */
.md-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 12px 16px;
  color: var(--md-sys-color-on-surface, #1d1b20);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  outline: none;
}

.md-menu-item:hover {
  background: var(--md-sys-color-on-surface, #1d1b20);
  background: rgba(29, 27, 32, 0.08);
}

.md-menu-item:focus {
  background: var(--md-sys-color-on-surface, #1d1b20);
  background: rgba(29, 27, 32, 0.12);
}

.md-menu-item--selected {
  background: var(--md-sys-color-secondary-container, #e8def8);
  color: var(--md-sys-color-on-secondary-container, #1d192b);
}

.md-menu-item__icon {
  font-size: 20px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.md-menu-item--selected .md-menu-item__icon {
  color: var(--md-sys-color-on-secondary-container, #1d192b);
}

.md-menu-item__text {
  flex: 1;
}

.md-menu-item__check {
  font-size: 20px;
  color: var(--md-sys-color-on-secondary-container, #1d192b);
}

/* Backdrop */
.md-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .md-menu-surface {
    max-width: calc(100vw - 32px);
  }
}
</style>