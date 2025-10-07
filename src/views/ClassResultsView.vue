<template>
  <div class="class-results-page">
    <!-- Center-aligned App Bar -->
    <CenterAppBar
      :title="pageTitle"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      @back="navigateBack"
      @user-menu-click="handleUserMenuClick"
      @logout="handleLogout"
    />

    <!-- Analysis Tabs -->
    <AnalysisTabs v-model="activeView" :tabs="tabItems" />

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Dashboard View - Class Average -->
      <DashboardView
        v-if="activeView === 'dashboard'"
        :class-id="props.id"
      />

      <!-- Student Analysis View -->
      <StudentAnalysisView
        v-if="activeView === 'student-analysis'"
        :class-id="props.id"
        @export-student-chart="exportStudentChart"
        @export-all-students="exportAllStudents"
      />
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Components
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import AnalysisTabs from '@/components/analysis/AnalysisTabs.vue'
import DashboardView from '@/components/analysis/DashboardView.vue'
import StudentAnalysisView from '@/components/analysis/StudentAnalysisView.vue'
import { useLogout } from '@/composables/useLogout'
import { useClassStore } from '@/stores'

interface Props {
  id: string
}

const props = defineProps<Props>()

// Stores
const router = useRouter()
const classStore = useClassStore()
const activeView = ref('dashboard')
const isScrolled = ref(false)

// Get current class
const currentClass = computed(() => {
  return classStore.userClasses.find(c => c.id === props.id) || null
})

const pageTitle = computed(() => {
  return currentClass.value ? `Résultats - ${currentClass.value.name}` : 'Résultats de la classe'
})

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

    console.log('Exporting student chart - capturing entire competencies card')

    // Capture toute la card "Évaluation des compétences"
    const cardElement = document.querySelector('.competencies-card')
    if (!cardElement) {
      window.alert('Impossible de trouver la carte d\'évaluation à exporter')
      return
    }

    // Générer le canvas avec options optimisées pour PDF
    const canvas = await html2canvas(cardElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: cardElement.scrollWidth,
      windowHeight: cardElement.scrollHeight,
      width: cardElement.scrollWidth,
      height: cardElement.scrollHeight
    })

    // Créer le PDF avec format A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Dimensions du PDF
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const maxWidth = pageWidth - (margin * 2)

    // Calculer les dimensions de l'image
    let imgWidth = maxWidth
    let imgHeight = (canvas.height * imgWidth) / canvas.width

    // Si l'image est trop haute pour une seule page, l'ajuster
    const maxHeightPerPage = pageHeight - (margin * 2)

    const imgData = canvas.toDataURL('image/png')

    if (imgHeight <= maxHeightPerPage) {
      // L'image tient sur une seule page
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight)
    } else {
      // L'image nécessite plusieurs pages
      let remainingHeight = imgHeight
      let sourceY = 0
      let pageNumber = 0

      while (remainingHeight > 0) {
        if (pageNumber > 0) {
          pdf.addPage()
        }

        const heightForThisPage = Math.min(remainingHeight, maxHeightPerPage)
        const sourceHeight = (heightForThisPage / imgHeight) * canvas.height

        // Créer un canvas temporaire pour cette section
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = sourceHeight
        const tempCtx = tempCanvas.getContext('2d')

        if (tempCtx) {
          tempCtx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          )

          const tempImgData = tempCanvas.toDataURL('image/png')
          pdf.addImage(tempImgData, 'PNG', margin, margin, imgWidth, heightForThisPage)
        }

        sourceY += sourceHeight
        remainingHeight -= heightForThisPage
        pageNumber++
      }
    }

    // Télécharger le PDF
    const fileName = `evaluation-competences-${currentClass.value?.name || 'classe'}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    console.log('✅ PDF exported successfully:', fileName)

  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error)
    window.alert('Erreur lors de l\'export de l\'évaluation')
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
    pdf.text(`Résultats tous les élèves - ${currentClass.value?.name || 'Classe'}`, margin, 20)

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
    pdf.save(`resultats-tous-eleves-${currentClass.value?.name || 'classe'}-${new Date().toISOString().split('T')[0]}.pdf`)

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

  // Load class if not already loaded
  if (classStore.classes.length === 0) {
    classStore.loadClasses()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Event handlers
const navigateBack = () => {
  router.push(`/classes/${props.id}`)
}

const handleUserMenuClick = () => {
  console.log('User menu clicked')
}

const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
}
</script>

<style scoped>
.class-results-page {
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
