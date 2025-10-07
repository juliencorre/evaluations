<template>
  <div class="evaluation-wrapper">
    <!-- Filters Panel -->
    <div class="filters-panel" :class="{ 'collapsed': !filtersExpanded }">
      <div class="filters-header" @click="toggleFilters">
        <div class="filters-title">
          <span class="material-symbols-outlined">filter_list</span>
          <span>Filtres</span>
          <span v-if="activeFiltersCount > 0" class="filters-count">{{ activeFiltersCount }}</span>
        </div>
        <button class="toggle-button" :aria-label="filtersExpanded ? 'Masquer les filtres' : 'Afficher les filtres'">
          <span class="material-symbols-outlined">{{ filtersExpanded ? 'expand_less' : 'expand_more' }}</span>
        </button>
      </div>

      <div v-show="filtersExpanded" class="filters-content">
        <!-- Genre Filter -->
        <div class="filter-group">
          <label class="filter-label">Genre des élèves</label>
          <div class="filter-chips">
            <button
              class="filter-chip"
              :class="{ 'active': genderFilter === 'all' }"
              @click="genderFilter = 'all'"
            >
              <span class="material-symbols-outlined">person</span>
              <span>Tous</span>
            </button>
            <button
              class="filter-chip chip-male"
              :class="{ 'active': genderFilter === 'M' }"
              @click="genderFilter = 'M'"
            >
              <span class="material-symbols-outlined">male</span>
              <span>Garçons</span>
            </button>
            <button
              class="filter-chip chip-female"
              :class="{ 'active': genderFilter === 'F' }"
              @click="genderFilter = 'F'"
            >
              <span class="material-symbols-outlined">female</span>
              <span>Filles</span>
            </button>
            <button
              class="filter-chip chip-neutral"
              :class="{ 'active': genderFilter === 'unspecified' }"
              @click="genderFilter = 'unspecified'"
            >
              <span class="material-symbols-outlined">help</span>
              <span>Non spécifié</span>
            </button>
          </div>
        </div>

        <!-- Domain Filter -->
        <div class="filter-group">
          <label class="filter-label">Domaines</label>
          <div class="filter-chips">
            <button
              class="filter-chip"
              :class="{ 'active': selectedDomains.length === 0 }"
              @click="clearDomainFilter"
            >
              <span class="material-symbols-outlined">select_all</span>
              <span>Tous</span>
            </button>
            <button
              v-for="domain in availableDomains"
              :key="domain.id"
              class="filter-chip"
              :class="{ 'active': selectedDomains.includes(domain.id) }"
              @click="toggleDomain(domain.id)"
            >
              <span>{{ domain.name }}</span>
            </button>
          </div>
        </div>

        <!-- Field Filter -->
        <div class="filter-group">
          <label class="filter-label">Champs</label>
          <div class="filter-chips">
            <button
              class="filter-chip"
              :class="{ 'active': selectedFields.length === 0 }"
              @click="clearFieldFilter"
            >
              <span class="material-symbols-outlined">select_all</span>
              <span>Tous</span>
            </button>
            <button
              v-for="field in availableFields"
              :key="field.id"
              class="filter-chip"
              :class="{ 'active': selectedFields.includes(field.id) }"
              @click="toggleField(field.id)"
            >
              <span>{{ field.name }}</span>
            </button>
          </div>
        </div>

        <!-- Competency Filter -->
        <div class="filter-group">
          <label class="filter-label">Compétences</label>
          <div class="filter-chips">
            <button
              class="filter-chip"
              :class="{ 'active': selectedCompetencies.length === 0 }"
              @click="clearCompetencyFilter"
            >
              <span class="material-symbols-outlined">select_all</span>
              <span>Toutes</span>
            </button>
            <button
              v-for="competency in availableCompetencies"
              :key="competency.id"
              class="filter-chip"
              :class="{ 'active': selectedCompetencies.includes(competency.id) }"
              @click="toggleCompetency(competency.id)"
            >
              <span>{{ competency.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation controls -->
    <div class="table-navigation">
      <div class="nav-controls">
        <button
          class="nav-button nav-button-left"
          :disabled="!canScrollLeft"
          title="Faire défiler vers la gauche"
          @click="scrollLeft"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <span class="nav-info">{{ currentStudentRange }}</span>
        <button
          class="nav-button nav-button-right"
          :disabled="!canScrollRight"
          title="Faire défiler vers la droite"
          @click="scrollRight"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Table container -->
    <div ref="tableContainer" class="evaluation-table-container" @scroll="handleScroll">
      <table class="evaluation-table">
      <!-- Fixed header -->
      <thead>
            <tr>
              <th class="hierarchy-header sticky-left domain-col">
                <div class="header-content">
                  <span>Domaine</span>
                </div>
              </th>
              <th class="hierarchy-header sticky-left field-col">
                <div class="header-content">
                  <span>Champ</span>
                </div>
              </th>
              <th class="hierarchy-header sticky-left competency-col">
                <div class="header-content">
                  <span>Compétence</span>
                </div>
              </th>
              <th class="hierarchy-header sticky-left specific-competency-col">
                <div class="header-content">
                  <span>Sous-compétence</span>
                </div>
              </th>
              <th
                v-for="student in filteredStudents"
                :key="student.id"
                class="student-header"
                :class="getStudentHeaderClass(student)"
                :title="`${student.firstName} ${student.lastName}`"
              >
                <div class="student-name">
                  <span class="student-display-name">{{ student.displayName }}</span>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Table body -->
          <tbody>
            <tr
              v-for="node in visibleNodes"
              :key="node.id"
              :class="['competency-row', `type-${node.type}`]"
            >
              <!-- Hierarchy cells (sticky left) -->
              <td class="hierarchy-cell sticky-left domain-cell">
                <div class="cell-content">
                  {{ node.hierarchyData?.domain || '' }}
                </div>
              </td>
              <td class="hierarchy-cell sticky-left field-cell">
                <div class="cell-content">
                  {{ node.hierarchyData?.field || '' }}
                </div>
              </td>
              <td class="hierarchy-cell sticky-left competency-cell">
                <div class="cell-content">
                  {{ node.hierarchyData?.competency || '' }}
                </div>
              </td>
              <td class="hierarchy-cell sticky-left specific-competency-cell">
                <div class="cell-content">
                  {{ node.hierarchyData?.specificCompetency || node.name }}
                </div>
              </td>

              <!-- Student result cells -->
              <td
                v-for="student in filteredStudents"
                :key="`${node.id}-${student.id}`"
                :ref="(el) => setCellRef(el, node.id, student.id)"
                class="result-cell"
                :class="[
                  ...getResultCellClass(node, student.id),
                  { editing: isEditing(node.id, student.id) }
                ]"
                @click.stop="startEditing(node, student.id, $event)"
              >
                <div class="result-content">
                  <!-- Editing mode -->
                  <div
                    v-if="canShowResult(node) && isEditing(node.id, student.id)"
                    class="edit-mode"
                  >
                    <!-- Numeric input for numeric result types -->
                    <InlineNumericInput
                      v-if="isNumericResultType(node)"
                      :initial-value="editingValue"
                      :trigger-element="currentTriggerElement || undefined"
                      @save="(value) => selectValue(value, node.id, student.id)"
                      @close="stopEditing"
                    />
                    <!-- Selector for other result types -->
                    <InlineResultSelector
                      v-else
                      :options="getResultValues(node)"
                      :selected-value="editingValue"
                      :trigger-element="currentTriggerElement || undefined"
                      @select="(option) => selectValue(option.value, node.id, student.id)"
                      @close="stopEditing"
                    />
                  </div>

                  <!-- Display mode -->
                  <span
                    v-else-if="canShowResult(node)"
                    class="result-badge"
                    :class="`level-${(getStudentResult(node.id, student.id)?.value || getStudentResult(node.id, student.id)?.level || 'N/A').toLowerCase().replace('/', '-')}`"
                    :title="getResultTitle(node.id, student.id)"
                  >
                    {{ getStudentResult(node.id, student.id)?.value || getStudentResult(node.id, student.id)?.level || 'N/A' }}
                  </span>
                </div>
              </td>
            </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type ComponentPublicInstance } from 'vue'
