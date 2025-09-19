<template>
  <div class="students-page">
    <!-- Search App Bar -->
    <SearchAppBar
      v-model:search-value="searchTerm"
      placeholder="Rechercher un élève..."
      aria-label="Rechercher un élève"
      logo-icon="school"
      :is-scrolled="isScrolled"
      @clear-search="searchTerm = ''"
      @logo-click="$router.push('/evaluations')"
      @help="handleHelp"
      @logout="handleLogout"
    />

    <main class="students-content" role="main">
      <h1 class="visually-hidden">Gestion des élèves</h1>

      <!-- Students List -->
      <StudentsList
        :students="filteredStudents"
        @edit-student="handleEditStudent"
        @delete-student="handleDeleteStudent"
      />
    </main>

    <!-- Extended FAB -->
    <ExtendedFAB
      v-if="!modalsRef?.showStudentDialog && !modalsRef?.showDeleteDialog"
      icon="add"
      :visible="true"
      aria-label="Ajouter un élève"
      @click="handleAddStudent"
    />

    <!-- Student Modals -->
    <StudentModals
      ref="modalsRef"
      :is-saving="isSaving"
      :is-deleting="isDeleting"
      @save-student="handleSaveStudent"
      @delete-student="handleDeleteStudentConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchAppBar from '@/components/common/SearchAppBar.vue'
import ExtendedFAB from '@/components/common/ExtendedFAB.vue'
import StudentsList from '@/components/students/StudentsList.vue'
import StudentModals from '@/components/students/StudentModals.vue'
import type { Student } from '../types/evaluation'
import { useStudentsStore } from '../stores/studentsStore'

// Router
const $router = useRouter()

// Store
const studentsStore = useStudentsStore()

// Refs
const modalsRef = ref()

// State
const searchTerm = ref('')
const isScrolled = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

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

// Computed
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

// Event handlers
const handleHelp = () => {
  console.log('Help requested')
  window.alert('Aide - Fonctionnalité à venir')
}

const handleLogout = () => {
  console.log('Logout requested')
  window.alert('Déconnexion - Fonctionnalité à venir')
}

const handleAddStudent = () => {
  modalsRef.value?.openAddDialog()
}

const handleEditStudent = (student: Student) => {
  modalsRef.value?.openEditDialog(student)
}

const handleDeleteStudent = (student: Student) => {
  modalsRef.value?.openDeleteDialog(student)
}

const handleSaveStudent = async (student: Student) => {
  if (isSaving.value) return

  isSaving.value = true
  console.log('🚀 Début sauvegarde élève')

  try {
    if (student.id) {
      // Modifier un élève existant
      console.log('📝 Modification élève:', student.id)
      await studentsStore.updateStudent(student.id, {
        firstName: student.firstName,
        lastName: student.lastName
      })
    } else {
      // Ajouter un nouvel élève
      console.log('➕ Ajout élève:', student.firstName, student.lastName)
      const result = await studentsStore.addStudent({
        firstName: student.firstName,
        lastName: student.lastName
      })
      console.log('✅ Élève ajouté:', result)
    }

    console.log('🎯 Fermeture du dialog')
    modalsRef.value?.closeDialogs()
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error)
  } finally {
    isSaving.value = false
    console.log('🏁 Fin sauvegarde élève')
  }
}

const handleDeleteStudentConfirmed = async (student: Student) => {
  if (isDeleting.value) return

  isDeleting.value = true

  try {
    await studentsStore.deleteStudent(student.id)
    modalsRef.value?.closeDialogs()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    isDeleting.value = false
  }
}

</script>

<style scoped>
.students-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding-top: 64px;
}

.students-content {
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

@media (max-width: 900px) {
  .students-content {
    padding: 24px 16px 80px;
  }
}

@media (max-width: 480px) {
  .students-content {
    padding: 16px 16px 80px;
  }
}
</style>
