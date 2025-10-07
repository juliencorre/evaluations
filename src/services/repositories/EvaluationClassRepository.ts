import { BaseRepository } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Class } from '@/types/evaluation'
import { supabaseEvaluationClassesService } from '@/services/supabaseEvaluationClassesService'

export class EvaluationClassRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'EvaluationClass')
  }

  getClassesForEvaluation(evaluationId: string, schoolYearId?: string): Promise<Class[]> {
    this.log('getClassesForEvaluation', { evaluationId, schoolYearId })
    return supabaseEvaluationClassesService.getClassesForEvaluation(evaluationId, schoolYearId)
  }

  getEvaluationsForClass(classId: string, schoolYearId?: string) {
    this.log('getEvaluationsForClass', { classId, schoolYearId })
    return supabaseEvaluationClassesService.getEvaluationsForClass(classId, schoolYearId)
  }

  addClassToEvaluation(payload: { evaluationId: string; classId: string; schoolYearId?: string }) {
    this.log('addClassToEvaluation', payload)
    return supabaseEvaluationClassesService.addClassToEvaluation({
      evaluation_id: payload.evaluationId,
      class_id: payload.classId,
      school_year_id: payload.schoolYearId
    })
  }

  addClassesToEvaluation(payload: { evaluationId: string; classIds: string[]; schoolYearId?: string }) {
    this.log('addClassesToEvaluation', payload)
    return supabaseEvaluationClassesService.addClassesToEvaluation(
      payload.evaluationId,
      payload.classIds,
      payload.schoolYearId
    )
  }

  removeClassFromEvaluation(evaluationId: string, classId: string, schoolYearId?: string) {
    this.log('removeClassFromEvaluation', { evaluationId, classId, schoolYearId })
    return supabaseEvaluationClassesService.removeClassFromEvaluation(evaluationId, classId, schoolYearId)
  }

  updateEvaluationClasses(payload: { evaluationId: string; classIds: string[]; schoolYearId?: string }) {
    this.log('updateEvaluationClasses', payload)
    return supabaseEvaluationClassesService.updateEvaluationClasses(
      payload.evaluationId,
      payload.classIds,
      payload.schoolYearId
    )
  }

  getEvaluationStatistics(evaluationId: string, schoolYearId?: string) {
    this.log('getEvaluationStatistics', { evaluationId, schoolYearId })
    return supabaseEvaluationClassesService.getEvaluationStatistics(evaluationId, schoolYearId)
  }
}