import type {
  Student,
  Evaluation,
  TreeNode,
  EvaluationResult,
  CompetencyFramework,
  ResultTypeConfig,
  ResultTypeConfigValue
} from '@/types/evaluation'
import { buildCompetencyTree, flattenTree, getCompetencyResult } from '@/utils/competencyTree'
import { useEvaluationResultsStore } from '@/stores/evaluationResultsStore'
import { supabaseResultTypesService } from '@/services/supabaseResultTypesService'
import InlineResultSelector from '@/components/evaluation/InlineResultSelector.vue'
import InlineNumericInput from '@/components/evaluation/InlineNumericInput.vue'

interface Props {
  evaluation: Evaluation
  students: Student[]
  framework: CompetencyFramework
}

const props = defineProps<Props>()

const competencyTree = ref<TreeNode[]>([])

// Filters state
const filtersExpanded = ref(false)
const genderFilter = ref<'all' | 'M' | 'F' | 'unspecified'>('all')
const selectedDomains = ref<string[]>([])
const selectedFields = ref<string[]>([])
const selectedCompetencies = ref<string[]>([])

// Inline editing state
const editingCell = ref<{ competencyId: string; studentId: string } | null>(null)
const editingValue = ref<string>('')
const ignoreNextGlobalClick = ref(false)
const cellRefs = ref<Map<string, HTMLElement>>(new Map())
const currentTriggerElement = ref<HTMLElement | null>(null)

