<template>
  <div class="students-page">
    <!-- Search App Bar -->
    <header class="search-app-bar" :class="{ 'search-app-bar--elevated': isScrolled }">
      <!-- Leading Logo -->
      <div class="search-app-bar__leading">
        <button class="app-logo-button" aria-label="Accueil" @click="$router.push('/')">
          <span class="material-symbols-outlined app-logo-icon">school</span>
        </button>
      </div>

      <!-- Center Search Field -->
      <div class="search-app-bar__center">
        <div class="search-field">
          <span class="material-symbols-outlined search-field__icon" aria-hidden="true">search</span>
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Rechercher un élève..."
            class="search-field__input"
            aria-label="Rechercher un élève"
          />
          <button
            v-if="searchTerm"
            class="search-field__clear"
            aria-label="Effacer la recherche"
            @click="searchTerm = ''"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <!-- Trailing Actions -->
      <div class="search-app-bar__trailing">
        <button class="icon-button user-menu-button" aria-label="Menu utilisateur">
          <span class="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>

    <main class="students-content" role="main">
      <h1 class="visually-hidden">Gestion des élèves</h1>

      <div v-if="filteredStudents.length > 0" class="students-list" role="list">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-item"
          role="listitem"
        >
          <div class="student-content">
            <div class="student-avatar" aria-hidden="true">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div class="student-details">
              <div class="student-name">
                <span class="first-name">{{ student.firstName }}</span>
                <span class="last-name">{{ student.lastName }}</span>
              </div>
            </div>
          </div>
          <div class="student-trailing">
            <button class="action-btn edit-action" title="Modifier" @click="editStudent(student)">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button
              class="action-btn delete-action"
              title="Supprimer"
              @click="deleteStudent(student)"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
      <p v-else class="empty-state">Aucun élève ne correspond à votre recherche.</p>
    </main>

    <!-- Material 3 Extended FAB -->
    <button
      v-if="!showAddModal && !showEditModal"
      class="extended-fab"
      @click="showAddModal = true"
    >
      <span class="material-symbols-outlined fab-icon">add</span>
      <span class="fab-label">Ajouter un élève</span>
    </button>

    <!-- Full-screen Dialog pour les élèves -->
    <FullscreenDialog
      :model-value="showAddModal || showEditModal"
      :title="showEditModal ? 'Modifier l\'élève' : 'Nouvel élève'"
      :save-button-text="showEditModal ? 'Modifier' : 'Ajouter'"
      :saving-text="showEditModal ? 'Modification...' : 'Ajout...'"
      :save-disabled="isSaving || !currentStudent.firstName.trim() || !currentStudent.lastName.trim()"
      :is-saving="isSaving"
      @close="closeModal"
      @save="saveStudent"
    >
      <ContentSection
        title="Informations personnelles"
        :description="showEditModal
          ? 'Modifiez les informations de l\'élève.'
          : 'Saisissez les informations du nouvel élève à ajouter à la classe.'"
      >
        <div class="form-fields">
          <div class="text-field-outlined">
            <input
              id="firstName"
              v-model="currentStudent.firstName"
              type="text"
              required
              class="text-field-input-outlined"
              placeholder=" "
              maxlength="50"
            />
            <label for="firstName" class="text-field-label-outlined">Prénom *</label>
            <div class="text-field-outline">
              <div class="text-field-outline-start"></div>
              <div class="text-field-outline-notch">
                <div class="text-field-outline-leading"></div>
                <div class="text-field-outline-trailing"></div>
              </div>
              <div class="text-field-outline-end"></div>
            </div>
            <div class="field-helper-text">Entrez le prénom de l'élève</div>
          </div>

          <div class="text-field-outlined">
            <input
              id="lastName"
              v-model="currentStudent.lastName"
              type="text"
              required
              class="text-field-input-outlined"
              placeholder=" "
              maxlength="50"
            />
            <label for="lastName" class="text-field-label-outlined">Nom de famille *</label>
            <div class="text-field-outline">
              <div class="text-field-outline-start"></div>
              <div class="text-field-outline-notch">
                <div class="text-field-outline-leading"></div>
                <div class="text-field-outline-trailing"></div>
              </div>
              <div class="text-field-outline-end"></div>
            </div>
            <div class="field-helper-text">Entrez le nom de famille de l'élève</div>
          </div>
        </div>
      </ContentSection>
    </FullscreenDialog>

    <!-- Material 3 Dialog - Delete Confirmation -->
    <div v-if="showDeleteModal" class="dialog-scrim" @click="closeModal">
      <div class="dialog-container alert-dialog" @click.stop>
        <div class="dialog-header">
          <span class="dialog-icon alert-icon">
            <span class="material-symbols-outlined">warning</span>
          </span>
          <h2 class="dialog-headline">Supprimer l'élève</h2>
        </div>

        <div class="dialog-content">
          <p class="dialog-supporting-text">
            Êtes-vous sûr de vouloir supprimer
            <strong>{{ studentToDelete?.firstName }} {{ studentToDelete?.lastName }}</strong> ?
          </p>
          <p class="dialog-supporting-text warning-text">
            Cette action est irréversible et supprimera toutes les données associées à cet élève.
          </p>
        </div>

        <div class="dialog-actions">
          <button type="button" class="text-button" :disabled="isDeleting" @click="closeModal">
            Annuler
          </button>
          <button
            type="button"
            class="filled-button destructive"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            <span v-if="!isDeleting">Supprimer</span>
            <span v-else>Suppression...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import type { Student } from '../types/evaluation'
