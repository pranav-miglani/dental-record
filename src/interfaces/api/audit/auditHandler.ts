/**
 * Audit handler - Audit log queries (Admin only)
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { AuditService } from '../../../application/audit/AuditService'
import { AuditLogRepository } from '../../../infrastructure/dynamodb/repositories/AuditLogRepository'
import { ValidationError, ForbiddenError } from '../../../shared/errors'
import { requireRole } from '../../../shared/rbac/rbac'
import { ActionType, ResourceType } from '../../../shared/types'

const auditService = new AuditService(new AuditLogRepository())

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new ForbiddenError('User not authenticated')
    }

    // Only admins can view audit logs
    requireRole(event.user.roles as any, ['HOSPITAL_ADMIN'])

    const method = event.httpMethod
    const path = event.path

    // GET /api/audit/logs - Query audit logs
    if (method === 'GET' && path.endsWith('/audit/logs')) {
      const user_id = event.queryStringParameters?.user_id
      const action_type = event.queryStringParameters?.action_type as ActionType | undefined
      const resource_type = event.queryStringParameters?.resource_type as ResourceType | undefined
      const resource_id = event.queryStringParameters?.resource_id
      const limit = parseInt(event.queryStringParameters?.limit || '50')
      const lastKey = event.queryStringParameters?.last_key

      if (user_id) {
        const result = await auditService.getAuditLogsByUser(user_id, limit, lastKey)
        return successResponse(result)
      }

      if (action_type) {
        const result = await auditService.getAuditLogsByAction(action_type, limit, lastKey)
        return successResponse(result)
      }

      if (resource_type && resource_id) {
        const result = await auditService.getAuditLogsByResource(
          resource_type,
          resource_id,
          limit,
          lastKey
        )
        return successResponse(result)
      }

      return errorResponse(400, 'BAD_REQUEST', 'At least one filter parameter is required')
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

