/**
 * Consent service
 * Business logic for patient consent management
 */

import { IConsentRepository } from '../../infrastructure/dynamodb/repositories/IConsentRepository'
import { IPatientRepository } from '../../infrastructure/dynamodb/repositories/IPatientRepository'
import { Consent } from '../../domain/consent/Consent'
import { Patient } from '../../domain/patient/Patient'
import { NotFoundError, ValidationError, ConsentRequiredError } from '../../shared/errors'
import { v4 as uuidv4 } from 'uuid'

// Current consent version (should be configurable in production)
const CURRENT_CONSENT_VERSION = 1

export class ConsentService {
  constructor(
    private readonly consentRepository: IConsentRepository,
    private readonly patientRepository: IPatientRepository
  ) {}

  /**
   * Get consent status for a patient
   */
  async getConsentStatus(patient_id: string): Promise<{
    consent_given: boolean
    consent_version: number
    current_consent_version: number
    needs_reconsent: boolean
    consented_at?: Date
  }> {
    const patient = await this.patientRepository.findById(patient_id)

    if (!patient) {
      throw new NotFoundError('Patient', patient_id)
    }

    const consent = await this.consentRepository.findByPatientId(patient_id)

    return {
      consent_given: patient.consent_given,
      consent_version: patient.consent_version,
      current_consent_version: CURRENT_CONSENT_VERSION,
      needs_reconsent: patient.needsReconsent(CURRENT_CONSENT_VERSION),
      consented_at: consent?.consented_at,
    }
  }

  /**
   * Give consent (patient only)
   */
  async giveConsent(data: {
    patient_id: string
    consent_version: number
    ip_address: string
    user_agent: string
  }): Promise<Consent> {
    // Validate consent version
    if (data.consent_version !== CURRENT_CONSENT_VERSION) {
      throw new ValidationError(
        `Invalid consent version. Current version is ${CURRENT_CONSENT_VERSION}`
      )
    }

    // Get patient
    const patient = await this.patientRepository.findById(data.patient_id)

    if (!patient) {
      throw new NotFoundError('Patient', data.patient_id)
    }

    // Create consent record
    const consent_id = uuidv4()
    const consent = new Consent(
      consent_id,
      data.patient_id,
      data.consent_version,
      true, // is_active
      data.ip_address,
      data.user_agent,
      new Date()
    )

    // Save consent
    await this.consentRepository.create(consent)

    // Update patient consent status
    patient.giveConsent(data.consent_version)
    await this.patientRepository.update(patient)

    return consent
  }

  /**
   * Revoke consent
   */
  async revokeConsent(patient_id: string): Promise<void> {
    const patient = await this.patientRepository.findById(patient_id)

    if (!patient) {
      throw new NotFoundError('Patient', patient_id)
    }

    // Get latest consent
    const consent = await this.consentRepository.findByPatientId(patient_id)

    if (consent) {
      consent.revoke()
      await this.consentRepository.update(consent)
    }

    // Update patient
    patient.revokeConsent()
    await this.patientRepository.update(patient)
  }

  /**
   * Check if patient has valid consent
   */
  async checkConsent(patient_id: string): Promise<boolean> {
    const status = await this.getConsentStatus(patient_id)
    return status.consent_given && !status.needs_reconsent
  }

  /**
   * Require consent or throw error
   */
  async requireConsent(patient_id: string): Promise<void> {
    const hasConsent = await this.checkConsent(patient_id)

    if (!hasConsent) {
      throw new ConsentRequiredError('Patient consent is required to access this resource')
    }
  }

  /**
   * Get all patients who need to re-consent
   */
  async getPatientsNeedingReconsent(limit: number = 50, lastKey?: string) {
    return await this.consentRepository.findByVersion(CURRENT_CONSENT_VERSION - 1, limit, lastKey)
  }
}

