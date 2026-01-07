#!/bin/bash

# Run Selenium E2E Tests
# This script runs the E2E tests with proper configuration

set -e

echo "🧪 Running Selenium E2E Tests..."

# Check if API URL is set
if [ -z "$API_URL" ]; then
  echo "⚠️  Warning: API_URL not set. Using default or localhost"
  echo "   Set API_URL environment variable to test against deployed API"
  echo "   Example: export API_URL=https://your-api-gateway-url.amazonaws.com/prod"
fi

# Check if test credentials are set
if [ -z "$TEST_ADMIN_MOBILE" ] || [ -z "$TEST_ADMIN_PASSWORD" ]; then
  echo "⚠️  Warning: Test credentials not set"
  echo "   Set TEST_ADMIN_MOBILE and TEST_ADMIN_PASSWORD environment variables"
  echo "   Example:"
  echo "   export TEST_ADMIN_MOBILE=9999999999"
  echo "   export TEST_ADMIN_PASSWORD=YourPassword123!"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if ChromeDriver is available (for Selenium)
if ! command -v chromedriver &> /dev/null; then
  echo "⚠️  ChromeDriver not found. Installing..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install chromedriver
  else
    echo "Please install ChromeDriver manually"
  fi
fi

# Run E2E tests
echo "🚀 Starting E2E tests..."
npm run test:e2e

echo "✅ E2E tests complete!"

