# Deployment Guide - Dental Hospital Records System
## Complete Step-by-Step Guide for Beginners

> **Note**: This guide assumes you're new to AWS, Terraform, and serverless deployments. Every step is explained in detail.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [AWS Account Setup](#aws-account-setup)
4. [Local Development Setup](#local-development-setup)
5. [Infrastructure Deployment](#infrastructure-deployment)
6. [Application Deployment](#application-deployment)
7. [Configuration](#configuration)
8. [Testing](#testing)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software Installation

#### 1. Node.js (Version 20 or higher)
**What it is**: JavaScript runtime needed to build and run the application.

**Installation**:
```bash
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
# Or use Homebrew on macOS:
brew install node@20

# Verify installation
node --version  # Should show v20.x.x or higher
npm --version   # Should show 10.x.x or higher
```

**Why needed**: To compile TypeScript code and run build scripts.

---

#### 2. AWS CLI (Version 2.0 or higher)
**What it is**: Command-line tool to interact with AWS services.

**Installation**:
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows - Download from: https://aws.amazon.com/cli/

# Verify installation
aws --version  # Should show aws-cli/2.x.x
```

**Why needed**: To deploy resources, configure services, and manage AWS from command line.

---

#### 3. Terraform (Version 1.5 or higher)
**What it is**: Infrastructure as Code tool to create AWS resources automatically.

**Installation**:
```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Windows - Download from: https://www.terraform.io/downloads

# Verify installation
terraform version  # Should show Terraform v1.5.x or higher
```

**Why needed**: To create and manage all AWS infrastructure (databases, servers, etc.) automatically.

---

#### 4. Git
**What it is**: Version control system.

**Installation**:
```bash
# macOS (usually pre-installed)
git --version

# If not installed
brew install git

# Verify
git --version
```

**Why needed**: To manage code versions and deploy via CI/CD.

---

#### 5. Docker (Optional, for local testing)
**What it is**: Container platform for running DynamoDB locally.

**Installation**:
```bash
# macOS
brew install --cask docker

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Windows - Download Docker Desktop from: https://www.docker.com/products/docker-desktop

# Verify
docker --version
```

**Why needed**: To test database operations locally before deploying.

---

## AWS Account Setup

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process:
   - Enter email and password
   - Provide payment information (you'll get free tier credits)
   - Verify phone number
   - Choose support plan (Basic is free)

**Important**: AWS Free Tier includes:
- 12 months free: 750 hours/month EC2, 5GB S3 storage, 25GB DynamoDB
- Always free: 1 million Lambda requests/month, 1GB API Gateway requests/month

---

### Step 2: Create IAM User (Recommended)

**Why**: Don't use root account for daily operations. Create a user with limited permissions.

1. **Login to AWS Console**: https://console.aws.amazon.com/
2. **Go to IAM Service**: Search "IAM" in top search bar
3. **Create User**:
   - Click "Users" → "Create user"
   - Username: `dental-hospital-admin`
   - Select "Provide user access to the AWS Management Console" (optional, for console access)
   - Click "Next"

4. **Set Permissions**:
   - Select "Attach policies directly"
   - Search and attach:
     - `AdministratorAccess` (for initial setup - you can restrict later)
     - OR create custom policy with minimum required permissions

5. **Create User**:
   - Click "Create user"
   - **IMPORTANT**: Save the Access Key ID and Secret Access Key immediately
   - You won't be able to see the secret key again!

---

### Step 3: Configure AWS CLI

```bash
# Configure AWS CLI with your credentials
aws configure

# You'll be prompted for:
# AWS Access Key ID: [Enter your Access Key ID from Step 2]
# AWS Secret Access Key: [Enter your Secret Access Key from Step 2]
# Default region name: us-east-1 (or your preferred region)
# Default output format: json

# Verify configuration
aws sts get-caller-identity

# This should return your account ID and user ARN
```

**Troubleshooting**:
- If you get "Unable to locate credentials", check your `~/.aws/credentials` file
- Make sure Access Key ID and Secret Access Key are correct

---

### Step 4: Create S3 Bucket for Terraform State

**What is Terraform State**: Terraform stores information about created resources in a "state file". We store it in S3 so multiple people can work on the same infrastructure.

```bash
# Create S3 bucket (must be globally unique name)
# Replace 'dental-hospital-terraform-state-YOUR-NAME' with your unique name
aws s3 mb s3://dental-hospital-terraform-state-YOUR-NAME

# Example:
aws s3 mb s3://dental-hospital-terraform-state-john-doe-2024

# Enable versioning (allows recovery of previous state)
aws s3api put-bucket-versioning \
  --bucket dental-hospital-terraform-state-YOUR-NAME \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket dental-hospital-terraform-state-YOUR-NAME \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access (security)
aws s3api put-public-access-block \
  --bucket dental-hospital-terraform-state-YOUR-NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Verify bucket was created
aws s3 ls | grep terraform-state
```

**Note**: Replace `YOUR-NAME` with something unique (your name, company, etc.) as S3 bucket names must be globally unique.

---

## Local Development Setup

### Step 1: Navigate to Project Directory

```bash
# Navigate to the project
cd /Users/apple/repository/dental-hospital-system

# Verify you're in the right directory
pwd
ls -la  # Should see package.json, src/, infrastructure/, etc.
```

---

### Step 2: Install Project Dependencies

```bash
# Install all Node.js packages
npm install

# This will:
# - Download all dependencies listed in package.json
# - Create node_modules/ directory
# - Install TypeScript, AWS SDK, testing tools, etc.

# Expected output: Should complete without errors
# Time: 2-5 minutes depending on internet speed

# Verify installation
ls node_modules  # Should see many folders
```

**Troubleshooting**:
- If you get permission errors, use `sudo npm install` (not recommended) or fix npm permissions
- If download fails, check internet connection
- If you get "package not found", run `npm cache clean --force` and try again

---

### Step 3: Create Environment Variables File

```bash
# Create .env file in project root
cat > .env << 'EOF'
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID_HERE
ENVIRONMENT=production
PROJECT_NAME=dental-hospital-system
JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECRET_STRING
EOF

# Get your AWS Account ID
aws sts get-caller-identity --query Account --output text

# Update .env file with your account ID
# Use a text editor to replace YOUR_ACCOUNT_ID_HERE

# Generate a secure JWT secret
openssl rand -base64 32

# Update .env file with the generated secret
# Replace CHANGE_THIS_TO_RANDOM_SECRET_STRING
```

**Security Note**: Never commit `.env` file to git. It's already in `.gitignore`.

---

### Step 4: Verify Project Structure

```bash
# Check project structure
tree -L 2 -I 'node_modules'  # If tree is installed
# OR
find . -maxdepth 2 -type d | grep -v node_modules

# Should see:
# - src/ (application code)
# - infrastructure/ (Terraform code)
# - tests/ (test files)
# - docs/ (documentation)
# - package.json (dependencies)
```

---

## Infrastructure Deployment

### Step 1: Navigate to Infrastructure Directory

```bash
cd infrastructure
ls -la  # Should see .tf files (Terraform configuration files)
```

---

### Step 2: Initialize Terraform

**What this does**: Downloads Terraform providers (plugins for AWS, etc.) and sets up backend.

```bash
# Initialize Terraform with S3 backend
# Replace YOUR-BUCKET-NAME with your actual bucket name from earlier
terraform init \
  -backend-config="bucket=dental-hospital-terraform-state-YOUR-NAME" \
  -backend-config="key=dental-hospital/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="encrypt=true"

# Expected output:
# - "Initializing provider plugins..."
# - "Terraform has been successfully initialized!"
# - Creates .terraform/ directory

# If you get errors:
# - Check bucket name is correct
# - Check AWS credentials are configured
# - Check bucket exists: aws s3 ls | grep terraform
```

**Time**: 1-2 minutes

---

### Step 3: Review Terraform Variables

```bash
# Check what variables are needed
cat variables.tf

# Create terraform.tfvars file with your values
cat > terraform.tfvars << 'EOF'
aws_region = "us-east-1"
environment = "production"
project_name = "dental-hospital-system"
jwt_secret = "YOUR_JWT_SECRET_FROM_ENV_FILE"
jwt_access_expiry = "30m"
jwt_refresh_expiry = "30d"
rate_limit_per_user = 15
api_gateway_stage_name = "prod"
enable_cloudfront = true
EOF

# Update jwt_secret with the value from your .env file
```

---

### Step 4: Validate Terraform Configuration

```bash
# Check for syntax errors
terraform validate

# Expected output: "Success! The configuration is valid."

# If errors:
# - Fix syntax errors shown
# - Check all .tf files are in infrastructure/ directory
```

---

### Step 5: Plan Infrastructure Deployment

**What this does**: Shows what resources will be created without actually creating them.

```bash
# Generate execution plan
terraform plan

# This will show:
# - Resources to be created (marked with +)
# - Resources to be modified (marked with ~)
# - Resources to be destroyed (marked with -)

# Review the plan carefully:
# - Should create ~20-30 resources
# - DynamoDB tables (8 tables)
# - Lambda functions (10 functions)
# - API Gateway
# - S3 buckets (3 buckets)
# - IAM roles and policies
# - EventBridge rules
# - CloudFront distribution

# Save plan to file for review
terraform plan -out=tfplan
```

**Time**: 2-3 minutes

**What to look for**:
- No errors
- All expected resources listed
- Correct region
- Correct resource names

---

### Step 6: Apply Infrastructure

**⚠️ WARNING**: This will create real AWS resources and may incur costs.

```bash
# Apply the plan
terraform apply

# OR use the saved plan
terraform apply tfplan

# Terraform will:
# 1. Show the plan again
# 2. Ask: "Do you want to perform these actions?"
# 3. Type: yes

# Expected output:
# - "aws_dynamodb_table.users: Creating..."
# - "aws_dynamodb_table.users: Creation complete"
# - ... (many resources)
# - "Apply complete! Resources: X added, 0 changed, 0 destroyed."

# Time: 10-15 minutes
```

**What happens**:
- Creates DynamoDB tables
- Creates S3 buckets
- Creates Lambda functions (empty, will deploy code later)
- Creates API Gateway
- Creates IAM roles
- Sets up EventBridge rules
- Creates CloudFront distribution

**Cost estimate**: 
- Free tier covers most resources for first year
- Estimated cost after free tier: $20-50/month for low traffic

---

### Step 7: Save Terraform Outputs

```bash
# Save outputs to file
terraform output -json > ../terraform-outputs.json

# View outputs
terraform output

# Important outputs:
# - api_gateway_url: Your API endpoint
# - images_bucket_name: S3 bucket for images
# - cloudfront_url: CDN URL for images
# - dynamodb_table_names: All table names

# Save API Gateway URL for later
terraform output api_gateway_url > ../api-url.txt
cat ../api-url.txt
```

---

## Application Deployment

### Step 1: Build TypeScript Code

```bash
# Go back to project root
cd ..

# Build Lambda functions
npm run build:lambda

# This will:
# - Compile TypeScript to JavaScript
# - Output to dist/lambda/ directory
# - Create separate folders for each handler

# Verify build
ls -la dist/lambda/
# Should see: auth/, users/, patients/, procedures/, images/, etc.
```

**Troubleshooting**:
- If build fails, check for TypeScript errors
- Run `npm run build` first to check for compilation errors
- Check `tsconfig.json` is correct

---

### Step 2: Package Lambda Functions

```bash
# Navigate to dist/lambda
cd dist/lambda

# Package each Lambda function
# Each function needs to be a zip file with its code and node_modules

# Method 1: Manual packaging (for each function)
cd auth
zip -r ../auth-handler.zip . -x "*.git*" -x "*.DS_Store"
cd ../users
zip -r ../users-handler.zip . -x "*.git*" -x "*.DS_Store"
# ... repeat for all handlers

# Method 2: Use the deployment script (recommended)
cd ../..
./scripts/deploy-lambda.sh

# OR create packages manually:
cd dist/lambda
for dir in */; do
  cd "$dir"
  zip -r "../${dir%/}.zip" . -x "*.git*" -x "*.DS_Store"
  cd ..
done
cd ../..
```

**Verify packages**:
```bash
ls -lh dist/*.zip
# Should see zip files for each handler
# Each should be 1-5 MB in size
```

---

### Step 3: Update Lambda Environment Variables

```bash
# Get table names from Terraform outputs
cd infrastructure
TABLE_NAMES=$(terraform output -json | jq -r '.dynamodb_tables.value')

# Create environment variables file
cat > ../lambda-env.json << EOF
{
  "USERS_TABLE_NAME": "$(terraform output -raw users_table_name)",
  "PATIENTS_TABLE_NAME": "$(terraform output -raw patients_table_name)",
  "PROCEDURES_TABLE_NAME": "$(terraform output -raw procedures_table_name)",
  "PROCEDURE_STEPS_TABLE_NAME": "$(terraform output -raw procedure_steps_table_name)",
  "IMAGES_TABLE_NAME": "$(terraform output -raw images_table_name)",
  "CONSENT_TABLE_NAME": "$(terraform output -raw consent_table_name)",
  "AUDIT_LOGS_TABLE_NAME": "$(terraform output -raw audit_logs_table_name)",
  "USER_PATIENT_MAPPING_TABLE_NAME": "$(terraform output -raw user_patient_mapping_table_name)",
  "IMAGES_BUCKET": "$(terraform output -raw images_bucket_name)",
  "ARCHIVE_BUCKET": "$(terraform output -raw archive_bucket_name)",
  "JWT_SECRET": "$(terraform output -raw jwt_secret)",
  "JWT_ACCESS_EXPIRY": "30m",
  "JWT_REFRESH_EXPIRY": "30d",
  "SNS_TOPIC_ARN": "$(terraform output -raw sns_topic_arn)",
  "AWS_REGION": "$(terraform output -raw aws_region)"
}
EOF

cd ..
```

---

### Step 4: Deploy Lambda Functions

```bash
# Deploy each Lambda function
# Get function names from Terraform
cd infrastructure
FUNCTIONS=$(terraform output -json | jq -r '.lambda_functions.value[]')

cd ..

# Deploy each function
for func in auth-handler users-handler patients-handler procedures-handler \
            images-handler consent-handler audit-handler admin-handler \
            steps-handler archive-handler; do
  echo "Deploying $func..."
  aws lambda update-function-code \
    --function-name "dental-hospital-system-production-${func}" \
    --zip-file "fileb://dist/${func}.zip" \
    --region us-east-1
  
  # Update environment variables
  aws lambda update-function-configuration \
    --function-name "dental-hospital-system-production-${func}" \
    --environment "Variables=$(cat lambda-env.json)" \
    --region us-east-1
  
  echo "$func deployed successfully"
done
```

**Verify deployment**:
```bash
# Test a Lambda function
aws lambda invoke \
  --function-name dental-hospital-system-production-auth-handler \
  --payload '{"httpMethod":"GET","path":"/health"}' \
  response.json

cat response.json
```

---

### Step 5: Deploy API Gateway

```bash
# API Gateway should be deployed via Terraform
# But we need to create a deployment

cd infrastructure
API_ID=$(terraform output -raw api_gateway_id)

# Create deployment
aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name prod \
  --description "Initial deployment"

# Get API URL
API_URL=$(terraform output -raw api_gateway_url)
echo "API URL: $API_URL"

cd ..
```

---

## Configuration

### Step 1: Configure S3 Buckets

```bash
# Get bucket names
cd infrastructure
IMAGES_BUCKET=$(terraform output -raw images_bucket_name)
ARCHIVE_BUCKET=$(terraform output -raw archive_bucket_name)

# Verify buckets exist
aws s3 ls | grep "$IMAGES_BUCKET"
aws s3 ls | grep "$ARCHIVE_BUCKET"

# Configure CORS for images bucket (allows browser access)
cat > ../s3-cors-config.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket "$IMAGES_BUCKET" \
  --cors-configuration file://../s3-cors-config.json

cd ..
```

---

### Step 2: Configure SNS for OTP

```bash
cd infrastructure
SNS_TOPIC_ARN=$(terraform output -raw sns_topic_arn)

# Verify topic exists
aws sns get-topic-attributes --topic-arn "$SNS_TOPIC_ARN"

# Note: For production, you'll need to:
# 1. Request SMS sending limits increase in AWS Support
# 2. Verify phone numbers for testing
# 3. Set up spending limits

cd ..
```

---

### Step 3: Create Initial Admin User

```bash
# Get API URL
cd infrastructure
API_URL=$(terraform output -raw api_gateway_url)
cd ..

# Create admin user via API
# First, you'll need to temporarily allow user creation without auth
# OR use AWS CLI to directly insert into DynamoDB

# Method 1: Direct DynamoDB insert (for initial setup)
aws dynamodb put-item \
  --table-name dental-hospital-system-production-users \
  --item '{
    "PK": {"S": "USER#admin-001"},
    "SK": {"S": "USER#admin-001"},
    "GSI1PK": {"S": "MOBILE#9999999999"},
    "user_id": {"S": "admin-001"},
    "mobile_number": {"S": "9999999999"},
    "name": {"S": "Hospital Admin"},
    "roles": {"SS": ["HOSPITAL_ADMIN"]},
    "password_hash": {"S": "$2a$10$CHANGE_THIS_WITH_ACTUAL_HASH"},
    "created_at": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "updated_at": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
  }'

# Generate password hash (use Node.js)
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourSecurePassword123!', 10).then(hash => console.log(hash))"

# Update the password_hash in the command above
```

---

## Testing

### Step 1: Test API Endpoints

```bash
# Get API URL
API_URL=$(cat api-url.txt)

# Test health endpoint (if exists)
curl "$API_URL/health"

# Test login endpoint
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9999999999",
    "password": "YourSecurePassword123!"
  }'

# Should return access_token and refresh_token
```

---

### Step 2: Run Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- AuthService.test.ts

# Expected: All tests should pass
```

---

### Step 3: Manual Testing Checklist

Use the HTML checklist file (`deployment-checklist.html`) to track your progress.

---

## Monitoring

### Step 1: Set Up CloudWatch Alarms

```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name dental-hospital-lambda-errors \
  --alarm-description "Alert on Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:alerts
```

---

### Step 2: View Logs

```bash
# View Lambda function logs
aws logs tail /aws/lambda/dental-hospital-system-production-auth-handler --follow

# View API Gateway logs
aws logs tail /aws/apigateway/dental-hospital-api --follow
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Terraform Init Fails
**Error**: "Failed to get existing workspaces"
**Solution**: 
- Check S3 bucket exists: `aws s3 ls | grep terraform`
- Check AWS credentials: `aws sts get-caller-identity`
- Check bucket permissions

#### Issue 2: Lambda Deployment Fails
**Error**: "The role defined for the function cannot be assumed"
**Solution**:
- Check IAM role exists: `aws iam get-role --role-name dental-hospital-lambda-role`
- Wait a few minutes after Terraform creates the role
- Verify role trust policy allows Lambda service

#### Issue 3: API Gateway Returns 500
**Error**: Internal server error
**Solution**:
- Check Lambda function logs
- Verify environment variables are set
- Check Lambda function has correct handler name
- Verify API Gateway integration is correct

#### Issue 4: DynamoDB Access Denied
**Error**: "User is not authorized to perform: dynamodb:PutItem"
**Solution**:
- Check IAM role has DynamoDB permissions
- Verify table names in environment variables match actual table names
- Check IAM policy attached to Lambda execution role

---

## Next Steps

1. ✅ Complete all steps in the HTML checklist
2. ✅ Test all API endpoints
3. ✅ Set up monitoring and alerts
4. ✅ Review security settings
5. ✅ Document your specific configuration
6. ✅ Set up CI/CD pipeline (optional)

---

## Support

If you encounter issues:
1. Check CloudWatch logs
2. Review Terraform outputs
3. Check AWS Service Health Dashboard
4. Review error messages carefully
5. Check this guide's troubleshooting section

---

**Last Updated**: 2025-01-15  
**Version**: 2.0 (Complete Beginner's Guide)
