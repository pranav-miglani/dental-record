/**
 * Image repository - DynamoDB implementation
 */

import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { docClient, TABLES } from '../client'
import { IImageRepository } from './IImageRepository'
import { Image } from '../../../domain/image/Image'
import { PaginatedResponse } from '../../../shared/types'

export class ImageRepository implements IImageRepository {
  private readonly tableName = TABLES.IMAGES

  async findById(image_id: string, version?: number): Promise<Image | null> {
    if (version) {
      // Find specific version
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'image-id-index',
        KeyConditionExpression: 'GSI1PK = :imageId AND GSI1SK = :version',
        ExpressionAttributeValues: {
          ':imageId': { S: `IMAGE#${image_id}` },
          ':version': { S: `VERSION#${version}` },
        },
        Limit: 1,
      })

      const response = await docClient.send(command)

      if (!response.Items || response.Items.length === 0) {
        return null
      }

      return Image.fromPlainObject(response.Items[0] as Record<string, unknown>)
    } else {
      // Find current version
      const versions = await this.findVersions(image_id, 1)
      if (versions.items.length === 0) {
        return null
      }
      return versions.items.find((img) => img.is_current) || versions.items[0]
    }
  }

  async findVersions(
    image_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Image>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'image-id-index',
      KeyConditionExpression: 'GSI1PK = :imageId',
      ExpressionAttributeValues: {
        ':imageId': { S: `IMAGE#${image_id}` },
      },
      ScanIndexForward: false, // Latest version first
      Limit: limit,
      ExclusiveStartKey: lastKey
        ? (JSON.parse(Buffer.from(lastKey, 'base64').toString()) as Record<
            string,
            unknown
          >)
        : undefined,
    })

    const response = await docClient.send(command)

    const images =
      response.Items?.map((item) =>
        Image.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: images,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: images.length,
    }
  }

  async findByStepId(
    step_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Image>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :stepId',
      ExpressionAttributeValues: {
        ':stepId': { S: `STEP#${step_id}` },
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

    const images =
      response.Items?.map((item) =>
        Image.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: images,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: images.length,
    }
  }

  async findByProcedureId(
    procedure_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Image>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'procedure-images-index',
      KeyConditionExpression: 'GSI2PK = :procedureId',
      ExpressionAttributeValues: {
        ':procedureId': { S: `PROCEDURE#${procedure_id}` },
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

    const images =
      response.Items?.map((item) =>
        Image.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: images,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: images.length,
    }
  }

  async findByUploader(
    user_id: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Image>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'uploaded-by-index',
      KeyConditionExpression: 'GSI3PK = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: `USER#${user_id}` },
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

    const images =
      response.Items?.map((item) =>
        Image.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: images,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: images.length,
    }
  }

  async create(image: Image): Promise<Image> {
    const plainObject = image.toPlainObject()
    const timestamp = image.upload_timestamp.toISOString()

    const item = {
      PK: `STEP#${image.step_id}`,
      SK: `IMAGE#${image.image_id}#VERSION#${image.version}`,
      GSI1PK: `IMAGE#${image.image_id}`,
      GSI1SK: `VERSION#${image.version}`,
      GSI2PK: `PROCEDURE#${image.procedure_id}`,
      GSI2SK: `STEP#${image.step_id}#IMAGE#${image.image_id}#VERSION#${image.version}`,
      GSI3PK: `USER#${image.uploaded_by}`,
      GSI3SK: `IMAGE#${image.image_id}#VERSION#${image.version}#${timestamp}`,
      ...plainObject,
    }

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item as Record<string, unknown>,
    })

    await docClient.send(command)

    return image
  }

  async update(image: Image): Promise<Image> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    const plainObject = image.toPlainObject()
    Object.keys(plainObject).forEach((key, index) => {
      if (
        key !== 'image_id' &&
        key !== 'version' &&
        key !== 'PK' &&
        key !== 'SK' &&
        !key.startsWith('GSI')
      ) {
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
        PK: { S: `STEP#${image.step_id}` },
        SK: { S: `IMAGE#${image.image_id}#VERSION#${image.version}` },
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })

    await docClient.send(command)

    return image
  }

  async delete(image_id: string, version: number): Promise<void> {
    // Soft delete - mark as deleted
    const image = await this.findById(image_id, version)
    if (image) {
      image.delete()
      await this.update(image)
    }
  }

  async countAll(): Promise<number> {
    const { ScanCommand } = await import('@aws-sdk/client-dynamodb')
    
    let count = 0
    let lastKey: Record<string, unknown> | undefined

    do {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(PK, :pk) AND is_deleted = :deleted',
        ExpressionAttributeValues: {
          ':pk': { S: 'STEP#' },
          ':deleted': { BOOL: false },
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

