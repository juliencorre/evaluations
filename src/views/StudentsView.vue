<template>
  <div class="students-page">
    <!-- Search App Bar -->
    <SearchAppBar
      v-model:search-value="searchTerm"
      placeholder="Rechercher un élève..."
      aria-label="Rechercher un élève"
      :is-scrolled="isScrolled"
      :show-back-button="true"
      @clear-search="searchTerm = ''"
      @back="$router.push('/welcome')"
      @logout="handleLogout"
    />
    <main class="students-content" role="main">
      <h1 class="visually-hidden">Gestion des élèves</h1>

      <!-- No Students State -->
      <div v-if="studentsStore.allStudents.value.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
          </svg>
        </div>
        <h2 class="empty-title">Aucun élève</h2>
        <p class="empty-description">
          Commencez par ajouter votre premier élève avec le bouton ci-dessous.
        </p>
      </div>

      <!-- Students List with Filter Banner -->
      <div v-else class="students-with-filters">
        <StudentFilterBanner
          v-model:gender-filter="genderFilter"
          v-model:class-filter="classFilter"
          v-model:age-range-filter="ageRangeFilter"
          :classes="classStore.classes"
          @clear-filters="clearFilters"
        />
        <StudentsList
          :students="filteredStudents"
          @edit-student="handleEditStudent"
          @delete-student="handleDeleteStudent"
        />
      </div>
    </main>

    <!-- Menu FAB -->
    <MenuFAB
      v-if="!modalsRef?.showStudentDialog && !modalsRef?.showDeleteDialog"
      :menu-items="fabMenuItems"
      @menu-item-click="handleMenuItemClick"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import SearchAppBar from '@/components/common/SearchAppBar.vue'
import MenuFAB from '@/components/common/MenuFAB.vue'
import StudentsList from '@/components/students/StudentsList.vue'
import StudentModals from '@/components/students/StudentModals.vue'
import StudentFilterBanner from '@/components/students/StudentFilterBanner.vue'
import type { Student } from '../types/evaluation'
import { useStudentsStore } from '../stores/studentsStore'
import { useClassStore } from '@/stores/classStore'
import { useSchoolYearStore } from '@/stores/schoolYearStore'
import { useLogout } from '@/composables/useLogout'

// Stores
const studentsStore = useStudentsStore()
const classStore = useClassStore()
const schoolYearStore = useSchoolYearStore()

// Refs
const modalsRef = ref()

// State
const searchTerm = ref('')
const isScrolled = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const genderFilter = ref('')
const classFilter = ref('')
const ageRangeFilter = ref('')
const studentsInSelectedClass = ref<string[]>([]) // IDs of students in selected class

// Scroll handling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})


// Initialize students on mount
onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  try {
    // Load school years, classes, and students
    await schoolYearStore.ensureLoaded()

    if (classStore.classes.length === 0) {
      await classStore.loadClasses()
    }

    // Load students from Supabase if not already loaded
    if (studentsStore.allStudents.value.length === 0) {
      await studentsStore.refreshFromSupabase()
    }
  } catch (error) {
    console.error('Error loading students data:', error)
  }
})

// Helper function to calculate age from birthDate
const calculateAge = (birthDate: string | null | undefined): number => {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Computed
const filteredStudents = computed(() => {
  let students = studentsStore.allStudents.value

  // Filter by selected class if any
  if (classStore.selectedClassId) {
    // TODO: This would ideally filter students enrolled in the selected class
    // For now, we show all students until the class-specific filtering is implemented
    students = studentsStore.activeStudents.value
  }

  // Apply search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    students = students.filter(
      (student) =>
        student.firstName.toLowerCase().includes(search) ||
        student.lastName.toLowerCase().includes(search) ||
        student.id.toLowerCase().includes(search)
    )
  }

  // Apply gender filter
  if (genderFilter.value) {
    students = students.filter((student) => student.gender === genderFilter.value)
  }

  // Apply class filter
  if (classFilter.value && studentsInSelectedClass.value.length > 0) {
    students = students.filter((student) =>
      studentsInSelectedClass.value.includes(student.id)
    )
  }

  // Apply age range filter
  if (ageRangeFilter.value) {
    students = students.filter((student) => {
      const age = calculateAge(student.birthDate)
      if (!age) return false

      switch (ageRangeFilter.value) {
        case '6-8':
          return age >= 6 && age <= 8
        case '9-11':
          return age >= 9 && age <= 11
        case '12-14':
          return age >= 12 && age <= 14
        case '15+':
          return age >= 15
        default:
          return true
      }
    })
  }

  return students
})


// const selectedClass = computed(() => {
//   return classStore.selectedClass
// })

// Event handlers

const { logout } = useLogout()

const handleLogout = async () => {
  await logout()
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

// FAB Menu configuration
const fabMenuItems = [
  {
    key: 'new-student',
    icon: 'person_add',
    label: 'Nouvel élève',
    ariaLabel: 'Ajouter un nouvel élève',
    type: 'primary'
  }
]

// Handle menu item clicks
const handleMenuItemClick = (item: { key: string }) => {
  if (item.key === 'new-student') {
    handleAddStudent()
  }
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
        lastName: student.lastName,
        gender: student.gender,
        birthDate: student.birthDate
      })
    } else {
      // Ajouter un nouvel élève
      console.log('➕ Ajout élève:', student.firstName, student.lastName)
      const newStudent = await studentsStore.addStudent({
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        birthDate: student.birthDate
      })

      console.log('✅ Élève ajouté:', newStudent)
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
    // Delete the student directly
    await studentsStore.deleteStudent(student.id)
    modalsRef.value?.closeDialogs()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    isDeleting.value = false
  }
}

const clearFilters = () => {
  genderFilter.value = ''
  classFilter.value = ''
  ageRangeFilter.value = ''
  studentsInSelectedClass.value = []
}

// Watch for class filter changes and load students for selected class
watch(classFilter, async (newClassId) => {
  if (newClassId) {
    try {
      const students = await studentsStore.getStudentsForClass(newClassId)
      studentsInSelectedClass.value = students.map(s => s.id)
      console.log(`📋 Loaded ${studentsInSelectedClass.value.length} students for class ${newClassId}`)
    } catch (error) {
      console.error('Error loading students for class:', error)
      studentsInSelectedClass.value = []
    }
  } else {
    studentsInSelectedClass.value = []
  }
})

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

.students-with-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

@media (max-width: 768px) {
  .students-content {
    padding: 24px 0 80px;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .students-content {
    padding: 16px 0 80px;
  }
}
</style>


