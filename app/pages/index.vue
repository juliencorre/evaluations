<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Tableau de bord - Evaluations
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Plateforme d'évaluation sécurisée pour l'éducation
      </p>
    </div>

    <!-- Quick Stats -->
    <div v-if="isLoggedIn" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <AcademicCapIcon class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Classes
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.classes || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <NuxtLink to="/classes" class="font-medium text-blue-600 hover:text-blue-500">
              Gérer les classes
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Élèves
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.students || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <NuxtLink to="/students" class="font-medium text-green-600 hover:text-green-500">
              Gérer les élèves
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BookOpenIcon class="h-8 w-8 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Compétences
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.competences || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <NuxtLink to="/competences" class="font-medium text-yellow-600 hover:text-yellow-500">
              Gérer les compétences
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClipboardDocumentListIcon class="h-8 w-8 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Sessions d'évaluation
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.sessions || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <NuxtLink to="/evaluations/sessions" class="font-medium text-yellow-600 hover:text-yellow-500">
              Gérer les sessions
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ChartBarIcon class="h-8 w-8 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Barèmes
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.rubrics || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <NuxtLink to="/evaluations/rubrics" class="font-medium text-purple-600 hover:text-purple-500">
              Gérer les barèmes
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div v-if="isLoggedIn" class="bg-white shadow rounded-lg p-6 mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink
          to="/classes"
          class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div class="flex-shrink-0">
            <AcademicCapIcon class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <span class="absolute inset-0" aria-hidden="true" />
            <p class="text-sm font-medium text-gray-900">Créer une classe</p>
            <p class="text-sm text-gray-500 truncate">Nouvelle classe pour cette année</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/evaluations/sessions"
          class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div class="flex-shrink-0">
            <PlusIcon class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <span class="absolute inset-0" aria-hidden="true" />
            <p class="text-sm font-medium text-gray-900">Créer une évaluation</p>
            <p class="text-sm text-gray-500 truncate">Nouvelle session d'évaluation</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/competences"
          class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div class="flex-shrink-0">
            <BookOpenIcon class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <span class="absolute inset-0" aria-hidden="true" />
            <p class="text-sm font-medium text-gray-900">Gérer les compétences</p>
            <p class="text-sm text-gray-500 truncate">Référentiels de compétences</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Guest Content -->
    <div v-else class="max-w-4xl mx-auto">
      <AuthenticatedContent />
    </div>

    <!-- PWA Install Prompt -->
    <PwaInstallPrompt />
  </div>
</template>

<script setup>
import { 
  AcademicCapIcon,
  UsersIcon, 
  BookOpenIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  UserPlusIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

useHead({
  title: 'Tableau de bord - Evaluations',
  meta: [
    { name: 'description', content: 'Tableau de bord de la plateforme d\'évaluation sécurisée' }
  ]
})

// Get auth state
const { isLoggedIn } = useAuth()

// Stats
const stats = ref({
  classes: 0,
  students: 0,
  competences: 0,
  sessions: 0,
  rubrics: 0
})

// Load dashboard stats for authenticated users
const loadStats = async () => {
  if (!isLoggedIn.value) return
  
  try {
    // Use the classes composable for class data
    const classesStore = useClasses()
    const studentsStore = useStudents()
    
    // Load classes with details and other basic counts
    await Promise.all([
      classesStore.fetchClasses(),
      studentsStore.fetchStudents()
    ])
    
    // Calculate total students across all classes
    const totalStudents = classesStore.classes.value?.reduce((total, classItem) => {
      return total + (classItem.student_count || 0)
    }, 0) || 0
    
    stats.value = {
      classes: classesStore.classes.value?.length || 0,
      students: totalStudents,
      competences: 0, // Will be implemented when competence management is added
      sessions: 0, // Will be implemented when session management is added
      rubrics: 0 // Will be implemented when rubric management is added
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
  }
}

// Load stats on mount
onMounted(() => {
  if (isLoggedIn.value) {
    loadStats()
  }
})

// Watch for auth changes
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    loadStats()
  }
})
</script>