<template>
  <div class="metric-type-selector">
    <label class="selector-label">Type d'analyse</label>
    <div class="selector-container">
      <select
        :value="selectedMetricType"
        class="selector-input"
        @change="$emit('update:selectedMetricType', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="metricType in metricTypes" :key="metricType.value" :value="metricType.value">
          {{ metricType.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedMetricType: string
  metricTypes: Array<{ value: string; label: string }>
}

interface Emits {
  (e: 'update:selectedMetricType', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.metric-type-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
}

.selector-label {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 500);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.selector-container {
  position: relative;
}

.selector-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 8px;
  background: var(--md-sys-color-surface, #fef7ff);
  color: var(--md-sys-color-on-surface, #1d1b20);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.selector-input:hover {
  border-color: var(--md-sys-color-primary, #6750a4);
}

.selector-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary, #6750a4);
  box-shadow: 0 0 0 2px rgba(103, 80, 164, 0.12);
}
</style>