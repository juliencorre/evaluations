<template>
  <div class="competencies-page">
    <header class="page-header">
      <h1 class="page-title">
        <span class="material-symbols-outlined">psychology</span>
        Gestion des Compétences
      </h1>
    </header>

    <div class="page-content">
      <!-- Fonction de recherche temporairement désactivée -->
      <!-- 
      <div class="search-bar">
        <span class="material-symbols-outlined">search</span>
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Rechercher dans l'arborescence..."
          class="search-input"
        />
      </div>
      -->

      <div class="competencies-tree">
        <!-- Domain Level -->
        <div
          v-for="(domain, domainIndex) in frameworkWithDragDrop.domains"
          :key="domain.id"
          :class="[
            'tree-node',
            'domain-node',
            { 'ghost-element': domain.isGhost, 'dragging-element': domain.isDragging }
          ]"
          :draggable="!domain.isGhost && !domain.isDragging"
          @dragstart="!domain.isGhost && handleDragStart($event, domain, 'domain', domainIndex)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter($event, domain, 'domain', domainIndex)"
          @drop="handleDrop($event, domain, 'domain', domainIndex)"
        >
          <div class="node-content" @click="!domain.isGhost && toggleDomain(domain.id)">
            <span v-if="!domain.isGhost" class="node-icon">
              <span class="material-symbols-outlined">
                {{ expandedDomains.has(domain.id) ? 'expand_more' : 'chevron_right' }}
              </span>
            </span>
            <span class="node-label domain-label" :class="{ 'ghost-text': domain.isGhost }">
              {{ domain.isGhost ? 'Zone de dépôt' : domain.name }}
            </span>
            <div v-if="!domain.isGhost" class="node-actions">
              <button
                class="action-btn"
                title="Ajouter un champ"
                @click.stop="openAddFieldModal(domain)"
              >
                <span class="material-symbols-outlined">add</span>
              </button>
              <button
                class="action-btn"
                title="Modifier le domaine"
                @click.stop="openEditDomainModal(domain)"
              >
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button
                class="action-btn delete-action"
                title="Supprimer le domaine"
                @click.stop="openDeleteDomainModal(domain)"
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
              :class="[
                'tree-node',
                'field-node',
                { 'ghost-element': field.isGhost, 'dragging-element': field.isDragging }
              ]"
              :draggable="!field.isGhost && !field.isDragging"
              @dragstart="(event) => {
                if (!field.isGhost) {
                  handleDragStart(event, field, 'field', fieldIndex, { domain });
                  event.stopPropagation();
                }
              }"
              @dragend="handleDragEnd"
              @dragover="handleDragOver"
              @dragenter="(event) => {
                handleDragEnter(event, field, 'field', fieldIndex, { domain });
                event.stopPropagation();
              }"
              @drop="handleDrop($event, field, 'field', fieldIndex, { domain })"
            >
              <div class="node-content" @click="!field.isGhost && toggleField(field.id)">
                <span v-if="!field.isGhost" class="node-icon">
                  <span class="material-symbols-outlined">
                    {{ expandedFields.has(field.id) ? 'expand_more' : 'chevron_right' }}
                  </span>
                </span>
                <span class="node-label field-label" :class="{ 'ghost-text': field.isGhost }">
                  {{ field.isGhost ? 'Zone de dépôt' : field.name }}
                </span>
                <div v-if="!field.isGhost" class="node-actions">
                  <button
                    class="action-btn"
                    title="Ajouter une compétence"
                    @click.stop="openAddCompetencyModal(field, domain)"
                  >
                    <span class="material-symbols-outlined">add</span>
                  </button>
                  <button
                    class="action-btn"
                    title="Modifier le champ"
                    @click.stop="openEditFieldModal(field, domain)"
                  >
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    class="action-btn delete-action"
                    title="Supprimer le champ"
                    @click.stop="openDeleteFieldModal(field, domain)"
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
                  :class="[
                    'tree-node',
                    'competency-node',
                    {
                      'ghost-element': competency.isGhost,
                      'dragging-element': competency.isDragging
                    }
                  ]"
                  :draggable="!competency.isGhost && !competency.isDragging"
                  @dragstart="(event) => {
                    if (!competency.isGhost) {
                      handleDragStart(event, competency, 'competency', competencyIndex, {
                        domain,
                        field
                      });
                      event.stopPropagation();
                    }
                  }"
                  @dragend="handleDragEnd"
                  @dragover="handleDragOver"
                  @dragenter="(event) => {
                    handleDragEnter(event, competency, 'competency', competencyIndex, {
                      domain,
                      field
                    });
                    event.stopPropagation();
                  }"
                  @drop="
                    handleDrop($event, competency, 'competency', competencyIndex, { domain, field })
                  "
                >
                  <div
                    class="node-content"
                    @click="!competency.isGhost && toggleCompetency(competency.id)"
                  >
                    <span v-if="!competency.isGhost" class="node-icon">
                      <span class="material-symbols-outlined">
                        {{
                          expandedCompetencies.has(competency.id) ? 'expand_more' : 'chevron_right'
                        }}
                      </span>
                    </span>
                    <span
                      class="node-label competency-label"
                      :class="{ 'ghost-text': competency.isGhost }"
                    >
                      {{ competency.isGhost ? 'Zone de dépôt' : competency.name }}
                    </span>
                    <div v-if="!competency.isGhost" class="node-actions">
                      <button
                        class="action-btn"
                        title="Ajouter une sous-compétence"
                        @click.stop="openAddSpecificCompetencyModal(competency, field, domain)"
                      >
                        <span class="material-symbols-outlined">add</span>
                      </button>
                      <button
                        class="action-btn"
                        title="Modifier la compétence"
                        @click.stop="openEditCompetencyModal(competency, field, domain)"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        class="action-btn delete-action"
                        title="Supprimer la compétence"
                        @click.stop="openDeleteCompetencyModal(competency, field, domain)"
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
                      :class="[
                        'tree-node',
                        'specific-competency-node',
                        {
                          'ghost-element': specificCompetency.isGhost,
                          'dragging-element': specificCompetency.isDragging
                        }
                      ]"
                      :draggable="!specificCompetency.isGhost && !specificCompetency.isDragging"
                      @dragstart="(event) => {
                        if (!specificCompetency.isGhost) {
                          handleDragStart(
                            event,
                            specificCompetency,
                            'specificCompetency',
                            specificIndex,
                            { domain, field, competency }
                          );
                          event.stopPropagation();
                        }
                      }"
                      @dragend="handleDragEnd"
                      @dragover="handleDragOver"
                      @dragenter="(event) => {
                        handleDragEnter(
                          event,
                          specificCompetency,
                          'specificCompetency',
                          specificIndex,
                          { domain, field, competency }
                        );
                        event.stopPropagation();
                      }"
                      @drop="
                        handleDrop(
                          $event,
                          specificCompetency,
                          'specificCompetency',
                          specificIndex,
                          { domain, field, competency }
                        )
                      "
                    >
                      <div class="node-content">
                        <span v-if="!specificCompetency.isGhost" class="node-icon">
                          <span class="material-symbols-outlined">fiber_manual_record</span>
                        </span>
                        <span
                          class="node-label specific-competency-label"
                          :class="{ 'ghost-text': specificCompetency.isGhost }"
                        >
                          {{
                            specificCompetency.isGhost ? 'Zone de dépôt' : specificCompetency.name
                          }}
                        </span>
                        <div v-if="!specificCompetency.isGhost" class="node-actions">
                          <button
                            class="action-btn"
                            title="Modifier la sous-compétence"
                            @click.stop="
                              openEditSpecificCompetencyModal(
                                specificCompetency,
                                competency,
                                field,
                                domain
                              )
                            "
                          >
                            <span class="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            class="action-btn delete-action"
                            title="Supprimer la sous-compétence"
                            @click.stop="
                              openDeleteSpecificCompetencyModal(
                                specificCompetency,
                                competency,
                                field,
                                domain
                              )
                            "
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
    </div>

    <!-- Material 3 Extended FAB -->
    <button class="extended-fab" @click="openAddDomainModal()">
      <span class="material-symbols-outlined fab-icon">add</span>
      <span class="fab-label">Ajouter un domaine</span>
    </button>

    <!-- Material 3 Dialog - Add/Edit Competency -->
    <div v-if="showAddModal || showEditModal" class="dialog-scrim" @click="closeModal">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <span class="dialog-icon">
            <span class="material-symbols-outlined">{{
              showEditModal ? 'edit' : 'psychology_alt'
            }}</span>
          </span>
          <h2 class="dialog-headline">{{ getModalTitle() }}</h2>
        </div>

        <div class="dialog-content">
          <p class="dialog-supporting-text">
            {{ getModalDescription() }}
          </p>

          <form class="dialog-form" @submit.prevent="saveCompetency">
            <div class="text-field">
              <label for="itemName" class="text-field-label">{{ getFieldLabel('name') }} *</label>
              <input
                id="itemName"
                v-model="currentCompetency.name"
                type="text"
                required
                class="text-field-input"
                :placeholder="getFieldPlaceholder('name')"
              />
              <div class="text-field-underline"></div>
            </div>

            <div class="text-field">
              <label for="itemDescription" class="text-field-label"
                >{{ getFieldLabel('description') }} *</label
              >
              <textarea
                id="itemDescription"
                v-model="currentCompetency.description"
                required
                class="text-field-textarea"
                :placeholder="getFieldPlaceholder('description')"
                rows="3"
              ></textarea>
              <div class="text-field-underline"></div>
            </div>

            <!-- Affichage du contexte (lecture seule) -->
            <div v-if="currentContext && showContextInfo()" class="context-info">
              <div v-if="currentContext.domain">
                <p><strong>Domaine :</strong> {{ currentContext.domain.name }}</p>
              </div>
              <div v-if="currentContext.field">
                <p><strong>Champ :</strong> {{ currentContext.field.name }}</p>
              </div>
              <div v-if="currentContext.competency">
                <p><strong>Compétence parent :</strong> {{ currentContext.competency.name }}</p>
              </div>
            </div>
          </form>
        </div>

        <div class="dialog-actions">
          <button type="button" class="text-button" @click="closeModal">Annuler</button>
          <button type="submit" class="filled-button" @click="saveCompetency">
            {{ showEditModal ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Material 3 Dialog - Delete Confirmation -->
    <div v-if="showDeleteModal" class="dialog-scrim" @click="closeModal">
      <div class="dialog-container alert-dialog" @click.stop>
        <div class="dialog-header">
          <span class="dialog-icon alert-icon">
            <span class="material-symbols-outlined">warning</span>
          </span>
          <h2 class="dialog-headline">{{ getDeleteModalTitle() }}</h2>
        </div>

        <div class="dialog-content">
          <p class="dialog-supporting-text">
            {{ getDeleteModalText() }}
          </p>
          <p class="dialog-supporting-text warning-text">
            {{ getDeleteWarningText() }}
          </p>
        </div>

        <div class="dialog-actions">
          <button type="button" class="text-button" @click="closeModal">Annuler</button>
          <button type="button" class="filled-button destructive" @click="confirmDelete">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

/* eslint-disable no-undef */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCompetencyFrameworkStore } from '../stores/studentsStore'

// Interfaces pour les éléments du framework de compétences
interface CompetencyItem {
  id: string
  name: string
  description: string
  domain: string
  field: string
}

interface DomainItem {
  id: string
  name: string
  description: string
  fields: FieldItem[]
  isGhost?: boolean
  isDragging?: boolean
}

interface FieldItem {
  id: string
  name: string
  description: string
  competencies: CompetencyItemDetailed[]
  isGhost?: boolean
  isDragging?: boolean
}

interface CompetencyItemDetailed {
  id: string
  name: string
  description: string
  specificCompetencies: SpecificCompetencyItem[]
  isGhost?: boolean
  isDragging?: boolean
}

interface SpecificCompetencyItem {
  id: string
  name: string
  description: string
  isGhost?: boolean
  isDragging?: boolean
}

interface DragContext {
  domain?: DomainItem
  field?: FieldItem
  competency?: CompetencyItemDetailed
}

// État réactif local
// const searchTerm = ref('') // Fonction de recherche temporairement désactivée
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentCompetency = ref<CompetencyItem>({
  id: '',
  name: '',
  description: '',
  domain: '',
  field: ''
})
const competencyToDelete = ref<DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem | null>(null)
const currentContext = ref<{ type: string; domain?: DomainItem; field?: FieldItem; competency?: CompetencyItemDetailed; specificCompetency?: SpecificCompetencyItem } | null>(null)

// État d'expansion des nœuds de l'arbre
const expandedDomains = ref(new Set<string>())
const expandedFields = ref(new Set<string>())
const expandedCompetencies = ref(new Set<string>())

// États pour le drag & drop
const draggedItem = ref<DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem | null>(null)
const draggedType = ref<string>('')
const draggedIndex = ref<number>(-1)
const draggedContext = ref<DragContext | null>(null)
const isDragging = ref(false)
const ghostElement = ref<DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem | null>(null)
const ghostPosition = ref<number>(-1)
const ghostContext = ref<DragContext | null>(null)

// Utilisation du store global pour le framework de compétences
const {
  framework,
  updateDomain,
  updateField,
  updateCompetency,
  updateSpecificCompetency,
  addDomain,
  addField,
  addCompetency,
  addSpecificCompetency,
  deleteDomain,
  deleteField,
  deleteCompetency,
  deleteSpecificCompetency,
  reorderDomains,
  reorderFields,
  reorderCompetencies,
  reorderSpecificCompetencies
} = useCompetencyFrameworkStore()

// Framework avec drag & drop visuel
const frameworkWithDragDrop = computed(() => {
  if (!isDragging.value || ghostPosition.value < 0) return framework.value

  // Créer une copie profonde du framework
  const result = JSON.parse(JSON.stringify(framework.value))

  // Ajouter seulement l'élément fantôme sans supprimer l'élément dragué
  if (draggedType.value === 'domain') {
    // Marquer le domaine dragué comme étant en cours de drag
    if (result.domains[draggedIndex.value]) {
      result.domains[draggedIndex.value].isDragging = true
    }

    // Ajouter l'élément fantôme si une position est définie
    if (ghostPosition.value >= 0 && ghostPosition.value !== draggedIndex.value) {
      const ghost = {
        id: 'ghost-domain',
        name: '',
        description: '',
        fields: [],
        isGhost: true
      }
      // Ajuster la position si on insère après l'élément dragué
      const insertPos =
        ghostPosition.value > draggedIndex.value ? ghostPosition.value : ghostPosition.value
      result.domains.splice(insertPos, 0, ghost)
    }
  } else if (draggedType.value === 'field') {
    // Trouver et modifier le bon domaine
    const domain = result.domains.find((d: DomainItem) => d.id === draggedContext.value?.domain?.id)
    if (domain) {
      // Marquer le champ dragué comme étant en cours de drag
      if (domain.fields[draggedIndex.value]) {
        domain.fields[draggedIndex.value].isDragging = true
      }

      if (
        ghostPosition.value >= 0 &&
        ghostPosition.value !== draggedIndex.value &&
        ghostContext.value?.domain?.id === draggedContext.value?.domain?.id
      ) {
        const ghost = {
          id: 'ghost-field',
          name: '',
          description: '',
          competencies: [],
          isGhost: true
        }
        const insertPos =
          ghostPosition.value > draggedIndex.value ? ghostPosition.value : ghostPosition.value
        domain.fields.splice(insertPos, 0, ghost)
      }
    }
  } else if (draggedType.value === 'competency') {
    // Trouver et modifier le bon champ
    const domain = result.domains.find((d: DomainItem) => d.id === draggedContext.value?.domain?.id)
    if (domain) {
      const field = domain.fields.find((f: FieldItem) => f.id === draggedContext.value?.field?.id)
      if (field) {
        // Marquer la compétence draguée comme étant en cours de drag
        if (field.competencies[draggedIndex.value]) {
          field.competencies[draggedIndex.value].isDragging = true
        }

        if (
          ghostPosition.value >= 0 &&
          ghostPosition.value !== draggedIndex.value &&
          ghostContext.value?.field?.id === draggedContext.value?.field?.id
        ) {
          const ghost = {
            id: 'ghost-competency',
            name: '',
            description: '',
            specificCompetencies: [],
            isGhost: true
          }
          const insertPos =
            ghostPosition.value > draggedIndex.value ? ghostPosition.value : ghostPosition.value
          field.competencies.splice(insertPos, 0, ghost)
        }
      }
    }
  } else if (draggedType.value === 'specificCompetency') {
    // Trouver et modifier la bonne compétence
    const domain = result.domains.find((d: DomainItem) => d.id === draggedContext.value?.domain?.id)
    if (domain) {
      const field = domain.fields.find((f: FieldItem) => f.id === draggedContext.value?.field?.id)
      if (field) {
        const competency = field.competencies.find(
          (c: CompetencyItemDetailed) => c.id === draggedContext.value?.competency?.id
        )
        if (competency) {
          // Marquer la sous-compétence draguée comme étant en cours de drag
          if (competency.specificCompetencies[draggedIndex.value]) {
            competency.specificCompetencies[draggedIndex.value].isDragging = true
          }

          if (
            ghostPosition.value >= 0 &&
            ghostPosition.value !== draggedIndex.value &&
            ghostContext.value?.competency?.id === draggedContext.value?.competency?.id
          ) {
            const ghost = {
              id: 'ghost-specific',
              name: '',
              description: '',
              isGhost: true
            }
            const insertPos =
              ghostPosition.value > draggedIndex.value ? ghostPosition.value : ghostPosition.value
            competency.specificCompetencies.splice(insertPos, 0, ghost)
          }
        }
      }
    }
  }

  return result
})

// Framework filtré par la recherche - temporairement désactivé
/*
const filteredFramework = computed(() => {
  if (!searchTerm.value.trim()) {
    return framework
  }
  
  const search = searchTerm.value.toLowerCase()
  
  // Filtrer les domaines, champs et compétences selon le terme de recherche
  const filteredDomains = framework.domains.map(domain => {
    const filteredFields = domain.fields.map(field => {
      const filteredCompetencies = field.competencies.filter(competency => 
        competency.name.toLowerCase().includes(search) ||
        competency.description.toLowerCase().includes(search) ||
        competency.specificCompetencies.some(spec => 
          spec.name.toLowerCase().includes(search) ||
          spec.description.toLowerCase().includes(search)
        )
      )
      
      if (filteredCompetencies.length > 0) {
        return { ...field, competencies: filteredCompetencies }
      }
      
      // Si le champ ou sa description contient le terme de recherche
      if (field.name.toLowerCase().includes(search) || 
          field.description.toLowerCase().includes(search)) {
        return field
      }
      
      return null
    }).filter(Boolean)
    
    if (filteredFields.length > 0) {
      return { ...domain, fields: filteredFields }
    }
    
    // Si le domaine ou sa description contient le terme de recherche
    if (domain.name.toLowerCase().includes(search) || 
        domain.description.toLowerCase().includes(search)) {
      return domain
    }
    
    return null
  }).filter(Boolean)
  
  return { ...framework, domains: filteredDomains }
})
*/

// Fonctions de gestion de l'arbre
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

// Fonctions de drag & drop
 
 
const handleDragStart = (
  event: Event,
  item: DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem,
  type: string,
  index: number,
  context?: DragContext
) => {
  // eslint-disable-next-line no-undef
  const dragEvent = event as DragEvent
  if (!dragEvent.dataTransfer) return

  event.stopPropagation()

  draggedItem.value = item
  draggedType.value = type
  draggedIndex.value = index
  draggedContext.value = context
  isDragging.value = true

  dragEvent.dataTransfer.effectAllowed = 'move'
  dragEvent.dataTransfer.setData('text/plain', item.id)
}

// eslint-disable-next-line no-undef
const handleDragEnd = (_event: Event) => {
  isDragging.value = false

  // Réinitialiser les états
  draggedItem.value = null
  draggedType.value = ''
  draggedIndex.value = -1
  draggedContext.value = null
  ghostElement.value = null
  ghostPosition.value = -1
  ghostContext.value = null
}

// eslint-disable-next-line no-undef
const handleDragOver = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  // eslint-disable-next-line no-undef
  const dragEvent = event as DragEvent
  if (dragEvent.dataTransfer) {
    dragEvent.dataTransfer.dropEffect = 'move'
  }
}

 
 
