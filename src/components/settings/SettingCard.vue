<template>
  <article class="setting-card" aria-live="polite">
    <div class="setting-card__content">
      <h3 class="setting-card__title">{{ title }}</h3>
      <p v-if="description" class="setting-card__description">
        {{ description }}
      </p>
      <p v-if="showStatus" class="setting-card__status" :class="{ 'is-enabled': isEnabled }">
        {{ statusText }}
      </p>
    </div>

    <slot name="control"></slot>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description?: string
  isEnabled?: boolean
  showStatus?: boolean
  enabledText?: string
  disabledText?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  isEnabled: false,
  showStatus: true,
  enabledText: 'Activé',
  disabledText: 'Désactivé'
})

const statusText = computed(() =>
  props.isEnabled ? props.enabledText : props.disabledText
)
</script>

<style scoped>
.setting-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 28px 32px;
  border-radius: 24px;
  background: var(--md-sys-color-surface, #ffffff);
  box-shadow:
    0px 1px 3px rgba(0, 0, 0, 0.15),
    0px 1px 2px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--md-sys-color-outline-variant, #dbe4e4);
}

.setting-card__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.setting-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1b1c1c);
  margin: 0;
}

.setting-card__description {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--md-sys-color-on-surface-variant, #3f4948);
  margin: 0;
}

.setting-card__status {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant, #3f4948);
  margin: 0;
}

.setting-card__status.is-enabled {
  color: var(--md-sys-color-primary, #006a6b);
}

@media (max-width: 768px) {
  .setting-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 24px;
  }
}
</style>