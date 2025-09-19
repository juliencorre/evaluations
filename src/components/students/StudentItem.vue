<template>
  <div class="student-item" role="listitem">
    <div class="student-content">
      <div class="student-avatar" aria-hidden="true">
        <span class="material-symbols-outlined">person</span>
      </div>
      <div class="student-details">
        <div class="student-name">
          <span class="first-name">{{ student.firstName }}</span>
          <span class="last-name">{{ student.lastName }}</span>
        </div>
      </div>
    </div>
    <div class="student-trailing">
      <button class="action-btn edit-action" title="Modifier" @click="$emit('edit', student)">
        <span class="material-symbols-outlined">edit</span>
      </button>
      <button
        class="action-btn delete-action"
        title="Supprimer"
        @click="$emit('delete', student)"
      >
        <span class="material-symbols-outlined">delete</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '@/types/evaluation'

interface Props {
  student: Student
}

interface Emits {
  (e: 'edit', student: Student): void
  (e: 'delete', student: Student): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.student-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  min-height: 72px;
  background: var(--md-sys-color-surface, #ffffff);
  border-bottom: 1px solid var(--md-sys-color-outline, #79747E);
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  overflow: hidden;
  cursor: pointer;
}

.student-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.student-item:hover::before {
  background: rgba(103, 80, 164, 0.08);
}

.student-item:focus-within::before {
  background: rgba(103, 80, 164, 0.12);
}

.student-item:last-child {
  border-bottom: none;
}

.student-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.student-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--md-sys-color-primary-container, #eaddff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-avatar .material-symbols-outlined {
  color: var(--md-sys-color-on-primary-container, #21005d);
  font-size: 24px;
}

.student-details {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.student-name {
  display: flex;
  gap: 8px;
  align-items: baseline;
  min-width: 0;
}

.student-name .first-name,
.student-name .last-name {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-name .last-name {
  font-weight: var(--md-sys-typescale-body-large-weight-prominent, 500);
}

/* Trailing element - 24dp buttons with 16dp margin */
.student-trailing {
  display: flex;
  gap: 8px;
  margin-left: 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* Material 3 Icon Button - Standard (40x40dp) */
.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  background: transparent;
  color: rgba(28, 27, 31, 0.6);
  position: relative;
}

.action-btn .material-symbols-outlined {
  font-size: 20px;
}

/* State layers for icon buttons */
.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border-radius: 20px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.action-btn:hover::before {
  background: rgba(103, 80, 164, 0.08);
}

.action-btn:focus::before {
  background: rgba(103, 80, 164, 0.12);
}

.action-btn:active::before {
  background: rgba(103, 80, 164, 0.12);
}

.action-btn:focus {
  outline: none;
}

.delete-action:hover {
  color: #ba1a1a;
}

.delete-action:hover::before {
  background: rgba(186, 26, 26, 0.08);
}

.delete-action:focus {
  color: #ba1a1a;
}

.delete-action:focus::before {
  background: rgba(186, 26, 26, 0.12);
}

/* Responsive */
@media (max-width: 768px) {
  .student-item {
    padding: 12px 16px;
    min-height: 64px;
  }

  .student-content {
    gap: 12px;
  }

  .student-trailing {
    margin-left: 12px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .action-btn .material-symbols-outlined {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .student-item {
    padding: 16px;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .student-content {
    flex: 1;
    min-width: 0;
  }

  .student-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .student-name .first-name,
  .student-name .last-name {
    font-size: 14px;
    line-height: 20px;
  }

  .student-avatar {
    width: 36px;
    height: 36px;
  }

  .student-avatar .material-symbols-outlined {
    font-size: 20px;
  }

  .student-trailing {
    margin-left: 8px;
    gap: 4px;
  }
}

@media (max-width: 840px) {
  .student-item {
    padding: 16px 16px;
  }

  .student-content {
    gap: 12px;
  }

  .student-avatar {
    width: 40px;
    height: 40px;
  }

  .student-avatar .material-symbols-outlined {
    font-size: 22px;
  }
}
</style>