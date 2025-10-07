<template>
  <div class="mobile-evaluation-container">
    <!-- Student Tabs - Horizontal Scrollable -->
    <div class="students-tabs-container">
      <div ref="studentsTabsRef" class="students-tabs">
        <button
          v-for="student in students"
          :key="student.id"
          :class="['student-tab', { active: selectedStudentId === student.id }]"
          @click="selectStudent(student.id)"
        >
          {{ student.displayName }}
        </button>
      </div>
    </div>


    <!-- Sub-competencies List -->
    <div class="competencies-list">
      <div
        v-for="competency in specificCompetencies"
        :key="competency.id"
        class="competency-item"
        @click="editResult(competency.id)"
      >
        <div class="competency-info">
          <div class="competency-name">{{ competency.name }}</div>
          <div class="competency-hierarchy">
            <span class="domain">{{ competency.hierarchyData?.domain }}</span>
            <span class="separator">•</span>
            <span class="field">{{ competency.hierarchyData?.field }}</span>
            <span class="separator">•</span>
            <span class="competency">{{ competency.hierarchyData?.competency }}</span>
          </div>
        </div>
        <div class="result-section">
          <div
            v-if="getStudentResult(competency.id, selectedStudentId)"
            class="result-badge"
            :class="`level-${(getStudentResult(competency.id, selectedStudentId)?.value || 'N/A').toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
          >
            {{ getStudentResult(competency.id, selectedStudentId)?.value || 'N/A' }}
          </div>
          <div v-else class="result-badge level-n-a">N/A</div>
        </div>
      </div>
    </div>

    <!-- Edit Result Modal -->
    <div v-if="showEditModal" class="edit-modal-overlay" @click="closeEditModal">
      <div class="edit-modal" @click.stop>
        <h3>Évaluer la compétence</h3>
        <div v-if="editingCompetency" class="competency-details">
          <p class="competency-name">{{ editingCompetency.name }}</p>
          <p class="student-name">{{ selectedStudent?.firstName }} {{ selectedStudent?.lastName }}</p>
        </div>

        <!-- Numeric input for numeric result types -->
        <div v-if="isNumericResultType(editingCompetency)" class="numeric-input-section">
          <label class="input-label">Saisir une valeur numérique :</label>
          <div class="numeric-input-wrapper">
            <input
              v-model.number="editingValue"
              type="number"
              min="0"
              step="1"
              class="numeric-input"
              placeholder="Saisir un nombre entier"
            />
            <div class="input-info">
              <span class="range-text">
                Saisie libre (nombres entiers positifs)
              </span>
              <span v-if="isValidNumericValue" class="score-preview">
                Note: {{ calculateScore(Number(editingValue)) }}/10
              </span>
            </div>
          </div>
        </div>

        <!-- Standard options for other result types -->
        <div v-else class="result-options">
          <button
            v-for="option in getResultValues(editingCompetency)"
            :key="option.value"
            :class="['result-option', { selected: editingValue === option.value }]"
            @click="selectValue(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeEditModal">Annuler</button>
          <button
            class="btn-save"
            :disabled="!canSaveResult"
            @click="saveResult"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type {
  Student,
  Evaluation,
  TreeNode,
  EvaluationResult,
  CompetencyFramework,
  ResultTypeConfig,
  ResultTypeConfigValue
} from '@/types/evaluation'
import { buildCompetencyTree, flattenTree } from '@/utils/competencyTree'
import { useEvaluationResultsStore } from '@/stores/evaluationResultsStore'
import { supabaseResultTypesService } from '@/services/supabaseResultTypesService'

interface Props {
  evaluation: Evaluation
  students: Student[]
  framework: CompetencyFramework
}

const props = defineProps<Props>()

// Initialize evaluation results store
const evaluationStore = useEvaluationResultsStore()

// State
const selectedStudentId = ref<string>('')
const studentsTabsRef = ref<HTMLElement>()
const showEditModal = ref(false)
const editingCompetency = ref<TreeNode | null>(null)
const editingValue = ref<string>('')