const handleDragEnter = (
  event: Event,
  targetItem: DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem,
  targetType: string,
  targetIndex: number,
  targetContext?: DragContext
) => {
  event.preventDefault()
  event.stopPropagation()

  // Ne pas traiter les éléments fantômes ou en cours de drag
  if (targetItem.isGhost || targetItem.isDragging) return

  // Vérifier que le type de glissé correspond au type de la cible
  if (draggedType.value !== targetType) return

  // Vérifier que c'est le même contexte parent
  if (
    targetType === 'field' &&
    (!targetContext?.domain ||
      !draggedContext.value?.domain ||
      targetContext.domain.id !== draggedContext.value.domain.id)
  )
    return
  if (
    targetType === 'competency' &&
    (!targetContext?.field ||
      !draggedContext.value?.field ||
      targetContext.field.id !== draggedContext.value.field.id)
  )
    return
  if (
    targetType === 'specificCompetency' &&
    (!targetContext?.competency ||
      !draggedContext.value?.competency ||
      targetContext.competency.id !== draggedContext.value.competency.id)
  )
    return

  // Définir la position du fantôme
  ghostPosition.value = targetIndex
  ghostContext.value = targetContext

  // Créer l'élément fantôme basé sur l'élément dragué
  ghostElement.value = {
    ...draggedItem.value,
    isGhost: true
  }
}

 
 
