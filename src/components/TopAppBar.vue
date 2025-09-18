<template>
  <header class="md-top-app-bar" :class="appBarClasses">
    <!-- Leading section -->
    <div class="md-top-app-bar__leading">
      <slot name="leading">
        <button
          v-if="showBackButton"
          class="md-icon-button"
          :aria-label="backButtonLabel"
          @click="$emit('back')"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
      </slot>
    </div>

    <!-- Title section -->
    <div class="md-top-app-bar__title">
      <h1 class="md-top-app-bar__title-text">{{ title }}</h1>
      <p v-if="subtitle" class="md-top-app-bar__subtitle">{{ subtitle }}</p>
    </div>

    <!-- Trailing section -->
    <div class="md-top-app-bar__trailing">
      <slot name="trailing">
        <slot name="actions"></slot>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  subtitle?: string
  variant?: 'center-aligned' | 'small' | 'medium' | 'large'
  showBackButton?: boolean
  backButtonLabel?: string
  elevated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'center-aligned',
  showBackButton: false,
  backButtonLabel: 'Retour',
  elevated: false
})

defineEmits<{
  back: []
}>()

const appBarClasses = computed(() => ({
  'md-top-app-bar--center-aligned': props.variant === 'center-aligned',
  'md-top-app-bar--small': props.variant === 'small',
  'md-top-app-bar--medium': props.variant === 'medium',
  'md-top-app-bar--large': props.variant === 'large',
  'md-top-app-bar--elevated': props.elevated
}))
</script>

<style scoped>
/* Material Design 3 Top App Bar */

.md-top-app-bar {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface, #1d1b20);
  min-height: 64px;
  padding: 0 4px;
  box-sizing: border-box;
  z-index: 4;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.md-top-app-bar--elevated {
  background: var(--md-sys-color-surface-container, #f3edf7);
  box-shadow: var(--md-sys-elevation-level2,
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3)
  );
}

/* Center-aligned variant (default) */
.md-top-app-bar--center-aligned {
  padding: 0 16px;
}

.md-top-app-bar--center-aligned .md-top-app-bar__title {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Small variant */
.md-top-app-bar--small {
  min-height: 64px;
  padding: 0 16px;
}

.md-top-app-bar--small .md-top-app-bar__title {
  flex: 1;
  margin-left: 16px;
  margin-right: 16px;
}

/* Medium variant */
.md-top-app-bar--medium {
  min-height: 112px;
  padding: 0 16px;
  align-items: flex-end;
  padding-bottom: 24px;
}

.md-top-app-bar--medium .md-top-app-bar__title {
  flex: 1;
  margin-left: 16px;
  margin-right: 16px;
}

/* Large variant */
.md-top-app-bar--large {
  min-height: 152px;
  padding: 0 16px;
  align-items: flex-end;
  padding-bottom: 28px;
}

.md-top-app-bar--large .md-top-app-bar__title {
  flex: 1;
  margin-left: 16px;
  margin-right: 16px;
}

/* Leading section */
.md-top-app-bar__leading {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Title section */
.md-top-app-bar__title {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.md-top-app-bar__title-text {
  font-family: var(--md-sys-typescale-title-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-large-size, 22px);
  font-weight: var(--md-sys-typescale-title-large-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 28px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-top-app-bar__subtitle {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 4px 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Large variant title styling */
.md-top-app-bar--large .md-top-app-bar__title-text {
  font-family: var(--md-sys-typescale-headline-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-medium-size, 28px);
  font-weight: var(--md-sys-typescale-headline-medium-weight, 400);
  line-height: var(--md-sys-typescale-headline-medium-line-height, 36px);
}

/* Medium variant title styling */
.md-top-app-bar--medium .md-top-app-bar__title-text {
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
}

/* Trailing section */
.md-top-app-bar__trailing {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Icon button */
.md-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
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

.md-icon-button::before {
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

.md-icon-button:hover::before {
  opacity: 0.08;
}

.md-icon-button:focus::before {
  opacity: 0.12;
}

.md-icon-button:active::before {
  opacity: 0.12;
}

.md-icon-button .material-symbols-outlined {
  font-size: 24px;
  z-index: 1;
}

/* Focus management */
.md-icon-button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary, #6750a4);
  outline-offset: 2px;
}

/* Responsive design */
@media (max-width: 768px) {
  .md-top-app-bar {
    min-height: 56px;
    padding: 0 4px;
  }

  .md-top-app-bar--small {
    min-height: 56px;
    padding: 0 4px;
  }

  .md-top-app-bar--medium {
    min-height: 96px;
    padding-bottom: 20px;
  }

  .md-top-app-bar--large {
    min-height: 128px;
    padding-bottom: 24px;
  }

  .md-top-app-bar__title-text {
    font-size: var(--md-sys-typescale-title-medium-size, 16px);
    line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  }

  .md-top-app-bar--large .md-top-app-bar__title-text {
    font-size: var(--md-sys-typescale-headline-small-size, 24px);
    line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  }

  .md-top-app-bar--medium .md-top-app-bar__title-text {
    font-size: var(--md-sys-typescale-title-large-size, 22px);
    line-height: var(--md-sys-typescale-title-large-line-height, 28px);
  }

  .md-icon-button {
    width: 40px;
    height: 40px;
  }

  .md-icon-button .material-symbols-outlined {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .md-top-app-bar {
    padding: 0 8px;
  }

  .md-top-app-bar--center-aligned .md-top-app-bar__title {
    margin: 0 8px;
  }

  .md-top-app-bar--small .md-top-app-bar__title,
  .md-top-app-bar--medium .md-top-app-bar__title,
  .md-top-app-bar--large .md-top-app-bar__title {
    margin-left: 8px;
    margin-right: 8px;
  }
}
</style>