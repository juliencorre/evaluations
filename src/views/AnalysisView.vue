<template>
  <div class="analysis-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      title="Analyses"
      :is-scrolled="isScrolled"
      :show-search="false"
      @user-menu-click="handleUserMenuClick"
      @help="handleHelp"
      @logout="handleLogout"
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

const handleHelp = () => {
  console.log('Help requested')
  window.alert('Aide - Fonctionnalité à venir')
}

const handleLogout = () => {
  console.log('Logout requested')
  window.alert('Déconnexion - Fonctionnalité à venir')
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
  padding: 24px 32px 80px;
  background-color: var(--md-sys-color-surface);
}


/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 16px 16px 80px;
  }
}

@media (min-width: 1440px) {
  .main-content {
    padding: 24px 32px 80px 80px;
  }
}
</style>