const handleDrop = (
  event: Event,
  targetItem: DomainItem | FieldItem | CompetencyItemDetailed | SpecificCompetencyItem,
  targetType: string,
  targetIndex: number,
  _targetContext?: DragContext
) => {
  event.preventDefault()
  event.stopPropagation()

  // Vérifier que le type de glissé correspond au type de la cible
  if (draggedType.value !== targetType) return

  // Éviter de se déposer sur soi-même
  if (draggedItem.value?.id === targetItem?.id) return

  const fromIndex = draggedIndex.value
  let toIndex = ghostPosition.value >= 0 ? ghostPosition.value : targetIndex

  // Ajuster l'index si on déplace vers le bas dans la même liste
  if (ghostPosition.value > draggedIndex.value) {
    toIndex = ghostPosition.value - 1
  }

  try {
    switch (draggedType.value) {
      case 'domain':
        reorderDomains(fromIndex, toIndex)
        break
      case 'field':
        if (draggedContext.value?.domain?.id === ghostContext.value?.domain?.id) {
          reorderFields(draggedContext.value.domain.id, fromIndex, toIndex)
        }
        break
      case 'competency':
        if (draggedContext.value?.field?.id === ghostContext.value?.field?.id) {
          reorderCompetencies(draggedContext.value.field.id, fromIndex, toIndex)
        }
        break
      case 'specificCompetency':
        if (draggedContext.value?.competency?.id === ghostContext.value?.competency?.id) {
          reorderSpecificCompetencies(draggedContext.value.competency.id, fromIndex, toIndex)
        }
        break
    }
  } catch (error) {
    console.error('Erreur lors de la réorganisation:', error)
  }
}

