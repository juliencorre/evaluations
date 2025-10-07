/**
 * @deprecated Ce fichier est conservé pour la rétrocompatibilité
 * Utilisez plutôt:
 * - import { useEvaluationsStore } from '@/stores/modules/evaluations.store'
 * Ou mieux encore:
 * - import { useEvaluationsStore } from '@/stores'
 *
 * Note: Le nom du store a changé de useEvaluationStore à useEvaluationsStore (pluriel)
 */

export { useEvaluationsStore } from './modules/evaluations.store'

// Alias pour compatibilité avec l'ancien nom
export { useEvaluationsStore as useEvaluationStore } from './modules/evaluations.store'
