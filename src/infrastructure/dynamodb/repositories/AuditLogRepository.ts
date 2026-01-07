/**
 * Audit log repository - DynamoDB implementation
 */

import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import { docClient, TABLES } from '../client'
import { IAuditLogRepository } from './IAuditLogRepository'
import { AuditLog } from '../../../domain/audit/AuditLog'
import { ActionType, ResourceType } from '../../../shared/types'
import { PaginatedResponse } from '../../../shared/types'

export class AuditLogRepository implements IAuditLogRepository {
  private readonly tableName = TABLES.AUDIT_LOGS

  async findByUserId(
    user_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<AuditLog>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'user-audit-index',
      KeyConditionExpression: 'GSI1PK = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: `USER#${user_id}` },
      },
      ScanIndexForward: false, // Latest first
      Limit: limit,
      ExclusiveStartKey: lastKey
        ? (JSON.parse(Buffer.from(lastKey, 'base64').toString()) as Record<
            string,
            unknown
          >)
        : undefined,
    })

    const response = await docClient.send(command)

    const logs =
      response.Items?.map((item) =>
        AuditLog.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: logs,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: logs.length,
    }
  }

  async findByActionType(
    action_type: ActionType,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<AuditLog>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'action-type-index',
      KeyConditionExpression: 'GSI2PK = :actionType',
      ExpressionAttributeValues: {
        ':actionType': { S: `ACTION#${action_type}` },
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastKey
        ? (JSON.parse(Buffer.from(lastKey, 'base64').toString()) as Record<
            string,
            unknown
          >)
        : undefined,
    })

    const response = await docClient.send(command)

    const logs =
      response.Items?.map((item) =>
        AuditLog.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: logs,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: logs.length,
    }
  }

  async findByResource(
    resource_type: ResourceType,
    resource_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<AuditLog>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'resource-index',
      KeyConditionExpression: 'GSI3PK = :resource',
      ExpressionAttributeValues: {
        ':resource': { S: `RESOURCE#${resource_type}#RESOURCE_ID#${resource_id}` },
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastKey
        ? (JSON.parse(Buffer.from(lastKey, 'base64').toString()) as Record<
            string,
            unknown
          >)
        : undefined,
    })

    const response = await docClient.send(command)

    const logs =
      response.Items?.map((item) =>
        AuditLog.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: logs,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: logs.length,
    }
  }

  async create(auditLog: AuditLog): Promise<AuditLog> {
    const plainObject = auditLog.toPlainObject()
    const timestamp = auditLog.timestamp.toISOString()

    const item = {
      PK: `AUDIT#${auditLog.audit_id}`,
      SK: `TIMESTAMP#${timestamp}`,
      GSI1PK: `USER#${auditLog.user_id}`,
      GSI1SK: `TIMESTAMP#${timestamp}#AUDIT#${auditLog.audit_id}`,
      GSI2PK: `ACTION#${auditLog.action_type}`,
      GSI2SK: `TIMESTAMP#${timestamp}#AUDIT#${auditLog.audit_id}`,
      GSI3PK: `RESOURCE#${auditLog.resource_type}#RESOURCE_ID#${auditLog.resource_id}`,
      GSI3SK: `TIMESTAMP#${timestamp}#AUDIT#${auditLog.audit_id}`,
      ...plainObject,
    }

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item as Record<string, unknown>,
    })

    await docClient.send(command)

    return auditLog
  }
}

