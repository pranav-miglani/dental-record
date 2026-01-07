/**
 * RBAC middleware for API Gateway Lambda handlers
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from './authMiddleware'
import { UserRole } from '../types'
import { requireRole } from '../rbac/rbac'
import { ForbiddenError } from '../errors'

/**
 * RBAC middleware
 * Checks if user has required role(s)
 */
export function rbacMiddleware(
  requiredRoles: UserRole[]
): (handler: (event: AuthenticatedEvent) => Promise<APIGatewayProxyResult>) => (
  event: AuthenticatedEvent
) => Promise<APIGatewayProxyResult> {
  return (handler) => {
    return async (event: AuthenticatedEvent): Promise<APIGatewayProxyResult> => {
      try {
        // Check if user is authenticated
        if (!event.user) {
          throw new ForbiddenError('User not authenticated')
        }

        // Check if user has required role
        requireRole(event.user.roles as UserRole[], requiredRoles)

        // Call handler
        return await handler(event)
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return {
            statusCode: 403,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              success: false,
              error: {
                code: 'FORBIDDEN',
                message: error.message,
              },
            }),
          }
        }

        // Re-throw other errors
        throw error
      }
    }
  }
}

