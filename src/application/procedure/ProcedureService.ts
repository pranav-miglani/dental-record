/**
 * Procedure service
 * Business logic for procedure management
 */

import { IProcedureRepository } from '../../infrastructure/dynamodb/repositories/IProcedureRepository'
import { IProcedureStepRepository } from '../../infrastructure/dynamodb/repositories/IProcedureStepRepository'
import { Procedure } from '../../domain/procedure/Procedure'
import { ProcedureStep } from '../../domain/procedure/ProcedureStep'
import {
  ProcedureType,
  ProcedureStatus,
  ToothNumber,
} from '../../shared/types'
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../../shared/errors'
import { v4 as uuidv4 } from 'uuid'
import {
  getProcedureDefinition,
  getAllSteps,
  getMandatorySteps,
} from '../../domain/procedure/ProcedureDefinitions'

export class ProcedureService {
  constructor(
    private readonly procedureRepository: IProcedureRepository,
    private readonly procedureStepRepository: IProcedureStepRepository
  ) {}

  /**
   * Create and assign a procedure to a patient
   */
  async createProcedure(data: {
    patient_id: string
    procedure_type: ProcedureType
    procedure_name?: string
    procedure_description?: string
    tooth_number?: ToothNumber
    assigned_by: string
    diagnosis_notes?: string
  }): Promise<{ procedure: Procedure; steps: ProcedureStep[] }> {
    // Validate procedure type
    const definition = getProcedureDefinition(data.procedure_type)

    // Generate procedure ID
    const procedure_id = uuidv4()

    // Create procedure
    const procedure = new Procedure(
      procedure_id,
      data.patient_id,
      data.procedure_type,
      'DRAFT',
      data.procedure_name || definition.procedure_name,
      data.procedure_description,
      data.tooth_number,
      data.assigned_by,
      new Date()
    )

    // Create procedure steps from definition
    const stepDefinitions = getAllSteps(data.procedure_type)
    const steps: ProcedureStep[] = []

    for (const stepDef of stepDefinitions) {
      // Only create top-level steps (not nested)
      if (!stepDef.parent_step_type) {
        const step_id = uuidv4()
        const step = new ProcedureStep(
          step_id,
          procedure_id,
          stepDef.step_type,
          stepDef.step_name,
          stepDef.is_mandatory
        )
        steps.push(step)
      }
    }

    // Save procedure
    await this.procedureRepository.create(procedure)

    // Save steps
    for (const step of steps) {
      await this.procedureStepRepository.create(step)
    }

    return { procedure, steps }
  }

  /**
   * Get procedure by ID with steps
   */
  async getProcedure(procedure_id: string): Promise<{
    procedure: Procedure
    steps: ProcedureStep[]
  }> {
    const procedure = await this.procedureRepository.findById(procedure_id)

    if (!procedure) {
      throw new NotFoundError('Procedure', procedure_id)
    }

    const steps = await this.procedureStepRepository.findByProcedureId(procedure_id)

    return { procedure, steps }
  }

  /**
   * Get procedures for a patient
   */
  async getProceduresByPatient(
    patient_id: string,
    limit: number = 50,
    lastKey?: string
  ) {
    return await this.procedureRepository.findByPatientId(patient_id, limit, lastKey)
  }

  /**
   * Confirm procedure (DRAFT → IN_PROGRESS)
   */
  async confirmProcedure(procedure_id: string, user_id: string): Promise<Procedure> {
    const procedure = await this.procedureRepository.findById(procedure_id)

    if (!procedure) {
      throw new NotFoundError('Procedure', procedure_id)
    }

    // Only doctor can confirm
    // This check should be done at handler level with RBAC

    procedure.confirm()
    return await this.procedureRepository.update(procedure)
  }

  /**
   * Update procedure information
   */
  async updateProcedure(
    procedure_id: string,
    data: {
      procedure_name?: string
      procedure_description?: string
      tooth_number?: ToothNumber
    }
  ): Promise<Procedure> {
    const procedure = await this.procedureRepository.findById(procedure_id)

    if (!procedure) {
      throw new NotFoundError('Procedure', procedure_id)
    }

    if (!procedure.canBeModified()) {
      throw new ForbiddenError('Cannot modify cancelled procedure')
    }

    procedure.updateInfo(data)
    return await this.procedureRepository.update(procedure)
  }

  /**
   * Close procedure (when all mandatory steps completed)
   */
  async closeProcedure(procedure_id: string): Promise<Procedure> {
    const { procedure, steps } = await this.getProcedure(procedure_id)

    // Check if all mandatory steps are completed
    const mandatorySteps = getMandatorySteps(procedure.procedure_type)
    const mandatoryStepTypes = new Set(mandatorySteps)

    const completedMandatorySteps = steps.filter(
      (step) =>
        mandatoryStepTypes.has(step.step_type) &&
        (step.is_completed || step.is_skipped)
    )

    if (completedMandatorySteps.length < mandatorySteps.length) {
      throw new ValidationError('Not all mandatory steps are completed')
    }

    procedure.close()
    return await this.procedureRepository.update(procedure)
  }

  /**
   * Cancel procedure
   */
  async cancelProcedure(
    procedure_id: string,
    reason?: string
  ): Promise<Procedure> {
    const procedure = await this.procedureRepository.findById(procedure_id)

    if (!procedure) {
      throw new NotFoundError('Procedure', procedure_id)
    }

    procedure.cancel(reason)
    return await this.procedureRepository.update(procedure)
  }

  /**
   * Check if procedure can be auto-closed
   */
  async checkAutoClose(procedure_id: string): Promise<boolean> {
    const { procedure, steps } = await this.getProcedure(procedure_id)

    if (procedure.status !== 'IN_PROGRESS') {
      return false
    }

    const mandatorySteps = getMandatorySteps(procedure.procedure_type)
    const mandatoryStepTypes = new Set(mandatorySteps)

    const completedMandatorySteps = steps.filter(
      (step) =>
        mandatoryStepTypes.has(step.step_type) &&
        (step.is_completed || step.is_skipped)
    )

    return completedMandatorySteps.length === mandatorySteps.length
  }
}

