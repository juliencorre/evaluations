<template>
  <main role="main">
    <h1 class="visually-hidden">Tableau d'évaluation des compétences</h1>

    <!-- Affichage conditionnel : attendre que les données soient chargées -->
    <div v-if="isLoading" class="loading-state">
      <p>Chargement des compétences...</p>
    </div>

    <EvaluationTable
      v-else-if="framework.domains.length > 0"
      :evaluation="evaluation"
      :students="allStudents"
      :framework="framework"
    />

    <div v-else class="empty-state">
      <p>Aucune compétence disponible</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import EvaluationTable from '@/components/EvaluationTable.vue'
import { SAMPLE_EVALUATION } from '@/data/staticData'
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'

const { allStudents } = useStudentsStore()
const competenciesStore = useCompetencyFrameworkStore()
const { framework, isCompetenciesLoading } = competenciesStore
const evaluation = SAMPLE_EVALUATION

// Utiliser l'état de chargement pour l'affichage conditionnel
const isLoading = isCompetenciesLoading

// Debug: vérifier si le framework arrive dans HomeView
console.log('🏠 [HomeView] Initialisation avec framework:', {
  domains: framework.value.domains.length,
  frameworkName: framework.value.name,
  isLoading: isLoading.value
})

// Watcher pour voir les changements du framework
watch(framework, (newFramework) => {
  console.log('🏠 [HomeView] Framework mis à jour:', {
    domains: newFramework.domains.length,
    frameworkName: newFramework.name
  })
}, { deep: true })

// Watcher pour voir les changements de l'état de chargement
watch(isLoading, (newLoading) => {
  console.log('🏠 [HomeView] État de chargement:', newLoading ? 'EN COURS' : 'TERMINÉ')
})
</script>

<style scoped>
main {
  height: calc(100vh - 60px);
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.loading-state, .empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
}
</style>
