<template>
  <div class="controls-grid">
    <div class="control-card">
      <div class="control-header">
        <h3 class="control-title">Sélection de l'élève</h3>
      </div>
      <div class="control-content">
        <select :value="selectedStudent" class="student-select" @change="updateStudent">
          <option value="">Choisir un élève...</option>
          <option v-for="student in students" :key="student.id" :value="student.id">
            {{ student.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="control-card">
      <div class="control-header">
        <h3 class="control-title">Type d'analyse</h3>
      </div>
      <div class="control-content">
        <div class="metric-type-buttons">
          <button
            v-for="type in metricTypes"
            :key="type.value"
            class="metric-type-button"
            :class="{ active: selectedMetricType === type.value }"
            @click="$emit('update:selectedMetricType', type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Student {
  id: string
  name: string
}

interface MetricType {
  value: string
  label: string
}

interface Props {
  students: Student[]
  selectedStudent: string
  metricTypes: MetricType[]
  selectedMetricType: string
}

interface Emits {
  (e: 'update:selectedStudent', value: string): void
  (e: 'update:selectedMetricType', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const updateStudent = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:selectedStudent', target.value)
}
</script>

<style scoped>
.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.control-card {
  background: var(--md-sys-color-surface-container-low, #ffffff);
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 12px;
  padding: 24px 16px;
  margin-bottom: 8px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.control-header {
  margin-bottom: 16px;
}

.control-title {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0;
}

.student-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 8px;
  background: var(--md-sys-color-surface-container, #f0f4f3);
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  cursor: pointer;
}

.student-select:focus {
  outline: none;
  border-color: var(--md-sys-color-primary, #6750a4);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 20%, transparent);
}

.metric-type-buttons {
  display: flex;
  gap: 8px;
}

.metric-type-button {
  padding: 10px 16px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-low, #ffffff);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.metric-type-button:hover {
  background: var(--md-sys-color-surface-container-high, #f3edf7);
}

.metric-type-button.active {
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
  border-color: var(--md-sys-color-primary, #6750a4);
}

@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .control-card {
    padding: 16px;
  }

  .metric-type-buttons {
    flex-wrap: wrap;
  }
}
</style>