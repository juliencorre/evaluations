<template>
  <main role="main">
    <h1 class="visually-hidden">Tableau d'évaluation des compétences</h1>
    <EvaluationTable
      :evaluation="evaluation"
      :students="allStudents"
      :framework="framework"
    />
  </main>
</template>

<script setup lang="ts">
import EvaluationTable from '@/components/EvaluationTable.vue'
import { SAMPLE_EVALUATION } from '@/data/staticData'
import { useStudentsStore, useCompetencyFrameworkStore } from '@/stores/studentsStore'

const { allStudents } = useStudentsStore()
const { framework } = useCompetencyFrameworkStore()
const evaluation = SAMPLE_EVALUATION
</script>

<style scoped>
main {
  height: calc(100vh - 60px);
  overflow: hidden;
}
</style>
