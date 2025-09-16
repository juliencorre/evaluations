<template>
  <div class="analysis-page">
    <!-- Navigation Rail -->
    <nav class="navigation-rail">
      <div class="rail-items">
        <button
          class="rail-item"
          :class="{ active: activeView === 'dashboard' }"
          @click="activeView = 'dashboard'"
        >
          <svg class="rail-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,13H11V3H3M3,21H11V15H3M13,21H21V11H13M13,3V9H21V3" />
          </svg>
          <span class="rail-label">Dashboard</span>
        </button>

        <button
          class="rail-item"
          :class="{ active: activeView === 'class-analysis' }"
          @click="activeView = 'class-analysis'"
        >
          <svg class="rail-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"
            />
          </svg>
          <span class="rail-label">Analyse classe</span>
        </button>

        <button
          class="rail-item"
          :class="{ active: activeView === 'student-analysis' }"
          @click="activeView = 'student-analysis'"
        >
          <svg class="rail-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
            />
          </svg>
          <span class="rail-label">Analyse élèves</span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">
              <svg class="title-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
              {{ getPageTitle() }}
            </h1>
            <p class="page-description">
              {{ getPageDescription() }}
            </p>
          </div>

          <!-- Global Export Button -->
          <div v-if="activeView === 'student-analysis'" class="header-actions">
            <button
              class="export-button export-all"
              title="Exporter tous les élèves en PDF"
              @click="exportAllStudents"
            >
              <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                />
                <path d="M12,11L16,15H13V19H11V15H8L12,11Z" />
              </svg>
              Exporter tous les élèves
            </button>
          </div>
        </div>
      </header>

      <!-- Dashboard View -->
      <div v-if="activeView === 'dashboard'" class="page-content">
        <!-- Métriques principales -->
        <section class="metrics-section">
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-header">
                <svg class="metric-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,11H7v6h2V11zm4-4h-2v10h2V7zm4-3h-2v13h2V4z" />
                </svg>
                <div class="metric-info">
                  <span class="metric-label">Moyenne générale</span>
                  <span class="metric-value">{{ averageScore }}/4</span>
                </div>
              </div>
              <div class="metric-trend positive">
                <svg class="trend-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"
                  />
                </svg>
                <span>+0.2 points</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Graphiques et analyses -->
        <section class="charts-section">
          <div class="charts-grid">
            <!-- Distribution des niveaux -->
            <div class="chart-card">
              <div class="card-header">
                <h3 class="card-title">Distribution des niveaux</h3>
                <p class="card-subtitle">Répartition des élèves par niveau de maîtrise</p>
              </div>
              <div class="chart-content">
                <div class="level-distribution">
                  <div v-for="level in levelDistribution" :key="level.name" class="level-item">
                    <div class="level-info">
                      <span class="level-name">{{ level.name }}</span>
                      <span class="level-count">{{ level.count }} élèves</span>
                    </div>
                    <div class="level-bar">
                      <div
                        class="level-progress"
                        :class="level.class"
                        :style="{ width: level.percentage + '%' }"
                      ></div>
                    </div>
                    <span class="level-percentage">{{ level.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progression dans le temps -->
            <div class="chart-card">
              <div class="card-header">
                <h3 class="card-title">Évolution des résultats</h3>
                <p class="card-subtitle">Progression des moyennes sur les 6 derniers mois</p>
              </div>
              <div class="chart-content">
                <div class="timeline-chart">
                  <div class="chart-area">
                    <svg class="progress-chart" viewBox="0 0 400 200">
                      <!-- Grille -->
                      <defs>
                        <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
                          <path
                            d="M 40 0 L 0 0 0 25"
                            fill="none"
                            stroke="#e0e0e0"
                            stroke-width="1"
                          />
                        </pattern>
                      </defs>
                      <rect width="400" height="200" fill="url(#grid)" />

                      <!-- Courbe de progression -->
                      <path
                        d="M 50 150 L 90 140 L 130 130 L 170 125 L 210 120 L 250 110 L 290 100 L 330 95 L 370 90"
                        fill="none"
                        stroke="#6750a4"
                        stroke-width="3"
                      />

                      <!-- Points de données -->
                      <circle cx="50" cy="150" r="4" fill="#6750a4" />
                      <circle cx="90" cy="140" r="4" fill="#6750a4" />
                      <circle cx="130" cy="130" r="4" fill="#6750a4" />
                      <circle cx="170" cy="125" r="4" fill="#6750a4" />
                      <circle cx="210" cy="120" r="4" fill="#6750a4" />
                      <circle cx="250" cy="110" r="4" fill="#6750a4" />
                      <circle cx="290" cy="100" r="4" fill="#6750a4" />
                      <circle cx="330" cy="95" r="4" fill="#6750a4" />
                      <circle cx="370" cy="90" r="4" fill="#6750a4" />
                    </svg>
                  </div>
                  <div class="chart-labels">
                    <span>Sept</span>
                    <span>Oct</span>
                    <span>Nov</span>
                    <span>Déc</span>
                    <span>Jan</span>
                    <span>Fév</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Class Analysis View -->
      <div v-if="activeView === 'class-analysis'" class="page-content">
        <section class="charts-section">
          <div class="chart-card">
            <div class="card-header">
              <h3 class="card-title">Analyse par classe</h3>
              <p class="card-subtitle">Performance des différentes classes</p>
            </div>
            <div class="chart-content">
              <p style="text-align: center; color: #49454f; padding: 40px">
                Contenu de l'analyse par classe à développer
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Student Analysis View -->
      <div v-if="activeView === 'student-analysis'" class="page-content">
        <!-- Student Selection and Filters -->
        <section class="controls-section">
          <div class="controls-grid">
            <!-- Student Selection -->
            <div class="control-card">
              <div class="control-header">
                <h3 class="control-title">Sélection de l'élève</h3>
              </div>
              <div class="control-content">
                <select v-model="selectedStudent" class="student-select">
                  <option value="">Choisir un élève...</option>
                  <option v-for="student in students" :key="student.id" :value="student.id">
                    {{ student.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Metric Type Selection -->
            <div class="control-card">
              <div class="control-header">
                <h3 class="control-title">Type d'analyse</h3>
              </div>
              <div class="control-content">
                <div class="metric-type-buttons">
                  <button
                    v-for="type in metricTypes"
                    :key="type.value"
                    class="metric-type-button"
                    :class="{ active: selectedMetricType === type.value }"
                    @click="selectedMetricType = type.value"
                  >
                    {{ type.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Student Analysis Chart -->
        <section v-if="selectedStudent" class="charts-section">
          <div class="chart-card">
            <div class="card-header">
              <div class="card-header-content">
                <div class="card-title-group">
                  <h3 class="card-title">{{ getSelectedStudentName() }}</h3>
                  <p class="card-subtitle">
                    {{ getMetricTypeLabel() }} - Résultats des évaluations de l'année
                  </p>
                </div>

                <!-- Individual Export Button -->
                <button
                  class="export-button export-single"
                  title="Exporter ce graphique en PDF"
                  @click="exportStudentChart"
                >
                  <svg class="export-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                    />
                    <path d="M12,11L16,15H13V19H11V15H8L12,11Z" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="chart-content">
              <!-- Legend -->
              <div class="chart-legend">
                <div
                  v-for="evaluation in evaluationPeriods"
                  :key="evaluation.id"
                  class="legend-item"
                >
                  <div class="legend-color" :style="{ backgroundColor: evaluation.color }"></div>
                  <span class="legend-label">{{ evaluation.name }}</span>
                </div>
              </div>

              <div class="horizontal-bar-chart">
                <div v-for="item in getStudentData()" :key="item.name" class="bar-item">
                  <div class="bar-info">
                    <span class="bar-label">{{ item.name }}</span>
                  </div>
                  <div class="bar-group">
                    <div
                      v-for="(evaluation, index) in item.evaluations"
                      :key="index"
                      class="bar-row"
                    >
                      <div class="bar-container">
                        <div
                          class="bar-fill"
                          :style="{
                            width: (evaluation.score / 4) * 100 + '%',
                            backgroundColor: evaluationPeriods[index].color
                          }"
                        ></div>
                      </div>
                      <span class="bar-value">{{ evaluation.score }}/4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- No Student Selected State -->
        <section v-else class="charts-section">
          <div class="chart-card">
            <div class="chart-content">
              <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                  />
                </svg>
                <h4 class="empty-title">Sélectionnez un élève</h4>
                <p class="empty-description">
                  Choisissez un élève dans la liste pour voir ses résultats d'évaluation
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

/* eslint-disable no-alert */
<script setup lang="ts">
import { ref } from 'vue'

// Type definitions
interface EvaluationScore {
  score: number
}

interface MetricData {
  name: string
  evaluations: EvaluationScore[]
}

interface StudentData {
  [studentId: string]: {
    [metricType: string]: MetricData[]
  }
}

// Active view state
const activeView = ref('dashboard')

// Données calculées
const averageScore = ref(2.8)

// Distribution des niveaux de maîtrise
const levelDistribution = ref([
  {
    name: 'Non acquis',
    count: 12,
    percentage: 15,
    class: 'level-not-acquired'
  },
  {
    name: "En cours d'acquisition",
    count: 28,
    percentage: 35,
    class: 'level-in-progress'
  },
  {
    name: 'Acquis',
    count: 32,
    percentage: 40,
    class: 'level-acquired'
  },
  {
    name: 'Expert',
    count: 8,
    percentage: 10,
    class: 'level-expert'
  }
])

// Student analysis data
const selectedStudent = ref('')
const selectedMetricType = ref('domains')

// Students list
const students = ref([
  { id: 'student1', name: 'Marie Dubois' },
  { id: 'student2', name: 'Pierre Martin' },
  { id: 'student3', name: 'Sophie Bernard' },
  { id: 'student4', name: 'Lucas Petit' },
  { id: 'student5', name: 'Emma Moreau' },
  { id: 'student6', name: 'Thomas Leroy' },
  { id: 'student7', name: 'Léa Roux' },
  { id: 'student8', name: 'Hugo Fournier' }
])

// Metric types
const metricTypes = ref([
  { value: 'domains', label: 'Domaines' },
  { value: 'fields', label: 'Champs' },
  { value: 'competencies', label: 'Compétences' }
])

// Evaluation periods
const evaluationPeriods = ref([
  { id: 1, name: 'Évaluation 1 (Sept-Oct)', color: '#6750a4' },
  { id: 2, name: 'Évaluation 2 (Nov-Déc)', color: '#0F62FE' },
  { id: 3, name: 'Évaluation 3 (Jan-Fév)', color: '#198038' }
])

// Mock student data with multiple evaluations
const studentData = ref<StudentData>({
  student1: {
    domains: [
      {
        name: 'Français',
        evaluations: [{ score: 2.8 }, { score: 3.1 }, { score: 3.2 }]
      },
      {
        name: 'Mathématiques',
        evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }]
      },
      {
        name: 'Histoire-Géographie',
        evaluations: [{ score: 3.2 }, { score: 3.4 }, { score: 3.5 }]
      },
      {
        name: 'Sciences',
        evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }]
      },
      {
        name: 'Arts',
        evaluations: [{ score: 3.5 }, { score: 3.7 }, { score: 3.8 }]
      }
    ],
    fields: [
      {
        name: 'Lecture',
        evaluations: [{ score: 2.9 }, { score: 3.0 }, { score: 3.1 }]
      },
      {
        name: 'Écriture',
        evaluations: [{ score: 3.0 }, { score: 3.2 }, { score: 3.3 }]
      },
      {
        name: 'Calcul',
        evaluations: [{ score: 2.4 }, { score: 2.6 }, { score: 2.7 }]
      },
      {
        name: 'Géométrie',
        evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }]
      },
      {
        name: 'Mesures',
        evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }]
      }
    ],
    competencies: [
      {
        name: 'Comprendre un texte',
        evaluations: [{ score: 2.7 }, { score: 2.9 }, { score: 3.0 }]
      },
      {
        name: 'Rédiger un paragraphe',
        evaluations: [{ score: 2.9 }, { score: 3.1 }, { score: 3.2 }]
      },
      {
        name: 'Résoudre un problème',
        evaluations: [{ score: 2.3 }, { score: 2.5 }, { score: 2.6 }]
      },
      {
        name: 'Calculer mentalement',
        evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }]
      },
      {
        name: "Se repérer dans l'espace",
        evaluations: [{ score: 3.0 }, { score: 3.2 }, { score: 3.3 }]
      }
    ]
  },
  student2: {
    domains: [
      {
        name: 'Français',
        evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }]
      },
      {
        name: 'Mathématiques',
        evaluations: [{ score: 2.8 }, { score: 3.0 }, { score: 3.1 }]
      },
      {
        name: 'Histoire-Géographie',
        evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }]
      },
      {
        name: 'Sciences',
        evaluations: [{ score: 3.0 }, { score: 3.2 }, { score: 3.3 }]
      },
      {
        name: 'Arts',
        evaluations: [{ score: 2.9 }, { score: 3.1 }, { score: 3.2 }]
      }
    ],
    fields: [
      {
        name: 'Lecture',
        evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }]
      },
      {
        name: 'Écriture',
        evaluations: [{ score: 2.4 }, { score: 2.6 }, { score: 2.7 }]
      },
      {
        name: 'Calcul',
        evaluations: [{ score: 2.9 }, { score: 3.1 }, { score: 3.2 }]
      },
      {
        name: 'Géométrie',
        evaluations: [{ score: 2.7 }, { score: 2.9 }, { score: 3.0 }]
      },
      {
        name: 'Mesures',
        evaluations: [{ score: 2.8 }, { score: 3.0 }, { score: 3.1 }]
      }
    ],
    competencies: [
      {
        name: 'Comprendre un texte',
        evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }]
      },
      {
        name: 'Rédiger un paragraphe',
        evaluations: [{ score: 2.5 }, { score: 2.7 }, { score: 2.8 }]
      },
      {
        name: 'Résoudre un problème',
        evaluations: [{ score: 2.8 }, { score: 3.0 }, { score: 3.1 }]
      },
      {
        name: 'Calculer mentalement',
        evaluations: [{ score: 3.0 }, { score: 3.2 }, { score: 3.3 }]
      },
      {
        name: "Se repérer dans l'espace",
        evaluations: [{ score: 2.6 }, { score: 2.8 }, { score: 2.9 }]
      }
    ]
  }
})

