/**
 * Users handler - User management (Admin only)
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { UserService } from '../../../application/user/UserService'
import { UserRepository } from '../../../infrastructure/dynamodb/repositories/UserRepository'
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '../../../shared/errors'
import { requireRole } from '../../../shared/rbac/rbac'
import { UserRole } from '../../../shared/types'

const userService = new UserService(new UserRepository())

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new ForbiddenError('User not authenticated')
    }

    const method = event.httpMethod
    const path = event.path

    // GET /api/users/me - Get current user
    if (method === 'GET' && path.endsWith('/users/me')) {
      const currentUser = await userService.getUser(event.user.user_id)
      return successResponse(currentUser)
    }

    // GET /api/users - List users
    if (method === 'GET' && path.endsWith('/users')) {
      requireRole(event.user.roles as any, ['HOSPITAL_ADMIN'])

      const role = event.queryStringParameters?.role as UserRole | undefined
      const panel_id = event.queryStringParameters?.panel_id
      const limit = parseInt(event.queryStringParameters?.limit || '50')
      const lastKey = event.queryStringParameters?.last_key

      if (role) {
        const result = await userService.getUsersByRole(role, limit, lastKey)
        return successResponse(result)
      }

      if (panel_id) {
        const result = await userService.getUsersByPanelId(panel_id, limit, lastKey)
        return successResponse(result)
      }

      return errorResponse(400, 'BAD_REQUEST', 'Role or panel_id filter is required')
    }

    // GET /api/users/:user_id - Get user
    if (method === 'GET' && path.includes('/users/') && !path.includes('/password') && !path.includes('/block') && !path.includes('/impersonate')) {
      requireRole(event.user.roles as any, ['HOSPITAL_ADMIN'])

      const user_id = path.split('/users/')[1]?.split('/')[0]
      if (!user_id) {
        throw new ValidationError('User ID is required')
      }

      const user = await userService.getUser(user_id)
      return successResponse(user)
    }

    // POST /api/users - Create user
    if (method === 'POST' && path.endsWith('/users')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const data = JSON.parse(event.body)

      const result = await userService.createUser({
        mobile_number: data.mobile_number,
        name: data.name,
        panel_id: data.panel_id,
        department: data.department,
        roles: data.roles as UserRole[],
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

    // PUT /api/users/:user_id - Update user
    if (method === 'PUT' && path.includes('/users/') && !path.includes('/password') && !path.includes('/block')) {
      requireRole(event.user.roles as any, ['HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const user_id = path.split('/users/')[1]?.split('/')[0]
      if (!user_id) {
        throw new ValidationError('User ID is required')
      }

      const data = JSON.parse(event.body)

      const user = await userService.updateUser(user_id, {
        name: data.name,
        roles: data.roles as UserRole[],
        panel_id: data.panel_id,
        department: data.department,
      })

      return successResponse(user)
    }

    // PUT /api/users/:user_id/password - Reset password
    if (method === 'PUT' && path.includes('/users/') && path.includes('/password')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const user_id = path.split('/users/')[1]?.split('/password')[0]
      if (!user_id) {
        throw new ValidationError('User ID is required')
      }

      const data = JSON.parse(event.body)

      // Use AuthService to reset password
      const authService = new (await import('../../../application/auth/AuthService')).AuthService(
        new UserRepository()
      )
      await authService.resetPassword(user_id, data.new_password)

      return successResponse({ message: 'Password reset successfully' })
    }

    // PUT /api/users/:user_id/block - Block/unblock user
    if (method === 'PUT' && path.includes('/users/') && path.includes('/block')) {
      requireRole(event.user.roles as any, ['HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const user_id = path.split('/users/')[1]?.split('/block')[0]
      if (!user_id) {
        throw new ValidationError('User ID is required')
      }

      const data = JSON.parse(event.body)

      if (data.is_blocked) {
        const blocked_until = data.blocked_until ? new Date(data.blocked_until) : undefined
        await userService.blockUser(user_id, blocked_until)
      } else {
        await userService.unblockUser(user_id)
      }

      const user = await userService.getUser(user_id)
      return successResponse(user)
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
  if (error instanceof ConflictError) {
    return errorResponse(409, 'CONFLICT', error.message)
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

