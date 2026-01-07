# Container-Based E2E Testing

## Overview

The E2E tests can now run entirely in Docker containers. This provides a completely isolated, reproducible test environment.

## Architecture

```
┌─────────────────────────────────────────┐
│  Docker Compose Network                 │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ DynamoDB     │  │ MinIO        │   │
│  │ Local        │  │ (S3)         │   │
│  │ :8000        │  │ :9000        │   │
│  └──────────────┘  └──────────────┘   │
│         │                  │            │
│         └────────┬─────────┘            │
│                  │                      │
│         ┌────────▼──────────┐          │
│         │  Test Runner      │          │
│         │  Container        │          │
│         │  (Runs E2E Tests) │          │
│         └───────────────────┘          │
└─────────────────────────────────────────┘
```

## What Was Set Up

### 1. Test Runner Container
- **Dockerfile.test**: Container image with Node.js, dependencies, and test tools
- Runs all E2E tests in isolated environment
- Connects to DynamoDB Local and MinIO services

### 2. Docker Compose Configuration
- **docker-compose.test.yml**: Orchestrates all services
- Automatically starts dependencies (DynamoDB, MinIO)
- Waits for services to be healthy before running tests

### 3. Setup Scripts
- **setup-docker-tables-container.sh**: Creates DynamoDB tables from within container
- **setup-minio-buckets-container.sh**: Creates S3 buckets from within container
- **run-e2e-in-container.sh**: Main script to run everything

### 4. NPM Scripts
- `npm run docker:test` - Run tests in container
- `npm run docker:test:clean` - Run tests and cleanup
- `npm run docker:setup:container` - Setup from within container

## Quick Start

### Prerequisites

1. **Install Docker Desktop**
   ```bash
   # macOS
   brew install --cask docker
   
   # Or download from: https://www.docker.com/products/docker-desktop
   ```

2. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to be running (whale icon in menu bar)

3. **Verify Docker is running**
   ```bash
   docker info
   ```

### Run Tests

#### Option 1: Using the Script (Recommended)

```bash
./scripts/run-e2e-in-container.sh
```

This will:
1. Build the test container
2. Start DynamoDB Local
3. Start MinIO
4. Wait for services to be healthy
5. Setup tables and buckets
6. Run all E2E tests
7. Show results

#### Option 2: Using Docker Compose Directly

```bash
# Build and run
docker-compose -f docker-compose.test.yml up --build test-runner

# With cleanup after
docker-compose -f docker-compose.test.yml up --build test-runner && \
docker-compose -f docker-compose.test.yml down
```

#### Option 3: Using NPM Scripts

```bash
# Run tests in container
npm run docker:test

# Run tests and cleanup
npm run docker:test:clean
```

## What Happens During Execution

1. **Service Startup**
   - DynamoDB Local starts on port 8000
   - MinIO starts on ports 9000 (API) and 9001 (Console)
   - Health checks verify services are ready

2. **Container Build**
   - Test runner container is built
   - Installs all Node.js dependencies
   - Copies source code

3. **Setup Phase**
   - Creates DynamoDB tables (8 tables)
   - Creates MinIO buckets (2 buckets)
   - Configures environment variables

4. **Test Execution**
   - Runs all E2E tests
   - Tests connect to Docker services
   - Results are displayed

5. **Cleanup** (optional)
   - Stops all containers
   - Removes test network

## Test Coverage

The container runs these E2E tests:

1. ✅ **Docker Services Health Check**
   - DynamoDB Local connectivity
   - MinIO (S3) connectivity

2. ✅ **DynamoDB Operations**
   - Create and read users
   - Create and read patients
   - Verify data persistence

3. ✅ **S3 (MinIO) Operations**
   - Create buckets
   - Upload files
   - Upload images
   - Download files

4. ✅ **End-to-End Workflow**
   - Complete workflow: User → Patient → Procedure
   - Data relationships
   - Cross-table operations

## Environment Variables

The test container uses these environment variables (set automatically):

