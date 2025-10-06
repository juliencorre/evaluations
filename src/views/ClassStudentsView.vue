<template>
  <div class="class-students-page">
    <!-- Center App Bar with Back Button -->
    <CenterAppBar
      :title="classData?.name || 'Gestion des élèves'"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      :show-school-year-selector="true"
      @back="handleBack"
      @logout="handleLogout"
    />

    <main class="class-students-content" role="main">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <svg class="spinner" viewBox="0 0 24 24">
            <circle
              class="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
        <p>Chargement des élèves...</p>
      </div>

      <!-- Content -->
      <div v-else class="content-sections">
        <!-- Students in Class Section -->
        <section class="students-section">
          <div class="section-header">
            <h2 class="section-title">
              Élèves de la classe
              <span class="students-count">({{ enrolledStudents.length }})</span>
            </h2>
          </div>

          <!-- No students enrolled -->
          <div v-if="enrolledStudents.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
            </div>
            <h3 class="empty-title">Aucun élève inscrit</h3>
            <p class="empty-description">
              Commencez par ajouter des élèves à cette classe avec le bouton ci-dessous.
            </p>
          </div>

          <!-- Students List -->
          <div v-else class="students-grid">
            <div
              v-for="student in enrolledStudents"
              :key="student.id"
              class="student-card"
            >
              <div class="student-info">
                <h3 class="student-name">{{ student.firstName }} {{ student.lastName }}</h3>
              </div>
              <button
                class="remove-button"
                :disabled="isRemoving"
                aria-label="Retirer de la classe"
                @click="handleRemoveStudent(student)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

        <!-- Add Students Section -->
        <section class="add-students-section">
          <div class="section-header">
            <h2 class="section-title">Ajouter des élèves</h2>
            <p class="section-description">
              Sélectionnez des élèves existants à ajouter à cette classe
            </p>
          </div>

          <!-- Available Students -->
          <div v-if="availableStudents.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
            </div>
            <h3 class="empty-title">Tous les élèves sont déjà inscrits</h3>
            <p class="empty-description">
              Tous les élèves disponibles sont déjà inscrits dans cette classe.
            </p>
          </div>

          <div v-else class="available-students">
            <div class="search-box">
              <input
                v-model="searchTerm"
                type="text"
                class="search-input"
                placeholder="Rechercher un élève..."
              />
            </div>

            <div class="students-grid">
              <div
                v-for="student in filteredAvailableStudents"
                :key="student.id"
                class="student-card selectable"
                :class="{ 'selected': selectedStudents.has(student.id) }"
                @click="toggleStudentSelection(student)"
              >
                <div class="student-info">
                  <h3 class="student-name">{{ student.firstName }} {{ student.lastName }}</h3>
                  </div>
                <div class="selection-indicator">
                  <svg v-if="selectedStudents.has(student.id)" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Add Selected Students Button -->
            <div v-if="selectedStudents.size > 0" class="add-students-actions">
              <button
                class="add-button"
                :disabled="isAdding"
                @click="handleAddSelectedStudents"
              >
                <svg v-if="isAdding" class="spinner" viewBox="0 0 24 24">
                  <circle
                    class="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                <span v-else>
                  Ajouter {{ selectedStudents.size }} élève{{ selectedStudents.size > 1 ? 's' : '' }}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentsStore } from '@/stores/studentsStore'
import { useClassStore } from '@/stores/classStore'
import { useSchoolYearStore } from '@/stores/schoolYearStore'
import { useLogout } from '@/composables/useLogout'
import { supabaseEvaluationResultsService } from '@/services/supabaseEvaluationResultsService'
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import type { Student } from '@/types/evaluation'

// Stores
const studentsStore = useStudentsStore()
const classStore = useClassStore()
const schoolYearStore = useSchoolYearStore()

// Router
const route = useRoute()
const router = useRouter()

// State
const isLoading = ref(true)
const isAdding = ref(false)
const isRemoving = ref(false)
const searchTerm = ref('')
const selectedStudents = ref(new Set<string>())
const isScrolled = ref(false)

// Class data
const classId = computed(() => route.params.id as string)
const classData = computed(() => classStore.getClassById(classId.value))

// Students data
const enrolledStudents = ref<Student[]>([])
const availableStudents = computed(() => {
  const enrolledIds = new Set(enrolledStudents.value.map(s => s.id))
  return studentsStore.allStudents.value.filter(student => !enrolledIds.has(student.id))
})

const filteredAvailableStudents = computed(() => {
  if (!searchTerm.value) {
    return availableStudents.value
  }

  const search = searchTerm.value.toLowerCase()
  return availableStudents.value.filter(
    (student) =>
      student.firstName.toLowerCase().includes(search) ||
      student.lastName.toLowerCase().includes(search) ||
      student.id.toLowerCase().includes(search)
  )
})

// Methods
const loadData = async () => {
  try {
    isLoading.value = true

    // Ensure school year is loaded
    await schoolYearStore.ensureLoaded()

    // Load classes if needed
    if (classStore.classes.length === 0) {
      await classStore.loadClasses()
    }

    // Load all students if needed
    if (studentsStore.allStudents.value.length === 0) {
      await studentsStore.refreshFromSupabase()
    }

    // Load enrolled students for this class
    await loadEnrolledStudents()
  } catch (error) {
    console.error('Error loading class students data:', error)
  } finally {
    isLoading.value = false
  }
}

