/**
 * Procedure Step Service
 * Business logic for step management
 */

import { IProcedureStepRepository } from '../../infrastructure/dynamodb/repositories/IProcedureStepRepository'
import { IProcedureRepository } from '../../infrastructure/dynamodb/repositories/IProcedureRepository'
import { ProcedureStep } from '../../domain/procedure/ProcedureStep'
import { NotFoundError, ValidationError } from '../../shared/errors'
import { getMandatorySteps } from '../../domain/procedure/ProcedureDefinitions'

export class ProcedureStepService {
  constructor(
    private readonly stepRepository: IProcedureStepRepository,
    private readonly procedureRepository: IProcedureRepository
  ) {}

  /**
   * Complete a step
   */
  async completeStep(step_id: string): Promise<ProcedureStep> {
    const step = await this.stepRepository.findById(step_id)

    if (!step) {
      throw new NotFoundError('Step', step_id)
    }

    step.complete()
    await this.stepRepository.update(step)

    // Check if procedure can be auto-closed
    await this.checkAutoClose(step.procedure_id)

    return step
  }

  /**
   * Skip a step (requires reason)
   */
  async skipStep(step_id: string, reason: string): Promise<ProcedureStep> {
    const step = await this.stepRepository.findById(step_id)

    if (!step) {
      throw new NotFoundError('Step', step_id)
    }

    if (!reason || reason.trim().length === 0) {
      throw new ValidationError('Skip reason is required')
    }

    step.skip(reason)
    await this.stepRepository.update(step)

    // Check if procedure can be auto-closed
    await this.checkAutoClose(step.procedure_id)

    return step
  }

  /**
   * Update step visit date
   */
  async updateVisitDate(step_id: string, visit_date: Date): Promise<ProcedureStep> {
    const step = await this.stepRepository.findById(step_id)

    if (!step) {
      throw new NotFoundError('Step', step_id)
    }

    step.updateVisitDate(visit_date)
    await this.stepRepository.update(step)

    return step
  }

  /**
   * Check if procedure can be auto-closed and close it
   */
  private async checkAutoClose(procedure_id: string): Promise<void> {
    const procedure = await this.procedureRepository.findById(procedure_id)

    if (!procedure || procedure.status !== 'IN_PROGRESS') {
      return
    }

    const steps = await this.stepRepository.findByProcedureId(procedure_id)
    const mandatorySteps = getMandatorySteps(procedure.procedure_type)
    const mandatoryStepTypes = new Set(mandatorySteps)

    const completedMandatorySteps = steps.filter(
      (step) =>
        mandatoryStepTypes.has(step.step_type) &&
        (step.is_completed || step.is_skipped)
    )

    // Auto-close if all mandatory steps are done
    if (completedMandatorySteps.length === mandatorySteps.length) {
      procedure.close()
      await this.procedureRepository.update(procedure)
    }
  }
}

