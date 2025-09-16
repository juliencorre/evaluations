<template>
  <div class="evaluation-table-container">
    <div class="table-header">
      <h2>{{ evaluation.name }}</h2>
      <p class="table-description">{{ evaluation.description }}</p>
    </div>
    
    <div class="table-wrapper">
      <div class="table-scroll-container">
        <table class="evaluation-table">
          <!-- Fixed header -->
          <thead>
            <tr>
              <th class="hierarchy-header sticky-left domain-col">
                <div class="header-content">
                  <span>Domaine</span>
                  <button 
                    v-if="domainSearch"
                    class="clear-search-btn"
                    type="button"
                    aria-label="Effacer la recherche domaine"
                    @click="clearDomainSearch"
                  >
                    ×
                  </button>
                </div>
                <div class="search-container">
                  <input
                    v-model="domainSearch"
                    type="text"
                    placeholder="Rechercher..."
                    class="search-input"
                    aria-label="Rechercher un domaine"
                  >
                </div>
              </th>
              <th class="hierarchy-header sticky-left field-col">
                <div class="header-content">
                  <span>Champ</span>
                  <button 
                    v-if="fieldSearch"
                    class="clear-search-btn"
                    type="button"
                    aria-label="Effacer la recherche champ"
                    @click="clearFieldSearch"
                  >
                    ×
                  </button>
                </div>
                <div class="search-container">
                  <input
                    v-model="fieldSearch"
                    type="text"
                    placeholder="Rechercher..."
                    class="search-input"
                    aria-label="Rechercher un champ"
                  >
                </div>
              </th>
              <th class="hierarchy-header sticky-left competency-col">
                <div class="header-content">
                  <span>Compétence</span>
                  <button 
                    v-if="competencySearch"
                    class="clear-search-btn"
                    type="button"
                    aria-label="Effacer la recherche compétence"
                    @click="clearCompetencySearch"
                  >
                    ×
                  </button>
                </div>
                <div class="search-container">
                  <input
                    v-model="competencySearch"
                    type="text"
                    placeholder="Rechercher..."
                    class="search-input"
                    aria-label="Rechercher une compétence"
                  >
                </div>
              </th>
              <th class="hierarchy-header sticky-left specific-competency-col">
                <div class="header-content">
                  <span>Sous-compétence</span>
                  <button 
                    v-if="searchTerm"
                    class="clear-search-btn"
                    type="button"
                    aria-label="Effacer la recherche"
                    @click="clearSearch"
                  >
                    ×
                  </button>
                </div>
                <div class="search-container">
                  <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Rechercher..."
                    class="search-input"
                    aria-label="Rechercher une compétence"
                  >
                </div>
              </th>
              <th 
                v-for="student in students" 
                :key="student.id"
                class="student-header"
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
              :class="[
                'competency-row',
                `type-${node.type}`
              ]"
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
                v-for="student in students"
                :key="`${node.id}-${student.id}`"
                class="result-cell"
                :class="getResultCellClass(node, student.id)"
              >
                <div class="result-content">
                  <span 
                    v-if="canShowResult(node)"
                    class="result-badge"
                    :class="`level-${getStudentResult(node.id, student.id)?.level?.toLowerCase()}`"
                    :title="getResultTitle(node.id, student.id)"
                  >
                    {{ getStudentResult(node.id, student.id)?.level || 'N/A' }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="table-footer">
      <div class="legend">
        <h3>Légende des niveaux :</h3>
        <div class="legend-items">
          <span class="legend-item">
            <span class="result-badge level-a">A</span> Très bonne maîtrise
          </span>
          <span class="legend-item">
            <span class="result-badge level-b">B</span> Maîtrise satisfaisante
          </span>
          <span class="legend-item">
            <span class="result-badge level-c">C</span> Maîtrise fragile
          </span>
          <span class="legend-item">
            <span class="result-badge level-d">D</span> Maîtrise insuffisante
          </span>
          <span class="legend-item">
            <span class="result-badge level-e">E</span> Maîtrise très insuffisante
          </span>
          <span class="legend-item">
            <span class="result-badge level-n-a">N/A</span> Non évalué
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { 
  Student, 
  Evaluation, 
  TreeNode, 
  EvaluationResult,
  CompetencyFramework
} from '@/types/evaluation'
import { 
  buildCompetencyTree, 
  flattenTree, 
  getCompetencyResult
} from '@/utils/competencyTree'

interface Props {
  evaluation: Evaluation
  students: Student[]
  framework: CompetencyFramework
}

const props = defineProps<Props>()

const searchTerm = ref('')
const domainSearch = ref('')
const fieldSearch = ref('')
const competencySearch = ref('')
const competencyTree = ref<TreeNode[]>([])

// Column visibility
const showDomain = ref(true)
const showField = ref(true)
const showCompetency = ref(true)
const showSpecificCompetency = ref(true)

// Initialize the tree
competencyTree.value = buildCompetencyTree(props.framework)

// Computed for filtered tree based on multiple searches
const filteredTree = computed(() => {
  let filtered = competencyTree.value
  
  // Filter by domain
  if (domainSearch.value.trim()) {
    filtered = filtered.filter(node => 
      node.hierarchyData?.domain.toLowerCase().includes(domainSearch.value.toLowerCase())
    )
  }
  
  // Filter by field
  if (fieldSearch.value.trim()) {
    filtered = filtered.filter(node => 
      node.hierarchyData?.field.toLowerCase().includes(fieldSearch.value.toLowerCase())
    )
  }
  
  // Filter by competency
  if (competencySearch.value.trim()) {
    filtered = filtered.filter(node => 
      node.hierarchyData?.competency.toLowerCase().includes(competencySearch.value.toLowerCase())
    )
  }
  
  // Filter by specific competency
  if (searchTerm.value.trim()) {
    filtered = filtered.filter(node => 
      node.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (node.hierarchyData?.specificCompetency.toLowerCase().includes(searchTerm.value.toLowerCase()))
    )
  }
  
  return filtered
})

// Computed for flattened visible nodes
const visibleNodes = computed(() => {
  return flattenTree(filteredTree.value)
})

// Methods
function clearSearch() {
  searchTerm.value = ''
}

function clearDomainSearch() {
  domainSearch.value = ''
}

function clearFieldSearch() {
  fieldSearch.value = ''
}

function clearCompetencySearch() {
  competencySearch.value = ''
}

// Column visibility toggles
function toggleDomain() {
  showDomain.value = !showDomain.value
}

function toggleField() {
  showField.value = !showField.value
}

function toggleCompetency() {
  showCompetency.value = !showCompetency.value
}

function toggleSpecificCompetency() {
  showSpecificCompetency.value = !showSpecificCompetency.value
}

function getStudentResult(competencyId: string, studentId: string): EvaluationResult | undefined {
  return getCompetencyResult(props.evaluation.results, studentId, competencyId)
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
      classes.push(`has-result-${result.level.toLowerCase()}`)
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
    'A': 'Très bonne maîtrise',
    'B': 'Maîtrise satisfaisante', 
    'C': 'Maîtrise fragile',
    'D': 'Maîtrise insuffisante',
    'E': 'Maîtrise très insuffisante',
    'N/A': 'Non évalué'
  }
  
  return levelNames[result.level] || result.level
}

