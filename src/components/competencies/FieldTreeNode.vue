<template>
  <div
    :class="[
      'tree-node',
      'field-node',
      { 'ghost-element': field.isGhost, 'dragging-element': field.isDragging }
    ]"
    :draggable="!field.isGhost && !field.isDragging"
    @dragstart="handleDragStart"
    @dragend="$emit('dragend', $event)"
    @dragover="$emit('dragover', $event)"
    @dragenter="handleDragEnter"
    @drop="$emit('drop', $event)"
  >
    <div class="node-content" @click="!field.isGhost && $emit('toggle')">
      <span v-if="!field.isGhost" class="node-icon">
        <span class="material-symbols-outlined">
          {{ isExpanded ? 'expand_more' : 'chevron_right' }}
        </span>
      </span>
      <span class="node-label field-label" :class="{ 'ghost-text': field.isGhost }">
        {{ field.isGhost ? 'Zone de dépôt' : field.name }}
      </span>
      <div v-if="!field.isGhost" class="node-actions">
        <button
          class="action-btn"
          title="Ajouter une compétence"
          @click.stop="$emit('add-competency')"
        >
          <span class="material-symbols-outlined">add</span>
        </button>
        <button
          class="action-btn"
          title="Modifier le champ"
          @click.stop="$emit('edit')"
        >
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button
          class="action-btn delete-action"
          title="Supprimer le champ"
          @click.stop="$emit('delete')"
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>

    <div v-if="isExpanded && !field.isGhost" class="tree-children">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface FieldItem {
  id: string
  name: string
  description: string
  isGhost?: boolean
  isDragging?: boolean
}

const props = defineProps<{
  field: FieldItem
  isExpanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
  'add-competency': []
  edit: []
  delete: []
  dragstart: [event: DragEvent]
  dragend: [event: DragEvent]
  dragover: [event: DragEvent]
  dragenter: [event: DragEvent]
  drop: [event: DragEvent]
}>()

const handleDragStart = (event: DragEvent) => {
  if (!props.field.isGhost) {
    emit('dragstart', event)
    event.stopPropagation()
  }
}

const handleDragEnter = (event: DragEvent) => {
  emit('dragenter', event)
  event.stopPropagation()
}
</script>