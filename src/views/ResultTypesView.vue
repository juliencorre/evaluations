<template>
  <div class="result-types-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      title="Types de résultats"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-user-menu="true"
      :show-back-button="true"
      @back="goBack"
      @logout="handleLogout"
    />

    <!-- Types Content -->
    <div class="page-content">
      <ResultTypesGrid
        :result-types="resultTypes"
        @edit="editResultType"
        @delete="deleteResultType"
      />
    </div>

    <!-- Menu FAB pour les actions de types -->
    <MenuFAB
      :menu-items="resultTypesMenuItems"
      @menu-item-click="handleFabMenuClick"
    />
  </div>

  <!-- Result Type Modal -->
  <ResultTypeModal
    ref="resultTypeModalRef"
    @save="handleResultTypeSave"
    @delete="handleResultTypeDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import MenuFAB from '@/components/common/MenuFAB.vue'
import ResultTypesGrid from '@/components/competencies/ResultTypesGrid.vue'
import ResultTypeModal from '@/components/competencies/ResultTypeModal.vue'
import type { ResultTypeConfig } from '@/types/evaluation'
import { SupabaseResultTypesService } from '@/services/supabaseResultTypesService'
import { useLogout } from '@/composables/useLogout'

// Router
const router = useRouter()

// Services
const resultTypesService = new SupabaseResultTypesService()

// State
const isScrolled = ref(false)
const resultTypes = ref<ResultTypeConfig[]>([])

// References
const resultTypeModalRef = ref<InstanceType<typeof ResultTypeModal>>()

// FAB Menu Items
const resultTypesMenuItems = ref([
  {
    key: 'add-type',
    icon: 'add',
    label: 'Nouveau type',
    ariaLabel: 'Créer un nouveau type de résultat',
    type: 'add'
  },
  {
    key: 'import-types',
    icon: 'file_upload',
    label: 'Importer',
    ariaLabel: 'Importer des types de résultats',
    type: 'import'
  }
])

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

// FAB Menu Handler
const handleFabMenuClick = (item: { key: string }) => {
  console.log('FAB menu click:', item.key)
  switch (item.key) {
    case 'add-type':
      openAddResultTypeModal()
      break
    case 'import-types':
      handleImportTypesClick()
      break
    default:
      console.warn('Unknown FAB menu item:', item.key)
  }
}

const handleImportTypesClick = () => {
  console.log('Import types clicked - functionality to be implemented')
  window.alert('Fonctionnalité d\'importation de types - À venir')
}

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

// Modal event handlers
const handleResultTypeSave = async (data: { type: Partial<ResultTypeConfig>; isEditing: boolean }) => {
  console.log('Result type save:', data)

  try {
    if (data.isEditing && data.type.id) {
      // Update existing result type
      await resultTypesService.updateResultType(data.type.id, data.type)
    } else {
      // Create new result type - ensure required fields are present
      if (data.type.name && data.type.type && data.type.config) {
        await resultTypesService.createResultType({
          name: data.type.name,
          type: data.type.type,
          config: data.type.config
        })
      } else {
        throw new Error('Données de type de résultat incomplètes')
      }
    }

    // Refresh result types list
    await loadResultTypes()

    console.log('✅ Result type saved successfully')
  } catch (error) {
    console.error('❌ Error saving result type:', error)
  }
}

const handleResultTypeDelete = async (type: ResultTypeConfig) => {
  console.log('Result type delete:', type)

  try {
    await resultTypesService.deleteResultType(type.id)

    // Refresh result types list
    await loadResultTypes()

    console.log('✅ Result type deleted successfully')
  } catch (error) {
    console.error('❌ Error deleting result type:', error)
  }
}

// Load result types
const loadResultTypes = async () => {
  try {
    resultTypes.value = await resultTypesService.getResultTypes()
    console.log('📋 Result types loaded:', resultTypes.value.length)
  } catch (error) {
    console.error('❌ Error loading result types:', error)
  }
}

// Navigation
const goBack = () => {
  console.log('Going back to previous page')
  router.go(-1)
}

// Event handlers

const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
}

// Lifecycle
onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  // Load result types
  await loadResultTypes()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.result-types-page {
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

/* Responsive */
@media (max-width: 768px) {
  .page-content {
    padding: 16px 8px 80px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 12px 4px 80px;
  }
}

@media (min-width: 1440px) {
  .page-content {
    padding: 24px 32px 80px 80px;
  }
}
</style>