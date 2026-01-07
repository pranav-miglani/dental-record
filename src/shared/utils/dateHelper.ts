/**
 * Date Helper
 * Utility functions for date operations
 */

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Parse date from YYYY-MM-DD
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00Z')
}

/**
 * Get date 3 years ago (for archival)
 */
export function getArchivalCutoffDate(): Date {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 3)
  return date
}

/**
 * Get year-month string (YYYY-MM) for archival folder structure
 */
export function getYearMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

