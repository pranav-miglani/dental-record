/**
 * Role-Based Access Control (RBAC) utilities
 */

import { UserRole } from '../types'
import { ForbiddenError } from '../errors'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  HOSPITAL_ADMIN: 5,
  DOCTOR: 4,
  ASSISTANT: 3,
  RGHS_AGENT: 2,
  PATIENT: 1,
}

/**
 * Check if user has required role(s)
 */
export function hasRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role))
}

/**
 * Check if user has minimum role level
 */
export function hasMinimumRole(userRoles: UserRole[], minimumRole: UserRole): boolean {
  const userMaxLevel = Math.max(...userRoles.map((role) => ROLE_HIERARCHY[role]))
  const minimumLevel = ROLE_HIERARCHY[minimumRole]
  return userMaxLevel >= minimumLevel
}

/**
 * Require role or throw ForbiddenError
 */
export function requireRole(userRoles: UserRole[], requiredRoles: UserRole[]): void {
  if (!hasRole(userRoles, requiredRoles)) {
    throw new ForbiddenError(
      `Required role: ${requiredRoles.join(' or ')}, but user has: ${userRoles.join(', ')}`
    )
  }
}

/**
 * Check if user can access patient data
 * Patients can only access their own linked patients
 * Doctors, Assistants, RGHS Agents, Admins can access all patients
 */
export function canAccessPatient(
  userRoles: UserRole[],
  userId: string,
  patientUserId?: string
): boolean {
  // Admin, Doctor, Assistant, RGHS Agent can access all patients
  if (
    hasRole(userRoles, ['HOSPITAL_ADMIN', 'DOCTOR', 'ASSISTANT', 'RGHS_AGENT'])
  ) {
    return true
  }

  // Patient can only access their own linked patients
  if (userRoles.includes('PATIENT')) {
    return patientUserId === userId
  }

  return false
}

/**
 * Check if user can edit resource
 * Only Doctors, Assistants, and Admins can edit
 */
export function canEdit(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, ['HOSPITAL_ADMIN', 'DOCTOR', 'ASSISTANT'])
}

/**
 * Check if user can annotate images
 * Only Doctors can annotate
 */
export function canAnnotate(userRoles: UserRole[]): boolean {
  return userRoles.includes('DOCTOR')
}

/**
 * Check if user can view image versions
 * Only Doctors and Admins can view version history
 */
export function canViewImageVersions(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, ['HOSPITAL_ADMIN', 'DOCTOR'])
}

/**
 * Check if user can download images
 * RGHS Agents, Doctors, Assistants, Admins can download
 * Patients cannot download
 */
export function canDownloadImages(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, ['HOSPITAL_ADMIN', 'DOCTOR', 'ASSISTANT', 'RGHS_AGENT'])
}

/**
 * Check if user can view archived data
 * Only Admins and Doctors can view archived data
 */
export function canViewArchived(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, ['HOSPITAL_ADMIN', 'DOCTOR'])
}

/**
 * Check if user can impersonate
 * Only Admins can impersonate
 */
export function canImpersonate(userRoles: UserRole[]): boolean {
  return userRoles.includes('HOSPITAL_ADMIN')
}

