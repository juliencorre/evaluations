<template>
  <div class="analysis-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      title="Analyses"
      :is-scrolled="isScrolled"
      :show-search="false"
      @user-menu-click="handleUserMenuClick"
    />

    <!-- Analysis Tabs -->
    <AnalysisTabs v-model="activeView" :tabs="tabItems" />

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Dashboard View -->
      <DashboardView v-if="activeView === 'dashboard'" />

      <!-- Student Analysis View -->
      <StudentAnalysisView
        v-if="activeView === 'student-analysis'"
        @export-student-chart="exportStudentChart"
        @export-all-students="exportAllStudents"
      />
    </main>

    <!-- Bottom Header -->
    <footer class="page-footer">
      <div class="footer-content">
        <div v-if="getPageTitle()" class="footer-text">
          <h1 class="footer-title">
            <svg class="title-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
            {{ getPageTitle() }}
          </h1>
          <p v-if="getPageDescription()" class="footer-description">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Components
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import AnalysisTabs from '@/components/analysis/AnalysisTabs.vue'
import DashboardView from '@/components/analysis/DashboardView.vue'
import StudentAnalysisView from '@/components/analysis/StudentAnalysisView.vue'

// State
const activeView = ref('dashboard')
const isScrolled = ref(false)

// Functions for page header
function getPageTitle(): string {
  switch (activeView.value) {
    case 'dashboard': return 'Classe'
    case 'student-analysis': return 'Analyse des élèves'
    default: return 'Classe'
  }
}

function getPageDescription(): string {
  switch (activeView.value) {
    case 'dashboard': return 'Vue d\'ensemble des métriques et performances'
    case 'student-analysis': return 'Analyse détaillée des performances individuelles'
    default: return ''
  }
}

// Tab configuration
const tabItems = computed(() => [
  { id: 'dashboard', label: 'Classe', value: 'dashboard' },
  { id: 'student-analysis', label: 'Élèves', value: 'student-analysis' }
])

// Export functions
const exportStudentChart = () => {
  console.log('Exporting student chart')
  window.alert('Export en cours pour l\'élève sélectionné')
}

const exportAllStudents = () => {
  console.log('Exporting all students data')
  window.alert('Export en cours pour tous les élèves')
}

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
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
.analysis-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 24px 32px;
  background-color: var(--md-sys-color-surface);
}

/* Page Footer */
.page-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
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
  font-family: var(--md-sys-typescale-display-small-font);
  font-size: var(--md-sys-typescale-display-small-size);
  font-weight: var(--md-sys-typescale-display-small-weight);
  line-height: var(--md-sys-typescale-display-small-line-height);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 32px;
  height: 32px;
  color: var(--md-sys-color-primary);
}

.footer-description {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  color: var(--md-sys-color-on-surface-variant);
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
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.export-button:hover {
  background: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-primary);
}

.export-button:active {
  background: var(--md-sys-color-primary-container);
}

.export-icon {
  width: 16px;
  height: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-content {
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

  .footer-title {
    font-size: var(--md-sys-typescale-headline-medium-size);
    line-height: var(--md-sys-typescale-headline-medium-line-height);
  }

  .title-icon {
    width: 28px;
    height: 28px;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
}

@media (min-width: 1440px) {
  .main-content {
    padding-left: 80px;
  }
}
</style>