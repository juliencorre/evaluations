<template>
  <header class="app-bar" :class="{ 'app-bar--elevated': elevated }">
    <div class="app-bar__leading">
      <slot name="leading">
        <!-- Default: empty leading section for balance -->
      </slot>
    </div>

    <div class="app-bar__title">
      <h1 class="app-bar__title-text">{{ title }}</h1>
    </div>

    <div class="app-bar__trailing">
      <slot name="trailing">
        <!-- Default trailing actions -->
        <button class="icon-button" aria-label="Rechercher">
          <span class="material-symbols-outlined">search</span>
        </button>
        <button class="icon-button user-menu-button" aria-label="Menu utilisateur">
          <span class="material-symbols-outlined">more_vert</span>
        </button>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  elevated?: boolean
}

defineProps<Props>()
</script>

<style scoped>
/* Material 3 Center-aligned App Bar */
.app-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 0 16px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-bar--elevated {
  background: var(--md-sys-color-surface-container);
  box-shadow:
    0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14),
    0px 1px 10px 0px rgba(0, 0, 0, 0.12);
}

.app-bar__leading {
  display: flex;
  align-items: center;
  min-width: 48px;
}

.app-bar__title {
  flex: 1;
  text-align: center;
}

.app-bar__title-text {
  font-family: var(--md-sys-typescale-title-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-large-size, 22px);
  font-weight: var(--md-sys-typescale-title-large-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 28px);
  margin: 0;
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.app-bar__trailing {
  display: flex;
  align-items: center;
  min-width: 48px;
  justify-content: flex-end;
  gap: 8px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface, #1d1b20);
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
  position: relative;
}

/* User menu button styling */
.user-menu-button .material-symbols-outlined {
  font-size: 32px;
}

/* Responsive */
@media (max-width: 768px) {
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