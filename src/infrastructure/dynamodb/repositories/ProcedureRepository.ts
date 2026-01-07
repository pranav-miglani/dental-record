/**
 * Procedure repository - DynamoDB implementation
 */

import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { docClient, TABLES } from '../client'
import { IProcedureRepository } from './IProcedureRepository'
import { Procedure } from '../../../domain/procedure/Procedure'
import { ProcedureStatus, ProcedureType } from '../../../shared/types'
import { PaginatedResponse } from '../../../shared/types'

export class ProcedureRepository implements IProcedureRepository {
  private readonly tableName = TABLES.PROCEDURES

  async findById(procedure_id: string): Promise<Procedure | null> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `PROCEDURE#${procedure_id}` },
        SK: { S: `PROCEDURE#${procedure_id}` },
      },
    })

    const response = await docClient.send(command)

    if (!response.Item) {
      return null
    }

    return Procedure.fromPlainObject(response.Item as Record<string, unknown>)
  }

  async findByPatientId(
    patient_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'patient-index',
      KeyConditionExpression: 'GSI1PK = :patient',
      ExpressionAttributeValues: {
        ':patient': { S: `PATIENT#${patient_id}` },
      },
      ScanIndexForward: false, // Sort by timestamp DESC
      Limit: limit,
      ExclusiveStartKey: lastKey
        ? (JSON.parse(Buffer.from(lastKey, 'base64').toString()) as Record<
            string,
            unknown
          >)
        : undefined,
    })

    const response = await docClient.send(command)

    const procedures =
      response.Items?.map((item) =>
        Procedure.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: procedures,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: procedures.length,
    }
  }

  async findByStatus(
    status: ProcedureStatus,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'status-index',
      KeyConditionExpression: 'GSI2PK = :status',
      ExpressionAttributeValues: {
        ':status': { S: `STATUS#${status}` },
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

    const procedures =
      response.Items?.map((item) =>
        Procedure.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: procedures,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: procedures.length,
    }
  }

  async findByType(
    procedure_type: ProcedureType,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'type-index',
      KeyConditionExpression: 'GSI3PK = :type',
      ExpressionAttributeValues: {
        ':type': { S: `TYPE#${procedure_type}` },
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

    const procedures =
      response.Items?.map((item) =>
        Procedure.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: procedures,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: procedures.length,
    }
  }

  async findByAssignedBy(
    doctor_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'assigned-by-index',
      KeyConditionExpression: 'GSI4PK = :doctor',
      ExpressionAttributeValues: {
        ':doctor': { S: `DOCTOR#${doctor_id}` },
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

    const procedures =
      response.Items?.map((item) =>
        Procedure.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: procedures,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: procedures.length,
    }
  }

  async findArchived(
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'archive-index',
      KeyConditionExpression: 'GSI5PK = :archived',
      ExpressionAttributeValues: {
        ':archived': { S: 'ARCHIVED#true' },
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

    const procedures =
      response.Items?.map((item) =>
        Procedure.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: procedures,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: procedures.length,
    }
  }

  async create(procedure: Procedure): Promise<Procedure> {
    const plainObject = procedure.toPlainObject()
    const timestamp = procedure.created_at.toISOString()
    const lastModified = procedure.last_modified.toISOString()

    const item = {
      PK: `PROCEDURE#${procedure.procedure_id}`,
      SK: `PROCEDURE#${procedure.procedure_id}`,
      GSI1PK: `PATIENT#${procedure.patient_id}`,
      GSI1SK: `PROCEDURE#${procedure.procedure_id}#${timestamp}`,
      GSI2PK: `STATUS#${procedure.status}`,
      GSI2SK: `PROCEDURE#${procedure.procedure_id}#${lastModified}`,
      GSI3PK: `TYPE#${procedure.procedure_type}`,
      GSI3SK: `PROCEDURE#${procedure.procedure_id}#${lastModified}`,
      GSI4PK: `DOCTOR#${procedure.assigned_by}`,
      GSI4SK: `PROCEDURE#${procedure.procedure_id}#${procedure.assigned_date.toISOString()}`,
      GSI5PK: procedure.archived ? 'ARCHIVED#true' : 'ARCHIVED#false',
      GSI5SK: procedure.archived
        ? `PROCEDURE#${procedure.procedure_id}#${new Date().toISOString()}`
        : undefined,
      ...plainObject,
    }

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item as Record<string, unknown>,
    })

    await docClient.send(command)

    return procedure
  }

  async update(procedure: Procedure): Promise<Procedure> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    const plainObject = procedure.toPlainObject()
    Object.keys(plainObject).forEach((key, index) => {
      if (
        key !== 'procedure_id' &&
        key !== 'PK' &&
        key !== 'SK' &&
        key !== 'GSI1PK' &&
        key !== 'GSI1SK' &&
        key !== 'GSI2PK' &&
        key !== 'GSI2SK' &&
        key !== 'GSI3PK' &&
        key !== 'GSI3SK' &&
        key !== 'GSI4PK' &&
        key !== 'GSI4SK' &&
        key !== 'GSI5PK' &&
        key !== 'GSI5SK'
      ) {
        const attrName = `#attr${index}`
        const attrValue = `:val${index}`
        updateExpressions.push(`${attrName} = ${attrValue}`)
        expressionAttributeNames[attrName] = key
        expressionAttributeValues[attrValue] = plainObject[key]
      }
    })

    // Update GSI keys
    const timestamp = procedure.created_at.toISOString()
    const lastModified = procedure.last_modified.toISOString()

    updateExpressions.push(
      'GSI1PK = :gsi1pk',
      'GSI1SK = :gsi1sk',
      'GSI2PK = :gsi2pk',
      'GSI2SK = :gsi2sk',
      'GSI3PK = :gsi3pk',
      'GSI3SK = :gsi3sk',
      'GSI4PK = :gsi4pk',
      'GSI4SK = :gsi4sk'
    )

    expressionAttributeValues[':gsi1pk'] = `PATIENT#${procedure.patient_id}`
    expressionAttributeValues[':gsi1sk'] = `PROCEDURE#${procedure.procedure_id}#${timestamp}`
    expressionAttributeValues[':gsi2pk'] = `STATUS#${procedure.status}`
    expressionAttributeValues[':gsi2sk'] = `PROCEDURE#${procedure.procedure_id}#${lastModified}`
    expressionAttributeValues[':gsi3pk'] = `TYPE#${procedure.procedure_type}`
    expressionAttributeValues[':gsi3sk'] = `PROCEDURE#${procedure.procedure_id}#${lastModified}`
    expressionAttributeValues[':gsi4pk'] = `DOCTOR#${procedure.assigned_by}`
    expressionAttributeValues[':gsi4sk'] = `PROCEDURE#${procedure.procedure_id}#${procedure.assigned_date.toISOString()}`

    if (procedure.archived) {
      updateExpressions.push('GSI5PK = :gsi5pk', 'GSI5SK = :gsi5sk')
      expressionAttributeValues[':gsi5pk'] = 'ARCHIVED#true'
      expressionAttributeValues[':gsi5sk'] = `PROCEDURE#${procedure.procedure_id}#${new Date().toISOString()}`
    }

    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `PROCEDURE#${procedure.procedure_id}` },
        SK: { S: `PROCEDURE#${procedure.procedure_id}` },
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })

    await docClient.send(command)

    return procedure
  }

  async delete(procedure_id: string): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `PROCEDURE#${procedure_id}` },
        SK: { S: `PROCEDURE#${procedure_id}` },
      },
    })

    await docClient.send(command)
  }

  async countByStatus(status: ProcedureStatus): Promise<number> {
    let count = 0
    let lastKey: Record<string, unknown> | undefined

    do {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'status-index',
        KeyConditionExpression: 'GSI2PK = :status',
        ExpressionAttributeValues: {
          ':status': { S: `STATUS#${status}` },
        },
        Select: 'COUNT',
        ExclusiveStartKey: lastKey,
      })

      const response = await docClient.send(command)
      count += response.Count || 0
      lastKey = response.LastEvaluatedKey
    } while (lastKey)

    return count
  }

  async countArchived(): Promise<number> {
    let count = 0
    let lastKey: Record<string, unknown> | undefined

    do {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'archived-index',
        KeyConditionExpression: 'GSI5PK = :archived',
        ExpressionAttributeValues: {
          ':archived': { S: 'ARCHIVED#true' },
        },
        Select: 'COUNT',
        ExclusiveStartKey: lastKey,
      })

      const response = await docClient.send(command)
      count += response.Count || 0
      lastKey = response.LastEvaluatedKey
    } while (lastKey)

    return count
  }

  async findByCreatedBefore(
    cutoffDate: Date,
    limit: number = 100,
    lastKey?: string
  ): Promise<PaginatedResponse<Procedure>> {
    const { ScanCommand } = await import('@aws-sdk/client-dynamodb')
    
    const cutoffISO = cutoffDate.toISOString()

    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :pk) AND created_at < :cutoff AND archived = :archived',
      ExpressionAttributeValues: {
        ':pk': { S: 'PROCEDURE#' },
        ':cutoff': { S: cutoffISO },
        ':archived': { BOOL: false },
      },
      Limit: limit,
      ExclusiveStartKey: lastKey
        ? (JSON.parse(Buffer.from(lastKey, 'base64').toString()) as Record<
            string,
            unknown
          >)
        : undefined,
    })

    const response = await docClient.send(command)

    const procedures =
      response.Items?.map((item) =>
        Procedure.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: procedures,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: procedures.length,
    }
  }
}

