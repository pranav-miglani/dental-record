/**
 * Procedures handler - CRUD operations for procedures
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { ProcedureService } from '../../../application/procedure/ProcedureService'
import { ProcedureRepository } from '../../../infrastructure/dynamodb/repositories/ProcedureRepository'
import { ProcedureStepRepository } from '../../../infrastructure/dynamodb/repositories/ProcedureStepRepository'
import { ValidationError, NotFoundError, ForbiddenError } from '../../../shared/errors'
import { requireRole } from '../../../shared/rbac/rbac'
import { ProcedureType, ProcedureStatus, ToothNumber } from '../../../shared/types'

const procedureService = new ProcedureService(
  new ProcedureRepository(),
  new ProcedureStepRepository()
)

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new ForbiddenError('User not authenticated')
    }

    const method = event.httpMethod
    const path = event.path

    // GET /api/procedures - List procedures with filters
    if (method === 'GET' && path.endsWith('/procedures')) {
      const patient_id = event.queryStringParameters?.patient_id
      const status = event.queryStringParameters?.status as ProcedureStatus | undefined
      const procedure_type = event.queryStringParameters?.procedure_type as ProcedureType | undefined
      const assigned_by = event.queryStringParameters?.assigned_by
      const limit = parseInt(event.queryStringParameters?.limit || '50')
      const lastKey = event.queryStringParameters?.last_key

      if (patient_id) {
        const result = await procedureService.getProceduresByPatient(patient_id, limit, lastKey)
        return successResponse(result)
      }

      // Get procedures by status, type, or assigned_by
      if (status) {
        const result = await procedureService['procedureRepository'].findByStatus(status, limit, lastKey)
        return successResponse(result)
      }

      if (procedure_type) {
        const result = await procedureService['procedureRepository'].findByType(procedure_type, limit, lastKey)
        return successResponse(result)
      }

      if (assigned_by) {
        const result = await procedureService['procedureRepository'].findByAssignedBy(assigned_by, limit, lastKey)
        return successResponse(result)
      }

      return errorResponse(400, 'BAD_REQUEST', 'At least one filter parameter is required')
    }

    // GET /api/procedures/:procedure_id - Get procedure with steps
    if (method === 'GET' && path.includes('/procedures/') && !path.includes('/confirm') && !path.includes('/close') && !path.includes('/cancel')) {
      const procedure_id = path.split('/procedures/')[1]?.split('/')[0]

      if (!procedure_id) {
        throw new ValidationError('Procedure ID is required')
      }

      const result = await procedureService.getProcedure(procedure_id)
      return successResponse(result)
    }

    // POST /api/procedures - Create procedure
    if (method === 'POST' && path.endsWith('/procedures')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const data = JSON.parse(event.body)

      const result = await procedureService.createProcedure({
        patient_id: data.patient_id,
        procedure_type: data.procedure_type as ProcedureType,
        procedure_name: data.procedure_name,
        procedure_description: data.procedure_description,
        tooth_number: data.tooth_number as ToothNumber,
        assigned_by: event.user.user_id,
        diagnosis_notes: data.diagnosis_notes,
      })

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: true,
          data: result,
        }),
      }
    }

    // PUT /api/procedures/:procedure_id/confirm - Confirm procedure
    if (method === 'PUT' && path.includes('/procedures/') && path.includes('/confirm')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'HOSPITAL_ADMIN'])

      const procedure_id = path.split('/procedures/')[1]?.split('/confirm')[0]
      if (!procedure_id) {
        throw new ValidationError('Procedure ID is required')
      }

      const procedure = await procedureService.confirmProcedure(procedure_id, event.user.user_id)
      return successResponse(procedure)
    }

    // PUT /api/procedures/:procedure_id - Update procedure
    if (method === 'PUT' && path.includes('/procedures/') && !path.includes('/confirm') && !path.includes('/close') && !path.includes('/cancel')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const procedure_id = path.split('/procedures/')[1]?.split('/')[0]
      if (!procedure_id) {
        throw new ValidationError('Procedure ID is required')
      }

      const data = JSON.parse(event.body)

      const procedure = await procedureService.updateProcedure(procedure_id, {
        procedure_name: data.procedure_name,
        procedure_description: data.procedure_description,
        tooth_number: data.tooth_number as ToothNumber,
      })

      return successResponse(procedure)
    }

    // PUT /api/procedures/:procedure_id/close - Close procedure
    if (method === 'PUT' && path.includes('/procedures/') && path.includes('/close')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'HOSPITAL_ADMIN'])

      const procedure_id = path.split('/procedures/')[1]?.split('/close')[0]
      if (!procedure_id) {
        throw new ValidationError('Procedure ID is required')
      }

      const procedure = await procedureService.closeProcedure(procedure_id)
      return successResponse(procedure)
    }

    // PUT /api/procedures/:procedure_id/cancel - Cancel procedure
    if (method === 'PUT' && path.includes('/procedures/') && path.includes('/cancel')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const procedure_id = path.split('/procedures/')[1]?.split('/cancel')[0]
      if (!procedure_id) {
        throw new ValidationError('Procedure ID is required')
      }

      const data = JSON.parse(event.body)

      const procedure = await procedureService.cancelProcedure(procedure_id, data.reason)
      return successResponse(procedure)
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

