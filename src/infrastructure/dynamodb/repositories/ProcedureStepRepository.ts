/**
 * Procedure step repository - DynamoDB implementation
 */

import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { docClient, TABLES } from '../client'
import { IProcedureStepRepository } from './IProcedureStepRepository'
import { ProcedureStep } from '../../../domain/procedure/ProcedureStep'

export class ProcedureStepRepository implements IProcedureStepRepository {
  private readonly tableName = TABLES.PROCEDURE_STEPS

  async findById(step_id: string): Promise<ProcedureStep | null> {
    // Step ID alone is not enough, we need to query by step_id
    // This is a simplified version - in production, you might want to add a GSI
    const command = new QueryCommand({
      TableName: this.tableName,
      FilterExpression: 'step_id = :stepId',
      ExpressionAttributeValues: {
        ':stepId': { S: step_id },
      },
      Limit: 1,
    })

    const response = await docClient.send(command)

    if (!response.Items || response.Items.length === 0) {
      return null
    }

    return ProcedureStep.fromPlainObject(response.Items[0] as Record<string, unknown>)
  }

  async findByProcedureId(procedure_id: string): Promise<ProcedureStep[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :procedureId',
      ExpressionAttributeValues: {
        ':procedureId': { S: `PROCEDURE#${procedure_id}` },
      },
    })

    const response = await docClient.send(command)

    return (
      response.Items?.map((item) =>
        ProcedureStep.fromPlainObject(item as Record<string, unknown>)
      ) || []
    )
  }

  async create(step: ProcedureStep): Promise<ProcedureStep> {
    const plainObject = step.toPlainObject()

    const item = {
      PK: `PROCEDURE#${step.procedure_id}`,
      SK: `STEP#${step.step_id}`,
      GSI1PK: `PROCEDURE#${step.procedure_id}#STATUS#${step.is_completed ? 'COMPLETED' : 'PENDING'}`,
      GSI1SK: `STEP#${step.step_id}`,
      ...plainObject,
    }

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item as Record<string, unknown>,
    })

    await docClient.send(command)

    return step
  }

  async update(step: ProcedureStep): Promise<ProcedureStep> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    const plainObject = step.toPlainObject()
    Object.keys(plainObject).forEach((key, index) => {
      if (key !== 'step_id' && key !== 'procedure_id' && key !== 'PK' && key !== 'SK') {
        const attrName = `#attr${index}`
        const attrValue = `:val${index}`
        updateExpressions.push(`${attrName} = ${attrValue}`)
        expressionAttributeNames[attrName] = key
        expressionAttributeValues[attrValue] = plainObject[key]
      }
    })

    // Update GSI key if status changed
    updateExpressions.push('GSI1PK = :gsi1pk')
    expressionAttributeValues[':gsi1pk'] = `PROCEDURE#${step.procedure_id}#STATUS#${step.is_completed ? 'COMPLETED' : 'PENDING'}`

    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `PROCEDURE#${step.procedure_id}` },
        SK: { S: `STEP#${step.step_id}` },
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })

    await docClient.send(command)

    return step
  }

  async delete(step_id: string): Promise<void> {
    // First find the step to get procedure_id
    const step = await this.findById(step_id)
    if (!step) {
      return
    }

    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        PK: { S: `PROCEDURE#${step.procedure_id}` },
        SK: { S: `STEP#${step_id}` },
      },
    })

    await docClient.send(command)
  }
}