import { useStudentsStore } from '../stores/studentsStore'

// Lazy load FullscreenDialog as it's only shown on user action
const FullscreenDialog = defineAsyncComponent(() => import('@/components/FullscreenDialog.vue'))
const ContentSection = defineAsyncComponent(() => import('@/components/ContentSection.vue'))

// Import router for navigation
import { useRouter } from 'vue-router'

// Get router instance
const $router = useRouter()

// Utiliser directement le store réactif global
const studentsStore = useStudentsStore()

// Scroll state for app bar elevation
const isScrolled = ref(false)

// Handle scroll events
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

// Set up scroll listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Check initial scroll position
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// État réactif local
const searchTerm = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentStudent = ref<Student>({ id: '', firstName: '', lastName: '', displayName: '' })
const studentToDelete = ref<Student | null>(null)
const isSaving = ref(false)
const isDeleting = ref(false)

// Élèves filtrés par la recherche
const filteredStudents = computed(() => {
  if (!searchTerm.value) {
    return studentsStore.allStudents.value
  }

  const search = searchTerm.value.toLowerCase()
  return studentsStore.allStudents.value.filter(
    (student) =>
      student.firstName.toLowerCase().includes(search) ||
      student.lastName.toLowerCase().includes(search) ||
      student.id.toLowerCase().includes(search)
  )
})

const editStudent = (student: Student) => {
  currentStudent.value = { ...student }
  showEditModal.value = true
}

const deleteStudent = (student: Student) => {
  studentToDelete.value = student
  showDeleteModal.value = true
}

const saveStudent = async () => {
  if (isSaving.value) return // Éviter la double soumission

  isSaving.value = true
  console.log('🚀 Début sauvegarde élève')

  try {
    if (showEditModal.value) {
      // Modifier un élève existant
      console.log('📝 Modification élève:', currentStudent.value.id)
      await studentsStore.updateStudent(currentStudent.value.id, {
        firstName: currentStudent.value.firstName,
        lastName: currentStudent.value.lastName
      })
    } else {
      // Ajouter un nouvel élève
      console.log('➕ Ajout élève:', currentStudent.value.firstName, currentStudent.value.lastName)
      const result = await studentsStore.addStudent({
        firstName: currentStudent.value.firstName,
        lastName: currentStudent.value.lastName
      })
      console.log('✅ Élève ajouté:', result)
    }

    console.log('🎯 Fermeture du dialog')
    closeModal()
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error)
  } finally {
    isSaving.value = false
    console.log('🏁 Fin sauvegarde élève')
  }
}

const confirmDelete = async () => {
  if (isDeleting.value || !studentToDelete.value) return

  isDeleting.value = true

  try {
    await studentsStore.deleteStudent(studentToDelete.value.id)
    closeModal()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    isDeleting.value = false
  }
}

const closeModal = () => {
  console.log('🔒 Fermeture modal - États avant:', {
    addModal: showAddModal.value,
    editModal: showEditModal.value,
    deleteModal: showDeleteModal.value,
    saving: isSaving.value
  })

  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  currentStudent.value = { id: '', firstName: '', lastName: '', displayName: '' }
  studentToDelete.value = null
  isSaving.value = false
  isDeleting.value = false

  console.log('✅ Modal fermée - États après:', {
    addModal: showAddModal.value,
    editModal: showEditModal.value,
    deleteModal: showDeleteModal.value,
    saving: isSaving.value
  })
}

