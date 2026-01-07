/**
 * Error handler middleware
 * Centralized error handling for Lambda handlers
 */

import { APIGatewayProxyResult } from 'aws-lambda'
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  BlockedUserError,
  InvalidCredentialsError,
  ConsentRequiredError,
} from '../errors'

export function handleError(error: unknown): APIGatewayProxyResult {
  // Handle known error types
  if (error instanceof ValidationError) {
    return errorResponse(422, 'VALIDATION_ERROR', error.message, error.details)
  }

  if (error instanceof NotFoundError) {
    return errorResponse(404, 'NOT_FOUND', error.message)
  }

  if (error instanceof UnauthorizedError) {
    return errorResponse(401, 'UNAUTHORIZED', error.message)
  }

  if (error instanceof ForbiddenError) {
    return errorResponse(403, 'FORBIDDEN', error.message)
  }

  if (error instanceof ConflictError) {
    return errorResponse(409, 'CONFLICT', error.message, error.details)
  }

  if (error instanceof RateLimitError) {
    return errorResponse(429, 'TOO_MANY_REQUESTS', error.message)
  }

  if (error instanceof BlockedUserError) {
    return errorResponse(403, 'BLOCKED', error.message)
  }

  if (error instanceof InvalidCredentialsError) {
    return errorResponse(401, 'INVALID_CREDENTIALS', error.message)
  }

  if (error instanceof ConsentRequiredError) {
    return errorResponse(403, 'CONSENT_REQUIRED', error.message)
  }

  if (error instanceof AppError) {
    return errorResponse(
      error.statusCode,
      error.code,
      error.message,
      error.details
    )
  }

  // Handle unknown errors
  console.error('Unhandled error:', error)
  return errorResponse(
    500,
    'INTERNAL_SERVER_ERROR',
    error instanceof Error ? error.message : 'An unexpected error occurred'
  )
}

function errorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    }),
  }
}

