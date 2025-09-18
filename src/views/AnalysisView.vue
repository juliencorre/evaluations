<template>
  <div class="analysis-page">
    <!-- Top App Bar -->
    <TopAppBar
      :title="currentPageTitle"
      :subtitle="currentPageDescription"
      variant="medium"
    />

    <!-- Material 3 Tabs -->
    <div class="tabs-container">
      <div class="tabs-bar">
        <button
          v-for="tab in tabItems"
          :key="tab.id"
          class="tab"
          :class="{ active: activeView === tab.value }"
          @click="activeView = tab.value"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <div class="tab-indicator"></div>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">

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
                            backgroundColor: evaluationPeriods[index]?.color || '#6750a4'
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

      <!-- Bottom Header -->
      <footer class="page-footer">
        <div class="footer-content">
          <div class="footer-text">
            <h1 class="footer-title">
              <svg class="title-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
              {{ getPageTitle() }}
            </h1>
            <p class="footer-description">
              {{ getPageDescription() }}
            </p>
          </div>

          <!-- Global Export Button -->
          <div v-if="activeView === 'student-analysis'" class="footer-actions">
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
      </footer>
    </main>

  </div>
</template>

/* eslint-disable no-alert */
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudentsStore, useCompetencyFrameworkStore } from '../stores/studentsStore'
import { useEvaluationResultsStore } from '../stores/evaluationResultsStore'
import { useEvaluationStore } from '../stores/evaluationStore'
import { SupabaseResultTypesService } from '../services/supabaseResultTypesService'
import type { EvaluationResult, ResultTypeConfig } from '../types/evaluation'
import TopAppBar from '@/components/TopAppBar.vue'

// Type definitions



// Active view state
const activeView = ref('dashboard')

// Functions for page header
function getPageTitle(): string {
  switch (activeView.value) {
    case 'dashboard': return 'Tableau de bord';
    case 'class-analysis': return 'Analyse de classe';
    case 'student-analysis': return 'Analyse des élèves';
    default: return 'Tableau de bord';
  }
}

function getPageDescription(): string {
  switch (activeView.value) {
    case 'dashboard': return 'Vue d\'ensemble des métriques et performances';
    case 'class-analysis': return 'Analyse comparative des résultats de classe';
    case 'student-analysis': return 'Analyse détaillée des performances individuelles';
    default: return '';
  }
}

// Computed properties for the page
const currentPageTitle = computed(() => getPageTitle())
const currentPageDescription = computed(() => getPageDescription())

const tabItems = computed(() => [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    value: 'dashboard'
  },
  {
    id: 'class-analysis',
    label: 'Analyse de classe',
    value: 'class-analysis'
  },
  {
    id: 'student-analysis',
    label: 'Analyse des élèves',
    value: 'student-analysis'
  }
])

// Use stores
const studentsStore = useStudentsStore()
const evaluationResultsStore = useEvaluationResultsStore()
const evaluationStore = useEvaluationStore()

// Services
const resultTypesService = new SupabaseResultTypesService()

// Result types configuration
const resultTypes = ref<ResultTypeConfig[]>([])

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
// Computed property to get students from the store
const students = computed(() => {
  return studentsStore.allStudents.value.map(student => ({
    id: student.id,
    name: `${student.firstName} ${student.lastName}`
  }))
});

// Metric types
const metricTypes = ref([
  { value: 'domains', label: 'Domaines' },
  { value: 'fields', label: 'Champs' },
  { value: 'competencies', label: 'Compétences' }
]);

