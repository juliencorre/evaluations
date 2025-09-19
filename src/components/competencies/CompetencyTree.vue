<template>
  <div class="competencies-tree">
    <!-- Domain Level -->
    <div
      v-for="(domain, domainIndex) in domains"
      :key="domain.id"
      :class="[
        'tree-node',
        'domain-node'
      ]"
      draggable="true"
      @dragstart="handleDragStart($event, domain, 'domain', domainIndex)"
      @dragend="handleDragEnd"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter($event, domain, 'domain', domainIndex)"
      @drop="handleDrop($event, domain, 'domain', domainIndex)"
    >
      <div class="node-content" @click="toggleDomain(domain.id)">
        <span class="node-icon">
          <span class="material-symbols-outlined">
            {{ expandedDomains.has(domain.id) ? 'expand_more' : 'chevron_right' }}
          </span>
        </span>
        <span class="node-label domain-label">
          {{ domain.name }}
        </span>
        <div class="node-actions">
          <button
            class="action-btn"
            title="Ajouter un champ"
            @click.stop="$emit('add-field', domain)"
          >
            <span class="material-symbols-outlined">add</span>
          </button>
          <button
            class="action-btn"
            title="Modifier le domaine"
            @click.stop="$emit('edit-domain', domain)"
          >
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button
            class="action-btn delete-action"
            title="Supprimer le domaine"
            @click.stop="$emit('delete-domain', domain)"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>

      <!-- Field Level -->
      <div v-if="expandedDomains.has(domain.id)" class="tree-children">
        <div
          v-for="(field, fieldIndex) in domain.fields"
          :key="field.id"
          class="tree-node field-node"
          draggable="true"
          @dragstart="handleDragStart($event, field, 'field', fieldIndex)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter($event, field, 'field', fieldIndex)"
          @drop="handleDrop($event, field, 'field', fieldIndex)"
        >
          <div class="node-content" @click="toggleField(field.id)">
            <span class="node-icon">
              <span class="material-symbols-outlined">
                {{ expandedFields.has(field.id) ? 'expand_more' : 'chevron_right' }}
              </span>
            </span>
            <span class="node-label field-label">
              {{ field.name }}
            </span>
            <div class="node-actions">
              <button
                class="action-btn"
                title="Ajouter une compétence"
                @click.stop="$emit('add-competency', field, domain)"
              >
                <span class="material-symbols-outlined">add</span>
              </button>
              <button
                class="action-btn"
                title="Modifier le champ"
                @click.stop="$emit('edit-field', field, domain)"
              >
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button
                class="action-btn delete-action"
                title="Supprimer le champ"
                @click.stop="$emit('delete-field', field, domain)"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>

          <!-- Competency Level -->
          <div v-if="expandedFields.has(field.id)" class="tree-children">
            <div
              v-for="(competency, competencyIndex) in field.competencies"
              :key="competency.id"
              class="tree-node competency-node"
              draggable="true"
              @dragstart="handleDragStart($event, competency, 'competency', competencyIndex)"
              @dragend="handleDragEnd"
              @dragover="handleDragOver"
              @dragenter="handleDragEnter($event, competency, 'competency', competencyIndex)"
              @drop="handleDrop($event, competency, 'competency', competencyIndex)"
            >
              <div class="node-content" @click="toggleCompetency(competency.id)">
                <span class="node-icon">
                  <span class="material-symbols-outlined">
                    {{ expandedCompetencies.has(competency.id) ? 'expand_more' : 'chevron_right' }}
                  </span>
                </span>
                <span class="node-label competency-label">
                  {{ competency.name }}
                </span>
                <div class="node-actions">
                  <button
                    class="action-btn"
                    title="Ajouter une sous-compétence"
                    @click.stop="$emit('add-specific-competency', competency, field, domain)"
                  >
                    <span class="material-symbols-outlined">add</span>
                  </button>
                  <button
                    class="action-btn"
                    title="Modifier la compétence"
                    @click.stop="$emit('edit-competency', competency, field, domain)"
                  >
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    class="action-btn delete-action"
                    title="Supprimer la compétence"
                    @click.stop="$emit('delete-competency', competency, field, domain)"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>

              <!-- Specific Competency Level -->
              <div v-if="expandedCompetencies.has(competency.id)" class="tree-children">
                <div
                  v-for="(specificCompetency, specificIndex) in competency.specificCompetencies"
                  :key="specificCompetency.id"
                  class="tree-node specific-competency-node"
                  draggable="true"
                  @dragstart="handleDragStart($event, specificCompetency, 'specificCompetency', specificIndex)"
                  @dragend="handleDragEnd"
                  @dragover="handleDragOver"
                  @dragenter="handleDragEnter($event, specificCompetency, 'specificCompetency', specificIndex)"
                  @drop="handleDrop($event, specificCompetency, 'specificCompetency', specificIndex)"
                >
                  <div class="node-content">
                    <span class="node-icon">
                      <span class="material-symbols-outlined">fiber_manual_record</span>
                    </span>
                    <span class="node-label specific-competency-label">
                      {{ specificCompetency.name }}
                    </span>
                    <div class="node-actions">
                      <button
                        class="action-btn"
                        title="Modifier la sous-compétence"
                        @click.stop="$emit('edit-specific-competency', specificCompetency, competency, field, domain)"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        class="action-btn delete-action"
                        title="Supprimer la sous-compétence"
                        @click.stop="$emit('delete-specific-competency', specificCompetency, competency, field, domain)"
                      >
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Domain } from '@/types/evaluation'

