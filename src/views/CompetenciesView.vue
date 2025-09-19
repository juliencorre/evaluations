<template>
  <div class="competencies-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      title="Compétences"
      :is-scrolled="isScrolled"
      :show-search="false"
      @user-menu-click="handleUserMenuClick"
    />

    <!-- Competency Tabs -->
    <CompetencyTabs v-model="activeView" :tabs="tabItems" />
    <!-- Tree View -->
    <div v-if="activeView === 'tree'" class="page-content">
      <h2 class="page-title">Référentiels de compétences</h2>

      <CompetencyTree
        :domains="frameworkWithDragDrop.domains"
        @add-field="openAddFieldModal"
        @edit-domain="openEditDomainModal"
        @delete-domain="openDeleteDomainModal"
        @add-competency="openAddCompetencyModal"
        @edit-field="openEditFieldModal"
        @delete-field="openDeleteFieldModal"
        @edit-competency="openEditCompetencyModal"
        @delete-competency="openDeleteCompetencyModal"
        @add-specific-competency="openAddSpecificCompetencyModal"
        @edit-specific-competency="openEditSpecificCompetencyModal"
        @delete-specific-competency="openDeleteSpecificCompetencyModal"
      />
    </div>

    <!-- Types View -->
    <div v-if="activeView === 'types'" class="page-content">
      <h2 class="page-title">Types de résultats disponibles</h2>

      <ResultTypesGrid
        :result-types="resultTypes"
        @edit="editResultType"
        @delete="deleteResultType"
      />
    </div>

    <!-- Import/Export View -->
    <div v-if="activeView === 'import'" class="page-content">
      <ImportExportSection
        import-title="Importer un référentiel"
        import-description="Importez un fichier JSON contenant un référentiel de compétences"
        export-title="Exporter le référentiel"
        export-description="Exportez le référentiel actuel au format JSON"
        export-button-text="Exporter en JSON"
        file-accept=".json"
        :importing="false"
        :exporting="false"
        @import="handleFileImport"
        @export="exportFramework"
      />
    </div>

    <!-- FABs -->
    <ExtendedFAB
      v-if="activeView === 'tree'"
      icon="add"
      label="Ajouter un domaine"
      :visible="true"
      @click="openAddDomainModal"
    />

    <ExtendedFAB
      v-if="activeView === 'types'"
      icon="add"
      label="Nouveau type"
      :visible="true"
      @click="openAddResultTypeModal"
    />
  </div>

  <!-- Competency Modals -->
  <CompetencyModals
    ref="modalsRef"
    :result-types="resultTypes"
    @save="handleModalSave"
    @delete="handleModalDelete"
  />

  <!-- Result Type Modal -->
  <ResultTypeModal
    ref="resultTypeModalRef"
    @save="handleResultTypeSave"
    @delete="handleResultTypeDelete"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import CompetencyTabs from '@/components/competencies/CompetencyTabs.vue'
