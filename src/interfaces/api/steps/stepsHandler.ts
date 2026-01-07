/**
 * Steps handler - Step management (update visit date, skip)
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { ProcedureStepService } from '../../../application/procedure/ProcedureStepService'
import { ProcedureStepRepository } from '../../../infrastructure/dynamodb/repositories/ProcedureStepRepository'
import { ProcedureRepository } from '../../../infrastructure/dynamodb/repositories/ProcedureRepository'
import { ValidationError, NotFoundError, ForbiddenError } from '../../../shared/errors'
import { requireRole } from '../../../shared/rbac/rbac'

const stepService = new ProcedureStepService(
  new ProcedureStepRepository(),
  new ProcedureRepository()
)

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new ForbiddenError('User not authenticated')
    }

    const method = event.httpMethod
    const path = event.path

    // GET /api/procedures/:procedure_id/steps - Get all steps
    if (method === 'GET' && path.includes('/procedures/') && path.includes('/steps') && !path.includes('/steps/')) {
      const procedure_id = path.split('/procedures/')[1]?.split('/steps')[0]
      if (!procedure_id) {
        throw new ValidationError('Procedure ID is required')
      }

      const steps = await stepService['stepRepository'].findByProcedureId(procedure_id)
      return successResponse({ steps })
    }

    // GET /api/procedures/:procedure_id/steps/:step_id - Get step
    if (method === 'GET' && path.includes('/steps/') && !path.includes('/skip') && !path.includes('/complete')) {
      const step_id = path.split('/steps/')[1]?.split('/')[0]
      if (!step_id) {
        throw new ValidationError('Step ID is required')
      }

      const step = await stepService['stepRepository'].findById(step_id)
      if (!step) {
        throw new NotFoundError('Step', step_id)
      }

      return successResponse(step)
    }

    // PUT /api/procedures/:procedure_id/steps/:step_id - Update step
    if (method === 'PUT' && path.includes('/steps/') && !path.includes('/skip') && !path.includes('/complete')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const step_id = path.split('/steps/')[1]?.split('/')[0]
      if (!step_id) {
        throw new ValidationError('Step ID is required')
      }

      const data = JSON.parse(event.body)

      if (data.visit_date) {
        const step = await stepService.updateVisitDate(step_id, new Date(data.visit_date))
        return successResponse(step)
      }

      return errorResponse(400, 'BAD_REQUEST', 'No valid update fields provided')
    }

    // POST /api/procedures/:procedure_id/steps/:step_id/complete - Complete step
    if (method === 'POST' && path.includes('/steps/') && path.includes('/complete')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      const step_id = path.split('/steps/')[1]?.split('/complete')[0]
      if (!step_id) {
        throw new ValidationError('Step ID is required')
      }

      const step = await stepService.completeStep(step_id)
      return successResponse(step)
    }

    // POST /api/procedures/:procedure_id/steps/:step_id/skip - Skip step
    if (method === 'POST' && path.includes('/steps/') && path.includes('/skip')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const step_id = path.split('/steps/')[1]?.split('/skip')[0]
      if (!step_id) {
        throw new ValidationError('Step ID is required')
      }

      const data = JSON.parse(event.body)

      if (!data.skip_reason) {
        throw new ValidationError('Skip reason is required')
      }

      const step = await stepService.skipStep(step_id, data.skip_reason)
      return successResponse(step)
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
    'OPTIONS': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }
}

