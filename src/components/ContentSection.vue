<template>
  <div class="content-section">
    <h2 class="section-headline">{{ title }}</h2>
    <p class="section-supporting-text" v-if="description">
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<style scoped>
.content-section {
  margin-bottom: 48px;
}

.content-section:last-child {
  margin-bottom: 24px;
}

.section-headline {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #1d1b20;
  margin: 0 0 8px 0;
}

.section-supporting-text {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #49454f;
  margin: 0 0 24px 0;
}

/* Responsive */
@media (max-width: 840px) {
  .content-section {
    margin-bottom: 32px;
  }
}
</style>