// Fonctions CRUD - Domaines (interface)
const openAddDomainModal = () => {
  console.log('Ouvrir modal ajouter domaine')
  showAddModal.value = true
  currentContext.value = { type: 'domain' }
}

const openEditDomainModal = (domain: DomainItem) => {
  console.log('Ouvrir modal éditer domaine:', domain)
  currentCompetency.value = {
    id: domain.id,
    name: domain.name,
    description: domain.description,
    domain: '',
    field: ''
  }
  showEditModal.value = true
  currentContext.value = { type: 'domain', domain }
}

const openDeleteDomainModal = (domain: DomainItem) => {
  console.log('Ouvrir modal supprimer domaine:', domain)
  competencyToDelete.value = domain
  showDeleteModal.value = true
}

// Fonctions CRUD - Champs (interface)
const openAddFieldModal = (domain: DomainItem) => {
  console.log('Ouvrir modal ajouter champ au domaine:', domain)
  showAddModal.value = true
  currentContext.value = { type: 'field', domain }
}

const openEditFieldModal = (field: FieldItem, domain: DomainItem) => {
  console.log('Ouvrir modal éditer champ:', field, 'du domaine:', domain)
  currentCompetency.value = {
    id: field.id,
    name: field.name,
    description: field.description,
    domain: '',
    field: ''
  }
  showEditModal.value = true
  currentContext.value = { type: 'field', field, domain }
}