// Initialize evaluation results store
const evaluationStore = useEvaluationResultsStore()

// Result types management
const resultTypes = ref<ResultTypeConfig[]>([])
const resultTypesMap = ref<Map<string, ResultTypeConfig>>(new Map())

// Table navigation state
const tableContainer = ref<HTMLElement>()
const scrollPosition = ref(0)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// Filtered students based on gender filter
const filteredStudents = computed(() => {
  if (genderFilter.value === 'all') {
    return props.students
  }

  if (genderFilter.value === 'unspecified') {
    return props.students.filter(student => !student.gender || student.gender === 'Autre')
  }

  return props.students.filter(student => student.gender === genderFilter.value)
})

// Available domains from framework
const availableDomains = computed(() => {
  return props.framework.domains || []
})

// Available fields (from all domains)
const availableFields = computed(() => {
  const fields: Array<{ id: string; name: string }> = []
  props.framework.domains?.forEach(domain => {
    if (domain.fields) {
      fields.push(...domain.fields)
    }
  })
  return fields
})

// Available competencies (from all fields)
const availableCompetencies = computed(() => {
  const competencies: Array<{ id: string; name: string }> = []
  props.framework.domains?.forEach(domain => {
    domain.fields?.forEach(field => {
      if (field.competencies) {
        competencies.push(...field.competencies)
      }
    })
  })
  return competencies
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (genderFilter.value !== 'all') count++
  if (selectedDomains.value.length > 0) count++
  if (selectedFields.value.length > 0) count++
  if (selectedCompetencies.value.length > 0) count++
  return count
})

// Toggle filters panel
function toggleFilters() {
  filtersExpanded.value = !filtersExpanded.value
}

// Domain filter functions
function toggleDomain(domainId: string) {
  const index = selectedDomains.value.indexOf(domainId)
  if (index > -1) {
    selectedDomains.value.splice(index, 1)
  } else {
    selectedDomains.value.push(domainId)
  }
}

function clearDomainFilter() {
  selectedDomains.value = []
}

// Field filter functions
function toggleField(fieldId: string) {
  const index = selectedFields.value.indexOf(fieldId)
  if (index > -1) {
    selectedFields.value.splice(index, 1)
  } else {
    selectedFields.value.push(fieldId)
  }
}

function clearFieldFilter() {
  selectedFields.value = []
}

// Competency filter functions
function toggleCompetency(competencyId: string) {
  const index = selectedCompetencies.value.indexOf(competencyId)
  if (index > -1) {
    selectedCompetencies.value.splice(index, 1)
  } else {
    selectedCompetencies.value.push(competencyId)
  }
}

function clearCompetencyFilter() {
  selectedCompetencies.value = []
}

// Initialize the tree
competencyTree.value = buildCompetencyTree(props.framework)

// Handle click outside to close dropdown
function handleClickOutside(event: Event) {
  if (ignoreNextGlobalClick.value) {
    ignoreNextGlobalClick.value = false
    return
  }

  if (editingCell.value) {
    const target = event.target as Element
    console.log('🖱️ [Global] Clic détecté sur:', target?.className)

    // Ne fermer que si le clic n'est pas sur le dropdown ou ses éléments
    if (target && !target.closest('.inline-result-selector') && !target.closest('.edit-mode')) {
      console.log('🚪 [Global] Fermeture du dropdown')
      cancelEditing()
    } else {
      console.log('🔒 [Global] Clic sur dropdown - pas de fermeture')
    }
  }
}

