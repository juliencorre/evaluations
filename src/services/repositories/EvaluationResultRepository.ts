/**
 * Evaluation Result Repository
 * Wraps Supabase evaluation result service to expose a typed repository API.
 */

import { BaseRepository } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Evaluation, EvaluationResult, EvaluationValue, EvaluationLevel } from '@/types/evaluation'
import { supabaseEvaluationResultsService } from '@/services/supabaseEvaluationResultsService'

export class EvaluationResultRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'EvaluationResult')
  }

  async getOrCreateEvaluation(evaluation: Omit<Evaluation, 'results'>): Promise<Evaluation> {
    try {
      this.log('getOrCreateEvaluation', { id: evaluation.id })
      return await supabaseEvaluationResultsService.getOrCreateEvaluation(evaluation)
    } catch (error) {
      this.handleError('getOrCreateEvaluation', error)
    }
  }

  async updateEvaluation(
    evaluationId: string,
    updates: Partial<Omit<Evaluation, 'id' | 'results' | 'createdAt'>>
  ): Promise<Evaluation | null> {
    try {
      this.log('updateEvaluation', { evaluationId })
      return await supabaseEvaluationResultsService.updateEvaluation(evaluationId, updates)
    } catch (error) {
      this.handleError('updateEvaluation', error)
    }
  }

  async deleteEvaluation(evaluationId: string): Promise<boolean> {
    try {
      this.log('deleteEvaluation', { evaluationId })
      return await supabaseEvaluationResultsService.deleteEvaluation(evaluationId)
    } catch (error) {
      this.handleError('deleteEvaluation', error)
    }
  }

  async getResults(evaluationId: string): Promise<EvaluationResult[]> {
    try {
      this.log('getResults', { evaluationId })
      return await supabaseEvaluationResultsService.getAllResults(evaluationId)
    } catch (error) {
      this.handleError('getResults', error)
    }
  }

  async saveResult(
    evaluationId: string,
    studentId: string,
    competencyId: string,
    value: EvaluationValue,
    comment?: string
  ): Promise<EvaluationResult> {
    try {
      this.log('saveResult', { evaluationId, studentId, competencyId })
      return await supabaseEvaluationResultsService.saveResult(
        evaluationId,
        studentId,
        competencyId,
        value,
        comment
      )
    } catch (error) {
      this.handleError('saveResult', error)
    }
  }

  async saveResultLevel(
    evaluationId: string,
    studentId: string,
    competencyId: string,
    level: EvaluationLevel,
    comment?: string
  ): Promise<EvaluationResult> {
    try {
      this.log('saveResultLevel', { evaluationId, studentId, competencyId })
      return await supabaseEvaluationResultsService.saveResult(
        evaluationId,
        studentId,
        competencyId,
        level,
        comment
      )
    } catch (error) {
      this.handleError('saveResultLevel', error)
    }
  }

  async deleteResult(evaluationId: string, studentId: string, competencyId: string): Promise<boolean> {
    try {
      this.log('deleteResult', { evaluationId, studentId, competencyId })
      return await supabaseEvaluationResultsService.deleteResult(
        evaluationId,
        studentId,
        competencyId
      )
    } catch (error) {
      this.handleError('deleteResult', error)
    }
  }
}