const openDeleteFieldModal = (field: FieldItem, domain: DomainItem) => {
  console.log('Ouvrir modal supprimer champ:', field, 'du domaine:', domain)
  competencyToDelete.value = field
  showDeleteModal.value = true
}

// Fonctions CRUD - Compétences (interface)
const openAddCompetencyModal = (field: FieldItem, domain: DomainItem) => {
  console.log('Ouvrir modal ajouter compétence au champ:', field, 'du domaine:', domain)
  showAddModal.value = true
  currentContext.value = { type: 'competency', field, domain }
}

const openEditCompetencyModal = (competency: CompetencyItemDetailed, field: FieldItem, domain: DomainItem) => {
  console.log(
    'Ouvrir modal éditer compétence:',
    competency,
    'du champ:',
    field,
    'du domaine:',
    domain
  )
  currentCompetency.value = {
    id: competency.id,
    name: competency.name,
    description: competency.description,
    domain: '',
    field: ''
  }
  showEditModal.value = true
  currentContext.value = { type: 'competency', competency, field, domain }
}

const openDeleteCompetencyModal = (competency: CompetencyItemDetailed, field: FieldItem, domain: DomainItem) => {
  console.log(
    'Ouvrir modal supprimer compétence:',
    competency,
    'du champ:',
    field,
    'du domaine:',
    domain
  )
  competencyToDelete.value = competency
  showDeleteModal.value = true
}

// Fonctions CRUD - Sous-compétences (interface)
const openAddSpecificCompetencyModal = (competency: CompetencyItemDetailed, field: FieldItem, domain: DomainItem) => {
  console.log(
    'Ouvrir modal ajouter sous-compétence à:',
    competency,
    'du champ:',
    field,
    'du domaine:',
    domain
  )
  showAddModal.value = true
  currentContext.value = { type: 'specificCompetency', competency, field, domain }
}

const openEditSpecificCompetencyModal = (
  specificCompetency: SpecificCompetencyItem,
  competency: CompetencyItemDetailed,
  field: FieldItem,
  domain: DomainItem
) => {
  console.log('Ouvrir modal éditer sous-compétence:', specificCompetency)
  currentCompetency.value = {
    id: specificCompetency.id,
    name: specificCompetency.name,
    description: specificCompetency.description,
    domain: '',
    field: ''
  }
  showEditModal.value = true
  currentContext.value = {
    type: 'specificCompetency',
    specificCompetency,
    competency,
    field,
    domain
  }
}

const openDeleteSpecificCompetencyModal = (
  specificCompetency: SpecificCompetencyItem,
  _competency: CompetencyItemDetailed,
  _field: FieldItem,
  _domain: DomainItem
) => {
  console.log('Ouvrir modal supprimer sous-compétence:', specificCompetency)
  competencyToDelete.value = specificCompetency
  showDeleteModal.value = true
}

