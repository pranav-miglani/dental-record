/**
 * Tooth Number Validator
 * Validates FDI notation for tooth numbers
 */

import { ValidationError } from '../errors'
import { ToothNumber } from '../types'

/**
 * Valid FDI tooth numbers by quadrant:
 * Upper Right: 11-18
 * Upper Left: 21-28
 * Lower Left: 31-38
 * Lower Right: 41-48
 */
const VALID_FDI_NUMBERS: Record<string, number[]> = {
  upper_right: [11, 12, 13, 14, 15, 16, 17, 18],
  upper_left: [21, 22, 23, 24, 25, 26, 27, 28],
  lower_left: [31, 32, 33, 34, 35, 36, 37, 38],
  lower_right: [41, 42, 43, 44, 45, 46, 47, 48],
}

/**
 * Validate tooth number in FDI notation
 */
export function validateToothNumber(toothNumber: ToothNumber): void {
  const toothNum = parseInt(toothNumber.tooth, 10)

  if (isNaN(toothNum)) {
    throw new ValidationError(`Invalid tooth number: ${toothNumber.tooth}`)
  }

  const validNumbers = VALID_FDI_NUMBERS[toothNumber.quadrant]

  if (!validNumbers || !validNumbers.includes(toothNum)) {
    throw new ValidationError(
      `Tooth number ${toothNum} is not valid for quadrant ${toothNumber.quadrant}`
    )
  }

  // Validate FDI notation matches
  if (toothNumber.fdi_notation !== toothNumber.tooth) {
    throw new ValidationError(
      `FDI notation ${toothNumber.fdi_notation} does not match tooth number ${toothNumber.tooth}`
    )
  }
}

/**
 * Parse tooth number string to ToothNumber object
 * Supports formats: "11", "11-12", "11,12,13"
 */
export function parseToothNumber(
  toothString: string,
  quadrant: 'upper_right' | 'upper_left' | 'lower_left' | 'lower_right'
): ToothNumber[] {
  const parts = toothString.split(/[,-]/).map((s) => s.trim())
  const toothNumbers: ToothNumber[] = []

  for (const part of parts) {
    const toothNum = parseInt(part, 10)

    if (isNaN(toothNum)) {
      throw new ValidationError(`Invalid tooth number: ${part}`)
    }

    const toothNumber: ToothNumber = {
      tooth: part,
      quadrant,
      fdi_notation: part,
    }

    validateToothNumber(toothNumber)
    toothNumbers.push(toothNumber)
  }

  return toothNumbers
}