// Initialize evaluation store on mount
onMounted(async () => {
  console.log('🔄 [EvaluationTable] Initializing evaluation:', props.evaluation.id)
  await evaluationStore.initializeEvaluation({
    id: props.evaluation.id,
    name: props.evaluation.name,
    description: props.evaluation.description,
    frameworkId: props.evaluation.frameworkId,
    classId: props.evaluation.classId,
    createdAt: props.evaluation.createdAt
  })
  console.log('✅ [EvaluationTable] Evaluation initialized, results count:', evaluationStore.results.value?.length || 0)

  // Load result types
  resultTypes.value = await supabaseResultTypesService.getResultTypes()
  resultTypesMap.value = new Map(resultTypes.value.map(rt => [rt.id, rt]))

  // Initialize scroll buttons state
  updateScrollButtons()

  // Add global click listener to close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside)
})

// Watch for evaluation changes to reload results
watch(() => props.evaluation, async (newEvaluation, oldEvaluation) => {
  if (newEvaluation.id !== oldEvaluation?.id) {
    console.log('🔄 [EvaluationTable] Changement d\'évaluation détecté:', newEvaluation.id, newEvaluation.name)
    await evaluationStore.initializeEvaluation({
      id: newEvaluation.id,
      name: newEvaluation.name,
      description: newEvaluation.description,
      frameworkId: newEvaluation.frameworkId,
      classId: newEvaluation.classId,
      createdAt: newEvaluation.createdAt
    })
  }
}, { deep: true })

onUnmounted(() => {
  // Clean up event listener
  document.removeEventListener('click', handleClickOutside)
})

// Computed for tree with filtering
const filteredTree = computed(() => {
  // If no filters are applied, return the whole tree
  if (selectedDomains.value.length === 0 &&
      selectedFields.value.length === 0 &&
      selectedCompetencies.value.length === 0) {
    return competencyTree.value
  }

  // Filter the tree based on hierarchyData since the tree is flat
  return competencyTree.value.filter(node => {
    // Check domain filter - match by domain name in hierarchyData
    if (selectedDomains.value.length > 0) {
      const domainMatch = availableDomains.value.find(d =>
        selectedDomains.value.includes(d.id) && d.name === node.hierarchyData?.domain
      )
      if (!domainMatch) return false
    }

    // Check field filter - match by field name in hierarchyData
    if (selectedFields.value.length > 0) {
      const fieldMatch = availableFields.value.find(f =>
        selectedFields.value.includes(f.id) && f.name === node.hierarchyData?.field
      )
      if (!fieldMatch) return false
    }

    // Check competency filter - match by competency name in hierarchyData
    if (selectedCompetencies.value.length > 0) {
      const competencyMatch = availableCompetencies.value.find(c =>
        selectedCompetencies.value.includes(c.id) && c.name === node.hierarchyData?.competency
      )
      if (!competencyMatch) return false
    }

    return true
  })
})

// Computed for flattened visible nodes
const visibleNodes = computed(() => {
  return flattenTree(filteredTree.value)
})


// Column visibility functions removed (columns are now always visible)

// Get student header class based on gender
function getStudentHeaderClass(student: Student): string {
  if (!student.gender) {
    return 'student-header-neutral'
  }
  if (student.gender === 'M') {
    return 'student-header-male'
  }
  if (student.gender === 'F') {
    return 'student-header-female'
  }
  return 'student-header-neutral'
}

function getStudentResult(competencyId: string, studentId: string): EvaluationResult | undefined {
  // Try to get from the store first, fallback to props for compatibility
  const storeResult = evaluationStore.getResult(studentId, competencyId)
  if (storeResult) {
    console.log('📌 [EvaluationTable] Found result in store:', { studentId, competencyId, value: storeResult.value })
    return storeResult
  }

  const propsResult = getCompetencyResult(props.evaluation.results, studentId, competencyId)
  if (propsResult) {
    console.log('📌 [EvaluationTable] Found result in props:', { studentId, competencyId, value: propsResult.value })
  }
  return propsResult
}

function canShowResult(node: TreeNode): boolean {
  // Only show results for specificCompetency nodes
  return node.type === 'specificCompetency'
}