// Page title and description based on active view
const getPageTitle = () => {
  switch (activeView.value) {
    case 'dashboard':
      return 'Dashboard'
    case 'class-analysis':
      return 'Analyse par classe'
    case 'student-analysis':
      return 'Analyse des élèves'
    default:
      return 'Analyses et Statistiques'
  }
}

const getPageDescription = () => {
  switch (activeView.value) {
    case 'dashboard':
      return "Vue d'ensemble des performances et tendances des évaluations"
    case 'class-analysis':
      return 'Analyse détaillée des performances par classe'
    case 'student-analysis':
      return 'Analyse individuelle des performances des élèves'
    default:
      return "Vue d'ensemble des performances et tendances des évaluations"
  }
}

// Student analysis helper functions
const getSelectedStudentName = () => {
  const student = students.value.find((s: { id: string; name: string }) => s.id === selectedStudent.value)
  return student ? student.name : ''
}

const getMetricTypeLabel = () => {
  const type = metricTypes.value.find((t: { value: string; label: string }) => t.value === selectedMetricType.value)
  return type ? type.label : ''
}

const getStudentData = () => {
  if (!selectedStudent.value || !studentData.value[selectedStudent.value]) {
    return []
  }
  return studentData.value[selectedStudent.value][selectedMetricType.value] || []
}

