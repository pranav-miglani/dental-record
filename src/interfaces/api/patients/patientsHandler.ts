/**
 * Patients handler - CRUD operations for patients
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { PatientService } from '../../../application/patient/PatientService'
import { PatientRepository } from '../../../infrastructure/dynamodb/repositories/PatientRepository'
import { UserPatientMappingRepository } from '../../../infrastructure/dynamodb/repositories/UserPatientMappingRepository'
import { ValidationError, NotFoundError, ForbiddenError } from '../../../shared/errors'
import { canAccessPatient } from '../../../shared/rbac/rbac'
import { Gender, RelationshipType } from '../../../shared/types'

const patientService = new PatientService(
  new PatientRepository(),
  new UserPatientMappingRepository()
)

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new ForbiddenError('User not authenticated')
    }

    const method = event.httpMethod
    const path = event.path

    // GET /api/patients - List patients
    if (method === 'GET' && path.endsWith('/patients')) {
      const search = event.queryStringParameters?.search
      const limit = parseInt(event.queryStringParameters?.limit || '50')
      const lastKey = event.queryStringParameters?.last_key

      if (search) {
        const result = await patientService.searchPatients(search, limit, lastKey)
        return successResponse(result)
      }

      // For patients, return only their linked patients
      if (event.user.roles.includes('PATIENT')) {
        const linkedPatients = await patientService.getLinkedPatients(event.user.user_id)
        return successResponse({ patients: linkedPatients, count: linkedPatients.length })
      }

      // For doctors/assistants/admins, return all patients (paginated)
      const result = await patientService.listAllPatients(limit, lastKey)
      return successResponse({ patients: result.items, count: result.count, last_key: result.last_key })
    }

    // GET /api/patients/:patient_id - Get patient
    if (method === 'GET' && path.includes('/patients/')) {
      const patient_id = path.split('/patients/')[1]?.split('/')[0]

      if (!patient_id) {
        throw new ValidationError('Patient ID is required')
      }

      // Check access
      if (!canAccessPatient(event.user.roles as any, event.user.user_id, patient_id)) {
        throw new ForbiddenError('Access denied')
      }

      const patient = await patientService.getPatient(patient_id)
      return successResponse(patient)
    }

    // POST /api/patients - Create patient
    if (method === 'POST' && path.endsWith('/patients')) {
      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const data = JSON.parse(event.body)

      const patient = await patientService.createPatient({
        name: data.name,
        date_of_birth: new Date(data.date_of_birth),
        gender: data.gender as Gender,
        aadhaar_last_4: data.aadhaar_last_4,
        emergency_contact: data.emergency_contact,
        medical_history: data.medical_history,
        allergies: data.allergies,
      })

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: true,
          data: patient,
        }),
      }
    }

    // PUT /api/patients/:patient_id - Update patient
    if (method === 'PUT' && path.includes('/patients/')) {
      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const patient_id = path.split('/patients/')[1]?.split('/')[0]
      if (!patient_id) {
        throw new ValidationError('Patient ID is required')
      }

      const data = JSON.parse(event.body)

      const patient = await patientService.updatePatient(patient_id, {
        name: data.name,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        gender: data.gender as Gender,
        aadhaar_last_4: data.aadhaar_last_4,
        emergency_contact: data.emergency_contact,
        medical_history: data.medical_history,
        allergies: data.allergies,
      })

      return successResponse(patient)
    }

    // POST /api/patients/:patient_id/link - Link patient to user
    if (method === 'POST' && path.includes('/patients/') && path.includes('/link')) {
      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const patient_id = path.split('/patients/')[1]?.split('/link')[0]
      if (!patient_id) {
        throw new ValidationError('Patient ID is required')
      }

      const data = JSON.parse(event.body)
      const user_id = data.user_id || event.user.user_id

      const mapping = await patientService.linkPatientToUser(
        user_id,
        patient_id,
        data.relationship_type as RelationshipType
      )

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: true,
          data: mapping,
        }),
      }
    }

    return errorResponse(404, 'NOT_FOUND', 'Endpoint not found')
  } catch (error) {
    return handleError(error)
  }
}

function successResponse(data: any): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: true,
      data,
    }),
  }
}

function errorResponse(
  statusCode: number,
  code: string,
  message: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: false,
      error: { code, message },
    }),
  }
}

function handleError(error: unknown): APIGatewayProxyResult {
  if (error instanceof ValidationError) {
    return errorResponse(422, 'VALIDATION_ERROR', error.message)
  }
  if (error instanceof NotFoundError) {
    return errorResponse(404, 'NOT_FOUND', error.message)
  }
  if (error instanceof ForbiddenError) {
    return errorResponse(403, 'FORBIDDEN', error.message)
  }

  return errorResponse(
    500,
    'INTERNAL_SERVER_ERROR',
    error instanceof Error ? error.message : 'An error occurred'
  )
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }
}

