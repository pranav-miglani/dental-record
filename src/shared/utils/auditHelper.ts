/**
 * Audit Helper
 * Utility functions for creating audit logs
 */

import { AuditService } from '../../application/audit/AuditService'
import { AuditLogRepository } from '../../infrastructure/dynamodb/repositories/AuditLogRepository'
import { ActionType, ResourceType } from '../types'
import { AuthenticatedEvent } from '../middleware/authMiddleware'

const auditService = new AuditService(new AuditLogRepository())

/**
 * Create audit log entry
 */
export async function logAction(
  event: AuthenticatedEvent,
  actionType: ActionType,
  resourceType: ResourceType,
  resourceId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!event.user) {
    return // Skip audit if user not authenticated
  }

  try {
    await auditService.logAction({
      user_id: event.user.user_id,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: event.requestContext?.identity?.sourceIp || 'unknown',
      user_agent: event.headers['User-Agent'] || 'unknown',
      impersonated_by: event.user.impersonated_by,
      metadata,
    })
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Extract resource IDs from event path
 */
export function extractResourceIds(path: string): {
  patient_id?: string
  procedure_id?: string
  step_id?: string
  image_id?: string
  user_id?: string
} {
  const ids: {
    patient_id?: string
    procedure_id?: string
    step_id?: string
    image_id?: string
    user_id?: string
  } = {}

  // Extract patient_id
  const patientMatch = path.match(/\/patients\/([^\/]+)/)
  if (patientMatch) {
    ids.patient_id = patientMatch[1]
  }

  // Extract procedure_id
  const procedureMatch = path.match(/\/procedures\/([^\/]+)/)
  if (procedureMatch) {
    ids.procedure_id = procedureMatch[1]
  }

  // Extract step_id
  const stepMatch = path.match(/\/steps\/([^\/]+)/)
  if (stepMatch) {
    ids.step_id = stepMatch[1]
  }

  // Extract image_id
  const imageMatch = path.match(/\/images\/([^\/]+)/)
  if (imageMatch) {
    ids.image_id = imageMatch[1]
  }

  // Extract user_id
  const userMatch = path.match(/\/users\/([^\/]+)/)
  if (userMatch) {
    ids.user_id = userMatch[1]
  }

  return ids
}

