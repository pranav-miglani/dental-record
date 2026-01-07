/**
 * User repository - DynamoDB implementation
 */

import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb'
import { docClient, TABLES } from '../client'
import { IUserRepository } from './IUserRepository'
import { User } from '../../../domain/user/User'
import { UserRole } from '../../../shared/types'
import { PaginatedResponse } from '../../../shared/types'
import { NotFoundError } from '../../../shared/errors'

export class UserRepository implements IUserRepository {
  private readonly tableName = TABLES.USERS

  async findByMobileNumber(mobile_number: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'mobile-index',
      KeyConditionExpression: 'GSI1PK = :mobile',
      ExpressionAttributeValues: {
        ':mobile': { S: `MOBILE#${mobile_number}` },
      },
      Limit: 1,
    })

    const response = await docClient.send(command)

    if (!response.Items || response.Items.length === 0) {
      return null
    }

    const item = response.Items[0]
    return User.fromPlainObject(item as Record<string, unknown>)
  }

  async findById(user_id: string): Promise<User | null> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `USER#${user_id}` },
        SK: { S: `USER#${user_id}` },
      },
    })

    const response = await docClient.send(command)

    if (!response.Item) {
      return null
    }

    return User.fromPlainObject(response.Item as Record<string, unknown>)
  }

  async findByRole(
    role: UserRole,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<User>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'role-index',
      KeyConditionExpression: 'GSI2PK = :role',
      ExpressionAttributeValues: {
        ':role': { S: `ROLE#${role}` },
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

    const users =
      response.Items?.map((item) =>
        User.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: users,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: users.length,
    }
  }

  async findByPanelId(
    panel_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<User>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'panel-index',
      KeyConditionExpression: 'GSI3PK = :panel',
      ExpressionAttributeValues: {
        ':panel': { S: `PANEL#${panel_id}` },
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

    const users =
      response.Items?.map((item) =>
        User.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: users,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: users.length,
    }
  }

  async mobileNumberExists(mobile_number: string): Promise<boolean> {
    const user = await this.findByMobileNumber(mobile_number)
    return user !== null
  }

  async create(user: User): Promise<User> {
    const item = {
      PK: `USER#${user.user_id}`,
      SK: `USER#${user.user_id}`,
      GSI1PK: `MOBILE#${user.mobile_number}`,
      GSI1SK: `USER#${user.user_id}`,
      ...user.toPlainObject(),
    }

    // Add GSI entries for each role
    const roleItems = user.roles.map((role) => ({
      ...item,
      GSI2PK: `ROLE#${role}`,
      GSI2SK: `USER#${user.user_id}`,
    }))

    // Add panel index if panel_id exists
    if (user.panel_id) {
      item.GSI3PK = `PANEL#${user.panel_id}`
      item.GSI3SK = `USER#${user.user_id}`
    }

    // For simplicity, we'll create one item per role in GSI2
    // In production, you might want to use a sparse index pattern
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item as Record<string, unknown>,
    })

    await docClient.send(command)

    return user
  }

  async update(user: User): Promise<User> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    // Build update expression dynamically
    const plainObject = user.toPlainObject()
    Object.keys(plainObject).forEach((key, index) => {
      if (key !== 'user_id' && key !== 'PK' && key !== 'SK') {
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
        PK: { S: `USER#${user.user_id}` },
        SK: { S: `USER#${user.user_id}` },
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })

    await docClient.send(command)

    return user
  }

  async delete(user_id: string): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `USER#${user_id}` },
        SK: { S: `USER#${user_id}` },
      },
    })

    await docClient.send(command)
  }

  async countAll(): Promise<number> {
    const { ScanCommand } = await import('@aws-sdk/client-dynamodb')
    
    let count = 0
    let lastKey: Record<string, unknown> | undefined

    do {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: {
          ':pk': { S: 'USER#' },
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
}