interface Props {
  domains: Domain[]
}

interface Emits {
  (e: 'add-field', domain: Domain): void
  (e: 'edit-domain', domain: Domain): void
  (e: 'delete-domain', domain: Domain): void
  (e: 'add-competency', field: any, domain: Domain): void
  (e: 'edit-field', field: any, domain: Domain): void
  (e: 'delete-field', field: any, domain: Domain): void
  (e: 'edit-competency', competency: any, field: any, domain: Domain): void
  (e: 'delete-competency', competency: any, field: any, domain: Domain): void
  (e: 'add-specific-competency', competency: any, field: any, domain: Domain): void
  (e: 'edit-specific-competency', specificCompetency: any, competency: any, field: any, domain: Domain): void
  (e: 'delete-specific-competency', specificCompetency: any, competency: any, field: any, domain: Domain): void
}

defineProps<Props>()
defineEmits<Emits>()

// Tree expansion state
const expandedDomains = ref(new Set<string>())
const expandedFields = ref(new Set<string>())
const expandedCompetencies = ref(new Set<string>())

// Tree node management
const toggleDomain = (domainId: string) => {
  if (expandedDomains.value.has(domainId)) {
    expandedDomains.value.delete(domainId)
  } else {
    expandedDomains.value.add(domainId)
  }
}

const toggleField = (fieldId: string) => {
  if (expandedFields.value.has(fieldId)) {
    expandedFields.value.delete(fieldId)
  } else {
    expandedFields.value.add(fieldId)
  }
}

const toggleCompetency = (competencyId: string) => {
  if (expandedCompetencies.value.has(competencyId)) {
    expandedCompetencies.value.delete(competencyId)
  } else {
    expandedCompetencies.value.add(competencyId)
  }
}

// Drag and drop functionality
const handleDragStart = (_event: DragEvent, item: unknown, type: string, index: number) => {
  console.log('Drag start:', { item, type, index })
}

const handleDragEnd = () => {
  console.log('Drag end')
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragEnter = (_event: DragEvent, item: unknown, type: string, index: number) => {
  console.log('Drag enter:', { item, type, index })
}

const handleDrop = (event: DragEvent, item: unknown, type: string, index: number) => {
  event.preventDefault()
  console.log('Drop:', { item, type, index })
}
</script>

<style scoped>
.competencies-tree {
  margin-top: 16px;
}

/* Tree node styles */
.tree-node {
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tree-node:hover {
  background: var(--md-sys-color-surface-container-highest, #e6e0e9);
}

.domain-node {
  border-left: 4px solid var(--md-sys-color-primary, #6750a4);
}

.field-node {
  border-left: 4px solid var(--md-sys-color-secondary, #625b71);
}

.competency-node {
  border-left: 4px solid var(--md-sys-color-tertiary, #7d5260);
}

.specific-competency-node {
  border-left: 4px solid var(--md-sys-color-outline, #79747e);
}

.node-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.node-icon {
  margin-right: 8px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.node-label {
  flex: 1;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.domain-label {
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  color: var(--md-sys-color-primary, #6750a4);
}

.field-label {
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  color: var(--md-sys-color-secondary, #625b71);
}

.competency-label {
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  color: var(--md-sys-color-tertiary, #7d5260);
}

.specific-competency-label {
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  color: var(--md-sys-color-outline, #79747e);
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background: var(--md-sys-color-surface-container-highest, #e6e0e9);
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.action-btn.delete-action:hover {
  background: var(--md-sys-color-error-container, #f9dedc);
  color: var(--md-sys-color-error, #ba1a1a);
}

.action-btn .material-symbols-outlined {
  font-size: 18px;
}

.tree-children {
  margin-left: 32px;
  border-left: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  padding-left: 16px;
}

/* Ghost and dragging states */
.ghost-element {
  opacity: 0.5;
  border: 2px dashed var(--md-sys-color-primary, #6750a4);
  background: var(--md-sys-color-primary-container, #eaddff);
}

.dragging-element {
  opacity: 0.8;
  transform: rotate(2deg);
  box-shadow:
    0px 4px 8px 3px rgba(0, 0, 0, 0.15),
    0px 1px 3px rgba(0, 0, 0, 0.3);
}

.ghost-text {
  font-style: italic;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}
</style>