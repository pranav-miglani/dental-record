/**
 * User-Patient mapping repository - DynamoDB implementation
 */

import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { docClient, TABLES } from '../client'
import { IUserPatientMappingRepository } from './IUserPatientMappingRepository'
import { UserPatientMapping } from '../../../domain/user/UserPatientMapping'
import { PaginatedResponse } from '../../../shared/types'

export class UserPatientMappingRepository implements IUserPatientMappingRepository {
  private readonly tableName = TABLES.USER_PATIENT_MAPPINGS

  async findByUserId(
    user_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<UserPatientMapping>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: `USER#${user_id}` },
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

    const mappings =
      response.Items?.map((item) =>
        UserPatientMapping.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: mappings,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: mappings.length,
    }
  }

  async findByPatientId(
    patient_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<UserPatientMapping>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'patient-user-index',
      KeyConditionExpression: 'GSI1PK = :patientId',
      ExpressionAttributeValues: {
        ':patientId': { S: `PATIENT#${patient_id}` },
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

    const mappings =
      response.Items?.map((item) =>
        UserPatientMapping.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: mappings,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: mappings.length,
    }
  }

  async findMapping(
    user_id: string,
    patient_id: string
  ): Promise<UserPatientMapping | null> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `USER#${user_id}` },
        SK: { S: `PATIENT#${patient_id}` },
      },
    })

    const response = await docClient.send(command)

    if (!response.Item) {
      return null
    }

    return UserPatientMapping.fromPlainObject(response.Item as Record<string, unknown>)
  }

  async create(mapping: UserPatientMapping): Promise<UserPatientMapping> {
    const plainObject = mapping.toPlainObject()

    const item = {
      PK: `USER#${mapping.user_id}`,
      SK: `PATIENT#${mapping.patient_id}`,
      GSI1PK: `PATIENT#${mapping.patient_id}`,
      GSI1SK: `USER#${mapping.user_id}`,
      ...plainObject,
    }

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item as Record<string, unknown>,
    })

    await docClient.send(command)

    return mapping
  }

  async update(mapping: UserPatientMapping): Promise<UserPatientMapping> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    const plainObject = mapping.toPlainObject()
    Object.keys(plainObject).forEach((key, index) => {
      if (key !== 'user_id' && key !== 'patient_id' && key !== 'PK' && key !== 'SK') {
        const attrName = `#attr${index}`
        const attrValue = `:val${index}`
        updateExpressions.push(`${attrName} = ${attrValue}`)
        expressionAttributeNames[attrName] = key
        expressionAttributeValues[attrValue] = plainObject[key]
      }
    })

    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `USER#${mapping.user_id}` },
        SK: { S: `PATIENT#${mapping.patient_id}` },
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })

    await docClient.send(command)

    return mapping
  }

  async delete(user_id: string, patient_id: string): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `USER#${user_id}` },
        SK: { S: `PATIENT#${patient_id}` },
      },
    })

    await docClient.send(command)
  }
}