function getResultCellClass(node: TreeNode, studentId: string): string[] {
  const classes: string[] = []

  if (canShowResult(node)) {
    const result = getStudentResult(node.id, studentId)
    if (result) {
      // Use value if available (new system), fallback to level (old system)
      const resultValue = result.value || result.level || 'N/A'
      classes.push(`has-result-${resultValue.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)
    } else {
      classes.push('no-result')
    }
  } else {
    classes.push('no-evaluation')
  }

  return classes
}

function getResultTitle(competencyId: string, studentId: string): string {
  const result = getStudentResult(competencyId, studentId)
  if (!result) return 'Non évalué'

  const levelNames = {
    A: 'Très bonne maîtrise',
    B: 'Maîtrise satisfaisante',
    C: 'Maîtrise fragile',
    D: 'Maîtrise insuffisante',
    E: 'Maîtrise très insuffisante',
    'N/A': 'Non évalué',
    'Oui': 'Acquis',
    'Non': 'Non acquis',
    'Acquis': 'Compétence acquise',
    'En cours': "En cours d'acquisition",
    'Non acquis': 'Non acquis'
  }

  // Use value if available (new system), fallback to level (old system)
  const resultValue = result.value || result.level || 'N/A'
  return levelNames[resultValue as keyof typeof levelNames] || resultValue
}

// Get result type config for a specific competency
function getResultTypeConfig(node: TreeNode): ResultTypeConfig | null {
  if (node.type !== 'specificCompetency') return null

  // Get the specific competency from the original item
  const specificComp = node.originalItem as { resultTypeConfigId?: string }
  if (!specificComp.resultTypeConfigId) {
    // Default to 'Échelle A-E' if not specified
    return resultTypes.value.find(rt => rt.name === 'Échelle A-E') || null
  }

  return resultTypesMap.value.get(specificComp.resultTypeConfigId) || null
}

// Check if a competency uses a numeric result type
function isNumericResultType(node: TreeNode): boolean {
  const config = getResultTypeConfig(node)
  return config?.type === 'numeric' || false
}

// Get result values based on the competency's result type
function getResultValues(node: TreeNode): ResultTypeConfigValue[] {
  const config = getResultTypeConfig(node)
  if (!config) {
    // Default values for backward compatibility
    return [
      { label: 'A', value: 'A', pivot_value: 10 },
      { label: 'B', value: 'B', pivot_value: 7.5 },
      { label: 'C', value: 'C', pivot_value: 5 },
      { label: 'D', value: 'D', pivot_value: 2.5 },
      { label: 'E', value: 'E', pivot_value: 0 },
      { label: 'N/A', value: 'N/A', pivot_value: null }
    ]
  }

  // Handle backward compatibility: convert string values to objects
  return config.config.values.map(v => {
    if (typeof v === 'string') {
      return { label: v, value: v, pivot_value: 5 }
    }
    return v
  })
}



// Table navigation computed properties
const currentStudentRange = computed(() => {
  if (!tableContainer.value) return '1-1 / 1'

  const container = tableContainer.value
  const firstColumnWidth = 520 // Approximative width of fixed columns
  const studentColumnWidth = 80 // Approximative width of student columns

  const visibleStart = Math.max(0, Math.floor((scrollPosition.value - firstColumnWidth) / studentColumnWidth))
  const containerWidth = container.clientWidth
  const visibleCount = Math.floor((containerWidth - firstColumnWidth) / studentColumnWidth)
  const visibleEnd = Math.min(props.students.length, visibleStart + visibleCount)

  return `${Math.max(1, visibleStart + 1)}-${Math.max(1, visibleEnd)} / ${props.students.length}`
})

// Table navigation functions
function handleScroll(event: Event) {
  const container = event.target as HTMLElement
  scrollPosition.value = container.scrollLeft
  updateScrollButtons()
}

function updateScrollButtons() {
  if (!tableContainer.value) return

  const container = tableContainer.value
  canScrollLeft.value = container.scrollLeft > 0
  canScrollRight.value = container.scrollLeft < (container.scrollWidth - container.clientWidth)
}

function scrollLeft() {
  if (!tableContainer.value) return

  const container = tableContainer.value
  const scrollAmount = 240 // Scroll by approximately 3 student columns
  container.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  })
}

function scrollRight() {
  if (!tableContainer.value) return

  const container = tableContainer.value
  const scrollAmount = 240 // Scroll by approximately 3 student columns
  container.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
}

// Inline editing functions
function isEditing(competencyId: string, studentId: string): boolean {
  return editingCell.value?.competencyId === competencyId && editingCell.value?.studentId === studentId
}

function setCellRef(el: Element | ComponentPublicInstance | null, competencyId: string, studentId: string) {
  const key = `${competencyId}-${studentId}`
  if (el && 'nodeType' in el) {
    cellRefs.value.set(key, el as HTMLElement)
  }
}


function startEditing(node: TreeNode, studentId: string, event?: Event) {
  if (!canShowResult(node)) return

  console.log('🖊️ [Edition] Début d\'édition:', { competencyId: node.id, studentId })

  // Set flag to ignore the global click that triggered this function
  ignoreNextGlobalClick.value = true

  // Store the trigger element
  if (event && event.currentTarget) {
    currentTriggerElement.value = event.currentTarget as HTMLElement
  }

  const currentResult = getStudentResult(node.id, studentId)
  editingCell.value = { competencyId: node.id, studentId }
  // Use value if available (new system), fallback to level (old system), default to N/A
  editingValue.value = currentResult?.value || currentResult?.level || 'N/A'
}

function selectValue(value: string, competencyId: string, studentId: string) {
  editingValue.value = value
  saveResult(competencyId, studentId)
}

function stopEditing() {
  editingCell.value = null
  editingValue.value = ''
  currentTriggerElement.value = null
}

async function saveResult(competencyId: string, studentId: string) {
  console.log('💾 [Edition] Sauvegarde du résultat:', {
    competencyId,
    studentId,
    newLevel: editingValue.value
  })

  try {
    // Save using the persistence service
    const savedResult = await evaluationStore.saveResult(
      studentId,
      competencyId,
      editingValue.value,
      '' // comment - can be extended later
    )

    if (savedResult) {
      // Also update the local props for immediate UI feedback
      let result = props.evaluation.results.find(r =>
        r.studentId === studentId && r.competencyId === competencyId
      )

      if (result) {
        result.value = editingValue.value
        result.evaluatedAt = savedResult.evaluatedAt
      } else {
        props.evaluation.results.push(savedResult)
      }

      editingCell.value = null
      editingValue.value = ''

      console.log('✅ [Edition] Résultat sauvegardé avec succès')
    } else {
      console.error('❌ [Edition] Erreur lors de la sauvegarde')
      // Keep editing mode active to allow retry
    }
  } catch (error) {
    console.error('❌ [Edition] Erreur lors de la sauvegarde:', error)
    // Keep editing mode active to allow retry
  }
}


function cancelEditing() {
  console.log('❌ [Edition] Annulation de l\'édition')
  editingCell.value = null
  editingValue.value = ''
}

</script>

<style scoped>
.evaluation-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px); /* 64px AppBar + 16px padding */
  max-height: calc(100vh - 80px);
}

/* Filters Panel Styles */
.filters-panel {
  background: var(--md-sys-color-surface-container-low, #f7f2fa);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #c4c6d0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.filters-panel.collapsed .filters-content {
  display: none;
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.filters-header:hover {
  background: var(--md-sys-color-surface-container, #ece6f0);
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.filters-title .material-symbols-outlined {
  font-size: 20px;
  color: var(--md-sys-color-primary, #6750a4);
}

.filters-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  cursor: pointer;
  border-radius: 20px;
  transition: background-color 0.2s ease;
}

.toggle-button:hover {
  background: var(--md-sys-color-surface-container-highest, #e6e0e9);
}

.toggle-button .material-symbols-outlined {
  font-size: 24px;
}

.filters-content {
  padding: 0 16px 16px 16px;
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-label {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 500);
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  height: 36px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-radius: 18px;
  background: var(--md-sys-color-surface, #ffffff);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.filter-chip .material-symbols-outlined {
  font-size: 18px;
}

.filter-chip:hover {
  background: var(--md-sys-color-surface-container-high, #ece6f0);
  border-color: var(--md-sys-color-on-surface, #1d1b20);
}

.filter-chip.active {
  background: var(--md-sys-color-secondary-container, #e8def8);
  border-color: var(--md-sys-color-secondary, #625b71);
  color: var(--md-sys-color-on-secondary-container, #1d192b);
}

.filter-chip.chip-male.active {
  background: #bbdefb;
  border-color: #1565c0;
  color: #1565c0;
}

.filter-chip.chip-female.active {
  background: #c8e6c9;
  border-color: #2e7d32;
  color: #2e7d32;
}

.filter-chip.chip-neutral.active {
  background: #e0e0e0;
  border-color: #616161;
  color: #616161;
}

/* Table navigation styles */
.table-navigation {
  background: var(--md-sys-color-surface-container);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  padding: 8px 16px;
  flex-shrink: 0;
}

.nav-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-small);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover:not(:disabled) {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-primary);
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  color: var(--md-sys-color-on-surface-variant);
}

.nav-button svg {
  width: 18px;
  height: 18px;
}

.nav-info {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
  min-width: 80px;
  text-align: center;
}

.evaluation-table-container {
  width: 100%;
  flex: 1;
  overflow: auto;
  background-color: var(--md-sys-color-surface);
  /* Improve horizontal scrolling */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--md-sys-color-outline-variant) transparent;
}

.evaluation-table-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.evaluation-table-container::-webkit-scrollbar-track {
  background: var(--md-sys-color-surface-container);
  border-radius: 4px;
}

.evaluation-table-container::-webkit-scrollbar-thumb {
  background: var(--md-sys-color-outline-variant);
  border-radius: 4px;
}

.evaluation-table-container::-webkit-scrollbar-thumb:hover {
  background: var(--md-sys-color-outline);
}

.evaluation-table-container::-webkit-scrollbar-corner {
  background: var(--md-sys-color-surface-container);
}


.column-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.controls-label {
  font-size: 0.9rem;
  color: var(--app-table-subhead-text);
  font-weight: 500;
}

.restore-column-btn {
  background: var(--app-tonal-button-bg);
  color: var(--app-tonal-button-text);
  border: 1px solid var(--app-tonal-button-border);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restore-column-btn:hover {
  background: var(--app-tonal-button-hover-bg);
  color: var(--app-tonal-button-hover-text);
  border-color: var(--app-tonal-button-hover-bg);
}


.evaluation-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: auto;
}

/* Header styles */
.evaluation-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--md-sys-color-surface, white);
}

.evaluation-table th {
  border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #333);
  vertical-align: top;
}

.domain-col {
  width: 15%;
  min-width: 120px;
  background: var(--md-sys-color-surface-container-low, #f8f9fa) !important;
}

.field-col {
  width: 20%;
  min-width: 150px;
  background: var(--md-sys-color-surface-container, #f1f3f4) !important;
}

.competency-col {
  width: 25%;
  min-width: 180px;
  background: var(--md-sys-color-surface-container-high, #e8eaed) !important;
}

.specific-competency-col {
  width: 25%;
  min-width: 200px;
  background: var(--md-sys-color-surface-container-highest, #e1e3e6) !important;
}

.hierarchy-header .header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.student-header {
  width: 80px;
  min-width: 60px;
  text-align: center;
  color: var(--md-sys-color-on-surface);
}

/* Student header colors based on gender */
.student-header.student-header-neutral {
  background: #e0e0e0 !important;
}

.student-header.student-header-neutral .student-display-name {
  color: #616161;
}

.student-header.student-header-male {
  background: #bbdefb !important;
}

.student-header.student-header-male .student-display-name {
  color: #1565c0;
}

.student-header.student-header-female {
  background: #c8e6c9 !important;
}

.student-header.student-header-female .student-display-name {
  color: #2e7d32;
}

.student-name {
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-display-name {
  font-weight: 600;
  font-size: 0.85rem;
}


/* Row and cell styles */
.evaluation-table tr:hover {
  background-color: var(--md-sys-color-surface-variant, #f5f5f5);
}

.evaluation-table td {
  border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
  padding: 0.5rem;
  vertical-align: top;
  background: var(--md-sys-color-surface, white);
}

.domain-cell {
  font-weight: 600;
  background: var(--md-sys-color-surface-container-low, #f8f9fa) !important;
  color: var(--md-sys-color-on-surface-variant, #5f6368);
}

.field-cell {
  font-weight: 500;
  background: var(--md-sys-color-surface-container, #f1f3f4) !important;
  color: #5f6368;
}

.competency-cell {
  background: var(--md-sys-color-surface-container-high, #e8eaed) !important;
  color: var(--md-sys-color-on-surface-variant, #5f6368);
}

.specific-competency-cell {
  background: var(--md-sys-color-surface-container-highest, #e1e3e6) !important;
  color: var(--md-sys-color-on-surface-variant, #5f6368);
}


.result-cell {
  text-align: center;
  padding: 0.25rem;
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Lower z-index when in edit mode to let dropdown appear above */
.result-cell:has(.edit-mode) {
  z-index: 0;
}

/* Fallback for browsers that don't support :has() */
.result-cell.editing {
  z-index: 0;
}

.result-cell:hover {
  background-color: var(--app-table-result-hover);
}

.result-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 2rem;
}

.result-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.75rem;
  min-width: 2rem;
  text-align: center;
}

/* Result level colors */
.level-a {
  background-color: var(--app-status-success-container);
  color: var(--app-status-success-on);
  border: 1px solid var(--app-status-success-border);
}

.level-b {
  background-color: var(--app-status-info-container);
  color: var(--app-status-info-on);
  border: 1px solid var(--app-status-info-border);
}

.level-c {
  background-color: var(--app-status-warning-container);
  color: var(--app-status-warning-on);
  border: 1px solid var(--app-status-warning-border);
}

.level-d,
.level-e {
  background-color: var(--app-status-danger-container);
  color: var(--app-status-danger-on);
  border: 1px solid var(--app-status-danger-border);
}

.level-n-a {
  background-color: var(--app-status-neutral-container);
  color: var(--app-status-neutral-on);
  border: 1px solid var(--app-status-neutral-border);
}

/* Result cell background colors (subtle) */
.has-result-a {
  background-color: var(--app-status-success-soft);
}

.has-result-b {
  background-color: var(--app-status-info-soft);
}

.has-result-c {
  background-color: var(--app-status-warning-soft);
}

.has-result-d,
.has-result-e {
  background-color: var(--app-status-danger-soft);
}

.no-result {
  background-color: var(--app-status-neutral-soft);
}

.no-evaluation {
  background-color: var(--app-table-no-eval-bg);
  cursor: default;
}

.no-evaluation:hover {
  background-color: var(--app-table-no-eval-bg);
}

/* Inline editing styles */
.edit-mode {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
}

.result-select {
  width: 60px;
  padding: 0.25rem;
  border: 2px solid var(--md-sys-color-primary);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  outline: none;
}

.result-select:focus {
  border-color: var(--app-table-search-focus-border);
  box-shadow: 0 0 0 0.2rem var(--app-focus-ring);
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-info {
    font-size: 0.8rem;
    min-width: 60px;
  }

  .nav-button {
    width: 28px;
    height: 28px;
  }

  .nav-button svg {
    width: 16px;
    height: 16px;
  }

  .domain-col,
  .domain-cell {
    min-width: 80px;
    max-width: 80px;
    width: 80px;
  }

  .field-col,
  .field-cell {
    min-width: 100px;
    max-width: 100px;
    width: 100px;
    left: 80px;
  }

  .competency-col,
  .competency-cell {
    min-width: 120px;
    max-width: 120px;
    width: 120px;
    left: 180px;
  }

  .specific-competency-col,
  .specific-competency-cell {
    min-width: 140px;
    max-width: 140px;
    width: 140px;
    left: 300px;
  }

  .student-header {
    min-width: 60px;
    max-width: 70px;
    width: 65px;
  }

  .result-cell {
    min-width: 60px;
    max-width: 70px;
    width: 65px;
  }



  .column-controls {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  /* Very aggressive reduction for smallest screens */
  .domain-col,
  .domain-cell {
    min-width: 60px;
    max-width: 60px;
    width: 60px;
  }

  .field-col,
  .field-cell {
    min-width: 80px;
    max-width: 80px;
    width: 80px;
    left: 60px;
  }

  .competency-col,
  .competency-cell {
    min-width: 100px;
    max-width: 100px;
    width: 100px;
    left: 140px;
  }

  .specific-competency-col,
  .specific-competency-cell {
    min-width: 120px;
    max-width: 120px;
    width: 120px;
    left: 240px;
  }

  .student-header {
    min-width: 45px;
    max-width: 55px;
    width: 50px;
  }

  .result-cell {
    min-width: 45px;
    max-width: 55px;
    width: 50px;
  }


  /* Reduce font sizes */
  .hierarchy-header,
  .student-header {
    font-size: 0.75rem;
    padding: 0.25rem;
  }
}
</style>

