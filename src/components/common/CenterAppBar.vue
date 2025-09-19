<template>
  <header class="app-bar" :class="{ 'app-bar--elevated': isScrolled }">
    <div class="app-bar__leading">
      <slot name="leading" />
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
        <button
          v-if="showUserMenu"
          class="icon-button user-menu-button"
          aria-label="Menu utilisateur"
          @click="$emit('user-menu-click')"
        >
          <span class="material-symbols-outlined">account_circle</span>
        </button>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  isScrolled?: boolean
  showSearch?: boolean
  showUserMenu?: boolean
}

interface Emits {
  (e: 'search-click'): void
  (e: 'user-menu-click'): void
}

withDefaults(defineProps<Props>(), {
  isScrolled: false,
  showSearch: true,
  showUserMenu: true
})

defineEmits<Emits>()
</script>

<style scoped>
.app-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 4px;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard);
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

.app-bar__title {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

.app-bar__title-text {
  font-family: var(--md-sys-typescale-title-large-font);
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: var(--md-sys-typescale-title-large-weight);
  line-height: var(--md-sys-typescale-title-large-line-height);
  color: var(--md-sys-color-on-surface);
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
  color: var(--md-sys-color-on-surface-variant);
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

.user-menu-button {
  color: var(--md-sys-color-primary);
}

.user-menu-button .material-symbols-outlined {
  font-size: 32px;
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
    font-size: 20px;
  }

  .user-menu-button .material-symbols-outlined {
    font-size: 28px;
  }
}
</style>