// Watch for search term changes to expand all nodes when searching
watch(searchTerm, (newTerm) => {
  if (newTerm.trim()) {
    // When searching, the searchTree function already expands matching nodes
    // No additional action needed
  }
})
</script>

<style scoped>
.evaluation-table-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.table-header {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-main {
  flex: 1;
}

.header-main h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.table-description {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.column-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.controls-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.restore-column-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restore-column-btn:hover {
  background: #bbdefb;
  color: #0d47a1;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.table-scroll-container {
  overflow: auto;
  height: 100%;
  position: relative;
}

.evaluation-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

/* Header styles */
.evaluation-table thead {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
}

.evaluation-table th {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  vertical-align: top;
}

.hierarchy-header {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  vertical-align: top;
}

.domain-col {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
  background: #f0f8ff !important;
  background-color: #f0f8ff !important;
}

.field-col {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
  background: #faf0ff !important;
  background-color: #faf0ff !important;
}

.competency-col {
  min-width: 250px;
  max-width: 250px;
  width: 250px;
  background: #fff8f0 !important;
  background-color: #fff8f0 !important;
}

.specific-competency-col {
  min-width: 300px;
  max-width: 300px;
  width: 300px;
}

.hierarchy-header .header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.visibility-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.8rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.visibility-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  opacity: 1;
}

.clear-search-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-btn:hover {
  color: #dc3545;
}

.search-container {
  margin-top: 0.5rem;
}

.search-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.student-header {
  min-width: 80px;
  max-width: 100px;
  width: 90px;
  text-align: center;
  writing-mode: horizontal-tb;
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

/* Sticky positioning */
.sticky-left {
  position: sticky;
  z-index: 10;
  background: #fff;
}

.domain-col,
.domain-cell {
  left: 0;
  border-right: 1px solid #dee2e6;
  z-index: 14;
  opacity: 1;
  backdrop-filter: none;
}

.field-col,
.field-cell {
  left: 150px;
  border-right: 1px solid #dee2e6;
  z-index: 13;
  opacity: 1;
  backdrop-filter: none;
}

.competency-col,
.competency-cell {
  left: 350px;
  border-right: 1px solid #dee2e6;
  z-index: 12;
  opacity: 1;
  backdrop-filter: none;
}

.specific-competency-col,
.specific-competency-cell {
  left: 600px;
  border-right: 2px solid #dee2e6;
  z-index: 11;
}

/* Row styles */
.competency-row {
  border-bottom: 1px solid #e9ecef;
}

.competency-row:hover {
  background-color: #f8f9fa;
}

.competency-row.type-specificCompetency {
  background-color: #ffffff;
}

/* Cell styles */
.evaluation-table td {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  vertical-align: top;
}

.hierarchy-cell {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  line-height: 1.4;
  position: sticky;
  background: #fff;
}

.domain-cell {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
  font-weight: 600;
  background: #f0f8ff !important;
  background-color: #f0f8ff !important;
}

.field-cell {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
  font-weight: 500;
  background: #faf0ff !important;
  background-color: #faf0ff !important;
}

.competency-cell {
  min-width: 250px;
  max-width: 250px;
  width: 250px;
  background: #fff8f0 !important;
  background-color: #fff8f0 !important;
}

.specific-competency-cell {
  min-width: 300px;
  max-width: 300px;
  width: 300px;
  background: #ffffff;
  background-color: #ffffff;
}

.cell-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.result-cell {
  text-align: center;
  min-width: 80px;
  max-width: 100px;
  width: 90px;
  padding: 0.25rem;
  position: relative;
  z-index: 1;
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
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.level-b {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.level-c {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.level-d {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.level-e {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.level-n-a {
  background-color: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

/* Result cell background colors (subtle) */
.has-result-a {
  background-color: rgba(212, 237, 218, 0.1);
}

.has-result-b {
  background-color: rgba(209, 236, 241, 0.1);
}

.has-result-c {
  background-color: rgba(255, 243, 205, 0.1);
}

.has-result-d {
  background-color: rgba(248, 215, 218, 0.1);
}

.has-result-e {
  background-color: rgba(248, 215, 218, 0.1);
}

.no-result {
  background-color: rgba(226, 227, 229, 0.05);
}

.no-evaluation {
  background-color: #f8f9fa;
}

/* Footer styles */
.table-footer {
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
}

.legend h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #495057;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #495057;
}

/* Responsive design */
@media (max-width: 768px) {
  .evaluation-table-container {
    height: 100vh;
  }
  
  .domain-col, .domain-cell {
    min-width: 120px;
    max-width: 120px;
    width: 120px;
  }
  
  .field-col, .field-cell {
    min-width: 160px;
    max-width: 160px;
    width: 160px;
    left: 120px;
  }
  
  .competency-col, .competency-cell {
    min-width: 200px;
    max-width: 200px;
    width: 200px;
    left: 280px;
  }
  
  .specific-competency-col, .specific-competency-cell {
    min-width: 240px;
    max-width: 240px;
    width: 240px;
    left: 480px;
  }
  
  .student-header {
    min-width: 70px;
    max-width: 80px;
    width: 75px;
  }
  
  .result-cell {
    min-width: 70px;
    max-width: 80px;
    width: 75px;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .column-controls {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .table-header {
    padding: 0.75rem;
  }
  
  .table-header h2 {
    font-size: 1.25rem;
  }
  
  .competency-header {
    min-width: 240px;
    max-width: 240px;
    width: 240px;
  }
  
  .competency-cell {
    min-width: 240px;
    max-width: 240px;
    width: 240px;
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
}
</style>