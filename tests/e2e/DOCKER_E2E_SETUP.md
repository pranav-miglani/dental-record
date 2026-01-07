# Docker E2E Tests Setup

## Overview

Docker E2E tests have been integrated into the test suite. These tests run against local Docker services (DynamoDB Local and MinIO) instead of requiring a deployed API.

## What Was Added

### 1. Docker E2E Test File
- `tests/e2e/docker-e2e.test.ts` - Complete E2E tests using Docker services

### 2. Test Runner Script
- `scripts/run-docker-e2e.sh` - Automated script to start services and run tests

### 3. NPM Scripts
- `npm run test:e2e:docker` - Run Docker E2E tests

## Test Coverage

The Docker E2E tests cover:

1. **Docker Services Health Check**
   - DynamoDB Local connectivity
   - MinIO (S3) connectivity

2. **DynamoDB Operations**
   - Create and read users
   - Create and read patients
   - Verify data persistence

3. **S3 (MinIO) Operations**
   - Create buckets
   - Upload files
   - Upload images
   - Download files

4. **End-to-End Workflow**
   - Complete workflow: User → Patient → Procedure
   - Data relationships
   - Cross-table operations

## Prerequisites

1. **Docker Desktop** installed and running
   ```bash
   # Check if Docker is running
   docker info
   ```

2. **AWS CLI** (for table setup)
   ```bash
   aws --version
   ```

3. **MinIO Client (mc)** - Optional
   ```bash
   brew install minio/stable/mc
   ```

## Running Tests

### Option 1: Using the Script (Recommended)

```bash
./scripts/run-docker-e2e.sh
```

This script:
1. Starts Docker services (DynamoDB, MinIO)
2. Waits for services to be healthy
3. Sets up tables and buckets
4. Runs E2E tests
5. Optionally stops services

### Option 2: Manual Steps

```bash
# 1. Start Docker services
npm run docker:up

# 2. Setup tables and buckets
npm run docker:setup

# 3. Run tests
npm run test:e2e:docker

# 4. Stop services
npm run docker:down
```

### Option 3: Keep Services Running

```bash
# Start services (keeps them running)
npm run docker:up

# Run tests multiple times
npm run test:e2e:docker
npm run test:e2e:docker

# Stop when done
npm run docker:down
```

## Environment Variables

The tests use these environment variables (set automatically by the script):

```bash
DYNAMODB_ENDPOINT=http://localhost:8000
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_FORCE_PATH_STYLE=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

## Test Results

When tests run successfully, you should see:

```
✅ DynamoDB Local: X tables found
✅ MinIO (S3): X buckets found
✅ DynamoDB user create/read successful
✅ DynamoDB patient create/read successful
✅ S3 (MinIO) upload/download successful
✅ S3 image upload successful
✅ Complete workflow test successful
```

## Troubleshooting

### Docker Not Running

```bash
# Start Docker Desktop, then:
docker info

# If Docker is not installed:
# macOS: brew install --cask docker
# Or download from: https://www.docker.com/products/docker-desktop
```

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :8000  # DynamoDB
lsof -i :9000  # MinIO

# Stop conflicting services or change ports in docker-compose.test.yml
```

### Tables Not Created

```bash
# Verify DynamoDB is running
curl http://localhost:8000

# Manually create tables
./scripts/setup-docker-tables.sh
```

### MinIO Connection Issues

```bash
# Verify MinIO is running
curl http://localhost:9000/minio/health/live

# Check MinIO logs
docker logs dental-hospital-minio-test
```

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: Docker E2E Tests

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
          ./scripts/setup-minio-buckets.sh || true
      - name: Run E2E tests
        run: npm run test:e2e:docker
        env:
          DYNAMODB_ENDPOINT: http://localhost:8000
          S3_ENDPOINT: http://localhost:9000
      - name: Stop services
        run: docker-compose -f docker-compose.test.yml down
```

## Next Steps

1. **Install Docker** if not already installed
2. **Start Docker Desktop**
3. **Run tests**: `./scripts/run-docker-e2e.sh`
4. **Review results** and fix any issues
5. **Integrate into CI/CD** pipeline

## Benefits

- ✅ **No AWS account needed** - Tests run completely locally
- ✅ **Fast execution** - No network latency
- ✅ **Isolated environment** - Each test run is clean
- ✅ **Cost-free** - No AWS charges
- ✅ **Reproducible** - Same environment every time
- ✅ **CI/CD ready** - Easy to integrate into pipelines

---

**Last Updated**: 2025-01-15

