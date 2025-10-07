<template>
  <div class="teachers-page">
    <!-- Search App Bar with Back Button -->
    <SearchAppBar
      :search-value="searchQuery"
      :title="pageTitle"
      :is-scrolled="isScrolled"
      :show-back-button="true"
      placeholder="Rechercher un enseignant..."
      @update:search-value="searchQuery = $event"
      @back="handleBack"
      @logout="handleLogout"
    />

    <main class="teachers-content" role="main">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <svg viewBox="0 0 24 24" fill="currentColor" class="spinner">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
        </div>
        <p>Chargement des enseignants...</p>
      </div>

      <!-- Teachers List -->
      <div v-else-if="filteredTeachers.length > 0" class="teachers-list">
        <div
          v-for="teacher in filteredTeachers"
          :key="teacher.id"
          class="teacher-card"
        >
          <div class="teacher-avatar">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="teacher-info">
            <h3 class="teacher-name">{{ teacher.fullName || teacher.email }}</h3>
            <p class="teacher-role">{{ getRoleLabel(teacher.role) }}</p>
            <p v-if="teacher.fullName && teacher.email" class="teacher-email">{{ teacher.email }}</p>
          </div>
          <div class="teacher-actions">
            <button
              v-if="teacher.role !== 'owner'"
              class="action-btn delete-btn"
              aria-label="Retirer l'enseignant"
              @click="handleRemoveTeacher(teacher)"
            >
              <span class="material-symbols-outlined">person_remove</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <span class="material-symbols-outlined">school</span>
        </div>
        <h2 class="empty-title">Aucun enseignant</h2>
        <p class="empty-description">
          Aucun enseignant n'a accès à cette classe pour le moment.
        </p>
      </div>
    </main>

    <!-- Menu FAB -->
    <MenuFAB
      v-if="!isLoading"
      :menu-items="fabMenuItems"
      @menu-item-click="handleMenuItemClick"
    />

    <!-- Add Teacher Modal -->
    <FullscreenDialog
      :visible="showAddTeacherModal"
      title="Ajouter un enseignant"
      subtitle="Donner accès à un enseignant"
      save-button-text="Ajouter"
      saving-text="Ajout..."
      :save-disabled="!newTeacherEmail.trim()"
      :is-saving="isSaving"
      @close="closeAddTeacherModal"
      @save="handleAddTeacher"
    >
      <div class="add-teacher-form">
        <div class="text-field-outlined">
          <input
            id="teacherEmail"
            v-model="newTeacherEmail"
            type="email"
            class="text-field-input-outlined"
            placeholder=" "
          />
          <label for="teacherEmail" class="text-field-label-outlined">Email de l'enseignant *</label>
          <div class="text-field-outline">
            <div class="text-field-outline-start"></div>
            <div class="text-field-outline-notch">
              <div class="text-field-outline-leading"></div>
              <div class="text-field-outline-trailing"></div>
            </div>
            <div class="text-field-outline-end"></div>
          </div>
        </div>

        <div class="text-field-outlined">
          <select
            id="teacherRole"
            v-model="newTeacherRole"
            class="text-field-input-outlined"
          >
            <option value="teacher">Enseignant</option>
            <option value="assistant">Assistant</option>
          </select>
          <label for="teacherRole" class="text-field-label-outlined text-field-label-select">Rôle</label>
          <div class="text-field-outline">
            <div class="text-field-outline-start"></div>
            <div class="text-field-outline-notch">
              <div class="text-field-outline-leading"></div>
              <div class="text-field-outline-trailing"></div>
            </div>
            <div class="text-field-outline-end"></div>
          </div>
        </div>
      </div>
    </FullscreenDialog>

    <!-- Confirmation Dialog for Remove -->
    <ConfirmationDialog
      :visible="showRemoveDialog"
      title="Retirer l'enseignant"
      :message="removeMessage"
      warning-text="Cet enseignant n'aura plus accès à cette classe."
      confirm-text="Retirer"
      cancel-text="Annuler"
      @close="closeRemoveDialog"
      @confirm="confirmRemoveTeacher"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchAppBar from '@/components/common/SearchAppBar.vue'
import MenuFAB from '@/components/common/MenuFAB.vue'
import FullscreenDialog from '@/components/common/FullscreenDialog.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useClassStore } from '@/stores/classStore'
import { useLogout } from '@/composables/useLogout'
import type { ClassTeacher } from '@/types/evaluation'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const classStore = useClassStore()
const { logout } = useLogout()

