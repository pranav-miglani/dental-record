/**
 * Change password handler (authenticated user)
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { AuthService } from '../../../application/auth/AuthService'
import { UserRepository } from '../../../infrastructure/dynamodb/repositories/UserRepository'
import { ValidationError } from '../../../shared/errors'
import { handleError } from '../../../shared/middleware/errorHandler'

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new Error('User not authenticated')
    }

    if (!event.body) {
      throw new ValidationError('Request body is required')
    }

    const { current_password, new_password } = JSON.parse(event.body)

    if (!current_password || !new_password) {
      throw new ValidationError('Current password and new password are required')
    }

    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    await authService.changePassword(event.user.user_id, current_password, new_password)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: {
          message: 'Password changed successfully',
        },
      }),
    }
  } catch (error) {
    return handleError(error)
  }
}

