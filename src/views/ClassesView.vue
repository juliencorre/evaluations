<template>
  <div class="classes-page">
    <!-- Center App Bar with School Year Selection -->
    <CenterAppBar
      title="Classes"
      :is-scrolled="isScrolled"
      :show-search="true"
      :show-back-button="true"
      :show-school-year-selector="true"
      @back="navigateToWelcome"
      @search-click="handleSearchClick"
      @logout="handleLogout"
    />

    <main class="classes-content" role="main">
      <h1 class="visually-hidden">Gestion des classes</h1>

      <!-- Loading State -->
      <div v-if="classStore.loading" class="loading-state">
        <div class="loading-spinner">
          <svg viewBox="0 0 24 24" fill="currentColor" class="spinner">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
        </div>
        <p>Chargement des classes...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredClasses.length === 0 && !searchTerm" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,3L1,9L12,15L21,9V10H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
          </svg>
        </div>
        <h2 class="empty-title">Aucune classe</h2>
        <p class="empty-description">
          Commencez par créer votre première classe avec le bouton ci-dessous.
        </p>
      </div>

      <!-- No Search Results -->
      <div v-else-if="filteredClasses.length === 0 && searchTerm" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5,14H20.5L22,15.5V20.5L20.5,22H15.5L14,20.5V15.5L15.5,14M16,16V20H20V16H16M10.5,18H12.5V20H10.5V18M6.5,16H8.5V18H6.5V16M2.5,14H4.5V16H2.5V14M7,2L13,8L7,14L1,8L7,2M7,4.8L3.8,8L7,11.2L10.2,8L7,4.8Z" />
          </svg>
        </div>
        <h2 class="empty-title">Aucun résultat</h2>
        <p class="empty-description">
          Aucune classe ne correspond à votre recherche "{{ searchTerm }}".
        </p>
      </div>

      <!-- Classes List -->
      <div v-else class="classes-list">
        <div
          v-for="classItem in filteredClasses"
          :key="classItem.id"
          class="class-card"
          @click="navigateToClassDetail(classItem)"
        >
          <div class="class-header">
            <div class="class-title-row">
              <h3 class="class-name">{{ classItem.name }}</h3>
              <span v-if="classItem.schoolYear" class="school-year-chip">
                {{ classItem.schoolYear }}
              </span>
            </div>
            <div class="class-nav-indicator">
              <span class="material-symbols-outlined">chevron_right</span>
            </div>
          </div>

          <p v-if="classItem.description" class="class-description">
            {{ classItem.description }}
          </p>

          <div v-if="classItem.level || classItem.subject" class="class-meta">
            <span v-if="classItem.level" class="meta-item">
              <span class="material-symbols-outlined">grade</span>
              {{ classItem.level }}
            </span>
            <span v-if="classItem.subject" class="meta-item">
              <span class="material-symbols-outlined">subject</span>
              {{ classItem.subject }}
            </span>
          </div>

          <div class="class-stats">
            <span class="stat-item">
              <span class="material-symbols-outlined">group</span>
              <span class="stat-label">{{ classStats[classItem.id]?.studentCount ?? '...' }} élèves</span>
            </span>
            <span class="stat-item">
              <span class="material-symbols-outlined">school</span>
              <span class="stat-label">{{ classStats[classItem.id]?.teacherCount ?? '...' }} enseignant{{ (classStats[classItem.id]?.teacherCount ?? 0) > 1 ? 's' : '' }}</span>
            </span>
            <span class="stat-item">
              <span class="material-symbols-outlined">assignment</span>
              <span class="stat-label">{{ classStats[classItem.id]?.evaluationCount ?? '...' }} évaluations</span>
            </span>
          </div>
        </div>
      </div>
    </main>

    <!-- Menu FAB -->
    <MenuFAB
      :menu-items="fabMenuItems"
      @menu-item-click="handleMenuItemClick"
    />

    <!-- Class Modal -->
    <ClassModal
      :visible="showModal"
      :class-data="selectedClassForEdit"
      :is-submitting="isSubmittingModal"
      @close="handleCloseModal"
      @submit="handleSubmitModal"
    />

    <!-- Search Class Dialog -->
    <SearchClassDialog
      :visible="showSearchDialog"
      @close="handleCloseSearchDialog"
      @class-joined="handleClassJoined"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import MenuFAB from '@/components/common/MenuFAB.vue'
