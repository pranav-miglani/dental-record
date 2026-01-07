/**
 * Consent repository - DynamoDB implementation
 */

import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { docClient, TABLES } from '../client'
import { IConsentRepository } from './IConsentRepository'
import { Consent } from '../../../domain/consent/Consent'
import { PaginatedResponse } from '../../../shared/types'

export class ConsentRepository implements IConsentRepository {
  private readonly tableName = TABLES.CONSENT

  async findByPatientId(patient_id: string): Promise<Consent | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :patientId',
      ExpressionAttributeValues: {
        ':patientId': { S: `PATIENT#${patient_id}` },
      },
      ScanIndexForward: false, // Get latest consent first
      Limit: 1,
    })

    const response = await docClient.send(command)

    if (!response.Items || response.Items.length === 0) {
      return null
    }

    return Consent.fromPlainObject(response.Items[0] as Record<string, unknown>)
  }

  async findByVersion(
    version: number,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Consent>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'consent-version-index',
      KeyConditionExpression: 'GSI1PK = :version',
      ExpressionAttributeValues: {
        ':version': { S: `VERSION#${version}` },
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

    const consents =
      response.Items?.map((item) =>
        Consent.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: consents,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: consents.length,
    }
  }

  async create(consent: Consent): Promise<Consent> {
    const plainObject = consent.toPlainObject()

    const item = {
      PK: `PATIENT#${consent.patient_id}`,
      SK: `CONSENT#${consent.consent_id}`,
      GSI1PK: `VERSION#${consent.consent_version}`,
      GSI1SK: `PATIENT#${consent.patient_id}#CONSENT#${consent.consent_id}`,
      ...plainObject,
    }

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item as Record<string, unknown>,
    })

    await docClient.send(command)

    return consent
  }

  async update(consent: Consent): Promise<Consent> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    const plainObject = consent.toPlainObject()
    Object.keys(plainObject).forEach((key, index) => {
      if (key !== 'consent_id' && key !== 'patient_id' && key !== 'PK' && key !== 'SK') {
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
        PK: { S: `PATIENT#${consent.patient_id}` },
        SK: { S: `CONSENT#${consent.consent_id}` },
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })

    await docClient.send(command)

    return consent
  }
}