const loadEnrolledStudents = async () => {
  try {
    console.log('🔄 Loading enrolled students...')
    console.log('📋 Class ID:', classId.value)
    console.log('📅 School Year ID:', schoolYearStore.currentSchoolYear.value?.id)

    if (!classId.value || !schoolYearStore.currentSchoolYear.value?.id) {
      console.log('❌ Missing classId or schoolYearId')
      enrolledStudents.value = []
      return
    }

    const students = await studentsStore.getStudentsForClass(
      classId.value,
      schoolYearStore.currentSchoolYear.value.id
    )
    console.log('✅ Enrolled students loaded:', students)
    enrolledStudents.value = students
  } catch (error) {
    console.error('❌ Error loading enrolled students:', error)
    enrolledStudents.value = []
  }
}

const toggleStudentSelection = (student: Student) => {
  if (selectedStudents.value.has(student.id)) {
    selectedStudents.value.delete(student.id)
  } else {
    selectedStudents.value.add(student.id)
  }
}

const handleAddSelectedStudents = async () => {
  if (isAdding.value || selectedStudents.value.size === 0) return

  const studentsCount = selectedStudents.value.size
  console.log(`👥 Adding ${studentsCount} student(s) to class`)

  isAdding.value = true
  try {
    const currentSchoolYear = schoolYearStore.currentSchoolYear.value
    if (!currentSchoolYear) {
      throw new Error('Aucune année scolaire sélectionnée')
    }

    console.log('📅 Current school year:', currentSchoolYear.name)
    console.log('📋 Class ID:', classId.value)

    // Add each selected student to the class
    for (const studentId of selectedStudents.value) {
      const student = studentsStore.allStudents.value.find(s => s.id === studentId)
      const studentName = student ? `${student.firstName} ${student.lastName}` : studentId
      console.log(`➕ Enrolling student ${studentName}...`)
      await studentsStore.enrollStudentInClass(
        studentId,
        classId.value,
        currentSchoolYear.id
      )
      console.log(`✅ Student ${studentName} enrolled successfully`)
    }

    // Clear selection and reload enrolled students
    selectedStudents.value.clear()
    console.log('🔄 Reloading enrolled students after enrollment...')
    await loadEnrolledStudents()

    console.log(`✅ ${studentsCount} élève(s) ajouté(s) à la classe avec succès`)
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des élèves:', error)
  } finally {
    isAdding.value = false
  }
}

const handleRemoveStudent = async (student: Student) => {
  if (isRemoving.value) return

  isRemoving.value = true
  try {
    const currentSchoolYear = schoolYearStore.currentSchoolYear.value
    if (!currentSchoolYear) {
      throw new Error('Aucune année scolaire sélectionnée')
    }

    console.log(`🗑️ Retrait de l'élève ${student.firstName} ${student.lastName} de la classe`)

    // 1. Delete all evaluation results for this student in this class
    const deletedCount = await supabaseEvaluationResultsService.deleteStudentResultsForClass(
      student.id,
      classId.value
    )
    console.log(`✅ ${deletedCount} résultat(s) d'évaluation supprimé(s)`)

    // 2. Unenroll student from class
    await studentsStore.unenrollStudentFromClass(
      student.id,
      classId.value,
      'dropped',
      currentSchoolYear.id
    )

    // 3. Reload enrolled students
    await loadEnrolledStudents()

    console.log(`✅ Élève ${student.firstName} ${student.lastName} retiré de la classe`)
  } catch (error) {
    console.error('❌ Erreur lors du retrait de l\'élève:', error)
  } finally {
    isRemoving.value = false
  }
}

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

// Logout
const { logout } = useLogout()
const handleLogout = async () => {
  await logout()
}

// Handle back navigation
const handleBack = () => {
  router.push('/classes')
}

// Initialize
onMounted(() => {
  loadData()
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.class-students-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

/* Content */
.class-students-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 16px;
}

.content-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.students-section,
.add-students-section {
  background: var(--md-sys-color-surface-container-low);
  border-radius: var(--md-sys-shape-corner-large, 16px);
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
}

.students-count {
  color: var(--md-sys-color-primary);
  font-weight: 500;
}

.section-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

/* Students Grid */
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.student-card {
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.student-card.selectable {
  cursor: pointer;
}

.student-card.selectable:hover {
  background: var(--md-sys-color-surface-container-highest);
  border-color: var(--md-sys-color-outline);
}

.student-card.selected {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 500);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-details {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.remove-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-error);
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.remove-button:hover:not(:disabled) {
  background: var(--md-sys-color-error-container);
}

.remove-button:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.remove-button svg {
  width: 20px;
  height: 20px;
}

.selection-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  flex-shrink: 0;
}

.selection-indicator svg {
  width: 16px;
  height: 16px;
}

/* Search */
.search-box {
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-small, 4px);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
  padding: 15px;
}

/* Actions */
.add-students-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 20px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  cursor: pointer;
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 40px;
}

.add-button:hover:not(:disabled) {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.add-button:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 32px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: var(--md-sys-color-outline);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-family: var(--md-sys-typescale-title-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-title-medium-size, 16px);
  font-weight: var(--md-sys-typescale-title-medium-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
}

.empty-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  max-width: 400px;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 31.416;
  stroke-dashoffset: 31.416;
  animation: dash 2s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .app-bar-content {
    padding: 12px 16px;
  }

  .class-students-content {
    padding: 16px;
  }

  .content-sections {
    gap: 24px;
  }

  .students-section,
  .add-students-section {
    padding: 16px;
  }

  .students-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .app-bar-content {
    padding: 8px 12px;
  }

  .class-students-content {
    padding: 12px;
  }

  .students-section,
  .add-students-section {
    padding: 12px;
  }
}
</style>