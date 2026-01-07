/**
 * User-Patient mapping repository interface
 */

import { UserPatientMapping } from '../../../domain/user/UserPatientMapping'
import { PaginatedResponse } from '../../../shared/types'

export interface IUserPatientMappingRepository {
  /**
   * Find patients linked to a user
   */
  findByUserId(
    user_id: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<UserPatientMapping>>

  /**
   * Find users linked to a patient
   */
  findByPatientId(
    patient_id: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<UserPatientMapping>>

  /**
   * Find specific mapping
   */
  findMapping(user_id: string, patient_id: string): Promise<UserPatientMapping | null>

  /**
   * Create mapping
   */
  create(mapping: UserPatientMapping): Promise<UserPatientMapping>

  /**
   * Update mapping
   */
  update(mapping: UserPatientMapping): Promise<UserPatientMapping>

  /**
   * Delete mapping
   */
  delete(user_id: string, patient_id: string): Promise<void>
}

