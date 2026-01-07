/**
 * Procedure Step domain model
 * Represents a step within a procedure
 */

export type StepType =
  | 'PROCEDURE_NAME'
  | 'TOOTH_NUMBER'
  | 'CLINICAL_PHOTO_INITIAL'
  | 'CLINICAL_PHOTO_FOLLOWUP'
  | 'WORKING_LENGTH'
  | 'MASTER_CONE'
  | 'BEFORE_FILLING'
  | 'AFTER_FILLING'
  | 'BEFORE_SCALING'
  | 'AFTER_SCALING'
  | 'BEFORE_EXTRACTION'
  | 'FLAP_RAISED'
  | 'ALVEOPLASTY'
  | 'BONE_AUGMENTATION'
  | 'AFTER_EXTRACTION'
  | 'DRESSING'

export class ProcedureStep {
  constructor(
    public readonly step_id: string,
    public readonly procedure_id: string,
    public step_type: StepType,
    public step_name: string,
    public is_mandatory: boolean,
    public is_completed: boolean = false,
    public is_skipped: boolean = false,
    public skip_reason?: string,
    public visit_date: Date = new Date(),
    public readonly created_at: Date = new Date(),
    public updated_at: Date = new Date()
  ) {}

  /**
   * Mark step as completed
   */
  complete(): void {
    if (this.is_skipped) {
      throw new Error('Cannot complete a skipped step')
    }
    this.is_completed = true
    this.updated_at = new Date()
  }

  /**
   * Mark step as skipped (requires reason)
   */
  skip(reason: string): void {
    if (this.is_completed) {
      throw new Error('Cannot skip a completed step')
    }
    this.is_skipped = true
    this.skip_reason = reason
    this.updated_at = new Date()
  }

  /**
   * Unskip step
   */
  unskip(): void {
    this.is_skipped = false
    this.skip_reason = undefined
    this.updated_at = new Date()
  }

  /**
   * Update visit date
   */
  updateVisitDate(date: Date): void {
    this.visit_date = date
    this.updated_at = new Date()
  }

  /**
   * Check if step is done (completed or skipped)
   */
  isDone(): boolean {
    return this.is_completed || this.is_skipped
  }

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): Record<string, unknown> {
    return {
      step_id: this.step_id,
      procedure_id: this.procedure_id,
      step_type: this.step_type,
      step_name: this.step_name,
      is_mandatory: this.is_mandatory,
      is_completed: this.is_completed,
      is_skipped: this.is_skipped,
      skip_reason: this.skip_reason,
      visit_date: this.visit_date.toISOString(),
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    }
  }

  /**
   * Create ProcedureStep from plain object
   */
  static fromPlainObject(data: Record<string, unknown>): ProcedureStep {
    return new ProcedureStep(
      data.step_id as string,
      data.procedure_id as string,
      data.step_type as StepType,
      data.step_name as string,
      (data.is_mandatory as boolean) || false,
      (data.is_completed as boolean) || false,
      (data.is_skipped as boolean) || false,
      data.skip_reason as string | undefined,
      new Date(data.visit_date as string),
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    )
  }
}