```bash
# AWS/DynamoDB
DYNAMODB_ENDPOINT=http://dynamodb-local:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# S3/MinIO
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_FORCE_PATH_STYLE=true

# Table Names
USERS_TABLE_NAME=test-users
PATIENTS_TABLE_NAME=test-patients
PROCEDURES_TABLE_NAME=test-procedures
# ... (all 8 tables)

# Buckets
IMAGES_BUCKET=test-images-bucket
ARCHIVE_BUCKET=test-archive-bucket

# JWT
JWT_SECRET=test-secret-key-for-local-testing
```

## Viewing Results

### Console Output
Test results are displayed in the console with:
- ✅ Green checkmarks for passing tests
- ❌ Red X for failing tests
- Detailed error messages
- Test execution time

### Logs
View container logs:
```bash
# Test runner logs
docker logs dental-hospital-test-runner

# DynamoDB logs
docker logs dental-hospital-dynamodb-test

# MinIO logs
docker logs dental-hospital-minio-test
```

### Coverage Reports
Coverage reports are generated in the `coverage/` directory (if configured).

## Troubleshooting

### Container Won't Build

```bash
# Check Docker is running
docker info

# Try building manually
docker-compose -f docker-compose.test.yml build test-runner

# Check for errors
docker-compose -f docker-compose.test.yml build --no-cache test-runner
```

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :8000  # DynamoDB
lsof -i :9000  # MinIO

# Stop conflicting services
docker-compose -f docker-compose.test.yml down

# Start fresh
docker-compose -f docker-compose.test.yml up -d
```

### Tests Fail to Connect

```bash
# Verify services are running
docker ps

# Check service health
docker inspect dental-hospital-dynamodb-test | grep Health
docker inspect dental-hospital-minio-test | grep Health

# View test container logs
docker logs dental-hospital-test-runner
```

### Table Creation Fails

```bash
# Check if AWS CLI is available in container
docker-compose -f docker-compose.test.yml run test-runner aws --version

# Manually create tables
docker-compose -f docker-compose.test.yml run test-runner \
  sh scripts/setup-docker-tables-container.sh
```

### Permission Issues

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Or run with explicit permissions
docker-compose -f docker-compose.test.yml run test-runner \
  sh -c "chmod +x scripts/*.sh && npm run docker:setup:container"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Container E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run E2E tests in container
        run: |
          docker-compose -f docker-compose.test.yml up --build test-runner
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: coverage/
```

### GitLab CI Example

```yaml
test:e2e:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker-compose -f docker-compose.test.yml up --build test-runner
  artifacts:
    when: always
    paths:
      - coverage/
```

## Benefits

✅ **Complete Isolation**: Tests run in isolated containers
✅ **Reproducible**: Same environment every time
✅ **No Local Setup**: No need to install dependencies locally
✅ **CI/CD Ready**: Easy to integrate into pipelines
✅ **Fast**: Services start quickly
✅ **Clean**: No leftover data on your machine
✅ **Parallel**: Can run multiple test suites in parallel

## Advanced Usage

### Keep Services Running

```bash
# Start services without running tests
docker-compose -f docker-compose.test.yml up -d dynamodb-local minio

# Run tests multiple times
docker-compose -f docker-compose.test.yml run test-runner npm run test:e2e:docker
docker-compose -f docker-compose.test.yml run test-runner npm run test:e2e:docker

# Stop when done
docker-compose -f docker-compose.test.yml down
```

### Debug Inside Container

```bash
# Run interactive shell in test container
docker-compose -f docker-compose.test.yml run test-runner sh

# Inside container:
# npm run test:e2e:docker
# aws dynamodb list-tables --endpoint-url http://dynamodb-local:8000
```

### Custom Test Command

```bash
# Run specific test file
docker-compose -f docker-compose.test.yml run test-runner \
  npm run test:e2e:docker -- docker-e2e.test.ts

# Run with custom environment
docker-compose -f docker-compose.test.yml run \
  -e CUSTOM_VAR=value \
  test-runner npm run test:e2e:docker
```

## Next Steps

1. **Install Docker Desktop** if not already installed
2. **Start Docker Desktop**
3. **Run tests**: `./scripts/run-e2e-in-container.sh`
4. **Review results** and fix any issues
5. **Integrate into CI/CD** pipeline

---

**Last Updated**: 2025-01-15

