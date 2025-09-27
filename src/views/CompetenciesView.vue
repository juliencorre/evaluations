<template>
  <div class="competencies-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      title="Compétences"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      @back="goBack"
      @user-menu-click="handleUserMenuClick"
      @logout="handleLogout"
    />

    <!-- Référentiels Content -->
    <div class="page-content">
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

    <!-- Menu FAB pour les actions de compétences -->
    <MenuFAB
      :menu-items="competenciesMenuItems"
      @menu-item-click="handleFabMenuClick"
    />
  </div>

  <!-- Competency Modals -->
  <CompetencyModals
    ref="modalsRef"
    :result-types="resultTypes"
    @save="handleModalSave"
    @delete="handleModalDelete"
  />

</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import MenuFAB from '@/components/common/MenuFAB.vue'
import CompetencyTree from '@/components/competencies/CompetencyTree.vue'
import CompetencyModals from '@/components/competencies/CompetencyModals.vue'
import type {
  Domain,
  Field,
  Competency,
  SpecificCompetency,
  ResultTypeConfig
} from '@/types/evaluation'
import { useCompetencyFrameworkStore } from '@/stores/studentsStore'
import { SupabaseCompetenciesService } from '@/services/supabaseCompetenciesService'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'
import { useLogout } from '@/composables/useLogout'

// Store
const competencyStore = useCompetencyFrameworkStore()

// Router
const router = useRouter()

// Services
const resultTypesService = new SupabaseResultTypesService()

// State
const isScrolled = ref(false)
const resultTypes = ref<ResultTypeConfig[]>([])

// Framework state with real data from store
const frameworkWithDragDrop = computed(() => ({
  domains: competencyStore.framework.value.domains
}))

interface MenuFabItem {
  key: string
  icon: string
  label: string
  ariaLabel: string
  type?: string
}

type CompetencyModalType = 'domain' | 'field' | 'competency' | 'specificCompetency'

interface CompetencyModalData {
  id?: string
  name: string
  description: string
  resultTypeConfigId?: string
}

interface CompetencyModalContext {
  domain?: Domain
  field?: Field
  competency?: Competency
}

// FAB Menu Items
const competenciesMenuItems = ref<MenuFabItem[]>([
  {
    key: 'add-domain',
    icon: 'add',
    label: 'Nouveau domaine',
    ariaLabel: 'Ajouter un nouveau domaine',
    type: 'add'
  },
  {
    key: 'import',
    icon: 'file_upload',
    label: 'Importer',
    ariaLabel: 'Importer un référentiel',
    type: 'import'
  }
])

// Modal states
const modalsRef = ref<InstanceType<typeof CompetencyModals> | null>(null)

// FAB Menu Handler
const handleFabMenuClick = (item: MenuFabItem) => {
  console.log('FAB menu click:', item.key)
  switch (item.key) {
    case 'add-domain':
      openAddDomainModal()
      break
    case 'import':
      handleImportClick()
      break
    default:
      console.warn('Unknown FAB menu item:', item.key)
  }
}

const handleImportClick = () => {
  console.log('Import clicked - functionality to be implemented')
  window.alert('Fonctionnalité d\'importation - À venir')
}

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
const openAddCompetencyModal = (field: Field, domain: Domain) => {
  console.log('Add competency to field:', field.name, 'in domain:', domain.name)
  modalsRef.value?.openAddDialog('competency', { domain, field })
}

const openEditFieldModal = (field: Field, domain: Domain) => {
  console.log('Edit field:', field.name, 'in domain:', domain.name)
  modalsRef.value?.openEditDialog('field', field, { domain })
}

const openDeleteFieldModal = (field: Field, domain: Domain) => {
  console.log('Delete field:', field.name, 'in domain:', domain.name)
  modalsRef.value?.openDeleteDialog('field', field, { domain })
}

// Competency operations
const openEditCompetencyModal = (competency: Competency, field: Field, domain: Domain) => {
  console.log('Edit competency:', competency.name, 'in field:', field.name)
  modalsRef.value?.openEditDialog('competency', competency, { domain, field })
}

const openDeleteCompetencyModal = (competency: Competency, field: Field, domain: Domain) => {
  console.log('Delete competency:', competency.name, 'in field:', field.name)
  modalsRef.value?.openDeleteDialog('competency', competency, { domain, field })
}

// Specific competency operations
const openAddSpecificCompetencyModal = (competency: Competency, field: Field, domain: Domain) => {
  console.log('Add specific competency to:', competency.name)
  modalsRef.value?.openAddDialog('specificCompetency', { domain, field, competency })
}

const openEditSpecificCompetencyModal = (
  specificCompetency: SpecificCompetency,
  competency: Competency,
  field: Field,
  domain: Domain
) => {
  console.log('Edit specific competency:', specificCompetency.name)
  modalsRef.value?.openEditDialog('specificCompetency', specificCompetency, { domain, field, competency })
}