// Result types management
const resultTypes = ref<ResultTypeConfig[]>([])
const resultTypesMap = ref<Map<string, ResultTypeConfig>>(new Map())

// Computed properties
const selectedStudent = computed(() =>
  props.students.find(s => s.id === selectedStudentId.value)
)

const specificCompetencies = computed(() => {
  const tree = buildCompetencyTree(props.framework)
  const flattened = flattenTree(tree)
  return flattened.filter(node => node.type === 'specificCompetency')
})

// Numeric input validation
const isValidNumericValue = computed(() => {
  if (!editingCompetency.value || !isNumericResultType(editingCompetency.value)) return false

  const value = Number(editingValue.value)
  // For free numeric input, just check if it's a valid integer >= 0
  return !isNaN(value) && Number.isInteger(value) && value >= 0
})

// Save button validation
const canSaveResult = computed(() => {
  // Check if value is empty (but allow 0 for numeric types)
  if (editingValue.value === '' || editingValue.value === null || editingValue.value === undefined) return false

  // For numeric types, use specific numeric validation
  if (editingCompetency.value && isNumericResultType(editingCompetency.value)) {
    return isValidNumericValue.value
  }

  return true // For non-numeric types, just check if value exists
})

// Methods
function selectStudent(studentId: string) {
  selectedStudentId.value = studentId

  // Scroll automatiquement vers l'onglet sélectionné pour un effet carrousel
  nextTick(() => {
    scrollToActiveTab()
  })
}

function scrollToActiveTab() {
  if (!studentsTabsRef.value) return

  const activeTab = studentsTabsRef.value.querySelector('.student-tab.active') as HTMLElement
  if (!activeTab) return

  const container = studentsTabsRef.value
  const containerRect = container.getBoundingClientRect()
  const tabRect = activeTab.getBoundingClientRect()

  // Calculer la position pour centrer l'onglet
  const containerCenter = containerRect.width / 2
  const tabCenter = tabRect.left - containerRect.left + tabRect.width / 2
  const scrollAmount = tabCenter - containerCenter

  container.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
}

function getStudentResult(competencyId: string, studentId: string): EvaluationResult | undefined {
  const storeResult = evaluationStore.getResult(studentId, competencyId)
  if (storeResult) return storeResult

  return props.evaluation.results.find(r =>
    r.studentId === studentId && r.competencyId === competencyId
  )
}

function editResult(competencyId: string) {
  if (!selectedStudentId.value) return

  const competency = specificCompetencies.value.find(c => c.id === competencyId)
  if (!competency) return

  editingCompetency.value = competency
  const currentResult = getStudentResult(competencyId, selectedStudentId.value)
  editingValue.value = currentResult?.value || ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingCompetency.value = null
  editingValue.value = ''
}

function selectValue(value: string) {
  editingValue.value = value
}

