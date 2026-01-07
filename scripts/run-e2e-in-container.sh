#!/bin/bash

# Run E2E tests in Docker container
# This script builds and runs the test container with all services

set -e

echo "🐳 Running E2E Tests in Docker Container..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Wait for Docker to be ready
echo -e "${YELLOW}🔍 Checking Docker status...${NC}"
if ! ./scripts/wait-for-docker.sh; then
  echo -e "${RED}❌ Docker is not ready. Please start Docker Desktop and try again.${NC}"
  exit 1
fi

# Build and run test container
echo -e "${YELLOW}📦 Building and starting test container...${NC}"
echo "   This will:"
echo "   1. Start DynamoDB Local"
echo "   2. Start MinIO"
echo "   3. Build test runner container"
echo "   4. Setup tables and buckets"
echo "   5. Run all E2E tests"
echo ""

# Run the test container
docker-compose -f docker-compose.test.yml up --build test-runner

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
else
  echo -e "${RED}❌ Some tests failed (exit code: $EXIT_CODE)${NC}"
fi

# Optionally clean up
if [ "$1" == "--cleanup" ]; then
  echo ""
  echo -e "${YELLOW}🧹 Cleaning up Docker services...${NC}"
  docker-compose -f docker-compose.test.yml down
fi

exit $EXIT_CODE