const openDeleteSpecificCompetencyModal = (
  specificCompetency: SpecificCompetency,
  competency: Competency,
  field: Field,
  domain: Domain
) => {
  console.log('Delete specific competency:', specificCompetency.name)
  modalsRef.value?.openDeleteDialog('specificCompetency', specificCompetency, { domain, field, competency })
}

const openAddDomainModal = () => {
  console.log('Add domain')
  modalsRef.value?.openAddDialog('domain')
}

// TODO: Add saveCompetency function when modals are implemented


// Import/Export operations
// TODO: Implement these functions when Import/Export tab is re-enabled
// const handleFileImport = (file: globalThis.File) => {
//   console.log('Import file:', file.name)
//   // Implementation
// }

// const exportFramework = () => {
//   console.log('Export framework')
//   // Implementation
// }

// Modal event handlers
const handleModalSave = async (
  data: {
    type: CompetencyModalType
    data: CompetencyModalData
    context?: CompetencyModalContext
  }
) => {
  console.log('Modal save:', data)

  try {
    switch (data.type) {
      case 'domain':
        if (data.data.id) {
          await SupabaseCompetenciesService.updateDomain(data.data.id, {
            name: data.data.name,
            description: data.data.description
          })
        } else {
          await SupabaseCompetenciesService.createDomain(
            data.data.name,
            data.data.description
          )
        }
        break

      case 'field':
        if (data.data.id) {
          await SupabaseCompetenciesService.updateField(data.data.id, {
            name: data.data.name,
            description: data.data.description
          })
        } else if (data.context?.domain) {
          await SupabaseCompetenciesService.createField(
            data.context.domain.id,
            data.data.name,
            data.data.description
          )
        }
        break

      case 'competency':
        if (data.data.id) {
          await SupabaseCompetenciesService.updateCompetency(data.data.id, {
            name: data.data.name,
            description: data.data.description
          })
        } else if (data.context?.field) {
          await SupabaseCompetenciesService.createCompetency(
            data.context.field.id,
            data.data.name,
            data.data.description
          )
        }
        break

      case 'specificCompetency':
        if (data.data.id) {
          // Update specific competency including result type
          await SupabaseCompetenciesService.updateSpecificCompetency(data.data.id, {
            name: data.data.name,
            description: data.data.description,
            resultTypeConfigId: data.data.resultTypeConfigId || undefined
          })
        } else if (data.context?.competency) {
          await SupabaseCompetenciesService.createSpecificCompetency(
            data.context.competency.id,
            data.data.name,
            data.data.description,
            data.data.resultTypeConfigId || undefined
          )
        }
        break
    }

    // Refresh data after save
    await competencyStore.refreshFromSupabase()
  } catch (error) {
    console.error('Error saving competency data:', error)
  }
}

const handleModalDelete = async (
  data: {
    type: CompetencyModalType
    item: CompetencyModalData
    context?: CompetencyModalContext
  }
) => {
  console.log('Modal delete:', data)

  try {
    switch (data.type) {
      case 'domain':
        if (data.item?.id) {
          await SupabaseCompetenciesService.deleteDomain(data.item.id)
        }
        break

      case 'field':
        if (data.item?.id) {
          await SupabaseCompetenciesService.deleteField(data.item.id)
        }
        break

      case 'competency':
        if (data.item?.id) {
          await SupabaseCompetenciesService.deleteCompetency(data.item.id)
        }
        break

      case 'specificCompetency':
        if (data.item?.id) {
          await SupabaseCompetenciesService.deleteSpecificCompetency(data.item.id)
        }
        break
    }

    // Refresh data after delete
    await competencyStore.refreshFromSupabase()
  } catch (error) {
    console.error('Error deleting competency data:', error)
  }
}


// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  await competencyStore.refreshFromSupabase()

  // Load result types
  try {
    resultTypes.value = await resultTypesService.getResultTypes()
    console.log('✅ Types de résultat chargés:', resultTypes.value.length)
  } catch (error) {
    console.error('❌ Erreur lors du chargement des types de résultat:', error)
  }

  // Scroll handling
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Event handlers
const goBack = () => {
  console.log('Going back to previous page')
  router.go(-1)
}

const handleUserMenuClick = () => {
  console.log('User menu clicked')
}


const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
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
  padding: 24px 32px 80px;
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

.types-content {
  padding-top: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-content {
    padding: 16px 8px 80px;
  }

  .page-title {
    font-size: 20px;
    line-height: 28px;
    margin: 0 0 16px 0;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 12px 4px 80px;
  }

  .page-title {
    font-size: 18px;
    line-height: 24px;
    margin: 0 0 12px 0;
  }
}

@media (min-width: 1440px) {
  .page-content {
    padding: 24px 32px 80px 80px;
  }
}
</style>