# CI/CD Test Integration Guide

## Overview

All test suites are fully integrated into the CI/CD pipeline. Tests run automatically on every push and pull request, ensuring code quality and preventing regressions.

## Test Pipeline Structure

```
┌─────────────────────────────────────────┐
│         Complete Test Suite             │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌─────────▼────────┐
│  Backend Tests │    │  Mobile App Tests │
└───────┬────────┘    └─────────┬────────┘
        │                       │
        └───────────┬───────────┘
                    │
            ┌───────▼────────┐
            │  Test Summary  │
            └────────────────┘
```

## Test Jobs

### 1. Backend Unit Tests
- **Job**: `backend-unit-tests`
- **Duration**: ~5-10 minutes
- **What it does**:
  - Runs all backend unit tests
  - Generates coverage report
  - Uploads to Codecov

### 2. Backend Integration Tests
- **Job**: `backend-integration-tests`
- **Duration**: ~10-15 minutes
- **What it does**:
  - Starts DynamoDB Local
  - Sets up test tables
  - Runs integration tests
  - Cleans up resources

### 3. Backend E2E Tests
- **Job**: `backend-e2e-tests`
- **Duration**: ~15-20 minutes
- **What it does**:
  - Builds Docker test containers
  - Starts DynamoDB Local + MinIO
  - Runs E2E tests
  - Saves test logs and results

### 4. Mobile App Unit Tests
- **Job**: `mobile-unit-tests` or `mobile-tests`
- **Duration**: ~10-15 minutes
- **What it does**:
  - Runs linter
  - Type checks
  - Runs all mobile unit tests
  - **Enforces 100% coverage threshold**
  - Uploads coverage to Codecov

### 5. Lint & Type Check
- **Job**: `lint-and-type-check`
- **Duration**: ~5 minutes
- **What it does**:
  - Runs ESLint for backend
  - Type checks backend
  - Runs ESLint for mobile
  - Type checks mobile

## Workflow Files

### 1. `test-complete.yml`
Complete test suite for all components:
- Backend tests (unit, integration, E2E)
- Mobile app tests
- Lint & type check
- Comprehensive test summary

### 2. `ci.yml`
CI pipeline with mobile tests integrated

### 3. `deploy.yml`
Deployment pipeline with mobile tests as prerequisite

### 4. `full-pipeline.yml`
Full CI/CD pipeline with all tests

### 5. `mobile-build.yml`
Mobile-specific build and test workflow

## Coverage Requirements

### Backend
- Target: >90% coverage
- Enforced: No (warnings only)

### Mobile App
- **Target: 100% coverage**
- **Enforced: Yes (fails if below 100%)**
- Thresholds:
  - Branches: 100%
  - Functions: 100%
  - Lines: 100%
  - Statements: 100%

## Test Execution Order

1. **Backend Unit Tests** (parallel)
2. **Backend Integration Tests** (parallel)
3. **Mobile Unit Tests** (parallel)
4. **Lint & Type Check** (parallel)
5. **Backend E2E Tests** (after integration tests)
6. **Test Summary** (after all tests)

## Coverage Reports

### Codecov Integration
- Backend coverage uploaded to Codecov
- Mobile coverage uploaded to Codecov
- Separate flags for each component
- Combined coverage dashboard

### Artifacts
- Coverage HTML reports (7-day retention)
- Test result logs
- Coverage JSON files

## Failure Handling

### Test Failures
- Pipeline stops on test failure
- Detailed error messages in logs
- Artifacts saved for debugging
- Test summary shows failed suites

### Coverage Failures
- Mobile tests fail if coverage < 100%
- Backend tests warn if coverage < 90%
- Coverage reports still uploaded

## Required Secrets

- `CODECOV_TOKEN` (optional): For coverage reporting
- `AWS_ACCESS_KEY_ID`: For deployment (if deploying)
- `AWS_SECRET_ACCESS_KEY`: For deployment (if deploying)

## Test Artifacts

### Backend
- `backend-e2e-results/`: E2E test logs and results
- `coverage/`: Coverage reports

### Mobile
- `mobile-coverage-report/`: Coverage HTML and JSON
- Coverage uploaded to Codecov

## Running Tests Locally

### Backend
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e:docker
```

### Mobile
```bash
cd mobile

# Unit tests with coverage
npm test

# Coverage report
npm run test:coverage

# E2E tests (requires device/emulator)
npm run test:e2e:ios
npm run test:e2e:android
```

## Pipeline Status

Check pipeline status:
- GitHub Actions tab
- Test summary in workflow runs
- Codecov dashboard
- Artifact downloads

## Best Practices

1. **Run tests locally before pushing**
   - Fix issues locally to save CI time
   - Ensure 100% coverage for mobile

2. **Check test summaries**
   - Review test results in GitHub
   - Download artifacts for detailed logs

3. **Monitor coverage**
   - Check Codecov dashboard regularly
   - Address coverage gaps immediately

4. **Keep tests fast**
   - Unit tests: < 5 minutes
   - Integration tests: < 15 minutes
   - E2E tests: < 20 minutes

## Troubleshooting

### Tests Fail in CI but Pass Locally
1. Check environment variables
2. Verify Docker services are running
3. Check Node.js version matches
4. Review test logs in artifacts

### Coverage Below Threshold
1. Review coverage report
2. Add missing test cases
3. Check coverage ignore patterns
4. Verify all code paths are tested

### Mobile Tests Fail
1. Check Node.js version (20.x)
2. Verify dependencies installed
3. Check TypeScript errors
4. Review coverage report

---

**Last Updated**: 2025-01-15

