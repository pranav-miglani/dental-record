/**
 * Procedure step repository interface
 */

import { ProcedureStep } from '../../../domain/procedure/ProcedureStep'

export interface IProcedureStepRepository {
  /**
   * Find step by ID
   */
  findById(step_id: string): Promise<ProcedureStep | null>

  /**
   * Find steps by procedure ID
   */
  findByProcedureId(procedure_id: string): Promise<ProcedureStep[]>

  /**
   * Create step
   */
  create(step: ProcedureStep): Promise<ProcedureStep>

  /**
   * Update step
   */
  update(step: ProcedureStep): Promise<ProcedureStep>

  /**
   * Delete step
   */
  delete(step_id: string): Promise<void>
}

