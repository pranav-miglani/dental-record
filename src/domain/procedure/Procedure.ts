/**
 * Procedure domain model
 * Represents a dental procedure (RCT, Scaling, Extraction)
 */

import { ProcedureType, ProcedureStatus, ToothNumber } from '../../shared/types'

export class Procedure {
  constructor(
    public readonly procedure_id: string,
    public readonly patient_id: string,
    public procedure_type: ProcedureType,
    public status: ProcedureStatus,
    public procedure_name: string,
    public procedure_description?: string,
    public tooth_number?: ToothNumber,
    public assigned_by: string,
    public assigned_date: Date,
    public start_date?: Date,
    public end_date?: Date,
    public is_backfilled: boolean = false,
    public archived: boolean = false,
    public archive_location?: string,
    public readonly created_at: Date = new Date(),
    public updated_at: Date = new Date(),
    public last_modified: Date = new Date()
  ) {}

  /**
   * Confirm procedure (DRAFT → IN_PROGRESS)
   */
  confirm(): void {
    if (this.status !== 'DRAFT') {
      throw new Error('Only DRAFT procedures can be confirmed')
    }
    this.status = 'IN_PROGRESS'
    this.start_date = this.start_date || new Date()
    this.updated_at = new Date()
    this.last_modified = new Date()
  }

  /**
   * Close procedure (when all mandatory steps completed)
   */
  close(): void {
    if (this.status === 'CANCELLED') {
      throw new Error('Cannot close a cancelled procedure')
    }
    this.status = 'CLOSED'
    this.end_date = this.end_date || new Date()
    this.updated_at = new Date()
    this.last_modified = new Date()
  }

  /**
   * Cancel procedure
   */
  cancel(reason?: string): void {
    if (this.status === 'CLOSED') {
      throw new Error('Cannot cancel a closed procedure')
    }
    this.status = 'CANCELLED'
    this.end_date = this.end_date || new Date()
    this.updated_at = new Date()
    this.last_modified = new Date()
  }

  /**
   * Check if procedure is active (not closed or cancelled)
   */
  isActive(): boolean {
    return this.status === 'DRAFT' || this.status === 'IN_PROGRESS'
  }

  /**
   * Check if procedure can be modified
   */
  canBeModified(): boolean {
    return this.status !== 'CANCELLED'
  }

  /**
   * Mark as archived
   */
  archive(archiveLocation: string): void {
    this.archived = true
    this.archive_location = archiveLocation
    this.updated_at = new Date()
    this.last_modified = new Date()
  }

  /**
   * Update procedure information
   */
  updateInfo(data: {
    procedure_name?: string
    procedure_description?: string
    tooth_number?: ToothNumber
  }): void {
    if (data.procedure_name !== undefined) {
      this.procedure_name = data.procedure_name
    }
    if (data.procedure_description !== undefined) {
      this.procedure_description = data.procedure_description
    }
    if (data.tooth_number !== undefined) {
      this.tooth_number = data.tooth_number
    }
    this.updated_at = new Date()
    this.last_modified = new Date()
  }

  /**
   * Update last modified timestamp
   */
  touch(): void {
    this.last_modified = new Date()
    this.updated_at = new Date()
  }

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): Record<string, unknown> {
    return {
      procedure_id: this.procedure_id,
      patient_id: this.patient_id,
      procedure_type: this.procedure_type,
      status: this.status,
      procedure_name: this.procedure_name,
      procedure_description: this.procedure_description,
      tooth_number: this.tooth_number,
      assigned_by: this.assigned_by,
      assigned_date: this.assigned_date.toISOString(),
      start_date: this.start_date?.toISOString(),
      end_date: this.end_date?.toISOString(),
      is_backfilled: this.is_backfilled,
      archived: this.archived,
      archive_location: this.archive_location,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
      last_modified: this.last_modified.toISOString(),
    }
  }

  /**
   * Create Procedure from plain object
   */
  static fromPlainObject(data: Record<string, unknown>): Procedure {
    return new Procedure(
      data.procedure_id as string,
      data.patient_id as string,
      data.procedure_type as ProcedureType,
      data.status as ProcedureStatus,
      data.procedure_name as string,
      data.procedure_description as string | undefined,
      data.tooth_number as ToothNumber | undefined,
      data.assigned_by as string,
      new Date(data.assigned_date as string),
      data.start_date ? new Date(data.start_date as string) : undefined,
      data.end_date ? new Date(data.end_date as string) : undefined,
      (data.is_backfilled as boolean) || false,
      (data.archived as boolean) || false,
      data.archive_location as string | undefined,
      new Date(data.created_at as string),
      new Date(data.updated_at as string),
      new Date(data.last_modified as string)
    )
  }
}

