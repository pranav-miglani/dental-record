# CI/CD Pipeline Documentation

## Overview

The project uses GitHub Actions for continuous integration and deployment. The pipeline includes comprehensive testing and automated deployment to AWS.

## Workflow Files

### 1. `ci.yml` - Continuous Integration
Runs on every push and pull request:
- Unit tests
- Integration tests (with DynamoDB Local)
- E2E tests (with Docker containers)
- Lint and type checking

### 2. `deploy.yml` - Deployment
Deploys infrastructure and Lambda functions to AWS (main branch only)

### 3. `full-pipeline.yml` - Complete Pipeline
Combines CI and CD in a single workflow

## Pipeline Stages

### Stage 1: Unit Tests
- **Job**: `unit-tests`
- **Duration**: ~5-10 minutes
- **What it does**:
  - Installs dependencies
  - Runs unit tests with coverage
  - Uploads coverage to Codecov

### Stage 2: Integration Tests
- **Job**: `integration-tests`
- **Duration**: ~10-15 minutes
- **What it does**:
  - Starts DynamoDB Local in Docker
  - Sets up test tables
  - Runs integration tests
  - Cleans up resources

### Stage 3: E2E Tests (Docker)
- **Job**: `e2e-tests`
- **Duration**: ~15-20 minutes
- **What it does**:
  - Builds test container
  - Starts DynamoDB Local and MinIO
  - Sets up tables and buckets
  - Runs all E2E tests
  - Saves test logs and results
  - Cleans up Docker resources

### Stage 4: Lint & Type Check
- **Job**: `lint-and-type-check`
- **Duration**: ~5 minutes
- **What it does**:
  - Runs ESLint
  - Type checks with TypeScript
  - Checks code formatting

### Stage 5: Deployment (Main Branch Only)
- **Job**: `deploy`
- **Duration**: ~15-20 minutes
- **What it does**:
  - Configures AWS credentials
  - Initializes Terraform
  - Plans infrastructure changes
  - Applies infrastructure
  - Builds Lambda functions
  - Deploys Lambda functions

## Required GitHub Secrets

For the pipeline to work, you need to set these secrets in GitHub:

1. **AWS_ACCESS_KEY_ID**
   - AWS access key for deployment
   - Required for: Deployment job

2. **AWS_SECRET_ACCESS_KEY**
   - AWS secret key for deployment
   - Required for: Deployment job

3. **CODECOV_TOKEN** (Optional)
   - Codecov token for coverage uploads
   - Required for: Coverage reporting

## Environment Variables

The pipeline uses these environment variables:

```yaml
NODE_VERSION: '20'
AWS_REGION: 'us-east-1'
```

## Test Coverage

### Unit Tests
- **Location**: `tests/unit/`
- **Command**: `npm run test:unit`
- **Coverage**: Uploaded to Codecov

### Integration Tests
- **Location**: `tests/integration/`
- **Command**: `npm run test:integration`
- **Services**: DynamoDB Local

### E2E Tests
- **Location**: `tests/e2e/`
- **Command**: `npm run test:e2e:docker`
- **Services**: DynamoDB Local + MinIO (S3)

## Pipeline Triggers

### Automatic Triggers
- **Push to main/develop**: Runs all tests
- **Pull Request**: Runs all tests
- **Push to feature branches**: Runs all tests

### Manual Triggers
- **workflow_dispatch**: Can manually trigger any workflow

## Artifacts

The pipeline generates these artifacts:

1. **Test Results**
   - Location: `test-results/`
   - Retention: 7 days
   - Contains: Docker logs, test output

2. **Coverage Reports**
   - Location: `coverage/`
   - Uploaded to: Codecov
   - Format: LCOV

## Pipeline Status

You can check pipeline status:
- In GitHub: Actions tab
- Via badges: Add to README.md
- Via notifications: Email/Slack (if configured)

## Troubleshooting

### Tests Fail in CI but Pass Locally

1. **Check environment variables**
   - Ensure all required env vars are set
   - Check Docker service endpoints

2. **Check Docker resources**
   - CI runners have limited resources
   - Increase timeouts if needed

3. **Check service health**
   - DynamoDB Local may need more time to start
   - MinIO may need more time to initialize

### Deployment Fails

1. **Check AWS credentials**
   - Verify secrets are set correctly
   - Check IAM permissions

2. **Check Terraform state**
   - Ensure S3 backend is configured
   - Check state file permissions

3. **Check Lambda deployment**
   - Verify Lambda function names
   - Check IAM roles and policies

## Best Practices

1. **Run tests locally first**
   - Use `npm run test:docker` before pushing
   - Fix issues locally to save CI time

2. **Keep tests fast**
   - Unit tests should be < 5 minutes
   - Integration tests should be < 15 minutes
   - E2E tests should be < 20 minutes

3. **Use test summaries**
   - Review test summaries in GitHub
   - Check artifact uploads for details

4. **Monitor pipeline health**
   - Set up notifications for failures
   - Review pipeline metrics regularly

## Customization

### Add More Test Jobs

```yaml
new-test-job:
  name: New Test Job
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm run test:new
```

### Change Test Timeouts

```yaml
e2e-tests:
  timeout-minutes: 30  # Increase timeout
```

### Add Deployment Environments

```yaml
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  environment: staging

deploy-production:
  if: github.ref == 'refs/heads/main'
  environment: production
```

## Pipeline Performance

Current pipeline performance:
- **Unit Tests**: ~5 minutes
- **Integration Tests**: ~10 minutes
- **E2E Tests**: ~15 minutes
- **Lint & Type Check**: ~3 minutes
- **Total CI Time**: ~35-40 minutes
- **Deployment Time**: ~20 minutes

## Next Steps

1. **Set up GitHub Secrets**
   - Add AWS credentials
   - Add Codecov token (optional)

2. **Enable workflows**
   - Push to trigger first run
   - Review results

3. **Configure notifications**
   - Set up email/Slack notifications
   - Configure status checks for PRs

4. **Add badges**
   - Add status badges to README
   - Show test coverage

---

**Last Updated**: 2025-01-15

