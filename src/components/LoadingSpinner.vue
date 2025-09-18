<template>
  <div class="loading-spinner" role="status" aria-label="Chargement en cours">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p class="loading-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Chargement...'
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-surface-variant, #e0e0e0);
  border-top: 3px solid var(--color-primary, #1976d2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--color-on-surface-variant, #666);
  font-size: 0.875rem;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .spinner {
    border-color: var(--color-surface-variant, #424242);
    border-top-color: var(--color-primary, #90caf9);
  }

  .loading-text {
    color: var(--color-on-surface-variant, #aaa);
  }
}
</style>