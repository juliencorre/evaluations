<template>
  <main role="main" class="evaluations-page">
    <h1 class="visually-hidden">Tableau d'évaluation des compétences</h1>

    <!-- Center-aligned App Bar -->
    <CenterAppBar
      v-if="!isLoading && framework && framework.domains.length > 0"
      :title="currentEvaluation?.name || 'Évaluation'"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      @back="goBackToList"
      @logout="handleLogout"
    />


    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>Chargement des compétences...</p>
    </div>

    <!-- Desktop Evaluation Table -->
    <EvaluationTable
      v-else-if="framework && framework.domains.length > 0 && !isMobileView && currentEvaluation"
      :evaluation="currentEvaluation"
      :students="evaluationStudents"
      :framework="framework"
    />

    <!-- Mobile Evaluation View -->
    <EvaluationMobileView
      v-else-if="framework && framework.domains.length > 0 && isMobileView && currentEvaluation"
      :evaluation="currentEvaluation"
      :students="evaluationStudents"
      :framework="framework"
    />

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>Aucune compétence disponible</p>
    </div>

    <!-- Menu FAB pour les actions d'évaluation -->
    <MenuFAB
      v-if="!isLoading && framework && framework.domains.length > 0"
      :menu-items="fabMenuItems"
      @menu-item-click="handleMenuItemClick"
      @edit="openEditEvaluation"
      @delete="openDeleteEvaluation"
    />

    <!-- Dialog de confirmation de suppression -->
    <ConfirmationDialog
      :visible="showDeleteDialog"
      title="Supprimer l'évaluation"
      :message="`Êtes-vous sûr de vouloir supprimer l'évaluation '${currentEvaluation?.name}' ?`"
      warning-text="Cette action est irréversible. Toutes les données d'évaluation associées seront définitivement supprimées."
      @close="showDeleteDialog = false"
      @confirm="confirmDeleteEvaluation"
    />

    <!-- Dialog de partage des résultats -->
    <ShareResultsDialog
      :visible="showShareDialog"
      :evaluation-info="shareEvaluationInfo || undefined"
      @close="showShareDialog = false"
      @send-email="handleSendEmail"
    />

  </main>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Define props for the evaluation ID
interface Props {
  id: string
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

// Components
const EvaluationTable = defineAsyncComponent({
  loader: () => import('@/components/EvaluationTable.vue'),
  loadingComponent: {
    template: '<div class="loading-placeholder">Chargement du tableau...</div>',
    style: 'padding: 2rem; text-align: center; color: var(--md-sys-color-on-surface-variant, #666);'
  },
  delay: 200,
  timeout: 5000
})

import CenterAppBar from '@/components/common/CenterAppBar.vue'
import EvaluationMobileView from '@/components/EvaluationMobileView.vue'
import MenuFAB from '@/components/common/MenuFAB.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import ShareResultsDialog from '@/components/common/ShareResultsDialog.vue'

// Services
import { shareResultsService } from '@/services/shareResultsService'

// Services
import { supabaseEvaluationClassesService } from '@/services/supabaseEvaluationClassesService'

// Stores
import { useCompetencyFrameworkStore } from '@/stores/competencyFrameworkStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { useSchoolYearStore } from '@/stores/schoolYearStore'
import { useLogout } from '@/composables/useLogout'
import { storeToRefs } from 'pinia'

const competenciesStore = useCompetencyFrameworkStore()
const { framework } = storeToRefs(competenciesStore)
const { refreshFromSupabase } = competenciesStore

const evaluationStore = useEvaluationStore()
const { setCurrentEvaluation, getEvaluationById, loadEvaluations, currentEvaluation } = evaluationStore

const schoolYearStore = useSchoolYearStore()

// State
const isLoading = ref(true)
interface EvaluationStudent {
  id: string
  firstName: string
  lastName: string
  displayName: string
  gender?: string | null
}

const evaluationStudents = ref<EvaluationStudent[]>([])
const isScrolled = ref(false)
const isMobileView = ref(false)
const showDeleteDialog = ref(false)
const showShareDialog = ref(false)

// FAB Menu configuration
const fabMenuItems = [
  {
    key: 'export',
    icon: 'download',
    label: 'Exporter',
    ariaLabel: 'Exporter les résultats de l\'évaluation',
    type: 'export'
  },
  {
    key: 'share',
    icon: 'share',
    label: 'Partager',
    ariaLabel: 'Partager les résultats par email',
    type: 'share'
  },
  {
    key: 'edit',
    icon: 'edit',
    label: 'Éditer',
    ariaLabel: 'Éditer l\'évaluation',
    type: 'edit'
  },
  {
    key: 'delete',
    icon: 'delete',
    label: 'Supprimer',
    ariaLabel: 'Supprimer l\'évaluation',
    type: 'delete'
  }
]

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

// Mobile detection
const checkMobileView = () => {
  isMobileView.value = window.innerWidth <= 768
}

const handleResize = () => {
  checkMobileView()
}

// Share evaluation info for dialog
const shareEvaluationInfo = computed(() => {
  if (!currentEvaluation || !framework.value?.domains || !evaluationStudents.value) {
    return null
  }

  const competenciesCount = framework.value.domains
    .filter((domain: any) => domain && domain.fields && Array.isArray(domain.fields))
    .reduce((sum: number, domain: any) =>
      sum + domain.fields
        .filter((field: any) => field && field.competencies && Array.isArray(field.competencies))
        .reduce((fieldSum: number, field: any) => fieldSum + field.competencies.length, 0)
    , 0)

  return {
    name: currentEvaluation.name || 'Évaluation sans nom',
    description: currentEvaluation.description,
    studentsCount: evaluationStudents.value.length,
    competenciesCount
  }
})

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  handleScroll()
  checkMobileView()