import ExtendedFAB from '@/components/common/ExtendedFAB.vue'
import ImportExportSection from '@/components/common/ImportExportSection.vue'
import CompetencyTree from '@/components/competencies/CompetencyTree.vue'
import ResultTypesGrid from '@/components/competencies/ResultTypesGrid.vue'
import CompetencyModals from '@/components/competencies/CompetencyModals.vue'
import ResultTypeModal from '@/components/competencies/ResultTypeModal.vue'
import type { Domain, ResultTypeConfig } from '@/types/evaluation'
import { useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'

interface TabItem {
  id: string
  label: string
  value: string
}

// Store
const competencyStore = useCompetencyFrameworkStore()

// Services
const resultTypesService = new SupabaseResultTypesService()

// State
const activeView = ref('tree')
const isScrolled = ref(false)

// Tab configuration
const tabItems = computed<TabItem[]>(() => [
  {
    id: 'tree',
    label: 'Référentiels',
    value: 'tree'
  },
  {
    id: 'types',
    label: 'Types',
    value: 'types'
  },
  {
    id: 'import',
    label: 'Import / Export',
    value: 'import'
  }
])

// Framework state with real data from store
const frameworkWithDragDrop = computed(() => ({
  domains: competencyStore.framework.value.domains
}))

// Result types state
const resultTypes = ref<ResultTypeConfig[]>([])

// Modal states
const modalsRef = ref()
const resultTypeModalRef = ref()

// TODO: Add editing context when modals are implemented

// TODO: Add modal management functions when modals are implemented

// Tree operations
const openAddFieldModal = (domain: Domain) => {
  console.log('Add field to domain:', domain)
  modalsRef.value?.openAddDialog('field', { domain })
}

const openEditDomainModal = (domain: Domain) => {
  console.log('Edit domain:', domain)
  modalsRef.value?.openEditDialog('domain', domain)
}

const openDeleteDomainModal = (domain: Domain) => {
  console.log('Delete domain:', domain)
  modalsRef.value?.openDeleteDialog('domain', domain)
}

// Field operations
const openAddCompetencyModal = (field: any, domain: any) => {
  console.log('Add competency to field:', field.name, 'in domain:', domain.name)
  modalsRef.value?.openAddDialog('competency', { domain, field })
}

const openEditFieldModal = (field: any, domain: any) => {
  console.log('Edit field:', field.name, 'in domain:', domain.name)
  modalsRef.value?.openEditDialog('field', field, { domain })
}

const openDeleteFieldModal = (field: any, domain: any) => {
  console.log('Delete field:', field.name, 'in domain:', domain.name)
  modalsRef.value?.openDeleteDialog('field', field, { domain })
}

// Competency operations
const openEditCompetencyModal = (competency: any, field: any, domain: any) => {
  console.log('Edit competency:', competency.name, 'in field:', field.name)
  modalsRef.value?.openEditDialog('competency', competency, { domain, field })
}

const openDeleteCompetencyModal = (competency: any, field: any, domain: any) => {
  console.log('Delete competency:', competency.name, 'in field:', field.name)
  modalsRef.value?.openDeleteDialog('competency', competency, { domain, field })
}

// Specific competency operations
const openAddSpecificCompetencyModal = (competency: any, field: any, domain: any) => {
  console.log('Add specific competency to:', competency.name)
  modalsRef.value?.openAddDialog('specificCompetency', { domain, field, competency })
}

const openEditSpecificCompetencyModal = (specificCompetency: any, competency: any, field: any, domain: any) => {
  console.log('Edit specific competency:', specificCompetency.name)
  modalsRef.value?.openEditDialog('specificCompetency', specificCompetency, { domain, field, competency })
}

const openDeleteSpecificCompetencyModal = (specificCompetency: any, competency: any, field: any, domain: any) => {
  console.log('Delete specific competency:', specificCompetency.name)
  modalsRef.value?.openDeleteDialog('specificCompetency', specificCompetency, { domain, field, competency })
}

const openAddDomainModal = () => {
  console.log('Add domain')
  modalsRef.value?.openAddDialog('domain')
}

// TODO: Add saveCompetency function when modals are implemented

// Result type operations
const openAddResultTypeModal = () => {
  console.log('Add result type')
  resultTypeModalRef.value?.openAddModal()
}

const editResultType = (type: ResultTypeConfig) => {
  console.log('Edit result type:', type)
  resultTypeModalRef.value?.openEditModal(type)
}

const deleteResultType = (type: ResultTypeConfig) => {
  console.log('Delete result type:', type)
  resultTypeModalRef.value?.openDeleteModal(type)
}

// Import/Export operations
const handleFileImport = (file: globalThis.File) => {
  console.log('Import file:', file.name)
  // Implementation
}

const exportFramework = () => {
  console.log('Export framework')
  // Implementation
}

// Modal event handlers
const handleModalSave = async (data: { type: string; data: any; context?: any }) => {
  console.log('Modal save:', data)
  // TODO: Implement save logic with competencyStore
  // For now, just refresh data
  await competencyStore.refreshFromSupabase()
}

const handleModalDelete = async (data: { type: string; item: any; context?: any }) => {
  console.log('Modal delete:', data)
  // TODO: Implement delete logic with competencyStore
  // For now, just refresh data
  await competencyStore.refreshFromSupabase()
}

// Result type modal event handlers
const handleResultTypeSave = async (data: { type: Partial<ResultTypeConfig>; isEditing: boolean }) => {
  console.log('Result type save:', data)
  try {
    if (data.isEditing && data.type.id) {
      await resultTypesService.updateResultType(data.type.id, data.type as ResultTypeConfig)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...resultTypeWithoutId } = data.type
      // Ensure type is defined, default to 'scale' if undefined
      const typeToCreate = {
        ...resultTypeWithoutId,
        type: resultTypeWithoutId.type || 'scale',
        config: {
          values: resultTypeWithoutId.config?.values || []
        }
      }
      await resultTypesService.createResultType(typeToCreate as Omit<ResultTypeConfig, 'id'>)
    }
    // Reload result types
    resultTypes.value = await resultTypesService.getResultTypes()
  } catch (error) {
    console.error('Error saving result type:', error)
  }
}

const handleResultTypeDelete = async (type: ResultTypeConfig) => {
  console.log('Result type delete:', type)
  try {
    await resultTypesService.deleteResultType(type.id!)
    // Reload result types
    resultTypes.value = await resultTypesService.getResultTypes()
  } catch (error) {
    console.error('Error deleting result type:', error)
  }
}

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  await competencyStore.refreshFromSupabase()
  // Load result types
  resultTypes.value = await resultTypesService.getResultTypes()

  // Scroll handling
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Event handlers
const handleUserMenuClick = () => {
  console.log('User menu clicked')
}
</script>

<style scoped>
.competencies-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background-color: transparent;
}

.page-title {
  font-family: var(--md-sys-typescale-headline-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-small-size, 24px);
  font-weight: var(--md-sys-typescale-headline-small-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 32px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0 0 24px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-content {
    padding: 16px;
  }
}

@media (min-width: 1440px) {
  .page-content {
    padding-left: 80px;
  }
}
</style>