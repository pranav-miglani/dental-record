/**
 * E2E Tests with Docker Services
 * Tests API endpoints against local Docker services (DynamoDB Local + MinIO)
 */

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

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'

describe('Dental Hospital System - E2E Tests with Docker', () => {
  let dynamoClient: DynamoDBDocumentClient
  let s3Client: S3Client
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let testPatientId: string

  beforeAll(async () => {
    // Docker service endpoints
    const dynamoEndpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
    const s3Endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'

    // Setup DynamoDB client
    const dynamoDbClient = new DynamoDBClient({
      region: 'us-east-1',
      endpoint: dynamoEndpoint,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    })
    dynamoClient = DynamoDBDocumentClient.from(dynamoDbClient)

    // Setup S3 client (MinIO)
    s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: s3Endpoint,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    })

    console.log(`\n🐳 Docker E2E Tests`)
    console.log(`   DynamoDB: ${dynamoEndpoint}`)
    console.log(`   S3 (MinIO): ${s3Endpoint}\n`)
  })

  describe('1. Docker Services Health Check', () => {
    test('1.1 - DynamoDB Local should be accessible', async () => {
      try {
        const { TableNames } = await dynamoClient.send(
          new (await import('@aws-sdk/client-dynamodb')).ListTablesCommand({})
        )

        expect(TableNames).toBeDefined()
        expect(Array.isArray(TableNames)).toBe(true)
        console.log(`✅ DynamoDB Local: ${TableNames?.length || 0} tables found`)
      } catch (error: any) {
        console.error('❌ DynamoDB connection failed:', error.message)
        throw error
      }
    })

    test('1.2 - MinIO (S3) should be accessible', async () => {
      try {
        const { Buckets } = await s3Client.send(
          new (await import('@aws-sdk/client-s3')).ListBucketsCommand({})
        )

        expect(Buckets).toBeDefined()
        expect(Array.isArray(Buckets)).toBe(true)
        console.log(`✅ MinIO (S3): ${Buckets?.length || 0} buckets found`)
      } catch (error: any) {
        console.error('❌ MinIO connection failed:', error.message)
        console.log('   Make sure MinIO is running: npm run docker:up')
        throw error
      }
    })
  })

  describe('2. DynamoDB Operations', () => {
    test('2.1 - Create and read user from DynamoDB', async () => {
      const testUser = {
        PK: 'USER#test-e2e-user',
        SK: 'USER#test-e2e-user',
        GSI1PK: 'MOBILE#9876543210',
        user_id: 'test-e2e-user',
        mobile_number: '9876543210',
        name: 'E2E Test User',
        password_hash: '$2a$10$testhash',
        roles: ['PATIENT'],
        login_count: 0,
        is_blocked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      try {
        // Put user
        await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).PutCommand({
            TableName: 'test-users',
            Item: testUser,
          })
        )

        // Get user
        const { Item } = await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).GetCommand({
            TableName: 'test-users',
            Key: {
              PK: 'USER#test-e2e-user',
              SK: 'USER#test-e2e-user',
            },
          })
        )

        expect(Item).toBeDefined()
        expect(Item?.user_id).toBe('test-e2e-user')
        expect(Item?.mobile_number).toBe('9876543210')
        console.log('✅ DynamoDB user create/read successful')
      } catch (error: any) {
        console.error('❌ DynamoDB operation failed:', error.message)
        throw error
      }
    })

    test('2.2 - Create and read patient from DynamoDB', async () => {
      const testPatient = {
        PK: 'PATIENT#test-e2e-patient',
        SK: 'PATIENT#test-e2e-patient',
        GSI1PK: 'DOB#1990-01-15',
        patient_id: 'test-e2e-patient',
        name: 'E2E Test Patient',
        date_of_birth: '1990-01-15',
        gender: 'MALE',
        aadhaar_last_4: '1234',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      try {
        // Put patient
        await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).PutCommand({
            TableName: 'test-patients',
            Item: testPatient,
          })
        )

        // Get patient
        const { Item } = await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).GetCommand({
            TableName: 'test-patients',
            Key: {
              PK: 'PATIENT#test-e2e-patient',
              SK: 'PATIENT#test-e2e-patient',
            },
          })
        )

        expect(Item).toBeDefined()
        expect(Item?.patient_id).toBe('test-e2e-patient')
        testPatientId = Item?.patient_id || 'test-e2e-patient'
        expect(testPatientId).toBe('test-e2e-patient')
        console.log('✅ DynamoDB patient create/read successful')
      } catch (error: any) {
        console.error('❌ DynamoDB patient operation failed:', error.message)
        throw error
      }
    })
  })

  describe('3. S3 (MinIO) Operations', () => {
    test('3.1 - Create bucket and upload file', async () => {
      const bucketName = 'test-images-bucket'
      const key = 'e2e-test/test-image.txt'
      const content = 'E2E Test Image Content'

      try {
        // Create bucket if it doesn't exist
        try {
          await s3Client.send(
            new (await import('@aws-sdk/client-s3')).CreateBucketCommand({
              Bucket: bucketName,
            })
          )
        } catch (error: any) {
          // Bucket might already exist, that's OK
          if (error.name !== 'BucketAlreadyOwnedByYou') {
            throw error
          }
        }

        // Upload file
        await s3Client.send(
          new (await import('@aws-sdk/client-s3')).PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: content,
            ContentType: 'text/plain',
          })
        )

        // Download file
        const { Body } = await s3Client.send(
          new (await import('@aws-sdk/client-s3')).GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          })
        )

        const bodyContent = await Body?.transformToString()
        expect(bodyContent).toBe(content)
        console.log('✅ S3 (MinIO) upload/download successful')
      } catch (error: any) {
        console.error('❌ S3 operation failed:', error.message)
        throw error
      }
    })

    test('3.2 - Upload image file to S3', async () => {
      const bucketName = 'test-images-bucket'
      const key = 'e2e-test/test-image.png'
      // 1x1 pixel PNG
      const imageContent = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      )

      try {
        await s3Client.send(
          new (await import('@aws-sdk/client-s3')).PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: imageContent,
            ContentType: 'image/png',
          })
        )

        // Verify file exists
        const { ContentLength } = await s3Client.send(
          new (await import('@aws-sdk/client-s3')).HeadObjectCommand({
            Bucket: bucketName,
            Key: key,
          })
        )

        expect(ContentLength).toBeGreaterThan(0)
        console.log('✅ S3 image upload successful')
      } catch (error: any) {
        console.error('❌ S3 image upload failed:', error.message)
        throw error
      }
    })
  })

  describe('4. End-to-End Workflow', () => {
    test('4.1 - Complete workflow: User → Patient → Procedure', async () => {
      // This test simulates a complete workflow using direct DynamoDB operations
      // In a real scenario, you'd call API endpoints

      try {
        // 1. Create user
        const user = {
          PK: 'USER#workflow-test',
          SK: 'USER#workflow-test',
          GSI1PK: 'MOBILE#1111111111',
          user_id: 'workflow-test-user',
          mobile_number: '1111111111',
          name: 'Workflow Test User',
          password_hash: '$2a$10$test',
          roles: ['DOCTOR'],
          created_at: new Date().toISOString(),
        }

        await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).PutCommand({
            TableName: 'test-users',
            Item: user,
          })
        )

        // 2. Create patient
        const patient = {
          PK: 'PATIENT#workflow-test-patient',
          SK: 'PATIENT#workflow-test-patient',
          patient_id: 'workflow-test-patient',
          name: 'Workflow Test Patient',
          date_of_birth: '1985-05-20',
          gender: 'FEMALE',
          created_at: new Date().toISOString(),
        }

        await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).PutCommand({
            TableName: 'test-patients',
            Item: patient,
          })
        )

        // 3. Create procedure
        const procedure = {
          PK: 'PROCEDURE#workflow-test-proc',
          SK: 'PROCEDURE#workflow-test-proc',
          GSI1PK: 'PATIENT#workflow-test-patient',
          procedure_id: 'workflow-test-proc',
          patient_id: 'workflow-test-patient',
          procedure_type: 'RCT',
          status: 'DRAFT',
          created_at: new Date().toISOString(),
        }

        await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).PutCommand({
            TableName: 'test-procedures',
            Item: procedure,
          })
        )

        // 4. Verify all items exist
        const { Item: userItem } = await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).GetCommand({
            TableName: 'test-users',
            Key: { PK: 'USER#workflow-test', SK: 'USER#workflow-test' },
          })
        )

        const { Item: patientItem } = await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).GetCommand({
            TableName: 'test-patients',
            Key: {
              PK: 'PATIENT#workflow-test-patient',
              SK: 'PATIENT#workflow-test-patient',
            },
          })
        )

        const { Item: procedureItem } = await dynamoClient.send(
          new (await import('@aws-sdk/lib-dynamodb')).GetCommand({
            TableName: 'test-procedures',
            Key: {
              PK: 'PROCEDURE#workflow-test-proc',
              SK: 'PROCEDURE#workflow-test-proc',
            },
          })
        )

        expect(userItem).toBeDefined()
        expect(patientItem).toBeDefined()
        expect(procedureItem).toBeDefined()
        expect(procedureItem?.patient_id).toBe(patientItem?.patient_id)

        console.log('✅ Complete workflow test successful')
        console.log(`   User: ${userItem?.user_id}`)
        console.log(`   Patient: ${patientItem?.patient_id}`)
        console.log(`   Procedure: ${procedureItem?.procedure_id}`)
      } catch (error: any) {
        console.error('❌ Workflow test failed:', error.message)
        throw error
      }
    })
  })

  afterAll(() => {
    console.log('\n📊 Docker E2E Test Summary:')
    console.log('   ✅ DynamoDB operations tested')
    console.log('   ✅ S3 (MinIO) operations tested')
    console.log('   ✅ End-to-end workflow tested')
    console.log('')
  })
})

