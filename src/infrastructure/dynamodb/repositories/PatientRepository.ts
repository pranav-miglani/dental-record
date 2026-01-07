/**
 * Patient repository - DynamoDB implementation
 */

import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { docClient, TABLES } from '../client'
import { IPatientRepository } from './IPatientRepository'
import { Patient } from '../../../domain/patient/Patient'
import { PaginatedResponse } from '../../../shared/types'
import { NotFoundError } from '../../../shared/errors'

export class PatientRepository implements IPatientRepository {
  private readonly tableName = TABLES.PATIENTS

  async findById(patient_id: string): Promise<Patient | null> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `PATIENT#${patient_id}` },
        SK: { S: `PATIENT#${patient_id}` },
      },
    })

    const response = await docClient.send(command)

    if (!response.Item) {
      return null
    }

    return Patient.fromPlainObject(response.Item as Record<string, unknown>)
  }

  async findByDOB(
    date_of_birth: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Patient>> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'dob-index',
      KeyConditionExpression: 'GSI1PK = :dob',
      ExpressionAttributeValues: {
        ':dob': { S: `DOB#${date_of_birth}` },
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

    const patients =
      response.Items?.map((item) =>
        Patient.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: patients,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: patients.length,
    }
  }

  async searchByName(
    namePrefix: string,
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Patient>> {
    // Get first letter for GSI partition key
    const firstLetter = namePrefix.charAt(0).toUpperCase()

    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'name-index',
      KeyConditionExpression: 'GSI2PK = :firstLetter AND begins_with(GSI2SK, :prefix)',
      ExpressionAttributeValues: {
        ':firstLetter': { S: `NAME#${firstLetter}` },
        ':prefix': { S: `PATIENT#${namePrefix}` },
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

    const patients =
      response.Items?.map((item) =>
        Patient.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: patients,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: patients.length,
    }
  }

  async findAll(
    limit: number = 50,
    lastKey?: string
  ): Promise<PaginatedResponse<Patient>> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :pk)',
      ExpressionAttributeValues: {
        ':pk': { S: 'PATIENT#' },
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

    const patients =
      response.Items?.map((item) =>
        Patient.fromPlainObject(item as Record<string, unknown>)
      ) || []

    return {
      items: patients,
      last_key: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
        : undefined,
      count: patients.length,
    }
  }

  async create(patient: Patient): Promise<Patient> {
    const plainObject = patient.toPlainObject()
    const dob = plainObject.date_of_birth as string
    const firstLetter = patient.name.charAt(0).toUpperCase()

    const item = {
      PK: `PATIENT#${patient.patient_id}`,
      SK: `PATIENT#${patient.patient_id}`,
      GSI1PK: `DOB#${dob}`,
      GSI1SK: `PATIENT#${patient.patient_id}`,
      GSI2PK: `NAME#${firstLetter}`,
      GSI2SK: `PATIENT#${patient.patient_id}#${patient.name}`,
      ...plainObject,
    }

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item as Record<string, unknown>,
    })

    await docClient.send(command)

    return patient
  }

  async update(patient: Patient): Promise<Patient> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    const plainObject = patient.toPlainObject()
    Object.keys(plainObject).forEach((key, index) => {
      if (key !== 'patient_id' && key !== 'PK' && key !== 'SK') {
        const attrName = `#attr${index}`
        const attrValue = `:val${index}`
        updateExpressions.push(`${attrName} = ${attrValue}`)
        expressionAttributeNames[attrName] = key
        expressionAttributeValues[attrValue] = plainObject[key]
      }
    })

    // Update GSI keys if name or DOB changed
    const dob = plainObject.date_of_birth as string
    const firstLetter = patient.name.charAt(0).toUpperCase()

    updateExpressions.push('GSI1PK = :gsi1pk', 'GSI1SK = :gsi1sk')
    updateExpressions.push('GSI2PK = :gsi2pk', 'GSI2SK = :gsi2sk')

    expressionAttributeValues[':gsi1pk'] = `DOB#${dob}`
    expressionAttributeValues[':gsi1sk'] = `PATIENT#${patient.patient_id}`
    expressionAttributeValues[':gsi2pk'] = `NAME#${firstLetter}`
    expressionAttributeValues[':gsi2sk'] = `PATIENT#${patient.patient_id}#${patient.name}`

    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `PATIENT#${patient.patient_id}` },
        SK: { S: `PATIENT#${patient.patient_id}` },
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })

    await docClient.send(command)

    return patient
  }

  async countAll(): Promise<number> {
    let count = 0
    let lastKey: Record<string, unknown> | undefined

    do {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: {
          ':pk': { S: 'PATIENT#' },
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

  async delete(patient_id: string): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `PATIENT#${patient_id}` },
        SK: { S: `PATIENT#${patient_id}` },
      },
    })

    await docClient.send(command)
  }
}

