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
          v-for="domain in framework.domains" 
          :key="domain.id"
          class="tree-node domain-node"
        >
          <div class="node-content" @click="toggleDomain(domain.id)">
            <span class="node-icon">
              <span class="material-symbols-outlined">
                {{ expandedDomains.has(domain.id) ? 'expand_more' : 'chevron_right' }}
              </span>
            </span>
            <span class="node-label domain-label">{{ domain.name }}</span>
            <div class="node-actions">
              <button @click.stop="openAddFieldModal(domain)" class="action-btn" title="Ajouter un champ">
                <span class="material-symbols-outlined">add</span>
              </button>
              <button @click.stop="openEditDomainModal(domain)" class="action-btn" title="Modifier le domaine">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button @click.stop="openDeleteDomainModal(domain)" class="action-btn delete-action" title="Supprimer le domaine">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          
          <!-- Field Level -->
          <div v-if="expandedDomains.has(domain.id)" class="tree-children">
            <div 
              v-for="field in domain.fields" 
              :key="field.id"
              class="tree-node field-node"
            >
              <div class="node-content" @click="toggleField(field.id)">
                <span class="node-icon">
                  <span class="material-symbols-outlined">
                    {{ expandedFields.has(field.id) ? 'expand_more' : 'chevron_right' }}
                  </span>
                </span>
                <span class="node-label field-label">{{ field.name }}</span>
                <div class="node-actions">
                  <button @click.stop="openAddCompetencyModal(field, domain)" class="action-btn" title="Ajouter une compétence">
                    <span class="material-symbols-outlined">add</span>
                  </button>
                  <button @click.stop="openEditFieldModal(field, domain)" class="action-btn" title="Modifier le champ">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button @click.stop="openDeleteFieldModal(field, domain)" class="action-btn delete-action" title="Supprimer le champ">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
              
              <!-- Competency Level -->
              <div v-if="expandedFields.has(field.id)" class="tree-children">
                <div 
                  v-for="competency in field.competencies" 
                  :key="competency.id"
                  class="tree-node competency-node"
                >
                  <div class="node-content" @click="toggleCompetency(competency.id)">
                    <span class="node-icon">
                      <span class="material-symbols-outlined">
                        {{ expandedCompetencies.has(competency.id) ? 'expand_more' : 'chevron_right' }}
                      </span>
                    </span>
                    <span class="node-label competency-label">{{ competency.name }}</span>
                    <div class="node-actions">
                      <button @click.stop="openAddSpecificCompetencyModal(competency, field, domain)" class="action-btn" title="Ajouter une sous-compétence">
                        <span class="material-symbols-outlined">add</span>
                      </button>
                      <button @click.stop="openEditCompetencyModal(competency, field, domain)" class="action-btn" title="Modifier la compétence">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button @click.stop="openDeleteCompetencyModal(competency, field, domain)" class="action-btn delete-action" title="Supprimer la compétence">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Specific Competency Level -->
                  <div v-if="expandedCompetencies.has(competency.id)" class="tree-children">
                    <div 
                      v-for="specificCompetency in competency.specificCompetencies" 
                      :key="specificCompetency.id"
                      class="tree-node specific-competency-node"
                    >
                      <div class="node-content">
                        <span class="node-icon">
                          <span class="material-symbols-outlined">fiber_manual_record</span>
                        </span>
                        <span class="node-label specific-competency-label">{{ specificCompetency.name }}</span>
                        <div class="node-actions">
                          <button @click.stop="openEditSpecificCompetencyModal(specificCompetency, competency, field, domain)" class="action-btn" title="Modifier la sous-compétence">
                            <span class="material-symbols-outlined">edit</span>
                          </button>
                          <button @click.stop="openDeleteSpecificCompetencyModal(specificCompetency, competency, field, domain)" class="action-btn delete-action" title="Supprimer la sous-compétence">
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
    <button @click="openAddDomainModal()" class="extended-fab">
      <span class="material-symbols-outlined fab-icon">add</span>
      <span class="fab-label">Ajouter un domaine</span>
    </button>

    <!-- Material 3 Dialog - Add/Edit Competency -->
    <div v-if="showAddModal || showEditModal" class="dialog-scrim" @click="closeModal">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <span class="dialog-icon">
            <span class="material-symbols-outlined">{{ showEditModal ? 'edit' : 'psychology_alt' }}</span>
          </span>
          <h2 class="dialog-headline">{{ getModalTitle() }}</h2>
        </div>
        
        <div class="dialog-content">
          <p class="dialog-supporting-text">
            {{ getModalDescription() }}
          </p>
          
          <form @submit.prevent="saveCompetency" class="dialog-form">
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
              <label for="itemDescription" class="text-field-label">{{ getFieldLabel('description') }} *</label>
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
          <button type="button" @click="closeModal" class="text-button">
            Annuler
          </button>
          <button type="submit" @click="saveCompetency" class="filled-button">
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
          <button type="button" @click="closeModal" class="text-button">
            Annuler
          </button>
          <button type="button" @click="confirmDelete" class="filled-button destructive">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCompetencyFrameworkStore } from '../stores/studentsStore'

