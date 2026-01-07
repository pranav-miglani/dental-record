/**
 * Docker Test Setup
 * Configuration for running tests against Docker services
 */

// Set test environment variables for Docker
process.env.NODE_ENV = 'test'
process.env.AWS_REGION = 'us-east-1'
process.env.AWS_ACCESS_KEY_ID = 'test'
process.env.AWS_SECRET_ACCESS_KEY = 'test'

// DynamoDB Local endpoint
process.env.DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'

// MinIO (S3) endpoint
process.env.S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000'
process.env.S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minioadmin'
process.env.S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'minioadmin'
process.env.S3_FORCE_PATH_STYLE = 'true'

// Table names
process.env.USERS_TABLE_NAME = 'test-users'
process.env.PATIENTS_TABLE_NAME = 'test-patients'
process.env.PROCEDURES_TABLE_NAME = 'test-procedures'
process.env.PROCEDURE_STEPS_TABLE_NAME = 'test-procedure-steps'
process.env.IMAGES_TABLE_NAME = 'test-images'
process.env.CONSENT_TABLE_NAME = 'test-consent'
process.env.AUDIT_LOGS_TABLE_NAME = 'test-audit-logs'
process.env.USER_PATIENT_MAPPING_TABLE_NAME = 'test-user-patient-mapping'

// S3 buckets
process.env.IMAGES_BUCKET = 'test-images-bucket'
process.env.ARCHIVE_BUCKET = 'test-archive-bucket'

// JWT
process.env.JWT_SECRET = 'test-secret-key-for-local-testing'
process.env.JWT_ACCESS_EXPIRY = '30m'
process.env.JWT_REFRESH_EXPIRY = '30d'

// Suppress localStorage warnings
if (typeof (global as any).localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  }
}

// Global test timeout
jest.setTimeout(60000) // 60 seconds for Docker tests

console.log('🐳 Docker test environment configured')
console.log(`   DynamoDB: ${process.env.DYNAMODB_ENDPOINT}`)
console.log(`   S3 (MinIO): ${process.env.S3_ENDPOINT}`)

