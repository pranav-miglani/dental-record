/**
 * Patient repository interface
 */

import { Patient } from '../../../domain/patient/Patient'
import { PaginatedResponse } from '../../../shared/types'

export interface IPatientRepository {
  /**
   * Find patient by ID
   */
  findById(patient_id: string): Promise<Patient | null>

  /**
   * Find patients by DOB (for auto-linking)
   */
  findByDOB(date_of_birth: string, limit?: number, lastKey?: string): Promise<PaginatedResponse<Patient>>

  /**
   * Search patients by name (fuzzy search)
   */
  searchByName(namePrefix: string, limit?: number, lastKey?: string): Promise<PaginatedResponse<Patient>>

  /**
   * List all patients (for doctors/admins)
   */
  findAll(limit?: number, lastKey?: string): Promise<PaginatedResponse<Patient>>

  /**
   * Create patient
   */
  create(patient: Patient): Promise<Patient>

  /**
   * Update patient
   */
  update(patient: Patient): Promise<Patient>

  /**
   * Delete patient (soft delete or hard delete)
   */
  delete(patient_id: string): Promise<void>

  /**
   * Count all patients
   */
  countAll(): Promise<number>
}

