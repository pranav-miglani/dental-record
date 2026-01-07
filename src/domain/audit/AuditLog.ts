/**
 * AuditLog domain model
 * Represents system audit trail entry
 */

import { ActionType, ResourceType } from '../../shared/types'

export class AuditLog {
  constructor(
    public readonly audit_id: string,
    public user_id: string,
    public action_type: ActionType,
    public resource_type: ResourceType,
    public resource_id: string,
    public patient_id?: string,
    public procedure_id?: string,
    public step_id?: string,
    public image_id?: string,
    public ip_address: string,
    public user_agent: string,
    public impersonated_by?: string,
    public metadata?: Record<string, unknown>,
    public timestamp: Date = new Date(),
    public readonly created_at: Date = new Date()
  ) {}

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): Record<string, unknown> {
    return {
      audit_id: this.audit_id,
      user_id: this.user_id,
      action_type: this.action_type,
      resource_type: this.resource_type,
      resource_id: this.resource_id,
      patient_id: this.patient_id,
      procedure_id: this.procedure_id,
      step_id: this.step_id,
      image_id: this.image_id,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      impersonated_by: this.impersonated_by,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
      created_at: this.created_at.toISOString(),
    }
  }

  /**
   * Create AuditLog from plain object
   */
  static fromPlainObject(data: Record<string, unknown>): AuditLog {
    return new AuditLog(
      data.audit_id as string,
      data.user_id as string,
      data.action_type as ActionType,
      data.resource_type as ResourceType,
      data.resource_id as string,
      data.patient_id as string | undefined,
      data.procedure_id as string | undefined,
      data.step_id as string | undefined,
      data.image_id as string | undefined,
      data.ip_address as string,
      data.user_agent as string,
      data.impersonated_by as string | undefined,
      data.metadata as Record<string, unknown> | undefined,
      new Date(data.timestamp as string),
      new Date(data.created_at as string)
    )
  }
}