// State
const isScrolled = ref(false)
const isLoading = ref(true)
const searchQuery = ref('')
const teachers = ref<ClassTeacher[]>([])
const showAddTeacherModal = ref(false)
const showRemoveDialog = ref(false)
const isSaving = ref(false)
const newTeacherEmail = ref('')
const newTeacherRole = ref<'teacher' | 'assistant'>('teacher')
const teacherToRemove = ref<ClassTeacher | null>(null)

// Computed
const currentClass = computed(() => {
  return classStore.userClasses.find(c => c.id === props.id) || null
})

const pageTitle = computed(() => {
  return currentClass.value ? `Enseignants - ${currentClass.value.name}` : 'Enseignants'
})

const filteredTeachers = computed(() => {
  // Exclure les utilisateurs admin de la liste (admin n'est pas un rôle valide dans user_classes)
  const nonAdminTeachers = teachers.value

  if (!searchQuery.value.trim()) {
    return nonAdminTeachers
  }

  const query = searchQuery.value.toLowerCase()
  return nonAdminTeachers.filter(teacher => {
    return (
      teacher.email?.toLowerCase().includes(query) ||
      teacher.fullName?.toLowerCase().includes(query)
    )
  })
})

const removeMessage = computed(() => {
  if (!teacherToRemove.value) return ''
  return `Êtes-vous sûr de vouloir retirer ${teacherToRemove.value.email || 'cet enseignant'} de cette classe ?`
})

// FAB Menu configuration
const fabMenuItems = computed(() => [
  {
    key: 'add-teacher',
    icon: 'person_add',
    label: 'Ajouter un enseignant',
    ariaLabel: 'Ajouter un enseignant à la classe',
    type: 'primary'
  }
])

// Methods
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: 'Propriétaire',
    teacher: 'Enseignant',
    assistant: 'Assistant'
  }
  return labels[role] || role
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

const handleBack = () => {
  router.back()
}

const handleLogout = async () => {
  await logout()
}

const handleMenuItemClick = (item: { key: string }) => {
  if (item.key === 'add-teacher') {
    showAddTeacherModal.value = true
  }
}

const closeAddTeacherModal = () => {
  showAddTeacherModal.value = false
  newTeacherEmail.value = ''
  newTeacherRole.value = 'teacher'
}

const handleAddTeacher = async () => {
  if (isSaving.value || !newTeacherEmail.value.trim()) return

  isSaving.value = true

  try {
    await classStore.addTeacherToClass(props.id, newTeacherEmail.value, newTeacherRole.value)
    await loadTeachers()
    closeAddTeacherModal()
  } catch (error) {
    console.error('Error adding teacher:', error)
    alert('Erreur lors de l\'ajout de l\'enseignant. Vérifiez que l\'email est valide.')
  } finally {
    isSaving.value = false
  }
}

const handleRemoveTeacher = (teacher: ClassTeacher) => {
  teacherToRemove.value = teacher
  showRemoveDialog.value = true
}

const closeRemoveDialog = () => {
  showRemoveDialog.value = false
  teacherToRemove.value = null
}

const confirmRemoveTeacher = async () => {
  if (!teacherToRemove.value) return

  try {
    await classStore.removeTeacherFromClass(props.id, teacherToRemove.value.userId)
    await loadTeachers()
    closeRemoveDialog()
  } catch (error) {
    console.error('Error removing teacher:', error)
    alert('Erreur lors de la suppression de l\'enseignant.')
  }
}

const loadTeachers = async () => {
  try {
    teachers.value = await classStore.getClassTeachers(props.id)
  } catch (error) {
    console.error('Error loading teachers:', error)
  }
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  try {
    if (classStore.classes.length === 0) {
      await classStore.loadClasses()
    }

    await loadTeachers()
  } catch (error) {
    console.error('Error loading teachers page:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.teachers-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--neuro-bg-base);
  padding-top: 64px;
  padding-left: 80px;
}

.teachers-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
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
  color: var(--neuro-accent-primary);
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

/* Teachers List */
.teachers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.teacher-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--neuro-bg-base);
  border-radius: var(--neuro-radius-medium);
  box-shadow: var(--neuro-shadow-raised);
  transition: all 0.2s ease;
}

.teacher-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--neuro-shadow-floating);
}

