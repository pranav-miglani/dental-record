/**
 * Refresh token handler
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { AuthService } from '../../../application/auth/AuthService'
import { UserRepository } from '../../../infrastructure/dynamodb/repositories/UserRepository'
import { ValidationError } from '../../../shared/errors'

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required')
    }

    const { refresh_token } = JSON.parse(event.body)

    if (!refresh_token) {
      throw new ValidationError('Refresh token is required')
    }

    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    const result = await authService.refreshToken(refresh_token)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    }
  } catch (error) {
    return {
      statusCode: error instanceof ValidationError ? 422 : 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'UNAUTHORIZED',
          message: error instanceof Error ? error.message : 'An error occurred',
        },
      }),
    }
  }
}