// Export functions
const exportStudentChart = () => {
  const studentName = getSelectedStudentName()
  const metricType = getMetricTypeLabel()

  // Simulate PDF generation
  console.log(`Exporting chart for ${studentName} - ${metricType}`)

  // Here you would implement the actual PDF generation logic
  // For example using libraries like jsPDF or html2canvas
   
   
   
   
   
   
   

   
  window.alert(`Export en cours pour ${studentName} - ${metricType}`)  
}

const exportAllStudents = () => {
  // Simulate PDF generation for all students
  console.log('Exporting all students data')

  // Here you would implement the logic to export all students
  // This could iterate through all students and generate a comprehensive PDF
   
   
   
   
   
   
   
   
  window.alert('Export en cours pour tous les élèves')  
}
</script>

<style scoped>
.analysis-page {
  display: flex;
  margin: 0;
  background: #ffffff;
  width: 100%;
  min-height: 100vh;
}

/* Navigation Rail */
.navigation-rail {
  width: 80px;
  background: #fffbfe;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  flex-shrink: 0;
}

.rail-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 12px;
  border-radius: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  width: 56px;
  min-height: 56px;
}

.rail-item:hover {
  background: #f3edf7;
}

.rail-item.active {
  background: #eaddff;
}

.rail-icon {
  width: 24px;
  height: 24px;
  color: #49454f;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.rail-item.active .rail-icon {
  color: #6750a4;
}