// Interface pour les compétences
interface CompetencyItem {
  id: string
  name: string
  description: string
  domain: string
  field: string
}

// État réactif local
// const searchTerm = ref('') // Fonction de recherche temporairement désactivée
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentCompetency = ref<CompetencyItem>({ id: '', name: '', description: '', domain: '', field: '' })
const competencyToDelete = ref<any>(null)
const currentContext = ref<any>(null) // Pour stocker le contexte d'ajout

// État d'expansion des nœuds de l'arbre
const expandedDomains = ref(new Set<string>())
const expandedFields = ref(new Set<string>())
const expandedCompetencies = ref(new Set<string>())

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
  deleteSpecificCompetency
} = useCompetencyFrameworkStore()

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

// Fonctions CRUD - Domaines (interface)
const openAddDomainModal = () => {
  console.log('Ouvrir modal ajouter domaine')
  showAddModal.value = true
  currentContext.value = { type: 'domain' }
}

const openEditDomainModal = (domain: any) => {
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

const openDeleteDomainModal = (domain: any) => {
  console.log('Ouvrir modal supprimer domaine:', domain)
  competencyToDelete.value = domain
  showDeleteModal.value = true
}

// Fonctions CRUD - Champs (interface)
const openAddFieldModal = (domain: any) => {
  console.log('Ouvrir modal ajouter champ au domaine:', domain)
  showAddModal.value = true
  currentContext.value = { type: 'field', domain }
}

const openEditFieldModal = (field: any, domain: any) => {
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

const openDeleteFieldModal = (field: any, domain: any) => {
  console.log('Ouvrir modal supprimer champ:', field, 'du domaine:', domain)
  competencyToDelete.value = field
  showDeleteModal.value = true
}

// Fonctions CRUD - Compétences (interface)
const openAddCompetencyModal = (field: any, domain: any) => {
  console.log('Ouvrir modal ajouter compétence au champ:', field, 'du domaine:', domain)
  showAddModal.value = true
  currentContext.value = { type: 'competency', field, domain }
}

const openEditCompetencyModal = (competency: any, field: any, domain: any) => {
  console.log('Ouvrir modal éditer compétence:', competency, 'du champ:', field, 'du domaine:', domain)
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

const openDeleteCompetencyModal = (competency: any, field: any, domain: any) => {
  console.log('Ouvrir modal supprimer compétence:', competency, 'du champ:', field, 'du domaine:', domain)
  competencyToDelete.value = competency
  showDeleteModal.value = true
}

// Fonctions CRUD - Sous-compétences (interface)
const openAddSpecificCompetencyModal = (competency: any, field: any, domain: any) => {
  console.log('Ouvrir modal ajouter sous-compétence à:', competency, 'du champ:', field, 'du domaine:', domain)
  showAddModal.value = true
  currentContext.value = { type: 'specificCompetency', competency, field, domain }
}

const openEditSpecificCompetencyModal = (specificCompetency: any, competency: any, field: any, domain: any) => {
  console.log('Ouvrir modal éditer sous-compétence:', specificCompetency)
  currentCompetency.value = {
    id: specificCompetency.id,
    name: specificCompetency.name,
    description: specificCompetency.description,
    domain: '',
    field: ''
  }
  showEditModal.value = true
  currentContext.value = { type: 'specificCompetency', specificCompetency, competency, field, domain }
}

const openDeleteSpecificCompetencyModal = (specificCompetency: any, _competency: any, _field: any, _domain: any) => {
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
    domain: isEdit ? 'Modifiez les informations du domaine.' : 'Saisissez les informations du nouveau domaine.',
    field: isEdit ? 'Modifiez les informations du champ.' : 'Saisissez les informations du nouveau champ.',
    competency: isEdit ? 'Modifiez les informations de la compétence.' : 'Saisissez les informations de la nouvelle compétence.',
    specificCompetency: isEdit ? 'Modifiez les informations de la sous-compétence.' : 'Saisissez les informations de la nouvelle sous-compétence.'
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
    specificCompetency: { name: 'Nom de la sous-compétence', description: 'Description de la sous-compétence' }
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
  
  if (competencyToDelete.value.fields) return `Êtes-vous sûr de vouloir supprimer le domaine "${name}" ?`
  if (competencyToDelete.value.competencies) return `Êtes-vous sûr de vouloir supprimer le champ "${name}" ?`
  if (competencyToDelete.value.specificCompetencies) return `Êtes-vous sûr de vouloir supprimer la compétence "${name}" ?`
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
  color: var(--md-sys-color-on-surface-variant, #49454f);
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
  background: var(--md-sys-color-on-surface-variant, #49454f);
  opacity: 0.08;
}

.action-btn:focus::before {
  background: var(--md-sys-color-on-surface-variant, #49454f);
  opacity: 0.12;
}

.action-btn:active::before {
  background: var(--md-sys-color-on-surface-variant, #49454f);
  opacity: 0.12;
}

.action-btn:focus {
  outline: none;
}

.delete-action:hover {
  color: var(--md-sys-color-error, #ba1a1a);
}

.delete-action:hover::before {
  background: var(--md-sys-color-error, #ba1a1a);
  opacity: 0.08;
}

.delete-action:focus {
  color: var(--md-sys-color-error, #ba1a1a);
}

.delete-action:focus::before {
  background: var(--md-sys-color-error, #ba1a1a);
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
  
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  border: none;
  border-radius: 16px;
  
  box-shadow: 
    0px 1px 3px 0px rgba(0, 0, 0, 0.3),
    0px 4px 8px 3px rgba(0, 0, 0, 0.15);
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
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
  background: var(--md-sys-color-on-primary-container, #21005d);
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
  0% { transform: scale(1); }
  50% { transform: scale(0.96); }
  100% { transform: scale(1); }
}

/* Material 3 Dialog Specifications - Same as students page */
.dialog-scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-scrim, rgba(0, 0, 0, 0.32));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: scrimFadeIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes scrimFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-container {
  background: var(--md-sys-color-surface-container-high, #f3edf7);
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
  color: var(--md-sys-color-secondary, #625b71);
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-icon {
  color: var(--md-sys-color-error, #ba1a1a);
}

.dialog-headline {
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0;
  flex: 1;
}

.dialog-content {
  padding: 0 24px 24px 24px;
}

.dialog-supporting-text {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0 0 16px 0;
}

.dialog-supporting-text:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: var(--md-sys-color-error, #ba1a1a);
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
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin-bottom: 8px;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-input,
.text-field-textarea,
.text-field-select {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1c1b1f);
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
  color: var(--md-sys-color-on-surface-variant, #49454f);
  opacity: 0.6;
}

.text-field-underline {
  height: 1px;
  background: var(--md-sys-color-outline, #79747e);
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
  background: var(--md-sys-color-primary, #6750a4);
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
  color: var(--md-sys-color-primary, #6750a4);
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
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  color: var(--md-sys-color-primary, #6750a4);
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
  background: var(--md-sys-color-primary, #6750a4);
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
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  color: var(--md-sys-color-on-primary, #ffffff);
  background: var(--md-sys-color-primary, #6750a4);
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.filled-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-primary, #ffffff);
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
  background: var(--md-sys-color-error, #ba1a1a);
  color: var(--md-sys-color-on-error, #ffffff);
}

.filled-button.destructive::before {
  background: var(--md-sys-color-on-error, #ffffff);
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
</style>