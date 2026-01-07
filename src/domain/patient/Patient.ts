/**
 * Patient domain model
 * Represents a dental patient
 */

import { Gender, EmergencyContact } from '../../shared/types'

export class Patient {
  constructor(
    public readonly patient_id: string,
    public name: string,
    public date_of_birth: Date,
    public gender: Gender,
    public aadhaar_last_4: string,
    public emergency_contact?: EmergencyContact,
    public medical_history?: string,
    public allergies?: string,
    public consent_given: boolean = false,
    public consent_version: number = 0,
    public readonly created_at: Date = new Date(),
    public updated_at: Date = new Date()
  ) {}

  /**
   * Check if patient has given consent
   */
  hasConsent(): boolean {
    return this.consent_given
  }

  /**
   * Check if consent needs to be re-captured (version mismatch)
   */
  needsReconsent(currentConsentVersion: number): boolean {
    return !this.consent_given || this.consent_version < currentConsentVersion
  }

  /**
   * Give consent
   */
  giveConsent(version: number): void {
    this.consent_given = true
    this.consent_version = version
    this.updated_at = new Date()
  }

  /**
   * Revoke consent
   */
  revokeConsent(): void {
    this.consent_given = false
    this.updated_at = new Date()
  }

  /**
   * Update patient information
   */
  updateInfo(data: {
    name?: string
    date_of_birth?: Date
    gender?: Gender
    aadhaar_last_4?: string
    emergency_contact?: EmergencyContact
    medical_history?: string
    allergies?: string
  }): void {
    if (data.name !== undefined) {
      this.name = data.name
    }
    if (data.date_of_birth !== undefined) {
      this.date_of_birth = data.date_of_birth
    }
    if (data.gender !== undefined) {
      this.gender = data.gender
    }
    if (data.aadhaar_last_4 !== undefined) {
      this.aadhaar_last_4 = data.aadhaar_last_4
    }
    if (data.emergency_contact !== undefined) {
      this.emergency_contact = data.emergency_contact
    }
    if (data.medical_history !== undefined) {
      this.medical_history = data.medical_history
    }
    if (data.allergies !== undefined) {
      this.allergies = data.allergies
    }
    this.updated_at = new Date()
  }

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): Record<string, unknown> {
    return {
      patient_id: this.patient_id,
      name: this.name,
      date_of_birth: this.date_of_birth.toISOString().split('T')[0], // YYYY-MM-DD format
      gender: this.gender,
      aadhaar_last_4: this.aadhaar_last_4,
      emergency_contact: this.emergency_contact,
      medical_history: this.medical_history,
      allergies: this.allergies,
      consent_given: this.consent_given,
      consent_version: this.consent_version,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    }
  }

  /**
   * Create Patient from plain object
   */
  static fromPlainObject(data: Record<string, unknown>): Patient {
    return new Patient(
      data.patient_id as string,
      data.name as string,
      new Date(data.date_of_birth as string),
      data.gender as Gender,
      data.aadhaar_last_4 as string,
      data.emergency_contact as EmergencyContact | undefined,
      data.medical_history as string | undefined,
      data.allergies as string | undefined,
      (data.consent_given as boolean) || false,
      (data.consent_version as number) || 0,
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    )
  }
}

