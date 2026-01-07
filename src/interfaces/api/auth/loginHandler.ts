/**
 * Login handler - API Gateway Lambda function
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { AuthService } from '../../../application/auth/AuthService'
import { UserRepository } from '../../../infrastructure/dynamodb/repositories/UserRepository'
import { ValidationError } from '../../../shared/errors'

/**
 * Lambda handler for user login
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    // Parse request body
    if (!event.body) {
      throw new ValidationError('Request body is required')
    }

    const { mobile_number, password } = JSON.parse(event.body)

    if (!mobile_number || !password) {
      throw new ValidationError('Mobile number and password are required')
    }

    // Initialize services
    const userRepository = new UserRepository()
    const userPatientMappingRepository = new (await import('../../../infrastructure/dynamodb/repositories/UserPatientMappingRepository')).UserPatientMappingRepository()
    const patientRepository = new (await import('../../../infrastructure/dynamodb/repositories/PatientRepository')).PatientRepository()
    const authService = new AuthService(userRepository, userPatientMappingRepository, patientRepository)

    // Authenticate user
    const result = await authService.login(mobile_number, password)

    // Return success response
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
    // Handle errors
    if (error instanceof ValidationError) {
      return {
        statusCode: 422,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        }),
      }
    }

    // Default error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'An error occurred',
        },
      }),
    }
  }
}

