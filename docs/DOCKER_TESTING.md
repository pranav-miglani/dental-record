# Docker Testing Guide

This guide explains how to run tests using Docker for local development and testing.

## Overview

The Docker setup provides:
- **DynamoDB Local**: Local DynamoDB instance for testing
- **MinIO**: S3-compatible storage for testing
- **Test Runner**: Containerized test execution

## Prerequisites

1. **Docker** and **Docker Compose** installed
   ```bash
   docker --version
   docker-compose --version
   ```

2. **AWS CLI** (for table setup)
   ```bash
   aws --version
   ```

3. **MinIO Client (mc)** - Optional, for bucket management
   ```bash
   # macOS
   brew install minio/stable/mc
   
   # Linux
   wget https://dl.min.io/client/mc/release/linux-amd64/mc
   chmod +x mc
   sudo mv mc /usr/local/bin/
   ```

## Quick Start

### 1. Start Docker Services

```bash
# Start all services
npm run docker:up

# Or manually
docker-compose -f docker-compose.test.yml up -d
```

This starts:
- DynamoDB Local on port `8000`
- MinIO on ports `9000` (API) and `9001` (Console)

### 2. Setup Tables and Buckets

```bash
# Setup everything
npm run docker:setup

# Or manually
./scripts/setup-docker-tables.sh
./scripts/setup-minio-buckets.sh
```

### 3. Run Tests

```bash
# Run all tests
npm run test:docker

# Run specific test types
npm run test:docker:unit
npm run test:docker:integration
npm run test:docker:e2e
```

### 4. Stop Services

```bash
npm run docker:down

# Or manually
docker-compose -f docker-compose.test.yml down
```

## Detailed Usage

### Using the Test Runner Script

The `run-docker-tests.sh` script automates everything:

```bash
./scripts/run-docker-tests.sh

# Stop services after tests
./scripts/run-docker-tests.sh --stop
```

This script:
1. Starts Docker services
2. Waits for services to be healthy
3. Sets up DynamoDB tables
4. Sets up MinIO buckets
5. Runs tests
6. Optionally stops services

### Manual Setup

#### 1. Start Services

```bash
docker-compose -f docker-compose.test.yml up -d dynamodb-local minio
```

#### 2. Verify Services

```bash
# Check DynamoDB
curl http://localhost:8000

# Check MinIO
curl http://localhost:9000/minio/health/live
```

#### 3. Setup DynamoDB Tables

```bash
export DYNAMODB_ENDPOINT=http://localhost:8000
./scripts/setup-docker-tables.sh
```

#### 4. Setup MinIO Buckets

```bash
export MINIO_ENDPOINT=http://localhost:9000
./scripts/setup-minio-buckets.sh
```

#### 5. Run Tests

```bash
export DYNAMODB_ENDPOINT=http://localhost:8000
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY=minioadmin
export S3_SECRET_KEY=minioadmin
export S3_FORCE_PATH_STYLE=true

npm run test:docker
```

## Service Endpoints

### DynamoDB Local
- **Endpoint**: `http://localhost:8000`
- **Region**: `us-east-1` (any region works locally)
- **Credentials**: Any (not validated locally)

### MinIO
- **API Endpoint**: `http://localhost:9000`
- **Console**: `http://localhost:9001`
- **Username**: `minioadmin`
- **Password**: `minioadmin`

### Access MinIO Console

1. Open browser: `http://localhost:9001`
2. Login with:
   - Username: `minioadmin`
   - Password: `minioadmin`
3. Browse buckets and files

## Environment Variables

The Docker setup uses these environment variables:

```bash
# DynamoDB
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# MinIO (S3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_FORCE_PATH_STYLE=true

# Table Names
USERS_TABLE_NAME=test-users
PATIENTS_TABLE_NAME=test-patients
PROCEDURES_TABLE_NAME=test-procedures
PROCEDURE_STEPS_TABLE_NAME=test-procedure-steps
IMAGES_TABLE_NAME=test-images
CONSENT_TABLE_NAME=test-consent
AUDIT_LOGS_TABLE_NAME=test-audit-logs
USER_PATIENT_MAPPING_TABLE_NAME=test-user-patient-mapping

# Buckets
IMAGES_BUCKET=test-images-bucket
ARCHIVE_BUCKET=test-archive-bucket
```

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are already in use
lsof -i :8000  # DynamoDB
lsof -i :9000  # MinIO

# Stop conflicting services or change ports in docker-compose.yml
```

### Tables Not Created

```bash
# Verify DynamoDB is running
curl http://localhost:8000

# Check AWS CLI configuration
aws configure list

# Try creating tables manually
aws dynamodb create-table \
  --endpoint-url http://localhost:8000 \
  --table-name test-users \
  --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
  --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### MinIO Connection Issues

```bash
# Verify MinIO is running
curl http://localhost:9000/minio/health/live

# Check MinIO logs
docker logs dental-hospital-minio-test

# Reset MinIO (WARNING: deletes all data)
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d minio
```

### Tests Fail to Connect

1. **Check services are running**:
   ```bash
   docker ps
   ```

2. **Verify endpoints**:
   ```bash
   curl http://localhost:8000  # DynamoDB
   curl http://localhost:9000/minio/health/live  # MinIO
   ```

3. **Check environment variables**:
   ```bash
   echo $DYNAMODB_ENDPOINT
   echo $S3_ENDPOINT
   ```

4. **Review test logs**:
   ```bash
   npm run test:docker 2>&1 | tee test-output.log
   ```

## Advanced Usage

### Running Tests in Docker Container

```bash
# Build test container
docker-compose -f docker-compose.test.yml build test-runner

# Run tests in container
docker-compose -f docker-compose.test.yml run --rm test-runner
```

### Using LocalStack (Full AWS Emulation)

LocalStack provides more complete AWS service emulation:

```bash
# Start LocalStack
docker-compose -f docker-compose.test.yml up -d localstack

# Use LocalStack endpoints
export AWS_ENDPOINT_URL=http://localhost:4566
```

### Persistent Data

Data is stored in Docker volumes:

```bash
# View volumes
docker volume ls

# Remove volumes (WARNING: deletes all data)
docker-compose -f docker-compose.test.yml down -v
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Start Docker services
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 10
      - name: Setup tables and buckets
        run: |
          ./scripts/setup-docker-tables.sh
          ./scripts/setup-minio-buckets.sh
      - name: Run tests
        run: npm run test:docker
        env:
          DYNAMODB_ENDPOINT: http://localhost:8000
          S3_ENDPOINT: http://localhost:9000
      - name: Stop services
        run: docker-compose -f docker-compose.test.yml down
```

## Best Practices

1. **Always cleanup**: Stop services after tests to free resources
2. **Use volumes**: Persist data between test runs if needed
3. **Health checks**: Wait for services to be healthy before running tests
4. **Isolation**: Each test should clean up after itself
5. **Parallel tests**: Use separate tables/buckets for parallel test runs

## Resources

- [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- [MinIO Documentation](https://min.io/docs/)
- [Docker Compose](https://docs.docker.com/compose/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

---

**Last Updated**: 2025-01-15

