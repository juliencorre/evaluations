<template>
  <main role="main">
    <h1 class="visually-hidden">Tableau d'évaluation des compétences</h1>
    <EvaluationTable
      :evaluation="evaluation"
      :students="students"
      :framework="framework"
    />
  </main>
</template>

<script setup lang="ts">
import EvaluationTable from '@/components/EvaluationTable.vue'
import { STUDENTS, COMPETENCY_FRAMEWORK, SAMPLE_EVALUATION } from '@/data/staticData'

const students = STUDENTS
const framework = COMPETENCY_FRAMEWORK
const evaluation = SAMPLE_EVALUATION
</script>

<style scoped>
main {
  height: calc(100vh - 60px);
  overflow: hidden;
}
</style>
