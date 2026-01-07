/**
 * Consent repository interface
 */

import { Consent } from '../../../domain/consent/Consent'
import { PaginatedResponse } from '../../../shared/types'

export interface IConsentRepository {
  /**
   * Find consent by patient ID
   */
  findByPatientId(patient_id: string): Promise<Consent | null>

  /**
   * Find consents by version
   */
  findByVersion(
    version: number,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<Consent>>

  /**
   * Create consent
   */
  create(consent: Consent): Promise<Consent>

  /**
   * Update consent
   */
  update(consent: Consent): Promise<Consent>
}

