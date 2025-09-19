<template>
  <div class="types-list">
    <ul class="md3-list" role="list">
      <li
        v-for="type in resultTypes"
        :key="type.id"
        class="md3-list-item"
        role="listitem"
      >
        <div class="md3-list-item__content">
          <div class="md3-list-item__headline">{{ type.name }}</div>
        </div>

        <div class="md3-list-item__trailing">
          <button class="icon-btn" aria-label="Modifier le type" @click="$emit('edit', type)">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="icon-btn" aria-label="Supprimer le type" @click="$emit('delete', type)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </li>
    </ul>
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
.types-list {
  margin-top: 0;
  max-width: 800px;
}

/* Material Design 3 Lists */
.md3-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: transparent;
}

.md3-list-item {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 12px 16px;
  position: relative;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  background: var(--md-sys-color-surface);
}

.md3-list-item:last-child {
  border-bottom: none;
}

.md3-list-item:hover {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.md3-list-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.md3-list-item__headline {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.md3-list-item__trailing {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 20px;
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

.icon-btn:focus {
  outline: none;
  background: var(--md-sys-color-surface-container-highest, #e6e0e9);
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.icon-btn .material-symbols-outlined {
  font-size: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .types-list {
    margin-top: 12px;
    max-width: 100%;
  }

  .md3-list-item {
    min-height: 48px;
    padding: 8px 12px;
  }

  .md3-list-item__trailing {
    gap: 4px;
    margin-left: 8px;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 18px;
  }

  .icon-btn .material-symbols-outlined {
    font-size: 18px;
  }
}
</style>