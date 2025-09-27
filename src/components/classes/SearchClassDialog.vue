<template>
  <FullscreenDialog
    :visible="visible"
    title="Rechercher une classe"
    subtitle="Trouvez et rejoignez une classe existante"
    save-button-text="Rejoindre"
    saving-text="Association..."
    :save-disabled="!selectedClass"
    :is-saving="isJoining"
    compact
    @close="handleClose"
    @save="handleJoinClass"
  >
    <template #header>
      <div class="dialog-description">
        <p>Recherchez une classe existante dans la liste ci-dessous et rejoignez-la.</p>
      </div>
    </template>

    <div class="search-content">
      <!-- Search Input -->
      <div class="search-section">
        <div class="search-input-container">
          <svg viewBox="0 0 24 24" fill="currentColor" class="search-icon">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
          </svg>
          <input
            v-model="searchTerm"
            type="text"
            class="search-input"
            placeholder="Rechercher par nom, niveau, matière..."
            :disabled="isLoading"
          />
          <button
            v-if="searchTerm"
            class="clear-search-btn"
            aria-label="Effacer la recherche"
            @click="searchTerm = ''"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
      </div>

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
        <p>Recherche des classes...</p>
      </div>

      <!-- Results Section -->
      <div v-else class="results-section">
        <!-- No Results -->
        <div v-if="filteredClasses.length === 0 && searchTerm" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5,14H20.5L22,15.5V20.5L20.5,22H15.5L14,20.5V15.5L15.5,14M16,16V20H20V16H16M10.5,18H12.5V20H10.5V18M6.5,16H8.5V18H6.5V16M2.5,14H4.5V16H2.5V14M7,2L13,8L7,14L1,8L7,2M7,4.8L3.8,8L7,11.2L10.2,8L7,4.8Z"/>
            </svg>
          </div>
          <h3 class="empty-title">Aucun résultat</h3>
          <p class="empty-description">
            Aucune classe ne correspond à votre recherche "{{ searchTerm }}".
          </p>
        </div>

        <!-- No Search Term -->
        <div v-else-if="!searchTerm" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
            </svg>
          </div>
          <h3 class="empty-title">Recherchez une classe</h3>
          <p class="empty-description">
            Saisissez le nom, le niveau ou la matière de la classe que vous cherchez.
          </p>
        </div>

        <!-- Classes List -->
        <div v-else class="classes-list">
          <div
            v-for="classItem in filteredClasses"
            :key="classItem.id"
            class="class-item"
            :class="{ 'selected': selectedClass?.id === classItem.id }"
            @click="selectClass(classItem)"
          >
            <div class="class-content">
              <div class="class-header">
                <h3 class="class-name">{{ classItem.name }}</h3>
                <div class="selection-indicator">
                  <svg v-if="selectedClass?.id === classItem.id" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                </div>
              </div>

              <p v-if="classItem.description" class="class-description">
                {{ classItem.description }}
              </p>

              <div class="class-meta">
                <span v-if="classItem.level" class="meta-item">
                  <span class="material-symbols-outlined">grade</span>
                  {{ classItem.level }}
                </span>
                <span v-if="classItem.schoolYear" class="meta-item">
                  <span class="material-symbols-outlined">calendar_today</span>
                  {{ classItem.schoolYear }}
                </span>
                <span v-if="classItem.subject" class="meta-item">
                  <span class="material-symbols-outlined">subject</span>
                  {{ classItem.subject }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="selectedClass" class="selection-info">
        <div class="selected-class-preview">
          <h4 class="preview-title">Classe sélectionnée :</h4>
          <div class="preview-content">
            <strong>{{ selectedClass.name }}</strong>
            <span v-if="selectedClass.level"> - {{ selectedClass.level }}</span>
            <span v-if="selectedClass.subject"> ({{ selectedClass.subject }})</span>
          </div>
        </div>
      </div>
    </template>
  </FullscreenDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import FullscreenDialog from '@/components/common/FullscreenDialog.vue'
import { supabaseClassesService } from '@/services/supabaseClassesService'
import { useAuthStore, isAuthenticated } from '@/stores/authStore'
import type { Class } from '@/types/evaluation'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'class-joined', classData: Class): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const searchTerm = ref('')
const selectedClass = ref<Class | null>(null)
const availableClasses = ref<Class[]>([])
const isLoading = ref(false)
const isJoining = ref(false)

// Computed
const filteredClasses = computed(() => {
  if (!searchTerm.value) {
    return []
  }

  const search = searchTerm.value.toLowerCase()
  return availableClasses.value.filter(classItem =>
    classItem.name.toLowerCase().includes(search) ||
    (classItem.description && classItem.description.toLowerCase().includes(search)) ||
    (classItem.level && classItem.level.toLowerCase().includes(search)) ||
    (classItem.subject && classItem.subject.toLowerCase().includes(search)) ||
    (classItem.schoolYear && classItem.schoolYear.toLowerCase().includes(search))
  )
})

// Methods
const loadAvailableClasses = async () => {
  try {
    isLoading.value = true

    // Load all classes (not just user's classes)
    const allClasses = await supabaseClassesService.getClasses()

    // TODO: Filter out classes the user is already in
    // For now, show all classes
    availableClasses.value = allClasses
  } catch (error) {
    console.error('Error loading available classes:', error)
  } finally {
    isLoading.value = false
  }
}

const selectClass = (classItem: Class) => {
  selectedClass.value = selectedClass.value?.id === classItem.id ? null : classItem
}