.teacher-avatar {
  width: 48px;
  height: 48px;
  background: var(--neuro-bg-base);
  box-shadow: var(--neuro-shadow-inset);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neuro-accent-primary);
}

.teacher-avatar .material-symbols-outlined {
  font-size: 28px;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--neuro-text-primary);
  margin: 0 0 4px 0;
}

.teacher-role {
  font-size: 14px;
  color: var(--neuro-text-secondary);
  margin: 0;
}

.teacher-email {
  font-size: 12px;
  color: var(--neuro-text-tertiary);
  margin: 2px 0 0 0;
  font-family: monospace;
}

.teacher-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--neuro-bg-base);
  border: none;
  border-radius: var(--neuro-radius-small);
  box-shadow: var(--neuro-shadow-flat);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--neuro-text-secondary);
}

.action-btn:hover {
  box-shadow: var(--neuro-shadow-raised);
  color: var(--neuro-text-primary);
}

.action-btn:active {
  box-shadow: var(--neuro-shadow-inset);
}

.delete-btn:hover {
  color: #ef4444;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 32px;
  flex: 1;
  min-height: 400px;
  background: var(--neuro-bg-base);
  border-radius: var(--neuro-radius-large);
  box-shadow: var(--neuro-shadow-flat);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: var(--neuro-text-tertiary);
}

.empty-icon .material-symbols-outlined {
  font-size: 80px;
}

.empty-title {
  font-size: 24px;
  font-weight: 400;
  color: var(--neuro-text-primary);
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 16px;
  color: var(--neuro-text-secondary);
  margin: 0;
  max-width: 400px;
}

/* Add Teacher Form */
.add-teacher-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 0;
}

/* Outlined Text Fields */
.text-field-outlined {
  position: relative;
  display: flex;
  flex-direction: column;
}

.text-field-input-outlined {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--neuro-text-primary);
  background: transparent;
  border: none;
  outline: none;
  padding: 16px;
  min-height: 56px;
  box-sizing: border-box;
  width: 100%;
  caret-color: var(--neuro-accent-primary);
}

.text-field-label-outlined {
  position: absolute;
  left: 16px;
  top: 16px;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--neuro-text-secondary);
  background: var(--neuro-bg-base);
  padding: 0 4px;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  transform-origin: left top;
  z-index: 1;
}

.text-field-input-outlined:focus + .text-field-label-outlined,
.text-field-input-outlined:not(:placeholder-shown) + .text-field-label-outlined {
  top: 0;
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--neuro-accent-primary);
  transform: translateY(-50%);
}

.text-field-outline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  z-index: 0;
}

.text-field-outline-start {
  width: 12px;
  border: 1px solid var(--neuro-text-tertiary);
  border-right: none;
  border-radius: var(--neuro-radius-small) 0 0 var(--neuro-radius-small);
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-notch {
  flex: 1;
  display: flex;
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-leading {
  width: 12px;
  border-top: 1px solid var(--neuro-text-tertiary);
  border-bottom: 1px solid var(--neuro-text-tertiary);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-trailing {
  flex: 1;
  border-top: 1px solid var(--neuro-text-tertiary);
  border-bottom: 1px solid var(--neuro-text-tertiary);
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-end {
  width: 12px;
  border: 1px solid var(--neuro-text-tertiary);
  border-left: none;
  border-radius: 0 var(--neuro-radius-small) var(--neuro-radius-small) 0;
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

/* Focus States */
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-start,
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-end,
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-trailing {
  border-color: var(--neuro-accent-primary);
  border-width: 2px;
}

.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-leading {
  border-top-color: transparent;
  border-bottom-width: 2px;
  border-bottom-color: var(--neuro-accent-primary);
}

.text-field-input-outlined:not(:placeholder-shown) ~ .text-field-outline .text-field-outline-leading {
  border-top-color: transparent;
}

/* Select Field */
select.text-field-input-outlined {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%236e6e73' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.text-field-label-select {
  top: 0 !important;
  font-size: var(--md-sys-typescale-body-small-size, 12px) !important;
  font-weight: var(--md-sys-typescale-body-small-weight, 400) !important;
  line-height: var(--md-sys-typescale-body-small-line-height, 16px) !important;
  color: var(--neuro-text-secondary) !important;
  transform: translateY(-50%) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .teachers-page {
    padding-left: 0;
  }

  .teachers-content {
    padding: 16px;
  }
}
</style>