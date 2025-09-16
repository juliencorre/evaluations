<template>
  <div class="students-page">
    <header class="page-header">
      <h1 class="page-title">
        <span class="material-symbols-outlined">groups</span>
        Gestion des Élèves
      </h1>
    </header>

    <div class="page-content">
      <div class="search-bar">
        <span class="material-symbols-outlined search-icon">search</span>
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Rechercher un élève..."
          class="search-input"
        />
      </div>

      <div class="students-list">
        <div 
          v-for="student in filteredStudents" 
          :key="student.id"
          class="student-item"
        >
          <div class="student-content">
            <div class="student-name-grid">
              <span class="first-name">{{ student.firstName }}</span>
              <span class="last-name">{{ student.lastName }}</span>
            </div>
          </div>
          <div class="student-trailing">
            <button @click="editStudent(student)" class="action-btn edit-action" title="Modifier">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button @click="deleteStudent(student)" class="action-btn delete-action" title="Supprimer">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Material 3 Extended FAB -->
    <button @click="showAddModal = true" class="extended-fab">
      <span class="material-symbols-outlined fab-icon">add</span>
      <span class="fab-label">Ajouter un élève</span>
    </button>

    <!-- Material 3 Dialog - Add/Edit Student -->
    <div v-if="showAddModal || showEditModal" class="dialog-scrim" @click="closeModal">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <span class="dialog-icon">
            <span class="material-symbols-outlined">{{ showEditModal ? 'edit' : 'person_add' }}</span>
          </span>
          <h2 class="dialog-headline">{{ showEditModal ? 'Modifier l\'élève' : 'Ajouter un élève' }}</h2>
        </div>
        
        <div class="dialog-content">
          <p class="dialog-supporting-text">
            {{ showEditModal ? 'Modifiez les informations de l\'élève.' : 'Saisissez les informations du nouvel élève.' }}
          </p>
          
          <form @submit.prevent="saveStudent" class="dialog-form">
            <div class="text-field">
              <label for="firstName" class="text-field-label">Prénom *</label>
              <input 
                id="firstName"
                v-model="currentStudent.firstName" 
                type="text" 
                required
                class="text-field-input"
                placeholder="Prénom de l'élève"
              />
              <div class="text-field-underline"></div>
            </div>
            
            <div class="text-field">
              <label for="lastName" class="text-field-label">Nom *</label>
              <input 
                id="lastName"
                v-model="currentStudent.lastName" 
                type="text" 
                required
                class="text-field-input"
                placeholder="Nom de famille"
              />
              <div class="text-field-underline"></div>
            </div>
          </form>
        </div>
        
        <div class="dialog-actions">
          <button type="button" @click="closeModal" class="text-button">
            Annuler
          </button>
          <button type="submit" @click="saveStudent" class="filled-button">
            {{ showEditModal ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>

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
            Êtes-vous sûr de vouloir supprimer <strong>{{ studentToDelete?.firstName }} {{ studentToDelete?.lastName }}</strong> ?
          </p>
          <p class="dialog-supporting-text warning-text">
            Cette action est irréversible et supprimera toutes les données associées à cet élève.
          </p>
        </div>
        
        <div class="dialog-actions">
          <button type="button" @click="closeModal" class="text-button">
            Annuler
          </button>
          <button type="button" @click="confirmDelete" class="filled-button destructive">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Student } from '../types/evaluation'
import { useStudentsStore } from '../stores/studentsStore'

// Store global des élèves
const { allStudents, addStudent, updateStudent, deleteStudent: deleteStudentFromStore } = useStudentsStore()

// État réactif local
const searchTerm = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentStudent = ref<Student>({ id: '', firstName: '', lastName: '', displayName: '' })
const studentToDelete = ref<Student | null>(null)

// Élèves filtrés par la recherche
const filteredStudents = computed(() => {
  if (!searchTerm.value) {
    return allStudents.value
  }
  
  const search = searchTerm.value.toLowerCase()
  return allStudents.value.filter(student => 
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

const saveStudent = () => {
  if (showEditModal.value) {
    // Modifier un élève existant
    updateStudent(currentStudent.value.id, {
      firstName: currentStudent.value.firstName,
      lastName: currentStudent.value.lastName
    })
  } else {
    // Ajouter un nouvel élève
    addStudent({
      firstName: currentStudent.value.firstName,
      lastName: currentStudent.value.lastName
    })
  }
  
  closeModal()
}

const confirmDelete = () => {
  if (studentToDelete.value) {
    deleteStudentFromStore(studentToDelete.value.id)
  }
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  currentStudent.value = { id: '', firstName: '', lastName: '', displayName: '' }
  studentToDelete.value = null
}

// Plus besoin d'initialisation : le store contient déjà les données
</script>

<style scoped>
.students-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title .material-symbols-outlined {
  color: #2563eb;
  font-size: 2rem;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-bar {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Material 3 List Specifications - Sans conteneur */
.students-list {
  background: transparent;
}

/* Material 3 List Item - 56dp height, pas de bordures */
.student-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  min-height: 56px;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
  cursor: pointer;
  position: relative;
  border-radius: 0;
}

/* Material 3 State Layer */
.student-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
  border-radius: 0;
}

.student-item:hover::before {
  background: rgba(103, 80, 164, 0.08);
}

.student-item:focus::before {
  background: rgba(103, 80, 164, 0.12);
}

.student-item:active::before {
  background: rgba(103, 80, 164, 0.12);
}

.student-item:focus {
  outline: none;
}

/* Content area - now takes full width */
.student-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

/* Name grid layout */
.student-name-grid {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  align-items: baseline;
  width: 100%;
}

.first-name, .last-name {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface, #1c1b1f);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.first-name {
  text-align: left;
}

.last-name {
  text-align: left;
  font-weight: 500;
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
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Basic Dialog - 280dp minimum width, 560dp maximum */
.dialog-container {
  background: #FFFFFF;
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
  color: #625b71;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-icon {
  color: #ba1a1a;
}

.dialog-headline {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: #49454f;
  margin-bottom: 8px;
  transition: color 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.text-field-input {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #ffffff;
  background: #6750a4;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.filled-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
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
  background: #ba1a1a;
  color: #ffffff;
}

.filled-button.destructive::before {
  background: #ffffff;
}

/* Ensure FAB container doesn't interfere with positioning */
.students-page {
  position: relative;
}

/* Material 3 Extended FAB Specifications */
.extended-fab {
  position: fixed !important;
  bottom: 24px;
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
  0% { transform: scale(1); }
  50% { transform: scale(0.96); }
  100% { transform: scale(1); }
}

/* Responsive */
@media (max-width: 768px) {
  .students-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  /* Mobile: Maintain Material 3 list specifications */
  .student-item {
    padding: 8px 16px;
    min-height: 56px; /* Keep Material 3 standard height */
  }
  
  .student-name-grid {
    grid-template-columns: 100px 1fr;
    gap: 6px;
  }
  
  .first-name, .last-name {
    font-size: var(--md-sys-typescale-body-large-size, 16px);
  }
  
  .student-trailing {
    margin-left: 16px; /* Keep standard margin */
  }
  
  .action-btn {
    width: 40px; /* Keep standard icon button size */
    height: 40px;
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
    bottom: 16px;
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
    bottom: 12px;
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
</style>