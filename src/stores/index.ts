/**
 * Exports centralisés pour tous les stores Pinia
 * Facilite les imports et assure une architecture cohérente
 *
 * Usage recommandé:
 * ```typescript
 * import { useStudentsStore, useEvaluationsStore } from '@/stores'
 * ```
 */

// ==================== REFACTORED STORES (pattern defineStore) ====================
export { useStudentsStore } from './modules/students.store'
export { useCompetencyFrameworkStore } from './modules/competencyFramework.store'
export { useEvaluationsStore } from './modules/evaluations.store'

// Alias pour compatibilité avec l'ancien nom
export { useEvaluationsStore as useEvaluationStore } from './modules/evaluations.store'

// ==================== LEGACY STORES (à migrer vers /modules) ====================
export { useAuthStore } from './authStore'
export { useClassStore } from './classStore'
export { useEvaluationResultsStore } from './evaluationResultsStore'
export { useSchoolYearStore } from './schoolYearStore'
export { useSchoolYearFilterStore } from './schoolYearFilterStore'
export { useSettingsStore } from './settingsStore'
