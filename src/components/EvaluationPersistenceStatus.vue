<template>
  <div class="persistence-status-container">
    <div class="status-header">
      <h4>État de la persistance</h4>
      <div class="status-indicators">
        <span class="status-badge" :class="statusClass">
          {{ statusText }}
        </span>
        <span class="source-badge" :class="sourceClass">
          {{ sourceText }}
        </span>
        <button
          v-if="evaluationStore.error.value"
          class="clear-error-btn"
          title="Effacer l'erreur"
          @click="evaluationStore.clearError"
        >
          ×
        </button>
      </div>
    </div>

    <div v-if="evaluationStore.error.value" class="error-message">
      {{ evaluationStore.error.value }}
    </div>

    <div v-if="stats" class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Résultats sauvés:</span>
        <span class="stat-value">{{ stats.totalResults }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Évaluations:</span>
        <span class="stat-value">{{ stats.evaluationsCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Taille stockage:</span>
        <span class="stat-value">{{ formatBytes(stats.storageSize) }}</span>
      </div>
    </div>

    <div class="actions">
      <button
        class="action-btn refresh-btn"
        :disabled="evaluationStore.isLoading.value"
        @click="refreshData"
      >
        🔄 Actualiser
      </button>

      <button
        class="action-btn export-btn"
        @click="exportData"
      >
        📤 Exporter
      </button>

      <button
        class="action-btn reset-btn"
        :disabled="!evaluationStore.evaluation.value"
        @click="resetEvaluation"
      >
        🔄 Réinitialiser
      </button>
    </div>

    <div v-if="evaluationStore.evaluationStats.value" class="evaluation-stats">
      <h5>Statistiques de l'évaluation courante</h5>
      <div class="level-distribution">
        <div
          v-for="(count, level) in evaluationStore.evaluationStats.value.levelCounts"
          :key="level"
          class="level-count"
        >
          <span :class="`level-badge level-${String(level).toLowerCase()}`">{{ level }}</span>
          <span class="count">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEvaluationResultsStore } from '@/stores/evaluationResultsStore'

const evaluationStore = useEvaluationResultsStore()

// Stats from the service
const stats = computed(() => {
  try {
    return evaluationStore.getServiceStats()
  } catch {
    return null
  }
})

const statusClass = computed(() => {
  if (evaluationStore.isLoading) return 'loading'
  if (evaluationStore.error.value) return 'error'
  if (evaluationStore.hasResults.value) return 'success'
  return 'idle'
})

const statusText = computed(() => {
  if (evaluationStore.isLoading) return 'Chargement...'
  if (evaluationStore.error.value) return 'Erreur'
  if (evaluationStore.hasResults.value) return 'Données sauvées'
  return 'Aucune donnée'
})

const sourceClass = computed(() => {
  return evaluationStore.useSupabase.value ? 'supabase' : 'local'
})

const sourceText = computed(() => {
  return evaluationStore.useSupabase.value ? 'Supabase' : 'Local'
})

// Actions
const refreshData = async () => {
  await evaluationStore.refreshEvaluation()
}

const exportData = () => {
  const data = evaluationStore.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `evaluation-results-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const resetEvaluation = async () => {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les résultats de cette évaluation ?')) {
    await evaluationStore.resetEvaluation()
  }
}

// Utility function
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.persistence-status-container {
  background: var(--app-table-no-eval-bg);
  border: 1px solid var(--app-border-subtle);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: var(--md-sys-color-on-surface);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.status-header h4 {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font-size: 1rem;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge,
.source-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-badge.loading {
  background: var(--app-status-warning-container);
  color: var(--app-status-warning-on);
  border-color: var(--app-status-warning-border);
}

.status-badge.error {
  background: var(--app-status-danger-container);
  color: var(--app-status-danger-on);
  border-color: var(--app-status-danger-border);
}

.status-badge.success {
  background: var(--app-status-success-container);
  color: var(--app-status-success-on);
  border-color: var(--app-status-success-border);
}

.status-badge.idle {
  background: var(--app-status-neutral-container);
  color: var(--app-status-neutral-on);
  border-color: var(--app-status-neutral-border);
}

.source-badge {
  font-size: 0.75rem;
}

.source-badge.supabase {
  background: var(--app-status-success-container);
  color: var(--app-status-success-on);
  border-color: var(--app-status-success-border);
}

.source-badge.local {
  background: var(--app-status-warning-container);
  color: var(--app-status-warning-on);
  border-color: var(--app-status-warning-border);
}

.clear-error-btn {
  background: none;
  border: none;
  color: var(--app-icon-danger);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  line-height: 1;
}

.error-message {
  background: var(--app-status-danger-container);
  color: var(--app-status-danger-on);
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--md-sys-color-surface);
  border-radius: 0.25rem;
  border: 1px solid var(--app-divider);
}

.stat-label {
  color: var(--app-table-subhead-text);
  font-size: 0.85rem;
}

.stat-value {
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--app-border-subtle);
  border-radius: 0.25rem;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: var(--app-table-row-hover);
  border-color: var(--app-border-strong);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--app-status-info-container);
  color: var(--app-status-info-on);
  border-color: var(--app-status-info-border);
}

.export-btn:hover:not(:disabled) {
  background: var(--app-status-success-container);
  color: var(--app-status-success-on);
  border-color: var(--app-status-success-border);
}

.reset-btn:hover:not(:disabled) {
  background: var(--app-status-warning-container);
  color: var(--app-status-warning-on);
  border-color: var(--app-status-warning-border);
}

.evaluation-stats h5 {
  margin: 0 0 0.5rem 0;
  color: var(--md-sys-color-on-surface);
  font-size: 0.9rem;
}

.level-distribution {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.level-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.level-badge {
  padding: 0.15rem 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
}

.level-a {
  background: var(--app-status-success-container);
  color: var(--app-status-success-on);
}

.level-b {
  background: var(--app-status-info-container);
  color: var(--app-status-info-on);
}

.level-c {
  background: var(--app-status-warning-container);
  color: var(--app-status-warning-on);
}

.level-d,
.level-e {
  background: var(--app-status-danger-container);
  color: var(--app-status-danger-on);
}

.level-n-a {
  background: var(--app-status-neutral-container);
  color: var(--app-status-neutral-on);
}

.count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

@media (max-width: 768px) {
  .persistence-status-container {
    padding: 0.75rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .level-distribution {
    justify-content: center;
  }
}
</style>
