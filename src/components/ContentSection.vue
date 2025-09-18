<template>
  <div class="content-section">
    <h2 class="section-headline">{{ title }}</h2>
    <p v-if="description" class="section-supporting-text">
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
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0 0 8px 0;
}

.section-supporting-text {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0 0 24px 0;
}

/* Responsive */
@media (max-width: 840px) {
  .content-section {
    margin-bottom: 32px;
  }
}
</style>