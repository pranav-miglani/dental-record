#!/bin/bash

# Run E2E tests with Docker services
# This script starts Docker services, sets them up, and runs E2E tests

set -e

echo "🐳 Starting Docker E2E Test Suite..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
  exit 1
fi

# Start Docker services
echo -e "${YELLOW}📦 Starting Docker services...${NC}"
docker-compose -f docker-compose.test.yml up -d dynamodb-local minio

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 3

# Check DynamoDB
echo "Checking DynamoDB Local..."
for i in {1..30}; do
  if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DynamoDB Local is ready${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ DynamoDB Local failed to start${NC}"
    exit 1
  fi
  sleep 1
done

# Check MinIO
echo "Checking MinIO..."
for i in {1..30}; do
  if curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MinIO is ready${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ MinIO failed to start${NC}"
    exit 1
  fi
  sleep 1
done

# Setup DynamoDB tables
echo ""
echo -e "${YELLOW}📊 Setting up DynamoDB tables...${NC}"
export DYNAMODB_ENDPOINT=http://localhost:8000
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

if [ -f "./scripts/setup-docker-tables.sh" ]; then
  ./scripts/setup-docker-tables.sh
else
  echo -e "${YELLOW}⚠️  Setup script not found, skipping table creation${NC}"
fi

# Setup MinIO buckets
echo ""
echo -e "${YELLOW}🪣 Setting up MinIO buckets...${NC}"
export MINIO_ENDPOINT=http://localhost:9000
export MINIO_ACCESS_KEY=minioadmin
export MINIO_SECRET_KEY=minioadmin

if [ -f "./scripts/setup-minio-buckets.sh" ]; then
  ./scripts/setup-minio-buckets.sh 2>/dev/null || echo -e "${YELLOW}⚠️  MinIO setup skipped (mc may not be installed)${NC}"
else
  echo -e "${YELLOW}⚠️  Setup script not found, skipping bucket creation${NC}"
fi

# Set environment variables for tests
export DYNAMODB_ENDPOINT=http://localhost:8000
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY=minioadmin
export S3_SECRET_KEY=minioadmin
export S3_FORCE_PATH_STYLE=true
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Table names
export USERS_TABLE_NAME=test-users
export PATIENTS_TABLE_NAME=test-patients
export PROCEDURES_TABLE_NAME=test-procedures
export PROCEDURE_STEPS_TABLE_NAME=test-procedure-steps
export IMAGES_TABLE_NAME=test-images
export CONSENT_TABLE_NAME=test-consent
export AUDIT_LOGS_TABLE_NAME=test-audit-logs
export USER_PATIENT_MAPPING_TABLE_NAME=test-user-patient-mapping

# Buckets
export IMAGES_BUCKET=test-images-bucket
export ARCHIVE_BUCKET=test-archive-bucket

# JWT
export JWT_SECRET=test-secret-key-for-local-testing
export JWT_ACCESS_EXPIRY=30m
export JWT_REFRESH_EXPIRY=30d

# Run E2E tests
echo ""
echo -e "${YELLOW}🧪 Running E2E tests with Docker services...${NC}"
echo ""

# Run the Docker E2E tests
npm run test:e2e:docker

TEST_EXIT_CODE=$?

# Optionally stop services
if [ "$1" == "--stop" ] || [ "$TEST_EXIT_CODE" -eq 0 ]; then
  echo ""
  echo -e "${YELLOW}🛑 Stopping Docker services...${NC}"
  docker-compose -f docker-compose.test.yml down
fi

# Exit with test result
exit $TEST_EXIT_CODE

