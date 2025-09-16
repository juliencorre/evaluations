<template>
  <div class="persistence-status-container">
    <div class="status-header">
      <h4>État de la persistance</h4>
      <div class="status-indicators">
        <span class="status-badge" :class="statusClass">
          {{ statusText }}
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
          <span :class="`level-badge level-${level.toLowerCase()}`">{{ level }}</span>
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
  if (evaluationStore.isLoading.value) return 'loading'
  if (evaluationStore.error.value) return 'error'
  if (evaluationStore.hasResults.value) return 'success'
  return 'idle'
})

const statusText = computed(() => {
  if (evaluationStore.isLoading.value) return 'Chargement...'
  if (evaluationStore.error.value) return 'Erreur'
  if (evaluationStore.hasResults.value) return 'Données sauvées'
  return 'Aucune donnée'
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
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.status-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1rem;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.loading {
  background: #fff3cd;
  color: #856404;
}

.status-badge.error {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.success {
  background: #d4edda;
  color: #155724;
}

.status-badge.idle {
  background: #e2e3e5;
  color: #6c757d;
}

.clear-error-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  line-height: 1;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
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
  background: white;
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

.stat-label {
  color: #6c757d;
  font-size: 0.85rem;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: white;
  color: #495057;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  background: #e3f2fd;
  color: #1976d2;
}

.export-btn:hover:not(:disabled) {
  background: #e8f5e8;
  color: #28a745;
}

.reset-btn:hover:not(:disabled) {
  background: #fff3cd;
  color: #856404;
}

.evaluation-stats h5 {
  margin: 0 0 0.5rem 0;
  color: #495057;
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
  background: #d4edda;
  color: #155724;
}

.level-b {
  background: #d1ecf1;
  color: #0c5460;
}

.level-c {
  background: #fff3cd;
  color: #856404;
}

.level-d {
  background: #f8d7da;
  color: #721c24;
}

.level-e {
  background: #f8d7da;
  color: #721c24;
}

.level-n-a {
  background: #e2e3e5;
  color: #6c757d;
}

.count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
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