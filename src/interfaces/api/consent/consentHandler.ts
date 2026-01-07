/**
 * Consent handler - Patient consent management
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { ConsentService } from '../../../application/consent/ConsentService'
import { ConsentRepository } from '../../../infrastructure/dynamodb/repositories/ConsentRepository'
import { PatientRepository } from '../../../infrastructure/dynamodb/repositories/PatientRepository'
import { ValidationError, NotFoundError, ConsentRequiredError } from '../../../shared/errors'
import { requireRole } from '../../../shared/rbac/rbac'

const consentService = new ConsentService(
  new ConsentRepository(),
  new PatientRepository()
)

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new Error('User not authenticated')
    }

    const method = event.httpMethod
    const path = event.path

    // GET /api/patients/:patient_id/consent - Get consent status
    if (method === 'GET' && path.includes('/patients/') && path.includes('/consent')) {
      const patient_id = path.split('/patients/')[1]?.split('/consent')[0]
      if (!patient_id) {
        throw new ValidationError('Patient ID is required')
      }

      const status = await consentService.getConsentStatus(patient_id)
      return successResponse(status)
    }

    // POST /api/patients/:patient_id/consent - Give consent
    if (method === 'POST' && path.includes('/patients/') && path.includes('/consent')) {
      // Only patients can give consent
      requireRole(event.user.roles as any, ['PATIENT'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const patient_id = path.split('/patients/')[1]?.split('/consent')[0]
      if (!patient_id) {
        throw new ValidationError('Patient ID is required')
      }

      const data = JSON.parse(event.body)

      const consent = await consentService.giveConsent({
        patient_id,
        consent_version: data.consent_version,
        ip_address: event.requestContext.identity.sourceIp || 'unknown',
        user_agent: event.headers['User-Agent'] || 'unknown',
      })

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: true,
          data: consent,
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
  if (error instanceof ConsentRequiredError) {
    return errorResponse(403, 'CONSENT_REQUIRED', error.message)
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