import ClassModal from '@/components/classes/ClassModal.vue'
import SearchClassDialog from '@/components/classes/SearchClassDialog.vue'
import { useClassStore, useSchoolYearFilterStore } from '@/stores'
import { useLogout } from '@/composables/useLogout'
import type { Class } from '@/types/evaluation'

interface ClassFormData {
  name: string
  description?: string
  level?: string
  subject?: string
  schoolYear?: string
  active?: boolean
}

// Router
const router = useRouter()

// Stores
const classStore = useClassStore()
const schoolYearFilterStore = useSchoolYearFilterStore()

// State
const searchTerm = ref('')
const isScrolled = ref(false)
const showModal = ref(false)
const showSearchDialog = ref(false)
const selectedClassForEdit = ref<Class | null>(null)
const isSubmittingModal = ref(false)
const classStats = ref<Record<string, { studentCount: number; evaluationCount: number; teacherCount: number }>>({})

// Computed
const filteredClasses = computed(() => {
  let classes = classStore.userClasses

  // Filtrer par année scolaire sélectionnée
  if (!schoolYearFilterStore.isFilteringAllYears) {
    // Si une année spécifique est sélectionnée, filtrer les classes par cette année
    const selectedYearName = schoolYearFilterStore.displayText
    classes = classes.filter(classItem =>
      classItem.schoolYear === selectedYearName
    )
  }
  // Si "Toutes les années" est sélectionné, on affiche toutes les classes

  // Filtrer par terme de recherche
  if (!searchTerm.value) {
    return classes
  }

  const search = searchTerm.value.toLowerCase()
  return classes.filter(classItem =>
    classItem.name.toLowerCase().includes(search) ||
    (classItem.description && classItem.description.toLowerCase().includes(search)) ||
    (classItem.level && classItem.level.toLowerCase().includes(search)) ||
    (classItem.subject && classItem.subject.toLowerCase().includes(search))
  )
})

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  // Load classes if not already loaded
  if (classStore.classes.length === 0) {
    await classStore.loadClasses()
  }

  // Load class statistics
  await loadClassStatistics()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Event handlers
const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
}

const navigateToWelcome = () => {
  router.push('/welcome')
}

const handleSearchClick = () => {
  showSearchDialog.value = true
}

// Load class statistics
const loadClassStatistics = async () => {
  const classes = classStore.userClasses

  for (const classItem of classes) {
    try {
      // Get student count
      const students = await classStore.getStudentsForClass(classItem.id)
      const studentCount = students.length

      // Get evaluation count
      const evaluations = await classStore.getEvaluationsForClass(classItem.id)
      const evaluationCount = evaluations.length

      // Get teacher count (exclure les admin)
      const teachers = await classStore.getClassTeachers(classItem.id)
      const nonAdminTeachers = teachers.filter((teacher: { role: string }) => teacher.role !== 'admin')
      const teacherCount = nonAdminTeachers.length

      classStats.value[classItem.id] = {
        studentCount,
        evaluationCount,
        teacherCount
      }
    } catch (error) {
      console.error(`Error loading stats for class ${classItem.id}:`, error)
      classStats.value[classItem.id] = {
        studentCount: 0,
        evaluationCount: 0,
        teacherCount: 0
      }
    }
  }
}

const navigateToClassDetail = (classItem: Class) => {
  classStore.selectClass(classItem.id)
  router.push(`/classes/${classItem.id}`)
}

