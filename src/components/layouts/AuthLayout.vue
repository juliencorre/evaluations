<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-brand">
        <slot name="brand">
          <h1 class="auth-title">{{ title }}</h1>
          <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>
        </slot>
      </div>

      <Card class="auth-card" variant="elevated">
        <slot />
      </Card>

      <div v-if="$slots.footer" class="auth-footer">
        <slot name="footer" />
      </div>
    </div>

    <div v-if="showBackgroundPattern" class="auth-background">
      <div class="background-pattern"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../atoms/Card.vue'

interface Props {
  title?: string
  subtitle?: string
  showBackgroundPattern?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Welcome',
  showBackgroundPattern: true
})
</script>

<style scoped>
.auth-layout {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg,
    var(--md-sys-color-primary-container, #e3f2fd) 0%,
    var(--md-sys-color-tertiary-container, #f3e5f5) 100%
  );
}

.auth-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 400px;
  z-index: 1;
}

.auth-brand {
  text-align: center;
}

.auth-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #1d1d1d);
  margin: 0 0 8px 0;
}

.auth-subtitle {
  font-size: 16px;
  color: var(--md-sys-color-on-surface-variant, #666);
  margin: 0;
}

.auth-card {
  width: 100%;
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant, #666);
}

.auth-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-pattern {
  position: absolute;
  inset: -50%;
  background:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 35px,
      rgba(255, 255, 255, 0.05) 35px,
      rgba(255, 255, 255, 0.05) 70px
    );
  animation: pattern-slide 60s linear infinite;
}

@keyframes pattern-slide {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@media (max-width: 480px) {
  .auth-container {
    max-width: 100%;
  }

  .auth-title {
    font-size: 28px;
  }
}
</style>
