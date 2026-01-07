/**
 * DynamoDB client configuration
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// Create DynamoDB client
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
})

// Create DynamoDB Document Client (easier to work with)
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
})

// Table names from environment variables
export const TABLES = {
  USERS: process.env.USERS_TABLE_NAME || 'dental-hospital-users',
  PATIENTS: process.env.PATIENTS_TABLE_NAME || 'dental-hospital-patients',
  USER_PATIENT_MAPPINGS:
    process.env.USER_PATIENT_MAPPINGS_TABLE_NAME ||
    'dental-hospital-user-patient-mappings',
  PROCEDURE_STEPS:
    process.env.PROCEDURE_STEPS_TABLE_NAME || 'dental-hospital-procedure-steps',
  PROCEDURES:
    process.env.PROCEDURES_TABLE_NAME || 'dental-hospital-procedures',
  PROCEDURE_STEPS:
    process.env.PROCEDURE_STEPS_TABLE_NAME || 'dental-hospital-procedure-steps',
  IMAGES: process.env.IMAGES_TABLE_NAME || 'dental-hospital-images',
  CONSENT: process.env.CONSENT_TABLE_NAME || 'dental-hospital-consent',
  AUDIT_LOGS: process.env.AUDIT_LOGS_TABLE_NAME || 'dental-hospital-audit-logs',
}