// Fonctions de modal
// Fonctions utilitaires pour le modal dynamique
const getModalTitle = () => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type
  const isEdit = showEditModal.value

  const titles: Record<string, string> = {
    domain: isEdit ? 'Modifier le domaine' : 'Ajouter un domaine',
    field: isEdit ? 'Modifier le champ' : 'Ajouter un champ',
    competency: isEdit ? 'Modifier la compétence' : 'Ajouter une compétence',
    specificCompetency: isEdit ? 'Modifier la sous-compétence' : 'Ajouter une sous-compétence'
  }

  return titles[type] || ''
}

const getModalDescription = () => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type
  const isEdit = showEditModal.value

  const descriptions: Record<string, string> = {
    domain: isEdit
      ? 'Modifiez les informations du domaine.'
      : 'Saisissez les informations du nouveau domaine.',
    field: isEdit
      ? 'Modifiez les informations du champ.'
      : 'Saisissez les informations du nouveau champ.',
    competency: isEdit
      ? 'Modifiez les informations de la compétence.'
      : 'Saisissez les informations de la nouvelle compétence.',
    specificCompetency: isEdit
      ? 'Modifiez les informations de la sous-compétence.'
      : 'Saisissez les informations de la nouvelle sous-compétence.'
  }

  return descriptions[type] || ''
}

const getFieldLabel = (field: string) => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type

  const labels: Record<string, Record<string, string>> = {
    domain: { name: 'Nom du domaine', description: 'Description du domaine' },
    field: { name: 'Nom du champ', description: 'Description du champ' },
    competency: { name: 'Nom de la compétence', description: 'Description de la compétence' },
    specificCompetency: {
      name: 'Nom de la sous-compétence',
      description: 'Description de la sous-compétence'
    }
  }

  return labels[type]?.[field] || ''
}

const getFieldPlaceholder = (field: string) => {
  if (!currentContext.value) return ''
  const type = currentContext.value.type

  const placeholders: Record<string, Record<string, string>> = {
    domain: {
      name: 'Ex: Mathématiques',
      description: 'Décrivez le domaine de compétences...'
    },
    field: {
      name: 'Ex: Nombres et calculs',
      description: 'Décrivez le champ de compétences...'
    },
    competency: {
      name: 'Ex: Comprendre un texte',
      description: 'Décrivez la compétence...'
    },
    specificCompetency: {
      name: 'Ex: Identifier les informations principales',
      description: 'Décrivez la sous-compétence en détail...'
    }
  }

  return placeholders[type]?.[field] || ''
}

const showContextInfo = () => {
  if (!currentContext.value) return false
  const type = currentContext.value.type
  // Afficher le contexte pour tous les types sauf domaine
  return type !== 'domain'
}

const getDeleteModalTitle = () => {
  if (!competencyToDelete.value) return ''

  // Déterminer le type d'élément à supprimer en fonction de ses propriétés
  if (competencyToDelete.value.fields) return 'Supprimer le domaine'
  if (competencyToDelete.value.competencies) return 'Supprimer le champ'
  if (competencyToDelete.value.specificCompetencies) return 'Supprimer la compétence'
  return 'Supprimer la sous-compétence'
}

const getDeleteModalText = () => {
  if (!competencyToDelete.value) return ''
  const name = competencyToDelete.value.name

  if (competencyToDelete.value.fields)
    return `Êtes-vous sûr de vouloir supprimer le domaine "${name}" ?`
  if (competencyToDelete.value.competencies)
    return `Êtes-vous sûr de vouloir supprimer le champ "${name}" ?`
  if (competencyToDelete.value.specificCompetencies)
    return `Êtes-vous sûr de vouloir supprimer la compétence "${name}" ?`
  return `Êtes-vous sûr de vouloir supprimer la sous-compétence "${name}" ?`
}

const getDeleteWarningText = () => {
  if (!competencyToDelete.value) return ''

  if (competencyToDelete.value.fields) {
    return 'Cette action supprimera définitivement ce domaine et tous ses champs, compétences et évaluations associées.'
  }
  if (competencyToDelete.value.competencies) {
    return 'Cette action supprimera définitivement ce champ et toutes ses compétences et évaluations associées.'
  }
  if (competencyToDelete.value.specificCompetencies) {
    return 'Cette action supprimera définitivement cette compétence et toutes ses sous-compétences et évaluations associées.'
  }
  return 'Cette action supprimera définitivement cette sous-compétence et toutes les évaluations associées.'
}

