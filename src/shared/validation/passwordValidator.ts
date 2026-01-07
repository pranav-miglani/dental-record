/**
 * Password Validator
 * Validates password strength
 */

import { ValidationError } from '../errors'

const MIN_PASSWORD_LENGTH = 10

/**
 * Validate password strength
 */
export function validatePassword(password: string): void {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    )
  }

  // Add more validation rules if needed
  // e.g., complexity requirements, special characters, etc.
}