async function saveResult() {
  if (!editingCompetency.value || !selectedStudentId.value || editingValue.value === '' || editingValue.value === null || editingValue.value === undefined) return

  try {
    const savedResult = await evaluationStore.saveResult(
      selectedStudentId.value,
      editingCompetency.value.id,
      editingValue.value,
      ''
    )

    if (savedResult) {
      // Update local props for immediate UI feedback
      let result = props.evaluation.results.find(r =>
        r.studentId === selectedStudentId.value && r.competencyId === editingCompetency.value!.id
      )

      if (result) {
        result.value = editingValue.value
        result.evaluatedAt = savedResult.evaluatedAt
      } else {
        props.evaluation.results.push(savedResult)
      }

      closeEditModal()
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

// Get result type config for a specific competency
function getResultTypeConfig(node: TreeNode | null): ResultTypeConfig | null {
  if (!node || node.type !== 'specificCompetency') return null

  const specificComp = node.originalItem as { resultTypeConfigId?: string }
  if (!specificComp.resultTypeConfigId) {
    return resultTypes.value.find(rt => rt.name === 'Échelle A-E') || null
  }

  return resultTypesMap.value.get(specificComp.resultTypeConfigId) || null
}

// Get result values based on the competency's result type
function getResultValues(node: TreeNode | null): ResultTypeConfigValue[] {
  const config = getResultTypeConfig(node)
  if (!config) {
    return [
      { label: 'A', value: 'A', pivot_value: 10 },
      { label: 'B', value: 'B', pivot_value: 7.5 },
      { label: 'C', value: 'C', pivot_value: 5 },
      { label: 'D', value: 'D', pivot_value: 2.5 },
      { label: 'E', value: 'E', pivot_value: 0 },
      { label: 'N/A', value: 'N/A', pivot_value: 0 }
    ]
  }

  return config.config.values.map(v => {
    if (typeof v === 'string') {
      return { label: v, value: v, pivot_value: 5 }
    }
    return v
  })
}

// Check if result type is numeric
function isNumericResultType(node: TreeNode | null): boolean {
  const config = getResultTypeConfig(node)
  return config?.type === 'numeric' || false
}


// Calculate score for numeric values
function calculateScore(value: number): number {
  // For free numeric input, score is based on 10-point scale
  // Each point = 1 point on the scale, max 10
  return Math.min(value, 10)
}

// Initialize component
onMounted(async () => {
  // Initialize evaluation store
  await evaluationStore.initializeEvaluation({
    id: props.evaluation.id,
    name: props.evaluation.name,
    description: props.evaluation.description,
    frameworkId: props.evaluation.frameworkId,
    classId: props.evaluation.classId,
    createdAt: props.evaluation.createdAt
  })

  // Load result types
  resultTypes.value = await supabaseResultTypesService.getResultTypes()
  resultTypesMap.value = new Map(resultTypes.value.map(rt => [rt.id, rt]))

  // Select first student by default
  if (props.students.length > 0) {
    selectedStudentId.value = props.students[0].id
  }
})

// Watch for evaluation changes
watch(() => props.evaluation, async (newEvaluation) => {
  await evaluationStore.initializeEvaluation({
    id: newEvaluation.id,
    name: newEvaluation.name,
    description: newEvaluation.description,
    frameworkId: newEvaluation.frameworkId,
    classId: newEvaluation.classId,
    createdAt: newEvaluation.createdAt
  })
}, { deep: true })
</script>

<style scoped>
.mobile-evaluation-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--md-sys-color-surface);
  overflow: hidden;
}

/* Student Tabs */
.students-tabs-container {
  background: var(--md-sys-color-surface-container);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  padding: 8px 0;
  flex-shrink: 0;
  position: relative;
}

.students-tabs {
  display: flex;
  gap: 8px;
  padding: 0 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  scroll-padding: 8px;
  /* Ajout d'un momentum scrolling sur iOS */
  -webkit-overflow-scrolling: touch;
}

.students-tabs::-webkit-scrollbar {
  display: none;
}

/* Indicateurs visuels de scroll */
.students-tabs-container::before,
.students-tabs-container::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  pointer-events: none;
  z-index: 10;
}

.students-tabs-container::before {
  left: 0;
  background: linear-gradient(
    to right,
    var(--md-sys-color-surface-container) 0%,
    var(--md-sys-color-surface-container) 50%,
    transparent 100%
  );
}

.students-tabs-container::after {
  right: 0;
  background: linear-gradient(
    to left,
    var(--md-sys-color-surface-container) 0%,
    var(--md-sys-color-surface-container) 50%,
    transparent 100%
  );
}