const saveCompetency = () => {
  if (!currentContext.value || !currentCompetency.value.name.trim()) return

  const { type } = currentContext.value
  const isEdit = showEditModal.value

  try {
    if (type === 'domain') {
      if (isEdit) {
        updateDomain(currentContext.value.domain.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      } else {
        addDomain({
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      }
    } else if (type === 'field') {
      if (isEdit) {
        updateField(currentContext.value.field.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      } else {
        addField(currentContext.value.domain.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      }
    } else if (type === 'competency') {
      if (isEdit) {
        updateCompetency(currentContext.value.competency.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      } else {
        addCompetency(currentContext.value.field.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      }
    } else if (type === 'specificCompetency') {
      if (isEdit) {
        updateSpecificCompetency(currentContext.value.specificCompetency.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      } else {
        addSpecificCompetency(currentContext.value.competency.id, {
          name: currentCompetency.value.name,
          description: currentCompetency.value.description
        })
      }
    }

    console.log('Modification sauvegardée via store:', type, isEdit ? 'modifié' : 'ajouté')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }

  closeModal()
}

const confirmDelete = () => {
  if (!competencyToDelete.value) return

  try {
    const itemToDelete = competencyToDelete.value

    // Identifier le type d'élément et le supprimer via le store
    if (itemToDelete.fields) {
      // Supprimer un domaine
      deleteDomain(itemToDelete.id)
      console.log('Domaine supprimé via store:', itemToDelete.name)
    } else if (itemToDelete.competencies) {
      // Supprimer un champ
      deleteField(itemToDelete.id)
      console.log('Champ supprimé via store:', itemToDelete.name)
    } else if (itemToDelete.specificCompetencies) {
      // Supprimer une compétence
      deleteCompetency(itemToDelete.id)
      console.log('Compétence supprimée via store:', itemToDelete.name)
    } else {
      // Supprimer une sous-compétence
      deleteSpecificCompetency(itemToDelete.id)
      console.log('Sous-compétence supprimée via store:', itemToDelete.name)
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }

  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  currentCompetency.value = { id: '', name: '', description: '', domain: '', field: '' }
  competencyToDelete.value = null
  currentContext.value = null
}
</script>

<style scoped>
/* Réutilisation des styles de la page des élèves avec adaptations */
.competencies-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title .material-symbols-outlined {
  color: #2563eb;
  font-size: 2rem;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-bar {
  position: relative;
  max-width: 400px;
}

.search-bar .material-symbols-outlined {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Design épuré pour l'arborescence des compétences */
.competencies-tree {
  background: #ffffff;
}

/* Styles généraux des nœuds de l'arbre */
.tree-node {
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  position: relative;
  gap: 12px;
}

.node-content:hover {
  background-color: #f8f9fa;
}

.node-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6b7280;
  font-size: 18px;
}

.node-label {
  flex: 1;
  min-width: 0;
  color: #111827;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.node-content:hover .node-actions {
  opacity: 1;
}

/* Hiérarchie par indentation et typographie */

/* Niveau 1 - Domaines */
.domain-node .node-content {
  padding: 12px 16px;
  background-color: #ffffff;
}

.domain-node .node-content:hover {
  background-color: #f8f9fa;
}

.domain-label {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.025em;
}

.domain-node .node-icon {
  color: #4b5563;
  font-size: 20px;
}

/* Niveau 2 - Champs */
.field-node {
  padding-left: 16px;
}

.field-node .node-content {
  padding: 10px 16px;
}

.field-label {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.field-node .node-icon {
  font-size: 18px;
  color: #6b7280;
}

/* Niveau 3 - Compétences */
.competency-node {
  padding-left: 32px;
}

.competency-node .node-content {
  padding: 8px 16px;
}

.competency-label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  line-height: 1.4;
}

.competency-node .node-icon {
  font-size: 16px;
}

/* Niveau 4 - Sous-compétences */
.specific-competency-node {
  padding-left: 48px;
}

.specific-competency-node .node-content {
  padding: 6px 16px;
  cursor: default;
}

.specific-competency-label {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.5;
}

.specific-competency-node .node-icon {
  font-size: 14px;
  color: #9ca3af;
}

/* Conteneurs pour les enfants */
.tree-children {
  position: relative;
}

/* Espacement vertical entre les groupes */
.domain-node:not(:last-child) {
  margin-bottom: 4px;
}

/* Material 3 Icon Button - Standard (40x40dp) */
.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  background: transparent;
  color: #49454f;
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
  border-radius: 50%;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.action-btn:hover::before {
  background: #49454f;
  opacity: 0.08;
}

.action-btn:focus::before {
  background: #49454f;
  opacity: 0.12;
}

.action-btn:active::before {
  background: #49454f;
  opacity: 0.12;
}

.action-btn:focus {
  outline: none;
}

.delete-action:hover {
  color: #ba1a1a;
}

.delete-action:hover::before {
  background: #ba1a1a;
  opacity: 0.08;
}

.delete-action:focus {
  color: #ba1a1a;
}

.delete-action:focus::before {
  background: #ba1a1a;
  opacity: 0.12;
}

/* Material 3 Extended FAB - Same as students page */
.extended-fab {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 1001;
  pointer-events: auto;

  height: 56px;
  min-width: 80px;
  max-width: none;
  padding: 0 16px;

  background: #eaddff;
  color: #21005d;
  border: none;
  border-radius: 16px;

  box-shadow:
    0px 1px 3px 0px rgba(0, 0, 0, 0.3),
    0px 4px 8px 3px rgba(0, 0, 0, 0.15);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;

  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

.fab-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.fab-label {
  white-space: nowrap;
  flex-shrink: 0;
}

.extended-fab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #21005d;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
  border-radius: inherit;
}

.extended-fab:hover {
  box-shadow:
    0px 2px 3px 0px rgba(0, 0, 0, 0.3),
    0px 6px 10px 4px rgba(0, 0, 0, 0.15);
}

.extended-fab:hover::before {
  opacity: 0.08;
}

.extended-fab:focus {
  outline: none;
}

.extended-fab:focus::before {
  opacity: 0.12;
}

.extended-fab:active {
  animation: fabPress 0.1s ease;
}

.extended-fab:active::before {
  opacity: 0.12;
}

@keyframes fabPress {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.96);
  }
  100% {
    transform: scale(1);
  }
}

/* Material 3 Dialog Specifications - Same as students page */
.dialog-scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: scrimFadeIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes scrimFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-container {
  background: #ffffff;
  border-radius: 28px;
  box-shadow:
    0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  width: 100%;
  min-width: 280px;
  max-width: 560px;
  max-height: calc(100vh - 32px);
  overflow: hidden;
  animation: dialogSlideIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.alert-dialog {
  max-width: 312px;
}

.dialog-header {
  padding: 24px 24px 16px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.dialog-icon {
  width: 24px;
  height: 24px;
  color: #625b71;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-icon {
  color: #ba1a1a;
}

.dialog-headline {
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #1c1b1f;
  margin: 0;
  flex: 1;
}

.dialog-content {
  padding: 0 24px 24px 24px;
}

.dialog-supporting-text {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #49454f;
  margin: 0 0 16px 0;
}

.dialog-supporting-text:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #ba1a1a;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.text-field {
  position: relative;
  display: flex;
  flex-direction: column;
}

.text-field-label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: #49454f;
  margin-bottom: 8px;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-input,
.text-field-textarea,
.text-field-select {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #1c1b1f;
  background: transparent;
  border: none;
  outline: none;
  padding: 8px 0 8px 0;
  width: 100%;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
  resize: vertical;
}

.text-field-input::placeholder,
.text-field-textarea::placeholder {
  color: #49454f;
  opacity: 0.6;
}

.text-field-underline {
  height: 1px;
  background: #79747e;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
}

.text-field-underline::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  right: 50%;
  height: 2px;
  background: #6750a4;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-input:focus + .text-field-underline::after,
.text-field-textarea:focus + .text-field-underline::after,
.text-field-select:focus + .text-field-underline::after {
  left: 0;
  right: 0;
}

.text-field-input:focus ~ .text-field-label,
.text-field-textarea:focus ~ .text-field-label,
.text-field-select:focus ~ .text-field-label,
.text-field:focus-within .text-field-label {
  color: #6750a4;
}

/* Styles pour l'affichage du contexte dans le modal */
.context-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  border-left: 3px solid #e5e7eb;
}

.context-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #6b7280;
}

.context-info strong {
  color: #374151;
  font-weight: 500;
}

.dialog-actions {
  padding: 16px 24px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.text-button {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #6750a4;
  background: transparent;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

.text-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #6750a4;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-button:hover::before {
  opacity: 0.08;
}

.text-button:focus::before {
  opacity: 0.12;
}

.text-button:active::before {
  opacity: 0.12;
}

.filled-button {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #ffffff;
  background: #6750a4;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0px 1px 2px 0px rgba(0, 0, 0, 0.3),
    0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.filled-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.filled-button:hover::before {
  opacity: 0.08;
}

.filled-button:focus::before {
  opacity: 0.12;
}

.filled-button:active::before {
  opacity: 0.12;
}

.filled-button.destructive {
  background: #ba1a1a;
  color: #ffffff;
}

.filled-button.destructive::before {
  background: #ffffff;
}

/* Responsive */
@media (max-width: 768px) {
  .competencies-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .page-title {
    font-size: 1.5rem;
  }

  /* Ajustements pour l'arbre sur mobile */
  .field-node {
    padding-left: 12px;
  }

  .competency-node {
    padding-left: 24px;
  }

  .specific-competency-node {
    padding-left: 36px;
  }

  .domain-node .node-content {
    padding: 10px 12px;
  }

  .field-node .node-content {
    padding: 8px 12px;
  }

  .competency-node .node-content {
    padding: 6px 12px;
  }

  .specific-competency-node .node-content {
    padding: 4px 12px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .action-btn .material-symbols-outlined {
    font-size: 18px;
  }

  .extended-fab {
    position: fixed !important;
    bottom: 16px;
    right: 16px;
    height: 56px;
    padding: 0 16px;
    z-index: 1001;
  }

  .fab-label {
    font-size: 13px;
  }

  .dialog-scrim {
    padding: 8px;
  }

  .dialog-container {
    min-width: 280px;
    max-width: calc(100vw - 16px);
  }

  .dialog-header {
    padding: 16px 16px 12px 16px;
  }

  .dialog-content {
    padding: 0 16px 16px 16px;
  }

  .dialog-actions {
    padding: 12px 16px 16px 16px;
    flex-direction: column-reverse;
    gap: 8px;
  }

  .text-button,
  .filled-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  /* Réductions supplémentaires pour très petits écrans */
  .field-node {
    padding-left: 8px;
  }

  .competency-node {
    padding-left: 16px;
  }

  .specific-competency-node {
    padding-left: 24px;
  }

  .domain-node .node-content {
    padding: 8px 8px;
  }

  .field-node .node-content {
    padding: 6px 8px;
  }

  .competency-node .node-content {
    padding: 4px 8px;
  }

  .specific-competency-node .node-content {
    padding: 3px 8px;
  }

  .extended-fab {
    position: fixed !important;
    bottom: 12px;
    right: 12px;
    height: 52px;
    padding: 0 12px;
    min-width: 72px;
    z-index: 1001;
  }

  .fab-icon {
    font-size: 22px;
  }

  .fab-label {
    font-size: 12px;
  }
}

/* Styles pour les éléments fantômes */
.ghost-element {
  background: rgba(37, 99, 235, 0.1) !important;
  border: 2px dashed rgba(37, 99, 235, 0.3) !important;
  border-radius: 4px;
  margin: 2px 0;
}

.ghost-text {
  color: rgba(37, 99, 235, 0.7);
  font-style: italic;
  font-weight: 400;
}

.ghost-element .node-content {
  padding: 8px 16px;
  pointer-events: none;
}

.ghost-element .node-icon {
  opacity: 0.5;
}

/* Styles pour les éléments en cours de drag */
.dragging-element {
  opacity: 0.5;
  background: rgba(0, 0, 0, 0.05) !important;
}

.dragging-element * {
  pointer-events: none;
}
</style>
