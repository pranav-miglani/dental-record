/**
 * Custom error classes for the application
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 422, details)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      404
    )
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super('CONFLICT', message, 409, details)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super('TOO_MANY_REQUESTS', message, 429)
  }
}

export class BlockedUserError extends AppError {
  constructor(message: string = 'User account is blocked') {
    super('BLOCKED', message, 403)
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid credentials') {
    super('INVALID_CREDENTIALS', message, 401)
  }
}

export class ConsentRequiredError extends AppError {
  constructor(message: string = 'Patient consent required') {
    super('CONSENT_REQUIRED', message, 403)
  }
}

