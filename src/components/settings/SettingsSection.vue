<template>
  <section class="settings-section" :aria-labelledby="titleId">
    <div class="section-header">
      <h2 :id="titleId" class="section-title">{{ title }}</h2>
      <p v-if="description" class="section-description">
        {{ description }}
      </p>
    </div>

    <slot></slot>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined
})

const titleId = computed(() =>
  props.id ? `${props.id}-title` : `${props.title.toLowerCase().replace(/\s+/g, '-')}-title`
)
</script>

<style scoped>
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1b1c1c);
  margin: 0;
}

.section-description {
  font-size: 0.95rem;
  color: var(--md-sys-color-on-surface-variant, #3f4948);
  margin: 0;
  max-width: 720px;
}
</style>