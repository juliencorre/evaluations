<template>
  <div class="level-distribution">
    <div v-for="level in levels" :key="level.name" class="level-item">
      <div class="level-info">
        <span class="level-name">{{ level.name }}</span>
        <span class="level-count">{{ level.count }} élèves</span>
      </div>
      <div class="level-bar">
        <div
          class="level-progress"
          :class="level.class"
          :style="{ width: level.percentage + '%' }"
        ></div>
      </div>
      <span class="level-percentage">{{ level.percentage }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LevelData {
  name: string
  count: number
  percentage: number
  class: string
}

interface Props {
  levels: LevelData[]
}

defineProps<Props>()
</script>

<style scoped>
.level-distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.level-item {
  display: grid;
  grid-template-columns: 1fr auto 60px;
  align-items: center;
  gap: 16px;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}

.level-count {
  font-size: 0.75rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.level-bar {
  width: 120px;
  height: 8px;
  background: var(--md-sys-color-surface-variant, #f0f0f0);
  border-radius: 4px;
  overflow: hidden;
}

.level-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.level-not-acquired {
  background: var(--md-sys-color-error, #8a3030);
}

.level-in-progress {
  background: var(--md-sys-color-warning, #8a5a00);
}

.level-acquired {
  background: var(--md-sys-color-success, #2d5a3d);
}

.level-expert {
  background: var(--md-sys-color-primary, #405268);
}

.level-percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  text-align: right;
}

@media (max-width: 768px) {
  .level-item {
    grid-template-columns: 1fr auto;
    gap: 12px;
  }

  .level-percentage {
    grid-column: 2;
    margin-top: 8px;
  }
}
</style>