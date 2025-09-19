<template>
  <div class="types-grid">
    <div v-for="type in resultTypes" :key="type.id" class="type-card">
      <div class="type-header">
        <h3>{{ type.name }}</h3>
        <div class="type-actions">
          <button class="icon-btn" @click="$emit('edit', type)">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="icon-btn" @click="$emit('delete', type)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
      <div class="type-content">
        <div class="type-values">
          <span class="type-label">Valeurs :</span>
          <div class="values-list">
            <div v-for="value in type.config.values" :key="value.value" class="value-item">
              <span class="value-chip">
                {{ value.label || value }}
              </span>
              <span class="pivot-value">
                {{ value.pivot_value !== undefined ? value.pivot_value : '-' }}/10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResultTypeConfig } from '@/types/evaluation'

interface Props {
  resultTypes: ResultTypeConfig[]
}

interface Emits {
  (e: 'edit', type: ResultTypeConfig): void
  (e: 'delete', type: ResultTypeConfig): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.type-card {
  background: var(--md-sys-color-surface-container-low, #f7f2fa);
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.type-card:hover {
  background: var(--md-sys-color-surface-container, #f3edf7);
  box-shadow:
    0px 1px 2px 0px rgba(0, 0, 0, 0.3),
    0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.type-header h3 {
  margin: 0;
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.type-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-btn:hover {
  background: var(--md-sys-color-surface-container-highest, #e6e0e9);
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.icon-btn .material-symbols-outlined {
  font-size: 18px;
}

.type-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-label {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 500);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.values-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.value-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.value-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--md-sys-color-secondary-container, #e8def8);
  color: var(--md-sys-color-on-secondary-container, #1d192b);
  border-radius: 8px;
  font-family: var(--md-sys-typescale-label-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-small-size, 11px);
  font-weight: var(--md-sys-typescale-label-small-weight, 500);
  line-height: var(--md-sys-typescale-label-small-line-height, 16px);
}

.pivot-value {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 768px) {
  .types-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .type-card {
    padding: 12px;
  }
}
</style>