/**
 * Integration tests using Docker services
 * Tests against local DynamoDB and MinIO
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'

describe('Docker Services Integration Tests', () => {
  let dynamoClient: DynamoDBDocumentClient
  let s3Client: S3Client

  beforeAll(() => {
    // Create DynamoDB client pointing to local instance
    const dynamoDbClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    })

    dynamoClient = DynamoDBDocumentClient.from(dynamoDbClient)

    // Create S3 client pointing to MinIO
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    })
  })

  test('should connect to DynamoDB Local', async () => {
    try {
      const { TableNames } = await dynamoClient.send(
        new (await import('@aws-sdk/client-dynamodb')).ListTablesCommand({})
      )

      expect(TableNames).toBeDefined()
      expect(Array.isArray(TableNames)).toBe(true)
      console.log('✅ DynamoDB Local connection successful')
      console.log(`   Tables found: ${TableNames?.length || 0}`)
    } catch (error: any) {
      console.error('❌ DynamoDB connection failed:', error.message)
      throw error
    }
  })

  test('should connect to MinIO (S3)', async () => {
    try {
      const { Buckets } = await s3Client.send(
        new (await import('@aws-sdk/client-s3')).ListBucketsCommand({})
      )

      expect(Buckets).toBeDefined()
      expect(Array.isArray(Buckets)).toBe(true)
      console.log('✅ MinIO (S3) connection successful')
      console.log(`   Buckets found: ${Buckets?.length || 0}`)
    } catch (error: any) {
      console.error('❌ MinIO connection failed:', error.message)
      console.log('   Make sure MinIO is running: docker-compose up minio')
      throw error
    }
  })

  test('should create and read from DynamoDB', async () => {
    const testTable = 'test-users'
    const testItem = {
      PK: 'USER#test-123',
      SK: 'USER#test-123',
      user_id: 'test-123',
      mobile_number: '9999999999',
      name: 'Test User',
    }

    try {
      // Put item
      await dynamoClient.send(
        new (await import('@aws-sdk/lib-dynamodb')).PutCommand({
          TableName: testTable,
          Item: testItem,
        })
      )

      // Get item
      const { Item } = await dynamoClient.send(
        new (await import('@aws-sdk/lib-dynamodb')).GetCommand({
          TableName: testTable,
          Key: {
            PK: 'USER#test-123',
            SK: 'USER#test-123',
          },
        })
      )

      expect(Item).toBeDefined()
      expect(Item?.user_id).toBe('test-123')
      console.log('✅ DynamoDB read/write successful')
    } catch (error: any) {
      console.error('❌ DynamoDB operation failed:', error.message)
      console.log('   Make sure tables are created: npm run docker:setup')
      throw error
    }
  })

  test('should create bucket and upload to S3 (MinIO)', async () => {
    const bucketName = 'test-images-bucket'
    const key = 'test-file.txt'
    const content = 'Hello from Docker tests!'

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
      console.log('✅ S3 (MinIO) read/write successful')
    } catch (error: any) {
      console.error('❌ S3 operation failed:', error.message)
      console.log('   Make sure MinIO is running: docker-compose up minio')
      throw error
    }
  })
})

