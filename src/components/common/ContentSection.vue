<template>
  <div class="content-section">
    <h2 class="section-headline">{{ title }}</h2>
    <p class="section-supporting-text">{{ description }}</p>
    <div class="section-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  description: ''
})
</script>

<style scoped>
.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-headline {
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.section-supporting-text {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>