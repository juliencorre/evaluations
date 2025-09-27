<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
      <div class="dialog-container" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div class="dialog-header">
          <h2 id="dialog-title" class="dialog-title">Sélectionner l'année scolaire</h2>
          <button class="close-button" aria-label="Fermer" @click="$emit('close')">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="dialog-content">
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Chargement des années scolaires...</p>
          </div>

          <div v-else class="year-options">
            <!-- Option "Toutes les années" -->
            <label class="year-option">
              <input
                type="radio"
                name="schoolYear"
                value="all"
                :checked="selectedValue === 'all'"
                class="year-radio"
                @change="handleSelectionChange('all')"
              />
              <div class="year-card all-years">
                <div class="year-info">
                  <span class="year-name">Toutes les années</span>
                  <span class="year-description">Afficher les données de toutes les années scolaires</span>
                </div>
                <span class="material-symbols-outlined year-icon">select_all</span>
              </div>
            </label>

            <!-- Options années individuelles -->
            <label
              v-for="year in sortedSchoolYears"
              :key="year.id"
              class="year-option"
            >
              <input
                type="radio"
                name="schoolYear"
                :value="year.id"
                :checked="selectedValue === year.id"
                class="year-radio"
                @change="handleSelectionChange(year.id)"
              />
              <div class="year-card" :class="{ 'current-year': year.is_current }">
                <div class="year-info">
                  <span class="year-name">
                    {{ year.name }}
                    <span v-if="year.is_current" class="current-badge">Actuelle</span>
                  </span>
                  <span class="year-description">
                    Du {{ formatDate(year.start_date) }} au {{ formatDate(year.end_date) }}
                  </span>
                </div>
                <span class="material-symbols-outlined year-icon">
                  {{ year.is_current ? 'star' : 'calendar_today' }}
                </span>
              </div>
            </label>
          </div>
        </div>

        <div class="dialog-actions">
          <button class="button button-text" @click="$emit('close')">
            Annuler
          </button>
          <button
            class="button button-filled"
            :disabled="!hasValidSelection"
            @click="handleConfirm"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSchoolYearStore } from '@/stores/schoolYearStore'

interface Props {
  visible: boolean
  initialSelection?: string | 'all' | null
}

interface Emits {
  (e: 'close'): void
  (e: 'select', value: { type: 'all' | 'single', yearId?: string, yearName?: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  initialSelection: null
})

const emit = defineEmits<Emits>()

// School year store
const schoolYearStore = useSchoolYearStore()

// State
const selectedValue = ref<string | 'all' | null>(null)
const isLoading = ref(false)

// Computed
const sortedSchoolYears = computed(() => {
  // Filtrer les éléments undefined pour éviter les erreurs de rendu
  return schoolYearStore.sortedSchoolYears.value.filter(year => year != null)
})
const hasValidSelection = computed(() => selectedValue.value !== null)

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleSelectionChange = (value: string | 'all') => {
  selectedValue.value = value
}

const handleConfirm = () => {
  if (selectedValue.value === 'all') {
    emit('select', { type: 'all' })
  } else if (selectedValue.value) {
    const selectedYear = sortedSchoolYears.value.find(y => y && y.id === selectedValue.value)
    emit('select', {
      type: 'single',
      yearId: selectedValue.value,
      yearName: selectedYear?.name
    })
  }
}

const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const loadSchoolYears = async () => {
  isLoading.value = true
  try {
    await schoolYearStore.ensureLoaded()
  } catch (error) {
    console.error('Error loading school years:', error)
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      selectedValue.value = props.initialSelection
      loadSchoolYears()
    }
  }
)

// Focus management
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  selectedValue.value = props.initialSelection
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.dialog-container {
  background: var(--md-sys-color-surface);
  border-radius: 28px;
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--md-sys-elevation-level3);
  animation: dialogSlideUp 0.3s ease-out;
}

@keyframes dialogSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.dialog-title {
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short2) ease;
}

.close-button:hover {
  background: var(--md-sys-color-surface-container);
}

.close-button .material-symbols-outlined {
  font-size: 20px;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--md-sys-color-outline-variant);
  border-top: 3px solid var(--md-sys-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.year-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.year-option {
  cursor: pointer;
  display: block;
}

.year-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.year-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  background: var(--md-sys-color-surface);
  transition: all var(--md-sys-motion-duration-short4) ease;
  position: relative;
}

.year-card:hover {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary-container);
}

.year-radio:checked + .year-card {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary-container);
  box-shadow: var(--md-sys-elevation-level1);
}

.year-card.all-years {
  background: var(--md-sys-color-secondary-container);
}

.year-radio:checked + .year-card.all-years {
  background: var(--md-sys-color-secondary-container);
  border-color: var(--md-sys-color-secondary);
}

.year-card.current-year {
  border-color: var(--md-sys-color-tertiary);
}

.year-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.year-name {
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-badge {
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: 600;
  color: var(--md-sys-color-on-tertiary-container);
  background: var(--md-sys-color-tertiary-container);
  padding: 2px 8px;
  border-radius: 12px;
}

.year-description {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
}

.year-icon {
  font-size: 24px;
  color: var(--md-sys-color-primary);
  flex-shrink: 0;
}

.year-card.current-year .year-icon {
  color: var(--md-sys-color-tertiary);
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px 24px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.button {
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 500;
  font-size: var(--md-sys-typescale-label-large-size);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short4) ease;
  border: none;
  min-width: 64px;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.button-text {
  background: transparent;
  color: var(--md-sys-color-primary);
}

.button-text:hover:not(:disabled) {
  background: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
}

.button-filled {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.button-filled:hover:not(:disabled) {
  background: color-mix(in srgb, var(--md-sys-color-primary) 92%, var(--md-sys-color-on-primary) 8%);
  box-shadow: var(--md-sys-elevation-level1);
}

/* Mobile responsiveness */
@media (max-width: 599px) {
  .dialog-overlay {
    padding: 16px;
  }

  .dialog-container {
    max-height: 90vh;
  }

  .dialog-header {
    padding: 20px 20px 12px;
  }

  .dialog-content {
    padding: 12px 20px;
  }

  .dialog-actions {
    padding: 12px 20px 20px;
  }

  .year-card {
    padding: 12px;
  }
}
</style>