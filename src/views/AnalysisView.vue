<template>
  <div class="analysis-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      title="Analyses"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-school-icon="true"
      @user-menu-click="handleUserMenuClick"
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
import { useLogout } from '@/composables/useLogout'

// Stores

// State
const activeView = ref('dashboard')
const isScrolled = ref(false)


// Tab configuration
const tabItems = computed(() => [
  { id: 'dashboard', label: 'Classe', value: 'dashboard' },
  { id: 'student-analysis', label: 'Élèves', value: 'student-analysis' }
])

// Export functions
const exportStudentChart = async () => {
  try {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    console.log('Exporting student chart')

    // Capture le graphique de l'élève
    const chartElement = document.querySelector('.chart-container')
    if (!chartElement) {
      window.alert('Impossible de trouver le graphique à exporter')
      return
    }

    // Générer le canvas avec options optimisées pour PDF
    const canvas = await html2canvas(chartElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: chartElement.scrollWidth,
      windowHeight: chartElement.scrollHeight,
      width: chartElement.scrollWidth,
      height: chartElement.scrollHeight
    })

    // Créer le PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Dimensions du PDF avec marges réduites
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    const maxWidth = pageWidth - (margin * 2)
    const maxHeight = pageHeight - 50 // Espace pour titre et date

    // Calculer les dimensions optimales en gardant le ratio
    let imgWidth = maxWidth
    let imgHeight = (canvas.height * imgWidth) / canvas.width

    // Si le graphique est trop haut, ajuster
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight
      imgWidth = (canvas.width * imgHeight) / canvas.height
    }

    // Centrer l'image si nécessaire
    const xPosition = margin + (maxWidth - imgWidth) / 2

    // Ajouter le titre
    pdf.setFontSize(16)
    pdf.text('Analyse individuelle d\'élève', margin, 20)

    // Ajouter la date
    pdf.setFontSize(10)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 30)

    // Ajouter l'image du graphique
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', xPosition, 40, imgWidth, imgHeight)

    // Télécharger le PDF
    pdf.save(`analyse-eleve-${new Date().toISOString().split('T')[0]}.pdf`)

  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    window.alert('Erreur lors de l\'export du graphique')
  }
}

const exportAllStudents = async () => {
  try {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    console.log('Exporting all students data')

    // Capturer tous les graphiques visibles
    const chartElements = document.querySelectorAll('.chart-container')
    if (chartElements.length === 0) {
      window.alert('Aucun graphique à exporter')
      return
    }

    // Créer le PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Dimensions avec marges
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15

    // Ajouter le titre principal
    pdf.setFontSize(16)
    pdf.text('Analyse de tous les élèves', margin, 20)

    // Ajouter la date
    pdf.setFontSize(10)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 30)

    let yPosition = 50

    // Traiter chaque graphique
    for (let i = 0; i < chartElements.length; i++) {
      const chartElement = chartElements[i] as HTMLElement

      // Générer le canvas pour ce graphique avec options optimisées
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: chartElement.scrollWidth,
        windowHeight: chartElement.scrollHeight,
        width: chartElement.scrollWidth,
        height: chartElement.scrollHeight
      })

      // Dimensions du graphique avec marges
      const maxWidth = pageWidth - (margin * 2)
      const maxHeightPerChart = (pageHeight - 40) / 2 // Max 2 graphiques par page

      // Calculer les dimensions optimales
      let imgWidth = maxWidth
      let imgHeight = (canvas.height * imgWidth) / canvas.width

      // Ajuster si trop haut
      if (imgHeight > maxHeightPerChart) {
        imgHeight = maxHeightPerChart
        imgWidth = (canvas.width * imgHeight) / canvas.height
      }

      // Centrer l'image si nécessaire
      const xPosition = margin + (maxWidth - imgWidth) / 2

      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition + imgHeight > pageHeight - margin) {
        pdf.addPage()
        yPosition = 20
      }

      // Ajouter l'image du graphique
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight)

      yPosition += imgHeight + 20
    }

    // Télécharger le PDF
    pdf.save(`analyse-tous-eleves-${new Date().toISOString().split('T')[0]}.pdf`)

  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    window.alert('Erreur lors de l\'export des graphiques')
  }
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


const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
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