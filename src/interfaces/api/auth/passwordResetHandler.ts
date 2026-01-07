/**
 * Password reset handler (request and verify OTP)
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { OTPService } from '../../../infrastructure/sns/OTPService'
import { AuthService } from '../../../application/auth/AuthService'
import { UserRepository } from '../../../infrastructure/dynamodb/repositories/UserRepository'
import { ValidationError, NotFoundError } from '../../../shared/errors'
import { handleError } from '../../../shared/middleware/errorHandler'

const otpService = new OTPService()

export async function requestOTPHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required')
    }

    const { mobile_number } = JSON.parse(event.body)

    if (!mobile_number) {
      throw new ValidationError('Mobile number is required')
    }

    // Verify user exists
    const userRepository = new UserRepository()
    const user = await userRepository.findByMobileNumber(mobile_number)

    if (!user) {
      throw new NotFoundError('User', mobile_number)
    }

    // Generate and send OTP
    await otpService.generateAndSendOTP(mobile_number)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: {
          message: 'OTP sent to mobile number',
        },
      }),
    }
  } catch (error) {
    return handleError(error)
  }
}

export async function verifyOTPHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required')
    }

    const { mobile_number, otp, new_password } = JSON.parse(event.body)

    if (!mobile_number || !otp || !new_password) {
      throw new ValidationError('Mobile number, OTP, and new password are required')
    }

    // Verify OTP
    const isValid = await otpService.verifyOTP(mobile_number, otp)

    if (!isValid) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_OTP',
            message: 'Invalid or expired OTP',
          },
        }),
      }
    }

    // Reset password
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)
    const user = await userRepository.findByMobileNumber(mobile_number)

    if (!user) {
      throw new NotFoundError('User', mobile_number)
    }

    await authService.resetPassword(user.user_id, new_password)

    // Clear OTP
    otpService.clearOTP(mobile_number)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: {
          message: 'Password reset successful',
        },
      }),
    }
  } catch (error) {
    return handleError(error)
  }
}
