/**
 * Patient service
 * Business logic for patient management
 */

import { IPatientRepository } from '../../infrastructure/dynamodb/repositories/IPatientRepository'
import { IUserPatientMappingRepository } from '../../infrastructure/dynamodb/repositories/IUserPatientMappingRepository'
import { Patient } from '../../domain/patient/Patient'
import { UserPatientMapping } from '../../domain/user/UserPatientMapping'
import { Gender, RelationshipType, EmergencyContact } from '../../shared/types'
import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors'
import { v4 as uuidv4 } from 'uuid'

export class PatientService {
  constructor(
    private readonly patientRepository: IPatientRepository,
    private readonly userPatientMappingRepository: IUserPatientMappingRepository
  ) {}

  /**
   * Create a new patient
   */
  async createPatient(data: {
    name: string
    date_of_birth: Date
    gender: Gender
    aadhaar_last_4: string
    emergency_contact?: EmergencyContact
    medical_history?: string
    allergies?: string
  }): Promise<Patient> {
    // Validate data
    if (!data.name || !data.date_of_birth || !data.gender || !data.aadhaar_last_4) {
      throw new ValidationError('Name, date of birth, gender, and Aadhaar last 4 are required')
    }

    // Generate patient ID
    const patient_id = uuidv4()

    // Create patient
    const patient = new Patient(
      patient_id,
      data.name,
      data.date_of_birth,
      data.gender,
      data.aadhaar_last_4,
      data.emergency_contact,
      data.medical_history,
      data.allergies
    )

    // Save to database
    return await this.patientRepository.create(patient)
  }

  /**
   * Get patient by ID
   */
  async getPatient(patient_id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(patient_id)

    if (!patient) {
      throw new NotFoundError('Patient', patient_id)
    }

    return patient
  }

  /**
   * Search patients by name
   */
  async searchPatients(
    namePrefix: string,
    limit: number = 50,
    lastKey?: string
  ) {
    return await this.patientRepository.searchByName(namePrefix, limit, lastKey)
  }

  /**
   * Update patient information
   */
  async updatePatient(
    patient_id: string,
    data: {
      name?: string
      date_of_birth?: Date
      gender?: Gender
      aadhaar_last_4?: string
      emergency_contact?: EmergencyContact
      medical_history?: string
      allergies?: string
    }
  ): Promise<Patient> {
    const patient = await this.getPatient(patient_id)

    // Update patient information
    patient.updateInfo(data)

    // Save to database
    return await this.patientRepository.update(patient)
  }

  /**
   * Link patient to user (for family relationships)
   */
  async linkPatientToUser(
    user_id: string,
    patient_id: string,
    relationship_type: RelationshipType
  ): Promise<UserPatientMapping> {
    // Check if patient exists
    await this.getPatient(patient_id)

    // Check if mapping already exists
    const existing = await this.userPatientMappingRepository.findMapping(
      user_id,
      patient_id
    )

    if (existing) {
      throw new ConflictError('Patient is already linked to this user')
    }

    // Create mapping
    const mapping = new UserPatientMapping(user_id, patient_id, relationship_type)

    return await this.userPatientMappingRepository.create(mapping)
  }

  /**
   * Unlink patient from user
   */
  async unlinkPatientFromUser(user_id: string, patient_id: string): Promise<void> {
    const mapping = await this.userPatientMappingRepository.findMapping(
      user_id,
      patient_id
    )

    if (!mapping) {
      throw new NotFoundError('Patient mapping', `${user_id}-${patient_id}`)
    }

    await this.userPatientMappingRepository.delete(user_id, patient_id)
  }

  /**
   * List all patients (for doctors/admins)
   */
  async listAllPatients(limit: number = 50, lastKey?: string) {
    return await this.patientRepository.findAll(limit, lastKey)
  }

  /**
   * Get patients linked to a user
   */
  async getLinkedPatients(user_id: string) {
    const mappings = await this.userPatientMappingRepository.findByUserId(user_id)

    // Fetch patient details for each mapping
    const patients = await Promise.all(
      mappings.items.map(async (mapping) => {
        const patient = await this.patientRepository.findById(mapping.patient_id)
        return {
          patient_id: mapping.patient_id,
          name: patient?.name || 'Unknown',
          relationship_type: mapping.relationship_type,
        }
      })
    )

    return patients
  }

  /**
   * Auto-link patient by DOB (for family relationships)
   */
  async autoLinkByDOB(
    user_id: string,
    date_of_birth: string,
    relationship_type: RelationshipType
  ): Promise<UserPatientMapping | null> {
    // Find patients with matching DOB
    const patients = await this.patientRepository.findByDOB(date_of_birth, 1)

    if (patients.items.length === 0) {
      return null
    }

    const patient = patients.items[0]

    // Check if already linked
    const existing = await this.userPatientMappingRepository.findMapping(
      user_id,
      patient.patient_id
    )

    if (existing) {
      return existing
    }

    // Create mapping
    const mapping = new UserPatientMapping(user_id, patient.patient_id, relationship_type)

    return await this.userPatientMappingRepository.create(mapping)
  }
}

