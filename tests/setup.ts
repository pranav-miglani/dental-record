/**
 * Test setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.AWS_REGION = 'us-east-1'
process.env.USERS_TABLE_NAME = 'test-users'
process.env.PATIENTS_TABLE_NAME = 'test-patients'
process.env.PROCEDURES_TABLE_NAME = 'test-procedures'
process.env.IMAGES_TABLE_NAME = 'test-images'
process.env.CONSENT_TABLE_NAME = 'test-consent'
process.env.AUDIT_LOGS_TABLE_NAME = 'test-audit-logs'
process.env.IMAGES_BUCKET = 'test-images-bucket'
process.env.ARCHIVE_BUCKET = 'test-archive-bucket'
process.env.JWT_SECRET = 'test-secret-key'
process.env.JWT_ACCESS_EXPIRY = '30m'
process.env.JWT_REFRESH_EXPIRY = '30d'

// Mock AWS SDK if needed
jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn(),
  }
})

jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(),
    },
  }
})

// Global test timeout
jest.setTimeout(10000)

