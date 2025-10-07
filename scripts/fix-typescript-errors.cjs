/**
 * Script pour corriger toutes les erreurs TypeScript automatiquement
 */
/* eslint-disable no-undef */
 
const fs = require('fs');
const path = require('path');

// Fonction utilitaire pour lire et écrire des fichiers
function fixFile(filePath, replacements) {
  console.log(`Fixing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');

  let changed = false;
  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

const projectRoot = path.join(__dirname, '..');

// Fix HomeView.vue
fixFile(path.join(projectRoot, 'src/views/HomeView.vue'), [
  ['if (!currentEvaluation.value || !framework.domains || !evaluationStudents.value)', 'if (!currentEvaluation.value || !framework.value?.domains || !evaluationStudents.value)'],
  ['const competenciesCount = framework.domains', 'const competenciesCount = framework.value.domains'],
  ['competencies: framework.domains', 'competencies: (framework.value?.domains || [])'],
  ['totalCompetencies: framework.domains', 'totalCompetencies: (framework.value?.domains || [])'],
  ['if (!framework.value) {', 'if (!framework || !framework.value) {']
]);

// Fix ClassEvaluationsView.vue
fixFile(path.join(projectRoot, 'src/views/ClassEvaluationsView.vue'), [
  ['interface EvaluationItem {\n  id: string\n  name: string\n  description?: string\n  created_at: string\n}', 'interface EvaluationItem {\n  id: string\n  name: string\n  description?: string\n  createdAt: string\n}'],
  ['formatDate(evaluation.created_at)', 'formatDate(evaluation.createdAt)'],
  ['classData.value = classStore.classes.find(c => c.id === props.id)', 'classData.value = classStore.classes.find(c => c.id === props.id) || null'],
  ['evaluations.value = await supabaseEvaluationsService.getEvaluationsByClass(\n    props.id,\n    currentSchoolYearId\n  )', 'const fetchedEvaluations = await supabaseEvaluationsService.getEvaluationsByClass(\n    props.id,\n    currentSchoolYearId\n  )\n\n  // Map database format to EvaluationItem format\n  evaluations.value = fetchedEvaluations.map(eval => ({\n    id: eval.id,\n    name: eval.name,\n    description: eval.description,\n    createdAt: eval.created_at\n  }))'],
  ['{\n    id: \'add\',\n    label: \'Nouvelle évaluation\',\n    icon: \'add\'\n  }', '{\n    key: \'add\',\n    label: \'Nouvelle évaluation\',\n    icon: \'add\',\n    ariaLabel: \'Créer une nouvelle évaluation\',\n    type: \'primary\'\n  }'],
  ['const handleMenuItemClick = (menuItem: { id: string }) => {\n  if (menuItem.id === \'add\') {', 'const handleMenuItemClick = (menuItem: { key: string }) => {\n  if (menuItem.key === \'add\') {']
]);

// Fix EvaluationListView.vue
fixFile(path.join(projectRoot, 'src/views/EvaluationListView.vue'), [
  ['interface ClassEvaluation {\n  id: string\n  name: string\n  description?: string\n  created_at: string\n}', 'interface ClassEvaluation {\n  id: string\n  name: string\n  description?: string\n  createdAt: string\n}'],
  ['formatDate(evaluation.created_at)', 'formatDate(evaluation.createdAt)'],
  ['classEvaluations.value = await supabaseEvaluationsService.getEvaluationsByClass(\n      classStore.selectedClassId,\n      currentSchoolYearId\n    )', 'const fetchedEvaluations = await supabaseEvaluationsService.getEvaluationsByClass(\n      classStore.selectedClassId,\n      currentSchoolYearId\n    )\n    // Map database format to ClassEvaluation format\n    classEvaluations.value = fetchedEvaluations.map(eval => ({\n      id: eval.id,\n      name: eval.name,\n      description: eval.description,\n      createdAt: eval.created_at\n    }))']
]);

// Fix ClassTeachersView.vue
fixFile(path.join(projectRoot, 'src/views/ClassTeachersView.vue'), [
  ['v-model:search-query="searchQuery"', ':search-value="searchQuery"\n      @update:search-value="searchQuery = $event"']
]);

console.log('\n✓ All files fixed!');
