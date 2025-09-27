<template>
  <div class="class-filter-container">
    <div class="filter-chips-section">
      <h2 class="filter-label">Classe</h2>
      <div class="filter-chips-row">
        <!-- Chip pour "Toutes les classes" -->
        <div
          class="filter-chip"
          :class="{ 'selected': !classStore.selectedClassId }"
          role="button"
          tabindex="0"
          aria-label="Afficher toutes les classes"
          @click="selectAllClasses"
          @keydown.enter="selectAllClasses"
          @keydown.space.prevent="selectAllClasses"
        >
          <span class="chip-label">Toutes les classes</span>
          <div v-if="!classStore.selectedClassId" class="selected-indicator">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
            </svg>
          </div>
        </div>

        <!-- Chips pour chaque classe -->
        <div
          v-for="classItem in classStore.allClasses"
          :key="classItem.id"
          class="filter-chip"
          :class="{ 'selected': classStore.selectedClassId === classItem.id }"
          role="button"
          tabindex="0"
          :aria-label="`Filtrer par la classe ${classItem.name}`"
          @click="selectClass(classItem.id)"
          @keydown.enter="selectClass(classItem.id)"
          @keydown.space.prevent="selectClass(classItem.id)"
        >
          <span class="chip-label">{{ classItem.name }}</span>
          <div v-if="classStore.selectedClassId === classItem.id" class="selected-indicator">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClassStore } from '@/stores/classStore'

const classStore = useClassStore()

const selectClass = (classId: string) => {
  classStore.selectClass(classId)
}

const selectAllClasses = () => {
  classStore.selectClass(null)
}
</script>

<style scoped>
.class-filter-container {
  padding: 16px 24px;
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.filter-chips-section {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-label {
  font-family: var(--md-sys-typescale-title-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-small-size, 14px);
  font-weight: var(--md-sys-typescale-title-small-weight, 500);
  line-height: var(--md-sys-typescale-title-small-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 12px 0;
}

.filter-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Material Design 3 Filter Chips */
.filter-chip {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 16px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  user-select: none;
  outline: none;
  position: relative;

  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
}

.filter-chip:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-on-surface);
}

.filter-chip:focus {
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 1px var(--md-sys-color-primary);
}

.filter-chip:active {
  background: var(--md-sys-color-surface-container-highest);
}

/* Selected state */
.filter-chip.selected {
  background: var(--md-sys-color-secondary-container);
  border-color: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary-container);
}

.filter-chip.selected:hover {
  background: color-mix(in srgb, var(--md-sys-color-secondary-container) 92%, var(--md-sys-color-on-secondary-container) 8%);
}

.chip-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.selected-indicator {
  margin-left: 8px;
  width: 16px;
  height: 16px;
  color: var(--md-sys-color-on-secondary-container);
  flex-shrink: 0;
}

.selected-indicator svg {
  width: 100%;
  height: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .class-filter-container {
    padding: 12px 16px;
  }

  .filter-label {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .filter-chip {
    height: 28px;
    padding: 0 12px;
    font-size: 13px;
  }

  .chip-label {
    max-width: 100px;
  }

  .selected-indicator {
    width: 14px;
    height: 14px;
    margin-left: 6px;
  }
}

@media (max-width: 480px) {
  .class-filter-container {
    padding: 8px 12px;
  }

  .filter-chips-row {
    gap: 6px;
  }

  .chip-label {
    max-width: 80px;
  }
}
</style>