  // Load evaluations from database first to get the frameworkId
  await loadEvaluations()

  // Ensure school years are loaded
  await schoolYearStore.ensureLoaded()

  // Load the specific evaluation based on the route parameter
  const evaluationId = props.id || (route?.params?.id as string)
  if (evaluationId) {
    const evaluation = getEvaluationById(evaluationId)
    if (evaluation) {
      console.log('📋 [HomeView] Loading evaluation:', evaluation.name)
      setCurrentEvaluation(evaluation)

      // Load competencies framework from database using the evaluation's frameworkId
      if (evaluation.frameworkId) {
        await refreshFromSupabase(evaluation.frameworkId)
      }

      if (!framework || !framework.value) {
        console.error('❌ [HomeView] Failed to load framework')
        isLoading.value = false
        return
      }

      // Load students for this evaluation
      const currentSchoolYearId = schoolYearStore.currentSchoolYear.value?.id
      evaluationStudents.value = await supabaseEvaluationClassesService.getStudentsForEvaluation(
        evaluationId,
        currentSchoolYearId
      )
      console.log(`👥 [HomeView] Loaded ${evaluationStudents.value.length} students for evaluation`)
    } else {
      console.error('❌ [HomeView] Evaluation not found:', evaluationId)
    }
  }

  isLoading.value = false
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

// Event handlers

const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
}

const goBackToList = () => {
  router.push('/evaluations')
}

// Share dialog handlers
const openShareDialog = () => {
  console.log('📧 [HomeView] Opening share dialog')
  showShareDialog.value = true
}

const handleSendEmail = async (data: { emails: string[]; message: string }) => {
  console.log('📧 [HomeView] Sending results via email', {
    recipients: data.emails.length,
    messageLength: data.message.length
  })

  try {
    // Prepare evaluation data for sharing (similar to export)
    if (!framework.value?.domains || framework.value.domains.length === 0) {
      alert('Aucune compétence à partager. Veuillez vérifier que des compétences sont définies pour cette évaluation.')
      return
    }

    if (!evaluationStudents.value || evaluationStudents.value.length === 0) {
      alert('Aucun élève à partager. Veuillez vérifier que des élèves sont inscrits dans cette classe.')
      return
    }

    // Prepare data for sharing (reuse export data structure)
    const exportData = {
      evaluation: {
        id: currentEvaluation?.id || 'unknown',
        name: currentEvaluation?.name || 'Évaluation sans nom',
        description: currentEvaluation?.description || '',
        date: new Date().toLocaleDateString('fr-FR'),
        className: '',
        schoolYearFilter: schoolYearStore.currentSchoolYear?.value?.name || 'Toutes les années'
      },
      students: evaluationStudents.value.map(student => ({
        id: student.id,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim()
      })),
      results: [],
      competencies: (framework.value?.domains || [])
        .filter((domain: any) => domain && domain.fields && Array.isArray(domain.fields))
        .flatMap((domain: any) =>
          domain.fields
            .filter((field: any) => field && field.competencies && Array.isArray(field.competencies))
            .flatMap((field: any) =>
              field.competencies.map((competency: any) => ({
                id: competency.id,
                name: competency.name || 'Compétence sans nom',
                domain: domain.name || 'Domaine sans nom',
                field: field.name || 'Champ sans nom',
                results: evaluationStudents.value.map(student => ({
                  studentId: student.id,
                  studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
                  result: null // Results would need to be mapped from currentEvaluation.results
                }))
              }))
            )
        ),
      summary: {
        totalStudents: evaluationStudents.value.length,
        totalCompetencies: (framework.value?.domains || [])
          .filter((domain: any) => domain && domain.fields && Array.isArray(domain.fields))
          .reduce((sum: number, domain: any) =>
            sum + domain.fields
              .filter((field: any) => field && field.competencies && Array.isArray(field.competencies))
              .reduce((fieldSum: number, field: any) => fieldSum + field.competencies.length, 0)
          , 0),
        exportDate: new Date().toISOString()
      }
    }

    // Share the results
    const result = await shareResultsService.shareEvaluationResults(
      exportData,
      data.emails,
      data.message
    )

    if (result.success) {
      console.log('✅ [HomeView] Results shared successfully')
      alert(`✅ ${result.message}`)
      showShareDialog.value = false
    } else {
      console.error('❌ [HomeView] Failed to share results:', result.message)
      alert(`❌ ${result.message}`)
    }
  } catch (error) {
    console.error('❌ [HomeView] Error sharing results:', error)
    alert('Erreur lors du partage des résultats. Veuillez réessayer.')
  }
}