.student-tab {
  flex-shrink: 0;
  padding: 10px 18px;
  border-radius: 20px;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
  text-align: center;
  /* Améliorer la zone de touch sur mobile */
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Effet d'ombre pour indiquer l'interactivité */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.student-tab:hover {
  background: var(--md-sys-color-surface-container-high);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.student-tab.active {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border-color: var(--md-sys-color-primary);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.student-tab:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

/* Student Info */
.student-info {
  padding: 12px 8px;
  background: var(--md-sys-color-surface-container-low);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  flex-shrink: 0;
}

.student-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

/* Competencies List */
.competencies-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.competency-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 80px;
}

.competency-item:hover {
  background: var(--md-sys-color-surface-container);
}

.competency-item:last-child {
  border-bottom: none;
}

.competency-info {
  flex: 1;
  margin-right: 16px;
}

.competency-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 4px;
  line-height: 1.4;
}

.competency-hierarchy {
  font-size: 12px;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.3;
}

.separator {
  margin: 0 4px;
}

.domain {
  font-weight: 600;
}

.field {
  font-weight: 500;
}

.competency {
  font-style: italic;
}

/* Result Section */
.result-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.result-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  min-width: 40px;
  text-align: center;
  border: 2px solid transparent;
}

/* Result level colors */
.level-a {
  background-color: var(--app-status-success-container);
  color: var(--app-status-success-on);
  border-color: var(--app-status-success-border);
}

.level-b {
  background-color: var(--app-status-info-container);
  color: var(--app-status-info-on);
  border-color: var(--app-status-info-border);
}

.level-c {
  background-color: var(--app-status-warning-container);
  color: var(--app-status-warning-on);
  border-color: var(--app-status-warning-border);
}

.level-d,
.level-e {
  background-color: var(--app-status-danger-container);
  color: var(--app-status-danger-on);
  border-color: var(--app-status-danger-border);
}

.level-n-a {
  background-color: var(--app-status-neutral-container);
  color: var(--app-status-neutral-on);
  border-color: var(--app-status-neutral-border);
}

/* Edit Modal */
.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 8px;
}

.edit-modal {
  background: var(--md-sys-color-surface);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.edit-modal h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.competency-details {
  margin-bottom: 24px;
  padding: 12px;
  background: var(--md-sys-color-surface-container);
  border-radius: 8px;
}

.competency-details .competency-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--md-sys-color-on-surface);
}

.competency-details .student-name {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
}

/* Numeric input section */
.numeric-input-section {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
}

.numeric-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.numeric-input {
  padding: 12px 8px;
  border: 2px solid var(--md-sys-color-outline);
  border-radius: 8px;
  font-size: 16px;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface);
  transition: border-color 0.2s ease;
}

.numeric-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
}

.numeric-input:invalid {
  border-color: var(--md-sys-color-error);
}

.input-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.range-text {
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
}

.score-preview {
  color: var(--md-sys-color-primary);
  font-weight: 600;
}

.result-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 8px;
  margin-bottom: 24px;
}

.result-option {
  padding: 12px 8px;
  border: 2px solid var(--md-sys-color-outline);
  border-radius: 8px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.result-option:hover {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary-container);
}

.result-option.selected {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-save {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}

.btn-cancel:hover {
  background: var(--md-sys-color-surface-container-high);
}

.btn-save {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.btn-save:hover {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.btn-save:disabled {
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant);
  cursor: not-allowed;
}

/* Responsive adjustments for very small screens */
@media (max-width: 320px) {
  .students-tabs {
    padding: 0 12px;
    gap: 6px;
  }

  .students-tabs-container::before,
  .students-tabs-container::after {
    width: 15px;
  }

  .student-tab {
    padding: 8px 14px;
    font-size: 12px;
    min-width: 70px;
    min-height: 40px;
  }

  .competency-item {
    padding: 12px;
    min-height: 70px;
  }

  .competency-name {
    font-size: 14px;
  }

  .competency-hierarchy {
    font-size: 11px;
  }

  .result-badge {
    padding: 4px 8px;
    font-size: 12px;
    min-width: 32px;
  }
}

/* Amélioration pour les écrans moyens */
@media (max-width: 480px) and (min-width: 321px) {
  .students-tabs {
    gap: 6px;
  }

  .student-tab {
    padding: 9px 8px;
    font-size: 13px;
    min-width: 75px;
    min-height: 42px;
  }
}
</style>