const handleJoinClass = async () => {
  if (!selectedClass.value || isJoining.value) return

  isJoining.value = true
  try {
    const authStore = useAuthStore()

    // Ensure auth store is properly initialized
    await authStore.ensureInitialized()

    // Get the current user ID
    const currentUserId = authStore.user.value?.id

    if (!currentUserId) {
      console.error('No current user ID found')
      console.error('AuthStore user exists:', !!authStore.user)
      console.error('Is authenticated:', isAuthenticated.value)
      throw new Error('Utilisateur non authentifié')
    }

    console.log(`Attempting to join class ${selectedClass.value.name} with user ID: ${currentUserId}`)

    // Add user to the selected class
    await supabaseClassesService.addUserToClass(
      currentUserId,
      selectedClass.value.id,
      'teacher' // Default role when joining a class
    )

    console.log(`✅ Utilisateur associé à la classe: ${selectedClass.value.name}`)

    // Emit the joined class
    emit('class-joined', selectedClass.value)

    // Close dialog
    handleClose()
  } catch (error) {
    console.error('❌ Erreur lors de l\'association à la classe:', error)

    // Show user-friendly error message
    if (error instanceof Error && error.message.includes('non authentifié')) {
      alert('Vous devez être connecté pour rejoindre une classe.')
    } else {
      alert('Erreur lors de l\'association à la classe. Veuillez réessayer.')
    }
  } finally {
    isJoining.value = false
  }
}

const handleClose = () => {
  // Reset state
  searchTerm.value = ''
  selectedClass.value = null

  emit('close')
}

// Watchers
watch(() => props.visible, async (visible) => {
  if (visible) {
    // Ensure user is authenticated before loading classes
    const authStore = useAuthStore()
    await authStore.ensureInitialized()

    if (!isAuthenticated.value) {
      console.warn('User not authenticated when opening search dialog')
      emit('close') // Close dialog if not authenticated
      return
    }

    loadAvailableClasses()
  } else {
    // Reset when closed
    searchTerm.value = ''
    selectedClass.value = null
  }
})

// Initialize
onMounted(async () => {
  if (props.visible) {
    // Ensure user is authenticated before loading classes
    const authStore = useAuthStore()
    await authStore.ensureInitialized()

    if (!isAuthenticated.value) {
      console.warn('User not authenticated when opening search dialog')
      return
    }

    loadAvailableClasses()
  }
})
</script>

<style scoped>
.dialog-description {
  padding: 0;
  margin-bottom: 8px;
}

.dialog-description p {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.search-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Search Section */
.search-section {
  flex-shrink: 0;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: var(--md-sys-color-on-surface-variant);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-small, 4px);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
  padding: 15px 15px 15px 47px;
}

.search-input:disabled {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.38;
  cursor: not-allowed;
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-search-btn:hover {
  background: var(--md-sys-color-surface-container-highest);
}

.clear-search-btn svg {
  width: 20px;
  height: 20px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 32px;
}

.loading-spinner {
  margin-bottom: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  color: var(--md-sys-color-primary);
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

/* Results Section */
.results-section {
  flex: 1;
  min-height: 300px;
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

/* Classes List */
.classes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.class-item {
  background: var(--md-sys-color-surface-container-low);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.class-item:hover {
  background: var(--md-sys-color-surface-container);
  border-color: var(--md-sys-color-outline);
}

.class-item.selected {
  background: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
}

.class-content {
  width: 100%;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.class-name {
  font-family: var(--md-sys-typescale-body-large-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-large-size, 16px);
  font-weight: var(--md-sys-typescale-body-large-weight, 500);
  line-height: var(--md-sys-typescale-body-large-line-height, 24px);
  color: var(--md-sys-color-on-surface);
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.class-item.selected .class-name {
  color: var(--md-sys-color-on-primary-container);
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
  opacity: 0;
  transition: opacity 0.2s ease;
}

.class-item.selected .selection-indicator {
  opacity: 1;
}

.selection-indicator svg {
  width: 16px;
  height: 16px;
}

.class-description {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 12px 0;
}

.class-item.selected .class-description {
  color: var(--md-sys-color-on-primary-container);
  opacity: 0.8;
}

.class-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.class-item.selected .meta-item {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.meta-item .material-symbols-outlined {
  font-size: 14px;
}

/* Footer */
.selection-info {
  padding: 16px 0 0;
  border-top: 1px solid var(--md-sys-color-outline-variant);
  margin-top: 16px;
}

.selected-class-preview {
  background: var(--md-sys-color-secondary-container);
  border-radius: var(--md-sys-shape-corner-small, 4px);
  padding: 12px 16px;
}

.preview-title {
  font-family: var(--md-sys-typescale-body-small-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-small-size, 12px);
  font-weight: var(--md-sys-typescale-body-small-weight, 500);
  line-height: var(--md-sys-typescale-body-small-line-height, 16px);
  color: var(--md-sys-color-on-secondary-container);
  margin: 0 0 4px 0;
}

.preview-content {
  font-family: var(--md-sys-typescale-body-medium-font, 'Roboto');
  font-size: var(--md-sys-typescale-body-medium-size, 14px);
  font-weight: var(--md-sys-typescale-body-medium-weight, 400);
  line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
  color: var(--md-sys-color-on-secondary-container);
}

.preview-content strong {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .class-meta {
    gap: 6px;
  }

  .meta-item {
    font-size: 11px;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  .search-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .class-item {
    padding: 12px;
  }

  .empty-state {
    padding: 32px 16px;
  }
}
</style>