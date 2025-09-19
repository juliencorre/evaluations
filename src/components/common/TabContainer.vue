<template>
  <div class="tabs-container">
    <div class="tabs-bar" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab"
        :class="{ active: modelValue === tab.value }"
        role="tab"
        :aria-selected="modelValue === tab.value"
        @click="$emit('update:modelValue', tab.value)"
      >
        <span class="tab-label">{{ tab.label }}</span>
        <div class="tab-indicator"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Tab {
  id: string
  label: string
  value: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
  ariaLabel?: string
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
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 999;
}

.tabs-bar {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  min-width: 90px;
  padding: 12px 16px 16px;
  margin: 0 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.tab:hover {
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.tab.active {
  color: var(--md-sys-color-primary, #6750a4);
}

.tab-label {
  font-family: var(--md-sys-typescale-title-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-small-size, 14px);
  font-weight: var(--md-sys-typescale-title-small-weight, 500);
  line-height: var(--md-sys-typescale-title-small-line-height, 20px);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--md-sys-color-primary, #6750a4);
  border-radius: 3px 3px 0 0;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab.active .tab-indicator {
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .tabs-bar {
    padding: 0 16px;
  }

  .tab {
    min-width: 80px;
    padding: 12px 12px 16px;
  }
}
</style>