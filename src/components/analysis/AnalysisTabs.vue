<template>
  <div class="tabs-container">
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: modelValue === tab.value }"
        @click="$emit('update:modelValue', tab.value)"
      >
        <span class="tab-label">{{ tab.label }}</span>
        <div class="tab-indicator"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: string
  label: string
  value: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
/* Material 3 Tabs */
.tabs-container {
  position: sticky;
  top: 0;
  background: var(--md-sys-color-surface, #ffffff);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  z-index: 10;
}

.tabs-bar {
  display: flex;
  align-items: center;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-bar::-webkit-scrollbar {
  display: none;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  outline: none;
  overflow: hidden;
}

.tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-surface, #1d1b20);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.tab:hover::before {
  opacity: 0.08;
}

.tab:focus::before {
  opacity: 0.12;
}

.tab:active::before {
  opacity: 0.12;
}

.tab.active {
  color: var(--md-sys-color-primary, #6750a4);
}

.tab-label {
  position: relative;
  z-index: 1;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--md-sys-color-primary, #6750a4);
  border-radius: 3px 3px 0 0;
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab.active .tab-indicator {
  transform: scaleX(1);
}

/* Responsive tabs */
@media (max-width: 768px) {
  .tabs-container {
    padding: 0 16px;
  }

  .tabs-bar {
    padding: 0;
  }

  .tab {
    min-width: 120px;
    padding: 12px 8px;
    font-size: 13px;
  }
}
</style>