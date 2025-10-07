/**
 * Exports centralisés pour tous les stores Pinia
 * Facilite les imports et assure une architecture cohérente
 */

export { useAuthStore, isAuthenticated } from './modules/auth.store'
export { useStudentsStore } from './modules/students.store'
export { useClassStore } from './modules/class.store'
export { useEvaluationResultsStore } from './modules/evaluationResults.store'
export { useEvaluationsStore } from './modules/evaluations.store'
export { useCompetencyFrameworkStore } from './modules/competencyFramework.store'
export { useSchoolYearStore } from './modules/schoolYear.store'
export { useSchoolYearFilterStore } from './modules/schoolYearFilter.store'
export { useSettingsStore, getShowConsoleLogosRef } from './modules/settings.store'

// Aliases pour compatibilité avec les anciens noms
export { useEvaluationsStore as useEvaluationStore } from './modules/evaluations.store'
