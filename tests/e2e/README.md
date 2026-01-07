# E2E Tests - Dental Hospital System

## Overview

This directory contains End-to-End (E2E) tests for the Dental Hospital System. The tests verify the complete API functionality.

## Test Types

1. **API Integration Tests** (`api-integration.test.ts`)
   - Tests API endpoints directly via HTTP requests
   - Faster and more reliable for API testing
   - No browser required

2. **Selenium Tests** (`api.test.ts`)
   - Uses Selenium WebDriver for browser-based testing
   - Useful for future frontend testing
   - Can test API through browser automation

## Prerequisites

1. **Deployed API**: The API must be deployed to AWS (or running locally)
2. **Test User**: A test admin user must exist in the system
3. **Environment Variables**: Set API_URL, TEST_ADMIN_MOBILE, TEST_ADMIN_PASSWORD

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

```bash
export API_URL=https://your-api-gateway-url.amazonaws.com/prod
export TEST_ADMIN_MOBILE=9999999999
export TEST_ADMIN_PASSWORD=YourSecurePassword123!
```

Or create `.env.test` file:
```bash
API_URL=https://your-api-gateway-url.amazonaws.com/prod
TEST_ADMIN_MOBILE=9999999999
TEST_ADMIN_PASSWORD=YourSecurePassword123!
```

### 3. Create Test User

Before running tests, ensure a test admin user exists:

```bash
# Use AWS CLI or API to create test user
# See deployment guide for details
```

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npm run test:e2e -- api-integration.test.ts
```

### Run with Custom API URL

```bash
API_URL=https://your-api.com npm run test:e2e
```

## Test Coverage

The E2E tests cover:

1. ✅ Authentication (login, refresh, token validation)
2. ✅ User Management (get current user)
3. ✅ Patient Management (create, get, search, list)
4. ✅ Procedure Management (create, get, confirm, list)
5. ✅ Step Management (get steps, complete step)
6. ✅ Image Management (upload image)
7. ✅ Error Handling (404, 401, 403)
8. ✅ Security (unauthorized access)

## Expected Results

### If API is Deployed

- ✅ All tests should pass
- ✅ Test data will be created (patients, procedures)
- ✅ Cleanup may be needed after tests

### If API is Not Deployed

- ⚠️ Tests will skip with warnings
- ⚠️ No test data will be created
- ✅ Tests will verify API is not accessible

## Troubleshooting

### API Not Accessible

**Error**: `ECONNREFUSED` or `ENOTFOUND`

**Solution**:
1. Verify API is deployed: `aws apigateway get-rest-apis`
2. Check API_URL environment variable
3. Verify API Gateway stage is deployed

### Authentication Fails

**Error**: `401 Unauthorized`

**Solution**:
1. Verify test user exists in DynamoDB
2. Check TEST_ADMIN_MOBILE and TEST_ADMIN_PASSWORD
3. Verify user password is correct
4. Check JWT_SECRET matches between Lambda and tests

### Tests Timeout

**Error**: Tests timeout after 60 seconds

**Solution**:
1. Check API Gateway timeout settings
2. Verify Lambda functions are not cold-starting
3. Increase test timeout in jest.config.js

## Test Data Cleanup

After running tests, you may want to clean up test data:

```bash
# Delete test patients, procedures, etc.
# Use AWS CLI or API to clean up
```

## Continuous Integration

These tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    export API_URL=${{ secrets.API_URL }}
    export TEST_ADMIN_MOBILE=${{ secrets.TEST_ADMIN_MOBILE }}
    export TEST_ADMIN_PASSWORD=${{ secrets.TEST_ADMIN_PASSWORD }}
    npm run test:e2e
```

## Notes

- Tests are designed to be idempotent where possible
- Some tests depend on previous tests (e.g., procedure tests need patient)
- Tests will skip gracefully if prerequisites are not met
- All tests use real API endpoints (no mocks)

