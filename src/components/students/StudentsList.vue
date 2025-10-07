<template>
  <div class="students-list-container">
    <div v-if="students.length > 0" class="students-list" role="list">
      <StudentItem
        v-for="student in students"
        :key="student.id"
        :student="student"
        @edit="$emit('edit-student', $event)"
        @delete="$emit('delete-student', $event)"
      />
    </div>
    <p v-else class="empty-state">{{ emptyMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import StudentItem from './StudentItem.vue'
import type { Student } from '@/types/evaluation'

interface Props {
  students: Student[]
  emptyMessage?: string
}

interface Emits {
  (e: 'edit-student', student: Student): void
  (e: 'delete-student', student: Student): void
}

withDefaults(defineProps<Props>(), {
  emptyMessage: 'Aucun élève ne correspond à votre recherche.'
})

defineEmits<Emits>()
</script>

<style scoped>
.students-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: min(100%, clamp(36rem, 80vw, 70rem));
  margin: 0 auto;
}

.students-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
  background: transparent;
}

.empty-state {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  text-align: center;
  margin-top: 24px;
}

@media (max-width: 960px) {
  .students-list-container {
    width: 100%;
  }

  .students-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
}
</style>