// MenuFAB handlers
const handleMenuItemClick = (item: { key: string }) => {
  switch (item.key) {
    case 'export':
      exportEvaluationResults()
      break
    case 'share':
      openShareDialog()
      break
    case 'edit':
      openEditEvaluation()
      break
    case 'delete':
      openDeleteEvaluation()
      break
    default:
      console.warn('Unknown menu item:', item.key)
  }
}

const exportEvaluationResults = () => {
  console.log('📊 Export evaluation results requested')

  try {
    // Debug framework structure
    console.log('Framework structure:', framework.value)
    console.log('Domains:', framework.value?.domains)

    // Check if we have the necessary data
    if (!framework.value?.domains || framework.value.domains.length === 0) {
      alert('Aucune compétence à exporter. Veuillez vérifier que des compétences sont définies pour cette évaluation.')
      return
    }

    if (!evaluationStudents.value || evaluationStudents.value.length === 0) {
      alert('Aucun élève à exporter. Veuillez vérifier que des élèves sont inscrits dans cette classe.')
      return
    }

    // Prepare data for export with safety checks
    const exportData = {
      evaluation: {
        id: currentEvaluation?.id || 'unknown',
        name: currentEvaluation?.name || 'Évaluation sans nom',
        description: currentEvaluation?.description || '',
        date: new Date().toLocaleDateString('fr-FR'),
        className: '', // Class name would need to be resolved from classId
        schoolYearFilter: schoolYearStore.currentSchoolYear?.value?.name || 'Toutes les années'
      },
      students: evaluationStudents.value.map(student => ({
        id: student.id,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim()
      })),
      results: [],
      competencies: (framework.value?.domains || [])
        .filter((domain: any) => domain && domain.fields && Array.isArray(domain.fields))
        .flatMap((domain: any) =>
          domain.fields
            .filter((field: any) => field && field.competencies && Array.isArray(field.competencies))
            .flatMap((field: any) =>
              field.competencies.map((competency: any) => ({
                id: competency.id,
                name: competency.name || 'Compétence sans nom',
                domain: domain.name || 'Domaine sans nom',
                field: field.name || 'Champ sans nom',
                results: evaluationStudents.value.map(student => ({
                  studentId: student.id,
                  studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
                  result: null // Results would need to be mapped from currentEvaluation.results
                }))
              }))
            )
        ),
      summary: {
        totalStudents: evaluationStudents.value.length,
        totalCompetencies: (framework.value?.domains || [])
          .filter((domain: any) => domain && domain.fields && Array.isArray(domain.fields))
          .reduce((sum: number, domain: any) =>
            sum + domain.fields
              .filter((field: any) => field && field.competencies && Array.isArray(field.competencies))
              .reduce((fieldSum: number, field: any) => fieldSum + field.competencies.length, 0)
          , 0),
        exportDate: new Date().toISOString()
      }
    }

    console.log('Export data prepared:', exportData)

    if (exportData.competencies.length === 0) {
      alert('Aucune compétence valide trouvée pour l\'export. Veuillez vérifier la structure des compétences.')
      return
    }

    // Generate CSV content
    const csvContent = generateCSV(exportData)

    // Download file
    const fileName = `evaluation_${(currentEvaluation?.name || 'evaluation').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csvContent, fileName)

    console.log('✅ Export completed successfully')
  } catch (error) {
    console.error('❌ Error exporting evaluation results:', error)
    alert('Erreur lors de l\'export des résultats. Veuillez réessayer.')
  }
}

interface ExportedResult {
  studentId: string
  result: string | null
}

interface ExportedCompetency {
  id: string
  name: string
  domain: string
  field: string
  results: ExportedResult[]
}

interface ExportedStudent {
  id: string
  fullName: string
}

interface ExportSummary {
  totalStudents: number
  totalCompetencies: number
  exportDate: string
}

interface ExportedEvaluationInfo {
  id: string
  name: string
  description?: string
  date: string
  schoolYearFilter?: string
}

interface EvaluationExportData {
  evaluation: ExportedEvaluationInfo
  competencies: ExportedCompetency[]
  students: ExportedStudent[]
  summary: ExportSummary
}

const generateCSV = (data: EvaluationExportData) => {
  try {
    // Validate input data
    if (!data || !data.competencies || !Array.isArray(data.competencies)) {
      throw new Error('Invalid competencies data for CSV generation')
    }

    if (!data.students || !Array.isArray(data.students)) {
      throw new Error('Invalid students data for CSV generation')
    }

    // Create headers
    const headers = [
      'Élève',
      ...data.competencies.map(comp => `"${comp.domain} - ${comp.field} - ${comp.name}"`)
    ]
    const csvRows = [headers.join(',')]

    // Add student rows
    data.students.forEach(student => {
      const row = [
        `"${student.fullName || 'Élève sans nom'}"`,
        ...data.competencies.map(comp => {
          const result = comp.results.find(r => r.studentId === student.id)
          return result?.result ? `"${result.result}"` : '""'
        })
      ]
      csvRows.push(row.join(','))
    })

    // Add summary information
    csvRows.push('') // Empty line
    csvRows.push(`"Évaluation","${data.evaluation.name || 'Sans nom'}"`)
    csvRows.push(`"Description","${data.evaluation.description || 'Aucune description'}"`)
    csvRows.push(`"Date d'export","${data.evaluation.date || new Date().toLocaleDateString('fr-FR')}"`)
    csvRows.push(`"Filtre année scolaire","${data.evaluation.schoolYearFilter || 'Aucun filtre'}"`)
    csvRows.push(`"Nombre d'élèves","${data.summary.totalStudents || 0}"`)
    csvRows.push(`"Nombre de compétences","${data.summary.totalCompetencies || 0}"`)

    return csvRows.join('\n')
  } catch (error) {
    console.error('❌ Error generating CSV:', error)
    throw new Error('Erreur lors de la génération du fichier CSV')
  }
}

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const openEditEvaluation = () => {
  console.log('Edit evaluation requested')
  const evaluationId = props.id || (route?.params?.id as string)
  if (evaluationId) {
    router.push(`/evaluation/${evaluationId}/edit`)
  } else {
    console.error('❌ [HomeView] No evaluation ID found for editing')
  }
}

const openDeleteEvaluation = () => {
  console.log('Delete evaluation requested')
  showDeleteDialog.value = true
}

const confirmDeleteEvaluation = () => {
  console.log('Evaluation deletion confirmed')
  showDeleteDialog.value = false
  // TODO: Implémenter la suppression réelle de l'évaluation
  window.alert('Suppression de l\'évaluation - Fonctionnalité à venir')
}

// Debug logs
if (framework.value) {
  console.log('🏠 [HomeView] Initialisation avec framework:', {
    domains: framework.value.domains?.length || 0,
    frameworkName: framework.value.name || 'N/A',
    isLoading: isLoading.value
  })
}
</script>

<style scoped>
.evaluations-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: var(--md-sys-spacing-16);
}

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: var(--md-sys-typescale-body-large-font-family);
  font-size: var(--md-sys-typescale-body-large-font-size);
  font-weight: var(--md-sys-typescale-body-large-font-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  color: var(--md-sys-color-on-surface-variant);
  padding: var(--md-sys-spacing-6);
  text-align: center;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

main {
  height: calc(100vh - 60px);
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
}
</style>