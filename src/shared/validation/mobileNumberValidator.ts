/**
 * Mobile Number Validator
 * Validates Indian mobile numbers
 */

import { ValidationError } from '../errors'

/**
 * Indian mobile number pattern: 10 digits starting with 6-9
 */
const MOBILE_NUMBER_PATTERN = /^[6-9]\d{9}$/

/**
 * Validate Indian mobile number
 */
export function validateMobileNumber(mobile_number: string): void {
  // Remove any spaces, dashes, or country code
  const cleaned = mobile_number.replace(/[\s\-+]/g, '').replace(/^91/, '')

  if (!MOBILE_NUMBER_PATTERN.test(cleaned)) {
    throw new ValidationError(
      'Invalid mobile number. Must be 10 digits starting with 6-9'
    )
  }
}

/**
 * Normalize mobile number (remove spaces, dashes, country code)
 */
export function normalizeMobileNumber(mobile_number: string): string {
  return mobile_number.replace(/[\s\-+]/g, '').replace(/^91/, '')
}

