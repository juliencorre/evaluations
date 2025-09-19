<template>
  <div class="empty-state">
    <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
      <path :d="iconPath" />
    </svg>
    <h4 class="empty-title">{{ title }}</h4>
    <p v-if="description" class="empty-description">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  iconPath?: string
}

withDefaults(defineProps<Props>(), {
  description: undefined,
  iconPath: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z'
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--md-sys-color-on-surface-variant, #79747e);
  margin-bottom: 16px;
}

.empty-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0 0 8px 0;
}

.empty-description {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0;
}
</style>