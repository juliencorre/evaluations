import { ref } from 'vue'
import { useClassStore } from '@/stores'
import { useStudentsStore } from '@/stores'
import { useEvaluationStore } from '@/stores'

/**
 * Composable pour gérer le soft delete des entités
 * Comme nous n'avons pas encore la colonne deleted_at en base,
 * on simule avec les méthodes delete existantes qui font un hard delete
 * TODO: Mettre à jour quand les colonnes deleted_at seront ajoutées
 */

export function useSoftDelete() {
  const isDeleting = ref(false)
  const deleteError = ref<string>('')

  const classStore = useClassStore()
  const studentsStore = useStudentsStore()
  const evaluationStore = useEvaluationStore()

  /**
   * Soft delete d'un étudiant
   * TODO: Remplacer par un appel API qui set deleted_at
   */
  const softDeleteStudent = async (studentId: string) => {
    isDeleting.value = true
    deleteError.value = ''

    try {
      // Pour l'instant, on utilise le hard delete existant
      // TODO: Remplacer par PATCH /students/{id} avec { deleted_at: now() }
      await studentsStore.deleteStudent(studentId)
      return true
    } catch (error) {
      console.error('Erreur lors du soft delete étudiant:', error)
      deleteError.value = 'Impossible de supprimer l\'étudiant'
      return false
    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Soft delete d'une classe
   * TODO: Remplacer par un appel API qui set deleted_at
   */
  const softDeleteClass = async (classId: string) => {
    isDeleting.value = true
    deleteError.value = ''

    try {
      // Pour l'instant, on utilise le hard delete existant
      // TODO: Remplacer par PATCH /classes/{id} avec { deleted_at: now() }
      await classStore.deleteClass(classId)
      return true
    } catch (error) {
      console.error('Erreur lors du soft delete classe:', error)
      deleteError.value = 'Impossible de supprimer la classe'
      return false
    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Soft delete d'une évaluation
   * TODO: Remplacer par un appel API qui set deleted_at
   */
  const softDeleteEvaluation = async (evaluationId: string) => {
    isDeleting.value = true
    deleteError.value = ''

    try {
      // Pour l'instant, on utilise le hard delete existant
      // TODO: Remplacer par PATCH /evaluations/{id} avec { deleted_at: now() }
      await evaluationStore.deleteEvaluation(evaluationId)
      return true
    } catch (error) {
      console.error('Erreur lors du soft delete évaluation:', error)
      deleteError.value = 'Impossible de supprimer l\'évaluation'
      return false
    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Restaurer un étudiant supprimé
   * TODO: Implémenter quand les colonnes deleted_at seront ajoutées
   */
  const restoreStudent = async (studentId: string) => {
    // TODO: PATCH /students/{id} avec { deleted_at: null }
    console.log('Restore student not implemented yet:', studentId)
    return false
  }

  /**
   * Restaurer une classe supprimée
   * TODO: Implémenter quand les colonnes deleted_at seront ajoutées
   */
  const restoreClass = async (classId: string) => {
    // TODO: PATCH /classes/{id} avec { deleted_at: null }
    console.log('Restore class not implemented yet:', classId)
    return false
  }

  /**
   * Restaurer une évaluation supprimée
   * TODO: Implémenter quand les colonnes deleted_at seront ajoutées
   */
  const restoreEvaluation = async (evaluationId: string) => {
    // TODO: PATCH /evaluations/{id} avec { deleted_at: null }
    console.log('Restore evaluation not implemented yet:', evaluationId)
    return false
  }

  /**
   * Confirmer avant suppression avec message personnalisé
   */
  const confirmDelete = (
    entityName: string,
    entityType: 'étudiant' | 'classe' | 'évaluation' = 'étudiant'
  ): boolean => {
    return confirm(
      `Êtes-vous sûr de vouloir supprimer ${entityType} "${entityName}" ?\n\n` +
      'Cette action peut être annulée.'
    )
  }

  /**
   * Validation du format school_year
   */
  const validateSchoolYear = (schoolYear: string): { valid: boolean; error?: string } => {
    if (!schoolYear) {
      return { valid: true } // Optionnel
    }

    const schoolYearPattern = /^\d{4}-\d{4}$/
    if (!schoolYearPattern.test(schoolYear)) {
      return {
        valid: false,
        error: 'Format invalide. Utilisez YYYY-YYYY (ex: 2024-2025)'
      }
    }

    const years = schoolYear.split('-')
    const startYear = parseInt(years[0])
    const endYear = parseInt(years[1])

    if (endYear !== startYear + 1) {
      return {
        valid: false,
        error: 'L\'année de fin doit être l\'année suivante (ex: 2024-2025)'
      }
    }

    return { valid: true }
  }

  /**
   * Générer l'année scolaire courante automatiquement
   */
  const getCurrentSchoolYear = (): string => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // getMonth() retourne 0-11

    // Si on est entre septembre et décembre, l'année scolaire a commencé
    // Si on est entre janvier et août, on est dans la deuxième partie de l'année scolaire
    if (currentMonth >= 9) {
      return `${currentYear}-${currentYear + 1}`
    } else {
      return `${currentYear - 1}-${currentYear}`
    }
  }

  return {
    // État
    isDeleting,
    deleteError,

    // Soft delete
    softDeleteStudent,
    softDeleteClass,
    softDeleteEvaluation,

    // Restore (à implémenter)
    restoreStudent,
    restoreClass,
    restoreEvaluation,

    // Utilitaires
    confirmDelete,
    validateSchoolYear,
    getCurrentSchoolYear
  }
}