</script>

<style scoped>
.students-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  /* Add top padding to account for fixed app bar */
  padding-top: 64px;
}

.students-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 32px;
  display: flex;
  flex-direction: column;
}


/* Material 3 Search App Bar */
.search-app-bar {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 8px 4px;
  /* Initially same color as background */
  background: transparent;
  color: var(--md-sys-color-on-surface);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  /* No initial shadow/border */
}

/* Elevated state on scroll - contrasting color and elevation */
.search-app-bar--elevated {
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level2,
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3)
  );
}

/* Leading section with logo */
.search-app-bar__leading {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.app-logo-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--md-sys-color-primary, #6750a4);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
}

.app-logo-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--md-sys-color-primary);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.app-logo-button:hover::before {
  opacity: 0.08;
}

.app-logo-button:focus {
  outline: none;
}

.app-logo-button:focus::before {
  opacity: 0.12;
}

.app-logo-icon {
  font-size: 28px;
  z-index: 1;
}

/* Center search field */
.search-app-bar__center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 560px;
  height: 48px;
  padding: 0 16px;
  background: var(--md-sys-color-surface-container-highest, #e6e0e9);
  border-radius: 28px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.search-field:focus-within {
  background: var(--md-sys-color-surface-container-high, #ece6f0);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
}

.search-field__icon {
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-size: 24px;
  flex-shrink: 0;
}

.search-field__input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1c1b1f);
  outline: none;
}

.search-field__input::placeholder {
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

.search-field__input::-webkit-search-cancel-button {
  display: none;
}

.search-field__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  flex-shrink: 0;
}

.search-field__clear:hover {
  background: rgba(0, 0, 0, 0.08);
}

.search-field__clear .material-symbols-outlined {
  font-size: 18px;
}

/* Trailing section with actions */
.search-app-bar__trailing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--md-sys-color-on-surface-variant);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.icon-button:hover::before {
  opacity: 0.08;
}

.icon-button:focus {
  outline: none;
}

.icon-button:focus::before {
  opacity: 0.12;
}

.icon-button .material-symbols-outlined {
  font-size: 24px;
  z-index: 1;
}

