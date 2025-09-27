<template>
  <div class="class-detail-page">
    <!-- Center App Bar with School Year Selection -->
    <CenterAppBar
      :title="currentClass?.name || 'Détails de la classe'"
      :is-scrolled="isScrolled"
      :show-search="false"
      :show-back-button="true"
      :show-school-year-selector="true"
      @back="$router.back()"
      @logout="handleLogout"
    />

    <main class="class-detail-content" role="main">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <svg viewBox="0 0 24 24" fill="currentColor" class="spinner">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
        </div>
        <p>Chargement des détails de la classe...</p>
      </div>

      <!-- Class not found -->
      <div v-else-if="!currentClass" class="error-state">
        <div class="error-icon">
          <span class="material-symbols-outlined">error</span>
        </div>
        <h2 class="error-title">Classe introuvable</h2>
        <p class="error-description">
          La classe demandée n'existe pas ou n'est plus accessible.
        </p>
        <button class="btn btn-primary" @click="$router.push('/classes')">
          Retour aux classes
        </button>
      </div>

      <!-- Class Details -->
      <div v-else class="class-details">
        <!-- Header Section -->
        <div class="class-header-section">
          <div class="class-header-content">
            <div class="class-icon">
              <span class="material-symbols-outlined">school</span>
            </div>
            <div class="class-info">
              <h1 class="class-title">{{ currentClass.name }}</h1>
              <p v-if="currentClass.description" class="class-description">
                {{ currentClass.description }}
              </p>
              <div class="class-metadata">
                <span v-if="currentClass.level" class="metadata-item">
                  <span class="material-symbols-outlined">grade</span>
                  {{ currentClass.level }}
                </span>
                <span v-if="currentSchoolYear" class="metadata-item">
                  <span class="material-symbols-outlined">calendar_today</span>
                  {{ currentSchoolYear.name }}
                </span>
                <span v-if="currentClass.subject" class="metadata-item">
                  <span class="material-symbols-outlined">subject</span>
                  {{ currentClass.subject }}
                </span>
                <span class="metadata-item">
                  <span class="material-symbols-outlined">people</span>
                  {{ studentCount }} élève{{ studentCount > 1 ? 's' : '' }}
                </span>
                <span class="metadata-item" :class="{ 'active': currentClass.active }">
                  <span class="material-symbols-outlined">
                    {{ currentClass.active ? 'check_circle' : 'cancel' }}
                  </span>
                  {{ currentClass.active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button class="edit-class-btn" @click="openEditModal">
            <span class="material-symbols-outlined">edit</span>
            Modifier
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <div class="action-card" @click="navigateToStudents">
            <div class="action-icon">
              <span class="material-symbols-outlined">people</span>
            </div>
            <div class="action-content">
              <h3 class="action-title">Gérer les élèves</h3>
              <p class="action-description">
                {{ studentCount }} élève{{ studentCount > 1 ? 's' : '' }} inscrit{{ studentCount > 1 ? 's' : '' }}
                <span v-if="classStatistics.transferred > 0">
                  • {{ classStatistics.transferred }} transféré{{ classStatistics.transferred > 1 ? 's' : '' }}
                </span>
              </p>
            </div>
            <span class="material-symbols-outlined">chevron_right</span>
          </div>

          <div class="action-card" @click="navigateToEvaluations">
            <div class="action-icon">
              <span class="material-symbols-outlined">assignment</span>
            </div>
            <div class="action-content">
              <h3 class="action-title">Évaluations</h3>
              <p class="action-description">
                {{ evaluationCount }} évaluation{{ evaluationCount > 1 ? 's' : '' }} disponible{{ evaluationCount > 1 ? 's' : '' }}
              </p>
            </div>
            <span class="material-symbols-outlined">chevron_right</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Modal -->
    <ClassModal
      :visible="showEditModal"
      :class-data="currentClass"
      :is-submitting="isSubmittingModal"
      @close="handleCloseModal"
      @submit="handleSubmitModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CenterAppBar from '@/components/common/CenterAppBar.vue'
import ClassModal from '@/components/classes/ClassModal.vue'
import { useClassStore } from '@/stores/classStore'
import { useSchoolYearStore } from '@/stores/schoolYearStore'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { useLogout } from '@/composables/useLogout'

interface ClassFormData {
  name: string
  description?: string
  level?: string
  subject?: string
  schoolYear?: string
  active?: boolean
}

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const classStore = useClassStore()
const schoolYearStore = useSchoolYearStore()
const evaluationStore = useEvaluationStore()
const { logout } = useLogout()

// State
const isScrolled = ref(false)
const isLoading = ref(true)
const showEditModal = ref(false)
const isSubmittingModal = ref(false)
const studentCount = ref(0)
const evaluationCount = ref(0)
const classStatistics = ref({
  total: 0,
  active: 0,
  transferred: 0,
  graduated: 0,
  dropped: 0
})

// Computed
const currentClass = computed(() => {
  return classStore.userClasses.find(c => c.id === props.id) || null
})

const currentSchoolYear = computed(() => {
  return schoolYearStore.currentSchoolYear
})

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  try {
    // Load school years and classes
    await schoolYearStore.ensureLoaded()

    if (classStore.classes.length === 0) {
      await classStore.loadClasses()
    }

    // Load class-specific data
    await loadClassData()
  } catch (error) {
    console.error('Error loading class detail data:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Event handlers
const handleLogout = async () => {
  await logout()
}

const openEditModal = () => {
  showEditModal.value = true
}

const handleCloseModal = () => {
  showEditModal.value = false
  isSubmittingModal.value = false
}

const handleSubmitModal = async (classData: ClassFormData) => {
  if (isSubmittingModal.value || !currentClass.value) return

  isSubmittingModal.value = true

  try {
    await classStore.updateClass(currentClass.value.id, classData)
    console.log('Classe modifiée:', classData.name)
    handleCloseModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    isSubmittingModal.value = false
  }
}

const loadClassData = async () => {
  if (!props.id) return

  try {
    // Load class statistics
    const stats = await classStore.getClassStatistics(props.id, currentSchoolYear.value?.id)
    classStatistics.value = stats
    studentCount.value = stats.active

    // Load evaluation count using the new evaluation_classes system
    const evaluations = await evaluationStore.getEvaluationsForClass(props.id, currentSchoolYear.value?.id)
    evaluationCount.value = evaluations.length
  } catch (error) {
    console.error('Error loading class data:', error)
  }
}

const navigateToStudents = () => {
  router.push(`/classes/${props.id}/students`)
}

const navigateToEvaluations = () => {
  classStore.selectClass(props.id)
  router.push('/evaluations')
}
</script>

<style scoped>
.class-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.class-detail-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

/* Loading and Error States */
.loading-state,
.error-state {
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

.error-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: var(--md-sys-color-error);
}

.error-icon .material-symbols-outlined {
  font-size: 80px;
}

.error-title {
  font-size: 24px;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 12px 0;
}

.error-description {
  font-size: 16px;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 24px 0;
  max-width: 400px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.btn-primary:hover {
  background: var(--md-sys-color-primary-container);
}

/* Class Details */
.class-details {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.class-header-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
  background: var(--md-sys-color-surface-container-low);
  border-radius: 16px;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.class-header-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
}

.class-icon {
  width: 64px;
  height: 64px;
  background: var(--md-sys-color-primary-container);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-primary-container);
}

.class-icon .material-symbols-outlined {
  font-size: 32px;
}

.class-info {
  flex: 1;
}

.class-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.class-description {
  font-size: 16px;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.class-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container);
  padding: 8px 12px;
  border-radius: 8px;
}

.metadata-item.active {
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.metadata-item .material-symbols-outlined {
  font-size: 16px;
}

.edit-class-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-class-btn:hover {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:hover {
  background: var(--md-sys-color-surface-container);
  border-color: var(--md-sys-color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: var(--md-sys-color-secondary-container);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-secondary-container);
}

.action-icon .material-symbols-outlined {
  font-size: 24px;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0 0 4px 0;
}

.action-description {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  line-height: 1.4;
}

.action-card .material-symbols-outlined:last-child {
  font-size: 24px;
  color: var(--md-sys-color-on-surface-variant);
}

/* Responsive */
@media (max-width: 768px) {
  .class-detail-content {
    padding: 16px;
  }

  .class-header-section {
    flex-direction: column;
    align-items: stretch;
    padding: 24px;
  }

  .class-header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .edit-class-btn {
    align-self: center;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .class-metadata {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .class-detail-content {
    padding: 8px;
  }

  .class-header-section {
    padding: 16px;
  }

  .action-card {
    padding: 16px;
  }
}
</style>