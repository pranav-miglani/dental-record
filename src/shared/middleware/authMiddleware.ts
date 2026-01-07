/**
 * Authentication middleware for API Gateway Lambda handlers
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { AuthService } from '../../application/auth/AuthService'
import { UnauthorizedError } from '../errors'

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  user?: {
    user_id: string
    mobile_number: string
    roles: string[]
    impersonated_by?: string
  }
}

/**
 * Authentication middleware
 * Extracts and validates JWT token from Authorization header
 */
export function authMiddleware(
  authService: AuthService
): (handler: (event: AuthenticatedEvent) => Promise<APIGatewayProxyResult>) => (
  event: APIGatewayProxyEvent
) => Promise<APIGatewayProxyResult> {
  return (handler) => {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      try {
        // Extract token from Authorization header
        const authHeader = event.headers.Authorization || event.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedError('Missing or invalid Authorization header')
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Verify token
        const payload = authService.verifyToken(token)

        // Attach user info to event
        const authenticatedEvent: AuthenticatedEvent = {
          ...event,
          user: {
            user_id: payload.user_id,
            mobile_number: payload.mobile_number,
            roles: payload.roles,
            impersonated_by: payload.impersonated_by,
          },
        }

        // Call handler
        return await handler(authenticatedEvent)
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return {
            statusCode: 401,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              success: false,
              error: {
                code: 'UNAUTHORIZED',
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