// FAB Menu configuration
const fabMenuItems = [
  {
    key: 'new-class',
    icon: 'add',
    label: 'Nouvelle classe',
    ariaLabel: 'Ajouter une nouvelle classe',
    type: 'primary'
  },
  {
    key: 'search-class',
    icon: 'search',
    label: 'Rechercher une classe',
    ariaLabel: 'Rechercher et rejoindre une classe existante',
    type: 'secondary'
  }
]

// Handle menu item clicks
const handleMenuItemClick = (item: { key: string }) => {
  if (item.key === 'new-class') {
    selectedClassForEdit.value = null
    showModal.value = true
  } else if (item.key === 'search-class') {
    showSearchDialog.value = true
  }
}

// Modal handlers
const handleCloseModal = () => {
  showModal.value = false
  selectedClassForEdit.value = null
  isSubmittingModal.value = false
}

const handleSubmitModal = async (classData: ClassFormData) => {
  if (isSubmittingModal.value) return

  isSubmittingModal.value = true

  try {
    if (selectedClassForEdit.value) {
      // Modifier une classe existante
      await classStore.updateClass(selectedClassForEdit.value.id, classData)
      console.log('Classe modifiée:', classData.name)
    } else {
      // Créer une nouvelle classe
      await classStore.createClass(classData)
      console.log('Classe créée:', classData.name)
    }

    // Reload class statistics after creating/updating
    await loadClassStatistics()

    handleCloseModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    isSubmittingModal.value = false
  }
}

// Search dialog handlers
const handleCloseSearchDialog = () => {
  showSearchDialog.value = false
}

const handleClassJoined = async (classData: Class) => {
  console.log('Classe rejointe:', classData.name)

  // Reload classes to include the newly joined class
  await classStore.loadClasses()

  // Reload class statistics
  await loadClassStatistics()

  // Close the search dialog
  showSearchDialog.value = false
}
</script>

<style scoped>
.classes-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.classes-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 80px;
  display: flex;
  flex-direction: column;
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

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 32px;
  flex: 1;
  min-height: 400px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 24px;
  color: var(--md-sys-color-primary);
}

.spinner {
  width: 100%;
  height: 100%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Empty States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 32px;
  flex: 1;
  min-height: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: var(--md-sys-color-outline);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 24px;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.empty-description {
  font-size: 16px;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.5;
  max-width: 400px;
  margin: 0;
}

/* Classes List */
.classes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 0;
}

.class-card {
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
}

.class-card:hover {
  background: var(--md-sys-color-surface-container);
  border-color: var(--md-sys-color-outline);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.class-card.active {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary-container);
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.class-title-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  margin-right: 12px;
}

.class-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0;
  line-height: 1.3;
}

.class-card.active .class-name {
  color: var(--md-sys-color-on-primary-container);
}

.school-year-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 4px 12px;
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: all 0.2s ease;
}

.class-card.active .school-year-chip {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.class-nav-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.6;
  transition: all 0.2s ease;
}

.class-card:hover .class-nav-indicator {
  color: var(--md-sys-color-primary);
  opacity: 1;
  transform: translateX(4px);
}

.class-nav-indicator .material-symbols-outlined {
  font-size: 20px;
}

.class-description {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.4;
  margin: 0 0 16px 0;
}

.class-card.active .class-description {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.8;
}

.class-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container);
  padding: 4px 8px;
  border-radius: 8px;
}

.class-card.active .meta-item {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.meta-item .material-symbols-outlined {
  font-size: 14px;
}

.class-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--md-sys-color-on-surface-variant);
}

.class-card.active .stat-item {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.9;
}

.stat-item .material-symbols-outlined {
  font-size: 16px;
  opacity: 0.8;
}

.stat-label {
  font-weight: 500;
}

@media (max-width: 768px) {
  .classes-content {
    padding: 24px 16px 80px;
    max-width: 100%;
  }

  .classes-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .classes-content {
    padding: 16px 8px 80px;
  }

  .class-card {
    padding: 16px;
  }

  .class-nav-indicator {
    opacity: 1;
  }
}
</style>