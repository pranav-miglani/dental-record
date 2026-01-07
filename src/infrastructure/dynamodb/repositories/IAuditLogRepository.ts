/**
 * Audit log repository interface
 */

import { AuditLog } from '../../../domain/audit/AuditLog'
import { ActionType, ResourceType } from '../../../shared/types'
import { PaginatedResponse } from '../../../shared/types'

export interface IAuditLogRepository {
  /**
   * Find audit logs by user ID
   */
  findByUserId(
    user_id: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<AuditLog>>

  /**
   * Find audit logs by action type
   */
  findByActionType(
    action_type: ActionType,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<AuditLog>>

  /**
   * Find audit logs by resource
   */
  findByResource(
    resource_type: ResourceType,
    resource_id: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<AuditLog>>

  /**
   * Create audit log
   */
  create(auditLog: AuditLog): Promise<AuditLog>
}

