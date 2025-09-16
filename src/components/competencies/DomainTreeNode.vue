<template>
  <div
    :class="[
      'tree-node',
      'domain-node',
      { 'ghost-element': domain.isGhost, 'dragging-element': domain.isDragging }
    ]"
    :draggable="!domain.isGhost && !domain.isDragging"
    @dragstart="!domain.isGhost && $emit('dragstart', $event)"
    @dragend="$emit('dragend', $event)"
    @dragover="$emit('dragover', $event)"
    @dragenter="$emit('dragenter', $event)"
    @drop="$emit('drop', $event)"
  >
    <div class="node-content" @click="!domain.isGhost && $emit('toggle')">
      <span v-if="!domain.isGhost" class="node-icon">
        <span class="material-symbols-outlined">
          {{ isExpanded ? 'expand_more' : 'chevron_right' }}
        </span>
      </span>
      <span class="node-label domain-label" :class="{ 'ghost-text': domain.isGhost }">
        {{ domain.isGhost ? 'Zone de dépôt' : domain.name }}
      </span>
      <div v-if="!domain.isGhost" class="node-actions">
        <button
          class="action-btn"
          title="Ajouter un champ"
          @click.stop="$emit('add-field')"
        >
          <span class="material-symbols-outlined">add</span>
        </button>
        <button
          class="action-btn"
          title="Modifier le domaine"
          @click.stop="$emit('edit')"
        >
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button
          class="action-btn delete-action"
          title="Supprimer le domaine"
          @click.stop="$emit('delete')"
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>

    <div v-if="isExpanded && !domain.isGhost" class="tree-children">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface DomainItem {
  id: string
  name: string
  description: string
  isGhost?: boolean
  isDragging?: boolean
}

defineProps<{
  domain: DomainItem
  isExpanded: boolean
}>()

defineEmits<{
  toggle: []
  'add-field': []
  edit: []
  delete: []
  dragstart: [event: DragEvent]
  dragend: [event: DragEvent]
  dragover: [event: DragEvent]
  dragenter: [event: DragEvent]
  drop: [event: DragEvent]
}>()
</script>