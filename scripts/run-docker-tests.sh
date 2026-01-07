#!/bin/bash

# Run tests in Docker
# This script starts Docker services and runs tests

set -e

echo "🐳 Starting Docker services for testing..."

# Start Docker services
docker-compose -f docker-compose.test.yml up -d dynamodb-local minio

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if DynamoDB is ready
echo "Checking DynamoDB..."
until curl -s http://localhost:8000 > /dev/null; do
  echo "  Waiting for DynamoDB..."
  sleep 2
done
echo "✅ DynamoDB is ready"

# Check if MinIO is ready
echo "Checking MinIO..."
until curl -s http://localhost:9000/minio/health/live > /dev/null; do
  echo "  Waiting for MinIO..."
  sleep 2
done
echo "✅ MinIO is ready"

# Setup DynamoDB tables
echo ""
echo "📊 Setting up DynamoDB tables..."
export DYNAMODB_ENDPOINT=http://localhost:8000
./scripts/setup-docker-tables.sh

# Setup MinIO buckets
echo ""
echo "🪣 Setting up MinIO buckets..."
export MINIO_ENDPOINT=http://localhost:9000
./scripts/setup-minio-buckets.sh

# Set environment variables for tests
export DYNAMODB_ENDPOINT=http://localhost:8000
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY=minioadmin
export S3_SECRET_KEY=minioadmin
export S3_FORCE_PATH_STYLE=true

# Run tests
echo ""
echo "🧪 Running tests..."
npm run test:docker

# Optionally stop services after tests
if [ "$1" == "--stop" ]; then
  echo ""
  echo "🛑 Stopping Docker services..."
  docker-compose -f docker-compose.test.yml down
fi