.rail-label {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
  color: #49454f;
  text-align: center;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.rail-item.active .rail-label {
  color: #6750a4;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 24px;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 2rem;
  font-weight: 400;
  line-height: 2.5rem;
  color: #1c1b1f;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 32px;
  height: 32px;
  color: #6750a4;
}

.page-description {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  color: #49454f;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

/* Export Buttons */
.export-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #79747e;
  border-radius: 20px;
  background: #ffffff;
  color: #49454f;
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.export-button:hover {
  background: #f3edf7;
  border-color: #6750a4;
}

.export-button:active {
  background: #e8def8;
}

.export-single {
  padding: 8px;
  border-radius: 50%;
  min-width: 40px;
  min-height: 40px;
}

.export-icon {
  width: 20px;
  height: 20px;
}

.export-all .export-icon {
  width: 16px;
  height: 16px;
}

/* Page Content */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Metrics Section */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.metric-card:hover {
  box-shadow:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.metric-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.metric-icon {
  width: 24px;
  height: 24px;
  color: #6750a4;
  flex-shrink: 0;
  margin-top: 4px;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.metric-label {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: #49454f;
}

.metric-value {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 2rem;
  font-weight: 400;
  line-height: 2.5rem;
  color: #1c1b1f;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.metric-trend.positive {
  color: #2e7d31;
}

.metric-trend.neutral {
  color: #49454f;
}

.trend-icon {
  width: 16px;
  height: 16px;
}

/* Charts Section */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.chart-card:hover {
  box-shadow:
    0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.card-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.card-title-group {
  flex: 1;
}

.card-title {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.75rem;
  color: #1c1b1f;
  margin: 0 0 8px 0;
}

.card-subtitle {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: #49454f;
  margin: 0;
}

/* Level Distribution */
.level-distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.level-item {
  display: grid;
  grid-template-columns: 1fr auto 60px;
  align-items: center;
  gap: 16px;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c1b1f;
}

.level-count {
  font-size: 0.75rem;
  color: #49454f;
}

.level-bar {
  width: 120px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.level-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.level-not-acquired {
  background: #ba1a1a;
}

.level-in-progress {
  background: #f57c00;
}

.level-acquired {
  background: #2e7d31;
}

.level-expert {
  background: #6750a4;
}

.level-percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c1b1f;
  text-align: right;
}

/* Timeline Chart */
.timeline-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-area {
  width: 100%;
  height: 200px;
}

.progress-chart {
  width: 100%;
  height: 100%;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 50px;
  font-size: 0.75rem;
  color: #49454f;
}

/* Controls Section */
.controls-section {
  margin-bottom: 32px;
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.control-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.control-header {
  margin-bottom: 16px;
}

.control-title {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: #1c1b1f;
  margin: 0;
}

.student-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #79747e;
  border-radius: 8px;
  background: #ffffff;
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 1rem;
  color: #1c1b1f;
  cursor: pointer;
}

.student-select:focus {
  outline: none;
  border-color: #6750a4;
  box-shadow: 0 0 0 2px rgba(103, 80, 164, 0.2);
}

.metric-type-buttons {
  display: flex;
  gap: 8px;
}

.metric-type-button {
  padding: 10px 16px;
  border: 1px solid #79747e;
  border-radius: 20px;
  background: #ffffff;
  color: #49454f;
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.metric-type-button:hover {
  background: #f3edf7;
}

.metric-type-button.active {
  background: #6750a4;
  color: #ffffff;
  border-color: #6750a4;
}

/* Chart Legend */
.chart-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c1b1f;
}

/* Horizontal Bar Chart */
.horizontal-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.bar-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.bar-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
  margin-top: 8px;
}

.bar-label {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c1b1f;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.bar-value {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.75rem;
  color: #49454f;
  min-width: 40px;
  text-align: right;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #79747e;
  margin-bottom: 16px;
}

.empty-title {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: #1c1b1f;
  margin: 0 0 8px 0;
}

.empty-description {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.875rem;
  color: #49454f;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .navigation-rail {
    width: 60px;
  }

  .main-content {
    padding: 16px;
  }

  .rail-item {
    width: 48px;
    min-height: 48px;
    padding: 12px 8px;
  }

  .rail-label {
    font-size: 0.6rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .export-all {
    width: 100%;
    justify-content: center;
  }

  .page-title {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .title-icon {
    width: 28px;
    height: 28px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .metric-card,
  .chart-card {
    padding: 16px;
  }

  .charts-grid {
    gap: 16px;
  }

  .level-item {
    grid-template-columns: 1fr auto;
    gap: 12px;
  }

  .level-percentage {
    grid-column: 2;
    margin-top: 8px;
  }

  .controls-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .control-card {
    padding: 16px;
  }

  .metric-type-buttons {
    flex-wrap: wrap;
  }

  .bar-info {
    min-width: 150px;
  }

  .card-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .export-single {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .navigation-rail {
    width: 56px;
  }

  .main-content {
    padding: 12px;
  }

  .rail-item {
    width: 40px;
    min-height: 40px;
    padding: 8px 4px;
  }

  .rail-icon {
    width: 20px;
    height: 20px;
  }

  .rail-label {
    font-size: 0.55rem;
  }

  .metric-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .metric-icon {
    margin-top: 0;
  }

  .chart-labels {
    padding: 0 20px;
  }

  .bar-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .bar-info {
    min-width: unset;
    margin-top: 0;
  }

  .bar-group {
    order: 1;
  }

  .chart-legend {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
