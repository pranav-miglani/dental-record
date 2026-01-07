/**
 * Admin handler - Admin functions (impersonation, stats, system config)
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { UserService } from '../../../application/user/UserService'
import { UserRepository } from '../../../infrastructure/dynamodb/repositories/UserRepository'
import { ProcedureRepository } from '../../../infrastructure/dynamodb/repositories/ProcedureRepository'
import { PatientRepository } from '../../../infrastructure/dynamodb/repositories/PatientRepository'
import { ImageRepository } from '../../../infrastructure/dynamodb/repositories/ImageRepository'
import { AuthService } from '../../../application/auth/AuthService'
import { ValidationError, ForbiddenError } from '../../../shared/errors'
import { requireRole, canImpersonate } from '../../../shared/rbac/rbac'

const userService = new UserService(new UserRepository())
const authService = new AuthService(new UserRepository())

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new ForbiddenError('User not authenticated')
    }

    // Only admins can access admin endpoints
    requireRole(event.user.roles as any, ['HOSPITAL_ADMIN'])

    const method = event.httpMethod
    const path = event.path

    // GET /api/admin/stats - Get system statistics
    if (method === 'GET' && path.endsWith('/admin/stats')) {
      const userRepo = new UserRepository()
      const patientRepo = new PatientRepository()
      const procedureRepo = new ProcedureRepository()
      const imageRepo = new ImageRepository()

      // Get actual counts using count methods
      const [
        totalUsers,
        totalPatients,
        totalImages,
        activeProcedures,
        archivedProcedures,
      ] = await Promise.all([
        userRepo.countAll(),
        patientRepo.countAll(),
        imageRepo.countAll(),
        procedureRepo.countByStatus('IN_PROGRESS'),
        procedureRepo.countArchived(),
      ])

      // Count all procedures (sum of all statuses)
      const [draftCount, inProgressCount, closedCount, cancelledCount] = await Promise.all([
        procedureRepo.countByStatus('DRAFT'),
        procedureRepo.countByStatus('IN_PROGRESS'),
        procedureRepo.countByStatus('CLOSED'),
        procedureRepo.countByStatus('CANCELLED'),
      ])

      const totalProcedures = draftCount + inProgressCount + closedCount + cancelledCount

      const stats = {
        total_users: totalUsers,
        total_patients: totalPatients,
        total_procedures: totalProcedures,
        total_images: totalImages,
        active_procedures: activeProcedures,
        archived_procedures: archivedProcedures,
        procedures_by_status: {
          draft: draftCount,
          in_progress: inProgressCount,
          closed: closedCount,
          cancelled: cancelledCount,
        },
      }

      return successResponse(stats)
    }

    // POST /api/users/:user_id/impersonate - Impersonate user
    if (method === 'POST' && path.includes('/users/') && path.includes('/impersonate')) {
      if (!canImpersonate(event.user.roles as any)) {
        throw new ForbiddenError('Only admins can impersonate users')
      }

      const user_id = path.split('/users/')[1]?.split('/impersonate')[0]
      if (!user_id) {
        throw new ValidationError('User ID is required')
      }

      const user = await userService.getUser(user_id)

      // Generate impersonated token with impersonated_by in payload
      const access_token = authService.generateAccessToken(user, event.user.user_id)

      // Log impersonation action
      const { AuditService } = await import('../../../application/audit/AuditService')
      const { AuditLogRepository } = await import('../../../infrastructure/dynamodb/repositories/AuditLogRepository')
      const auditService = new AuditService(new AuditLogRepository())
      
      await auditService.logAction({
        user_id: event.user.user_id,
        action_type: 'USER_IMPERSONATE',
        resource_type: 'USER',
        resource_id: user_id,
        ip_address: event.requestContext?.identity?.sourceIp || 'unknown',
        user_agent: event.headers['User-Agent'] || 'unknown',
        metadata: {
          impersonated_user_id: user_id,
          impersonated_user_mobile: user.mobile_number,
        },
      })

      return successResponse({
        access_token,
        user,
        impersonated_by: event.user.user_id,
      })
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