/* User menu button styling */
.user-menu-button {
  color: var(--md-sys-color-primary, #6750a4);
}

.user-menu-button .material-symbols-outlined {
  font-size: 32px;
}

/* Large screens - show all trailing icons */
@media (min-width: 1280px) {
  .search-app-bar__trailing {
    gap: 8px;
  }
}

/* Medium screens - limit trailing icons */
@media (max-width: 1279px) and (min-width: 768px) {
  .search-app-bar__trailing .icon-button:nth-child(n+3) {
    display: none;
  }
}

/* Small screens - responsive layout */
@media (max-width: 767px) {
  .search-app-bar {
    padding: 8px 0;
  }

  .search-app-bar__leading {
    padding: 0 8px;
  }

  .search-app-bar__center {
    padding: 0 8px;
  }

  .search-app-bar__trailing {
    padding: 0 8px;
  }

  .search-app-bar__trailing .icon-button:not(:first-child) {
    display: none;
  }

  .app-logo-button,
  .icon-button {
    width: 40px;
    height: 40px;
  }

  .app-logo-icon {
    font-size: 24px;
  }

  .icon-button .material-symbols-outlined {
    font-size: 20px;
  }

  .search-field {
    height: 40px;
    padding: 0 12px;
  }

  .search-field__icon {
    font-size: 20px;
  }

  .search-field__input {
    font-size: 14px;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .search-app-bar__center {
    padding: 0 4px;
  }

  .search-field {
    padding: 0 8px;
    gap: 8px;
  }
}

.students-list {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.student-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  min-height: 76px;
  border-radius: 20px;
  background: var(--md-sys-color-surface, #ffffff);
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  transition:
    background-color 0.2s cubic-bezier(0.2, 0, 0, 1),
    border-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  overflow: hidden;
}

.student-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.student-item:hover::before {
  background: rgba(103, 80, 164, 0.08);
}

.student-item:focus-within::before {
  background: rgba(103, 80, 164, 0.12);
}

.student-item:hover,
.student-item:focus-within {
  border-color: rgba(103, 80, 164, 0.45);
}

.student-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.student-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--md-sys-color-primary-container, #eaddff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-avatar .material-symbols-outlined {
  color: var(--md-sys-color-on-primary-container, #21005d);
  font-size: 24px;
}

.student-details {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.student-name {
  display: flex;
  gap: 8px;
  align-items: baseline;
  min-width: 0;
}

.student-name .first-name,
.student-name .last-name {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-name .last-name {
  font-weight: var(--md-sys-typescale-body-large-weight-prominent, 500);
}

.empty-state {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  text-align: center;
  margin-top: 24px;
}


@media (max-width: 900px) {
  .students-content {
    padding: 24px 16px 32px;
  }

  .students-list {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}


@media (max-width: 480px) {
  .students-content {
    padding: 16px 16px 32px;
  }

  .student-item {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .student-content {
    width: 100%;
  }

  .student-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .student-preview {
    padding: 12px 14px;
  }

  .student-avatar {
    width: 36px;
    height: 36px;
  }

  .student-avatar .material-symbols-outlined {
    font-size: 20px;
  }

  .student-trailing {
    margin-left: 0;
    align-self: flex-end;
  }
}

/* Material 3 Icons */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

/* Trailing element - 24dp buttons with 16dp margin */
.student-trailing {
  display: flex;
  gap: 8px;
  margin-left: 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* Material 3 Icon Button - Standard (40x40dp) */
.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  background: transparent;
  color: rgba(28, 27, 31, 0.6);
  position: relative;
}

.action-btn .material-symbols-outlined {
  font-size: 20px;
}

/* State layers for icon buttons */
.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border-radius: 20px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.action-btn:hover::before {
  background: rgba(103, 80, 164, 0.08);
}

.action-btn:focus::before {
  background: rgba(103, 80, 164, 0.12);
}

.action-btn:active::before {
  background: rgba(103, 80, 164, 0.12);
}

.action-btn:focus {
  outline: none;
}

.delete-action:hover {
  color: #ba1a1a;
}

.delete-action:hover::before {
  background: rgba(186, 26, 26, 0.08);
}

.delete-action:focus {
  color: #ba1a1a;
}

.delete-action:focus::before {
  background: rgba(186, 26, 26, 0.12);
}

/* Material 3 Dialog Specifications */
.dialog-scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: scrimFadeIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes scrimFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Basic Dialog - 280dp minimum width, 560dp maximum */
.dialog-container {
  background: var(--md-sys-color-surface);
  border-radius: 28px;
  box-shadow:
    0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  width: 100%;
  min-width: 280px;
  max-width: 560px;
  max-height: calc(100vh - 32px);
  overflow: hidden;
  animation: dialogSlideIn 0.2s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Alert Dialog variant - smaller max width */
.alert-dialog {
  max-width: 312px;
}

/* Dialog Header */
.dialog-header {
  padding: 24px 24px 16px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.dialog-icon {
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-on-surface-variant);
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-icon {
  color: var(--md-sys-color-error);
}

.dialog-headline {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #1c1b1f;
  margin: 0;
  flex: 1;
}

/* Dialog Content */
.dialog-content {
  padding: 0 24px 24px 24px;
}

.dialog-supporting-text {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #49454f;
  margin: 0 0 16px 0;
}

.dialog-supporting-text:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #ba1a1a;
}

/* Dialog Form */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

/* Material 3 Text Fields */
.text-field {
  position: relative;
  display: flex;
  flex-direction: column;
}

.text-field-label {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: #49454f;
  margin-bottom: 8px;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
  z-index: 1;
  position: relative;
}

.text-field-input {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #1c1b1f;
  background: transparent;
  border: none;
  outline: none;
  padding: 8px 0 8px 0;
  width: 100%;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-input::placeholder {
  color: #49454f;
  opacity: 0.6;
}

.text-field-underline {
  height: 1px;
  background: #79747e;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
}

.text-field-underline::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  right: 50%;
  height: 2px;
  background: #6750a4;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-input:focus + .text-field-underline::after {
  left: 0;
  right: 0;
}

.text-field-input:focus ~ .text-field-label,
.text-field:focus-within .text-field-label {
  color: #6750a4;
}

/* Dialog Actions */
.dialog-actions {
  padding: 16px 24px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

/* Material 3 Buttons */
.text-button {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #6750a4;
  background: transparent;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

.text-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #6750a4;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-button:hover::before {
  opacity: 0.08;
}

.text-button:focus::before {
  opacity: 0.12;
}

.text-button:active::before {
  opacity: 0.12;
}

.filled-button {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--md-sys-color-on-primary);
  background: var(--md-sys-color-primary);
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0px 1px 2px 0px rgba(0, 0, 0, 0.3),
    0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.filled-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-primary);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.filled-button:hover::before {
  opacity: 0.08;
}

.filled-button:focus::before {
  opacity: 0.12;
}

.filled-button:active::before {
  opacity: 0.12;
}

.filled-button.destructive {
  background: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
}

.filled-button.destructive::before {
  background: var(--md-sys-color-on-error);
}

/* Styles pour les boutons disabled */
.text-button:disabled,
.filled-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.text-button:disabled::before,
.filled-button:disabled::before {
  display: none;
}

/* Ensure FAB container doesn't interfere with positioning */
.students-page {
  position: relative;
}

/* Material 3 Extended FAB Specifications */
.extended-fab {
  position: fixed !important;
  bottom: 104px; /* 64px menu height + 40px margin */
  right: 24px;
  z-index: 1001;
  pointer-events: auto;

  /* Extended FAB Dimensions */
  height: 56px;
  min-width: 80px;
  max-width: none;
  padding: 0 16px;

  /* Material 3 Extended FAB Surface */
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  border: none;
  border-radius: 16px;

  /* Elevation Level 3 */
  box-shadow:
    0px 1px 3px 0px rgba(0, 0, 0, 0.3),
    0px 4px 8px 3px rgba(0, 0, 0, 0.15);

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  /* Typography - Label Large */
  font-family: var(--md-sys-typescale-label-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-label-large-size, 14px);
  font-weight: var(--md-sys-typescale-label-large-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 20px);
  letter-spacing: 0.1px;

  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
}

/* Extended FAB Icon */
.fab-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

/* Extended FAB Label */
.fab-label {
  white-space: nowrap;
  flex-shrink: 0;
}

/* Extended FAB State Layer */
.extended-fab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--md-sys-color-on-primary-container, #21005d);
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
  border-radius: inherit;
}

.extended-fab:hover {
  box-shadow:
    0px 2px 3px 0px rgba(0, 0, 0, 0.3),
    0px 6px 10px 4px rgba(0, 0, 0, 0.15);
}

.extended-fab:hover::before {
  opacity: 0.08;
}

.extended-fab:focus {
  outline: none;
}

.extended-fab:focus::before {
  opacity: 0.12;
}

.extended-fab:active {
  transform: scale(0.96);
  transition: transform 0.1s ease;
}

.extended-fab:active::before {
  opacity: 0.12;
}

/* Extended FAB Pressed Animation */
.extended-fab:active {
  animation: fabPress 0.1s ease;
}

@keyframes fabPress {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.96);
  }
  100% {
    transform: scale(1);
  }
}

/* Large Screen with Navigation Rail */
@media (min-width: 1440px) {
  .extended-fab {
    position: fixed !important;
    bottom: 24px; /* Back to original position */
    right: 24px;
    z-index: 1001;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .students-page {
    padding: 16px;
  }

  /* Mobile adjustments for the student list visuals */
  .student-item {
    padding: 12px 16px;
    min-height: 64px;
  }

  .student-content {
    gap: 12px;
  }

  .student-trailing {
    margin-left: 12px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .action-btn .material-symbols-outlined {
    font-size: 18px;
  }

  /* Mobile Dialog Adaptations */
  .dialog-scrim {
    padding: 8px;
  }

  .dialog-container {
    min-width: 280px;
    max-width: calc(100vw - 16px);
  }

  .dialog-header {
    padding: 16px 16px 12px 16px;
  }

  .dialog-content {
    padding: 0 16px 16px 16px;
  }

  .dialog-actions {
    padding: 12px 16px 16px 16px;
    flex-direction: column-reverse;
    gap: 8px;
  }

  .text-button,
  .filled-button {
    width: 100%;
    justify-content: center;
  }

  /* Mobile Extended FAB */
  .extended-fab {
    position: fixed !important;
    bottom: 96px; /* 64px menu height + 32px margin for tablet */
    right: 16px;
    height: 56px;
    padding: 0 16px;
    z-index: 1001;
  }

  .fab-label {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  /* Small Mobile Extended FAB */
  .extended-fab {
    position: fixed !important;
    bottom: 92px; /* 64px menu height + 28px margin for mobile */
    right: 12px;
    height: 52px;
    padding: 0 12px;
    min-width: 72px;
    z-index: 1001;
  }

  .fab-icon {
    font-size: 22px;
  }

  .fab-label {
    font-size: 12px;
  }
}

/* Form Fields Layout */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Responsive pour student item */
@media (max-width: 840px) {
  .student-item {
    padding: 16px 16px;
  }

  .student-content {
    gap: 12px;
  }

  .student-avatar {
    width: 40px;
    height: 40px;
  }

  .student-avatar .material-symbols-outlined {
    font-size: 22px;
  }
}

/* Outlined Text Fields - Compatible avec CompetenciesView */
.text-field-outlined {
  position: relative;
  display: flex;
  flex-direction: column;
}

.text-field-input-outlined,
.text-field-textarea-outlined {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1d1b20);
  background: transparent;
  border: none;
  outline: none;
  padding: 16px;
  min-height: 56px;
  box-sizing: border-box;
  width: 100%;
  resize: none;
  caret-color: var(--md-sys-color-primary, #6750a4);
}

.text-field-textarea-outlined {
  min-height: 88px;
  resize: vertical;
}

.text-field-label-outlined {
  position: absolute;
  left: 16px;
  top: 16px;
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  background: var(--md-sys-color-surface);
  padding: 0 4px;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  transform-origin: left top;
  z-index: 1;
}

.text-field-input-outlined:focus + .text-field-label-outlined,
.text-field-textarea-outlined:focus + .text-field-label-outlined,
.text-field-input-outlined:not(:placeholder-shown) + .text-field-label-outlined,
.text-field-textarea-outlined:not(:placeholder-shown) + .text-field-label-outlined {
  top: 0;
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-primary, #6750a4);
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
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-right: none;
  border-radius: var(--md-sys-shape-corner-small, 4px) 0 0 var(--md-sys-shape-corner-small, 4px);
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-notch {
  flex: 1;
  display: flex;
  border-top: 1px solid var(--md-sys-color-outline, #79747e);
  border-bottom: 1px solid var(--md-sys-color-outline, #79747e);
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-leading {
  width: 12px;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-trailing {
  flex: 1;
  border-top: 1px solid var(--md-sys-color-outline, #79747e);
  border-bottom: 1px solid var(--md-sys-color-outline, #79747e);
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-outline-end {
  width: 12px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  border-left: none;
  border-radius: 0 var(--md-sys-shape-corner-small, 4px) var(--md-sys-shape-corner-small, 4px) 0;
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), border-width 0.2s cubic-bezier(0.2, 0, 0, 1);
}

/* Focus States */
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-start,
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-end,
.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-trailing,
.text-field-textarea-outlined:focus ~ .text-field-outline .text-field-outline-start,
.text-field-textarea-outlined:focus ~ .text-field-outline .text-field-outline-end,
.text-field-textarea-outlined:focus ~ .text-field-outline .text-field-outline-trailing {
  border-color: var(--md-sys-color-primary, #6750a4);
  border-width: 2px;
}

.text-field-input-outlined:focus ~ .text-field-outline .text-field-outline-leading,
.text-field-textarea-outlined:focus ~ .text-field-outline .text-field-outline-leading {
  border-top-color: transparent;
  border-bottom-color: transparent;
}

.text-field-input-outlined:not(:placeholder-shown) ~ .text-field-outline .text-field-outline-leading,
.text-field-textarea-outlined:not(:placeholder-shown) ~ .text-field-outline .text-field-outline-leading {
  border-top-color: transparent;
  border-bottom-color: transparent;
}

/* Supporting Text */
.field-helper-text {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 400);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-surface-variant, #49454f);
  margin-top: 4px;
  padding: 0 16px;
}

/* Hover States */
.text-field-outlined:hover:not(:focus-within) .text-field-outline-start,
.text-field-outlined:hover:not(:focus-within) .text-field-outline-end,
.text-field-outlined:hover:not(:focus-within) .text-field-outline-trailing {
  border-color: var(--md-sys-color-on-surface, #1d1b20);
}

</style>
