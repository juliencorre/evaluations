<template>
  <header class="app-bar" :class="{ 'app-bar--elevated': isScrolled }">
    <div class="app-bar__leading">
      <!-- Empty leading section for balance -->
    </div>

    <div class="app-bar__title">
      <h1 class="app-bar__title-text">{{ title }}</h1>
    </div>

    <div class="app-bar__trailing">
      <button class="icon-button" aria-label="Rechercher">
        <span class="material-symbols-outlined">search</span>
      </button>
      <button class="icon-button user-menu-button" aria-label="Menu utilisateur">
        <span class="material-symbols-outlined">account_circle</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  title: string
}

withDefaults(defineProps<Props>(), {
  title: 'Paramètres'
})

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Material 3 Center-aligned App Bar */
.app-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 4px;
  /* Initially same color as background */
  background: transparent;
  color: var(--md-sys-color-on-surface);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  /* No initial shadow/border */
}

/* Elevated state on scroll - contrasting color and elevation */
.app-bar--elevated {
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level2,
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3)
  );
}

/* App bar sections */
.app-bar__leading {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 48px; /* Balance trailing section */
}

.app-bar__title {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

.app-bar__title-text {
  font-family: var(--md-sys-typescale-title-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-large-size, 22px);
  font-weight: var(--md-sys-typescale-title-large-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 28px);
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
  border-radius: 50%;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.icon-button:hover::before {
  opacity: 0.08;
}

.icon-button:focus {
  outline: none;
}

.icon-button:focus::before {
  opacity: 0.12;
}

.icon-button .material-symbols-outlined {
  font-size: 24px;
  z-index: 1;
}

/* User menu button styling */
.user-menu-button {
  color: var(--md-sys-color-primary, #6750a4);
}

.user-menu-button .material-symbols-outlined {
  font-size: 32px;
}

/* Responsive design */
@media (max-width: 599px) {
  .app-bar {
    padding: 0;
  }

  .app-bar__title-text {
    font-size: var(--md-sys-typescale-title-medium-size, 16px);
    line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
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