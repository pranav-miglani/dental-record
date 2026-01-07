/**
 * Audit service
 * Business logic for audit logging
 */

import { IAuditLogRepository } from '../../infrastructure/dynamodb/repositories/IAuditLogRepository'
import { AuditLog } from '../../domain/audit/AuditLog'
import { ActionType, ResourceType } from '../../shared/types'
import { v4 as uuidv4 } from 'uuid'

export class AuditService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  /**
   * Create audit log entry
   */
  async logAction(data: {
    user_id: string
    action_type: ActionType
    resource_type: ResourceType
    resource_id: string
    patient_id?: string
    procedure_id?: string
    step_id?: string
    image_id?: string
    ip_address: string
    user_agent: string
    impersonated_by?: string
    metadata?: Record<string, unknown>
  }): Promise<AuditLog> {
    const audit_id = uuidv4()

    const auditLog = new AuditLog(
      audit_id,
      data.user_id,
      data.action_type,
      data.resource_type,
      data.resource_id,
      data.patient_id,
      data.procedure_id,
      data.step_id,
      data.image_id,
      data.ip_address,
      data.user_agent,
      data.impersonated_by,
      data.metadata,
      new Date()
    )

    return await this.auditLogRepository.create(auditLog)
  }

  /**
   * Get audit logs for a user
   */
  async getAuditLogsByUser(user_id: string, limit: number = 50, lastKey?: string) {
    return await this.auditLogRepository.findByUserId(user_id, limit, lastKey)
  }

  /**
   * Get audit logs by action type
   */
  async getAuditLogsByAction(
    action_type: ActionType,
    limit: number = 50,
    lastKey?: string
  ) {
    return await this.auditLogRepository.findByActionType(action_type, limit, lastKey)
  }

  /**
   * Get audit logs for a resource
   */
  async getAuditLogsByResource(
    resource_type: ResourceType,
    resource_id: string,
    limit: number = 50,
    lastKey?: string
  ) {
    return await this.auditLogRepository.findByResource(
      resource_type,
      resource_id,
      limit,
      lastKey
    )
  }
}