// Evaluation periods - generate colors for evaluations
const colorPalette = ['#6750a4', '#0F62FE', '#198038', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

const evaluationPeriods = computed(() => {
  return evaluationStore.allEvaluations.value.map((evaluation, index) => ({
    id: evaluation.id,
    name: evaluation.name,
    color: colorPalette[index % colorPalette.length]
  }))
});

// Helper function to get result type config ID from specific competency ID
const getResultTypeConfigId = (specificCompetencyId?: string): string | undefined => {
  if (!specificCompetencyId) return undefined

  const frameworkStore = useCompetencyFrameworkStore()
  const framework = frameworkStore.framework.value

  for (const domain of framework.domains) {
    for (const field of domain.fields) {
      for (const competency of field.competencies) {
        const specificComp = competency.specificCompetencies.find(sc => sc.id === specificCompetencyId)
        if (specificComp) {
          return specificComp.resultTypeConfigId
        }
      }
    }
  }
  return undefined
}

// Function to convert evaluation result value to score using pivot_value
const getScoreFromValue = (value: string, resultTypeConfigId?: string): number => {
  console.log('🔍 getScoreFromValue called with:', { value, resultTypeConfigId })

  if (!value || !resultTypeConfigId) {
    console.log('❌ Missing value or resultTypeConfigId:', { value, resultTypeConfigId })
    return 0
  }

  const resultType = resultTypes.value.find(rt => rt.id === resultTypeConfigId)
  console.log('📋 Found result type:', resultType)

  if (!resultType) {
    console.log('❌ No result type found for ID:', resultTypeConfigId)
    console.log('📋 Available result types:', resultTypes.value.map(rt => ({ id: rt.id, name: rt.name })))
    return 0
  }

  const configValue = resultType.config.values.find(v => v.value === value)
  console.log('🎯 Found config value:', configValue)

  if (!configValue) {
    console.log('❌ No config value found for:', value)
    console.log('📋 Available values:', resultType.config.values)
    return 0
  }

  // Convert pivot_value (0-10) to score (0-4)
  const score = (configValue.pivot_value / 10) * 4
  console.log('✅ Calculated score:', score)
  return score
}

// Function to calculate averages by level (domains, fields, competencies) across multiple evaluations
const calculateAveragesByLevel = (studentId: string, metricType: string) => {
  console.log('🎯 calculateAveragesByLevel called for:', { studentId, metricType })

  const results = evaluationResultsStore.results.value
  const evaluations = evaluationStore.allEvaluations.value

  console.log('📊 Raw data:', {
    resultsCount: results?.length || 0,
    evaluationsCount: evaluations?.length || 0,
    results: results,
    evaluations: evaluations
  })

  if (!Array.isArray(results) || results.length === 0 || evaluations.length === 0) {
    console.log('❌ Missing data:', {
      hasResults: Array.isArray(results) && results.length > 0,
      hasEvaluations: evaluations.length > 0
    })
    return []
  }

  // Filter results for the selected student
  const studentResults = results.filter(result => result.studentId === studentId)
  console.log('👤 Student results:', {
    studentId,
    totalResults: results.length,
    studentResultsCount: studentResults.length,
    studentResults: studentResults
  })

  if (studentResults.length === 0) {
    console.log('❌ No results found for student:', studentId)
    console.log('📋 Available student IDs:', [...new Set(results.map(r => r.studentId))])
    return []
  }

  // Group results by evaluation ID, then by the metric type
  const resultsByEvaluation = studentResults.reduce((acc, result) => {
    // Use the evaluation ID from the result or default to current evaluation
    const evaluationId = result.evaluatedAt ?
      evaluations.find(evaluation => new Date(evaluation.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
      evaluationResultsStore.evaluation.value?.id || 'current'

    console.log('📝 Processing result:', {
      result,
      evaluationId,
      evaluatedAt: result.evaluatedAt,
      currentEvaluation: evaluationResultsStore.evaluation.value?.id
    })

    const safeEvaluationId = evaluationId || 'unknown'
    if (!acc[safeEvaluationId]) {
      acc[safeEvaluationId] = []
    }
    acc[safeEvaluationId].push(result)
    return acc
  }, {} as Record<string, EvaluationResult[]>)

  console.log('📊 Results grouped by evaluation:', resultsByEvaluation)

  // Calculate averages for each metric level
  const calculateByMetricType = (allResults: EvaluationResult[]) => {
    switch (metricType) {
      case 'domains': {
        // Group by domains (simplified - assume one domain for now)
        console.log('🏗️ Calculating domains average')
        const domainsResult = [{
          name: 'Moyenne générale',
          evaluations: evaluations.map(evaluation => {
            const evalResults = resultsByEvaluation[evaluation.id] || []
            console.log(`📊 Evaluation ${evaluation.name} (${evaluation.id}):`, {
              resultsCount: evalResults.length,
              results: evalResults
            })

            if (evalResults.length === 0) {
              console.log(`❌ No results for evaluation ${evaluation.name}`)
              return { score: 0 }
            }

            const scores = evalResults.map(result => {
              console.log(`🔍 Full result object:`, result)
              console.log(`🔍 Result properties:`, {
                specificCompetencyId: result.specificCompetencyId,
                competencyId: result.competencyId,
                studentId: result.studentId,
                value: result.value,
                allKeys: Object.keys(result)
              })

              const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              console.log(`📊 Score for result:`, {
                result,
                specificCompetencyId: result.specificCompetencyId,
                resultTypeConfigId,
                value: result.value,
                score
              })
              return score
            })

            const totalScore = scores.reduce((sum, score) => sum + score, 0)
            const avgScore = totalScore / evalResults.length

            console.log(`✅ Average for ${evaluation.name}:`, {
              totalScore,
              resultCount: evalResults.length,
              avgScore
            })

            return { score: avgScore }
          })
        }]
        console.log('🏗️ Final domains result:', domainsResult)
        return domainsResult
      }

      case 'fields':
        // Group by fields (simplified)
        return [{
          name: 'Moyenne par champ',
          evaluations: evaluations.map(evaluation => {
            const evalResults = resultsByEvaluation[evaluation.id] || []
            if (evalResults.length === 0) return { score: 0 }

            const totalScore = evalResults.reduce((sum, result) => {
              const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              return sum + score
            }, 0)

            return { score: totalScore / evalResults.length }
          })
        }]

      case 'competencies': {
        // Group by competency ID
        const competencyGroups = allResults.reduce((acc, result) => {
          const key = result.competencyId || 'unknown'
          if (!acc[key]) {
            acc[key] = []
          }
          acc[key].push(result)
          return acc
        }, {} as Record<string, EvaluationResult[]>)

        return Object.entries(competencyGroups).map(([competencyId, competencyResults]) => ({
          name: `Compétence ${competencyId.slice(-8)}`,
          evaluations: evaluations.map(evaluation => {
            // Find results for this competency in this evaluation
            const evalCompetencyResults = competencyResults.filter(result => {
              const resultEvaluationId = result.evaluatedAt ?
                evaluations.find(evaluation_item => new Date(evaluation_item.createdAt).getTime() <= new Date(result.evaluatedAt || '').getTime())?.id :
                evaluationResultsStore.evaluation.value?.id || 'current'
              return resultEvaluationId === evaluation.id
            })

            if (evalCompetencyResults.length === 0) return { score: 0 }

            const totalScore = evalCompetencyResults.reduce((sum, result) => {
              const resultTypeConfigId = getResultTypeConfigId(result.specificCompetencyId)
              const score = result.value ? getScoreFromValue(result.value, resultTypeConfigId) : 0
              return sum + score
            }, 0)

            return { score: totalScore / evalCompetencyResults.length }
          })
        }))
      }

      default:
        return []
    }
  }

  return calculateByMetricType(studentResults)
}


// Temporary fallback with static data if no real data is available
const fallbackStudentData = {
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
};


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
  console.log('🎯 getStudentData called with:', {
    selectedStudent: selectedStudent.value,
    selectedMetricType: selectedMetricType.value
  })

  if (!selectedStudent.value) {
    console.log('❌ No student selected')
    return []
  }

  try {
    // Use the new calculation function for dynamic data
    console.log('🔍 Calling calculateAveragesByLevel...')
    const dynamicData = calculateAveragesByLevel(selectedStudent.value, selectedMetricType.value)
    console.log('📊 Dynamic data result:', dynamicData)

    if (dynamicData.length > 0) {
      console.log('✅ Using dynamic data')
      return dynamicData
    }

    // Fallback to static data if no dynamic data is available
    console.log('🔄 Falling back to static data')
    const fallbackData = fallbackStudentData?.[selectedStudent.value as keyof typeof fallbackStudentData]
    console.log('📋 Fallback data:', fallbackData)

    if (fallbackData) {
      const result = (fallbackData as Record<string, unknown[]>)[selectedMetricType.value] || []
      console.log('✅ Using fallback data:', result)
      return result
    }

    console.log('❌ No data available')
    return []
  } catch (error) {
    console.error('❌ Error getting student data:', error)
    return []
  }
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

// Initialize data on component mount
onMounted(async () => {
  try {
    // Load students from the database if not already loaded
    if (studentsStore.allStudents.value.length === 0) {
      await studentsStore.refreshFromSupabase()
    }

    // Load evaluations from the database
    await evaluationStore.loadEvaluations()

    // Load result types configuration for pivot value calculations
    resultTypes.value = await resultTypesService.getResultTypes()
    console.log('✅ Result types loaded:', resultTypes.value.length)

    // Initialize evaluation results if we have evaluations
    if (evaluationStore.allEvaluations.value.length > 0) {
      const firstEvaluation = evaluationStore.allEvaluations.value[0]
      console.log('🔄 Initializing evaluation results for:', firstEvaluation.name)

      await evaluationResultsStore.initializeEvaluation({
        id: firstEvaluation.id,
        name: firstEvaluation.name,
        description: firstEvaluation.description,
        frameworkId: firstEvaluation.frameworkId,
        classId: firstEvaluation.classId,
        createdAt: firstEvaluation.createdAt
      })

      console.log('✅ Evaluation results initialized:', {
        evaluationId: firstEvaluation.id,
        resultsCount: evaluationResultsStore.results.value.length
      })
    } else {
      console.log('⚠️ No evaluations available to load results from')
    }
  } catch (error) {
    console.error('❌ Error loading analysis data:', error)
  }
})
</script>

<style scoped>
.analysis-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
  position: relative;
}


.page-title {
  flex: 1;
}

.page-title h1 {
  font-family: var(--md-sys-typescale-headline-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-headline-medium-size, 28px);
  font-weight: var(--md-sys-typescale-headline-medium-weight, 400);
  line-height: var(--md-sys-typescale-headline-medium-line-height, 36px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0 0 4px 0;
}

.page-description {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin: 0;
}




/* Main Content */
.main-content {
  flex: 1;
  padding: 24px;
}

/* Page Footer */
.page-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.footer-text {
  flex: 1;
}

.footer-title {
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

.footer-description {
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

.footer-actions {
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
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 12px; /* 12dp corner radius */
  padding: 24px 16px; /* 16dp left/right padding */
  margin-bottom: 8px; /* 8dp max padding between cards */
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
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 12px; /* 12dp corner radius */
  padding: 24px 16px; /* 16dp left/right padding */
  margin-bottom: 8px; /* 8dp max padding between cards */
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
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  border-radius: 12px; /* 12dp corner radius */
  padding: 24px 16px; /* 16dp left/right padding */
  margin-bottom: 8px; /* 8dp max padding between cards */
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

  .main-content {
    padding: 16px;
  }

  .rail-item {
    width: 48px;
    min-height: 48px;
    padding: 12px 8px;
  }

  .rail-label {
    display: none;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .footer-actions {
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
    display: none;
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

/* Material 3 Tabs */
.tabs-container {
  position: sticky;
  top: 0;
  background: #ffffff;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  z-index: 10;
}

.tabs-bar {
  display: flex;
  align-items: center;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-bar::-webkit-scrollbar {
  display: none;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  outline: none;
  overflow: hidden;
}

.tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-surface, #1d1b20);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.tab:hover::before {
  opacity: 0.08;
}

.tab:focus::before {
  opacity: 0.12;
}

.tab:active::before {
  opacity: 0.12;
}

.tab.active {
  color: var(--md-sys-color-primary, #6750a4);
}

.tab-label {
  position: relative;
  z-index: 1;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--md-sys-color-primary, #6750a4);
  border-radius: 3px 3px 0 0;
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab.active .tab-indicator {
  transform: scaleX(1);
}

/* Responsive tabs */
@media (max-width: 768px) {
  .tabs-container {
    padding: 0 16px;
  }

  .tabs-bar {
    padding: 0;
  }

  .tab {
    min-width: 120px;
    padding: 12px 8px;
    font-size: 13px;
  }
}
</style>
