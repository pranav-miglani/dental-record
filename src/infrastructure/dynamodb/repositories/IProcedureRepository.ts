/**
 * Procedure repository interface
 */

import { Procedure } from '../../../domain/procedure/Procedure'
import { ProcedureStatus, ProcedureType } from '../../../shared/types'
import { PaginatedResponse } from '../../../shared/types'

export interface IProcedureRepository {
  /**
   * Find procedure by ID
   */
  findById(procedure_id: string): Promise<Procedure | null>

  /**
   * Find procedures by patient ID
   */
  findByPatientId(
    patient_id: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>>

  /**
   * Find procedures by status
   */
  findByStatus(
    status: ProcedureStatus,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>>

  /**
   * Find procedures by type
   */
  findByType(
    procedure_type: ProcedureType,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>>

  /**
   * Find procedures by assigned doctor
   */
  findByAssignedBy(
    doctor_id: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>>

  /**
   * Find archived procedures
   */
  findArchived(
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>>

  /**
   * Create procedure
   */
  create(procedure: Procedure): Promise<Procedure>

  /**
   * Update procedure
   */
  update(procedure: Procedure): Promise<Procedure>

  /**
   * Delete procedure
   */
  delete(procedure_id: string): Promise<void>

  /**
   * Count procedures by status
   */
  countByStatus(status: ProcedureStatus): Promise<number>

  /**
   * Count archived procedures
   */
  countArchived(): Promise<number>

  /**
   * Find procedures by created date (for archival)
   */
  findByCreatedBefore(cutoffDate: Date, limit?: number, lastKey?: string): Promise<PaginatedResponse<Procedure>>
}

