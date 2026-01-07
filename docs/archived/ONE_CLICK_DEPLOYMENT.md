# 🚀 One-Click Deployment Guide

## Complete Automated Deployment

This guide explains how to deploy the entire Dental Hospital System with a single command.

---

## Quick Start

### For New Setup

```bash
# 1. Configure AWS CLI
aws configure

# 2. Create .env file (if not exists)
cat > .env << EOF
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ENVIRONMENT=production
PROJECT_NAME=dental-hospital-system
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=YourSecurePassword123!
TERRAFORM_STATE_BUCKET=
EOF

# 3. Deploy everything
npm run deploy:all

# OR directly:
./scripts/deploy-all.sh
```

**That's it!** The script will:
- ✅ Check prerequisites
- ✅ Create Terraform state bucket (if needed)
- ✅ Deploy all infrastructure
- ✅ Build and deploy Lambda functions
- ✅ Deploy API Gateway
- ✅ Create admin user
- ✅ Verify deployment

---

## For Migration (New AWS Account)

```bash
# 1. Configure AWS CLI for NEW account
aws configure --profile new-account
export AWS_PROFILE=new-account

# 2. Create .env file for new account
cat > .env << EOF
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ENVIRONMENT=production
PROJECT_NAME=dental-hospital-system
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=YourSecurePassword123!
TERRAFORM_STATE_BUCKET=dental-hospital-terraform-state-new-$(date +%s)
EOF

# 3. Deploy infrastructure and code (skip admin if importing data)
npm run deploy:all:migration

# OR:
./scripts/deploy-all.sh --migration --skip-admin

# 4. Import data
./scripts/migrate-import-data.sh ./migration-export-YYYYMMDD-HHMMSS

# 5. Verify
./scripts/migrate-verify.sh ./migration-export-YYYYMMDD-HHMMSS
```

---

## What the Script Does

### 1. Prerequisites Check
- ✅ AWS CLI installed and configured
- ✅ Terraform installed
- ✅ Node.js installed
- ✅ jq installed
- ✅ AWS credentials valid
- ✅ .env file exists

### 2. Terraform Backend Setup
- ✅ Creates S3 bucket for Terraform state (if not specified)
- ✅ Enables versioning and encryption
- ✅ Initializes Terraform with backend

### 3. Infrastructure Deployment
- ✅ Creates terraform.tfvars (if not exists)
- ✅ Validates Terraform configuration
- ✅ Plans infrastructure changes
- ✅ Applies infrastructure (creates all AWS resources)
- ✅ Saves Terraform outputs

### 4. Application Build
- ✅ Installs npm dependencies
- ✅ Builds Lambda functions (TypeScript → JavaScript)

### 5. Lambda Deployment
- ✅ Packages each Lambda function
- ✅ Deploys all Lambda functions
- ✅ Updates environment variables
- ✅ Waits for deployment to complete

### 6. API Gateway Deployment
- ✅ Creates API Gateway deployment
- ✅ Saves API URL to file

### 7. Admin User Creation
- ✅ Checks if admin user exists
- ✅ Creates admin user if not exists
- ✅ Generates password hash
- ✅ Displays credentials

### 8. Verification
- ✅ Tests API Gateway accessibility
- ✅ Verifies Lambda functions exist
- ✅ Verifies DynamoDB tables exist
- ✅ Verifies S3 buckets exist

---

## Command Options

```bash
./scripts/deploy-all.sh [OPTIONS]
```

### Options

| Option | Description |
|--------|-------------|
| `--migration` | Migration mode (skips infrastructure deployment, assumes it exists) |
| `--skip-admin` | Skip admin user creation (useful when importing data) |
| `--skip-verify` | Skip verification steps (faster deployment) |

### Examples

```bash
# Standard deployment
./scripts/deploy-all.sh

# Migration deployment (infrastructure already exists)
./scripts/deploy-all.sh --migration

# Migration without admin creation (will import users)
./scripts/deploy-all.sh --migration --skip-admin

# Quick deployment without verification
./scripts/deploy-all.sh --skip-verify
```

---

## Environment Variables (.env)

Required variables:

```bash
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
ENVIRONMENT=production
PROJECT_NAME=dental-hospital-system
JWT_SECRET=your-secret-here
ADMIN_PASSWORD=YourSecurePassword123!
TERRAFORM_STATE_BUCKET=  # Optional: Will be created if empty
```

### Auto-Generated Values

If not specified, the script will:
- Generate `JWT_SECRET` automatically
- Create `TERRAFORM_STATE_BUCKET` automatically
- Use default `ADMIN_PASSWORD` if not set

---

## Deployment Time

| Phase | Time |
|-------|------|
| Prerequisites Check | 10 seconds |
| Terraform Backend Setup | 1-2 minutes |
| Infrastructure Deployment | 10-15 minutes |
| Application Build | 1-2 minutes |
| Lambda Deployment | 5-10 minutes |
| API Gateway Deployment | 1 minute |
| Admin User Creation | 10 seconds |
| Verification | 1-2 minutes |
| **Total** | **20-35 minutes** |

---

## What Gets Created

### AWS Resources

- ✅ **8 DynamoDB Tables** (users, patients, procedures, etc.)
- ✅ **10+ Lambda Functions** (auth, users, patients, etc.)
- ✅ **1 API Gateway** (REST API)
- ✅ **3 S3 Buckets** (images, archive, terraform-state)
- ✅ **1 CloudFront Distribution** (for images)
- ✅ **IAM Roles and Policies** (for Lambda execution)
- ✅ **EventBridge Rules** (for scheduled tasks)
- ✅ **SNS Topic** (for OTP)

### Application

- ✅ **Compiled Lambda Functions** (TypeScript → JavaScript)
- ✅ **Packaged Deployment Files** (.zip files)
- ✅ **Environment Configuration** (lambda-env.json)
- ✅ **Terraform Outputs** (terraform-outputs.json)
- ✅ **API URL** (api-url.txt)

### Initial Data

- ✅ **Admin User** (mobile: 9999999999, password from .env)

---

## Troubleshooting

### Error: "AWS CLI not found"

**Solution**: Install AWS CLI
```bash
# Mac
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

---

### Error: "Terraform not found"

**Solution**: Install Terraform
```bash
# Mac
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

---

### Error: "jq not found"

**Solution**: Install jq
```bash
# Mac
brew install jq

# Linux
sudo apt install jq
```

---

### Error: "AWS credentials not configured"

**Solution**: Configure AWS CLI
```bash
aws configure
# Enter Access Key ID
# Enter Secret Access Key
# Default region: us-east-1
# Default output: json
```

---

### Error: "Function not found" during Lambda deployment

**Solution**: 
- Make sure infrastructure is deployed first
- Run `terraform apply` in infrastructure directory
- Or run the script without `--migration` flag

---

### Error: "Bucket already exists"

**Solution**: 
- Set `TERRAFORM_STATE_BUCKET` in .env to an existing bucket
- Or choose a different bucket name (must be globally unique)

---

## Verification After Deployment

### 1. Check API Gateway

```bash
API_URL=$(cat api-url.txt)
echo "API URL: $API_URL"

# Test login
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9999999999",
    "password": "YourPassword"
  }'
```

### 2. Check Lambda Functions

```bash
aws lambda list-functions | grep dental-hospital
```

### 3. Check DynamoDB Tables

```bash
aws dynamodb list-tables | grep dental-hospital
```

### 4. Check S3 Buckets

```bash
aws s3 ls | grep dental-hospital
```

---

## Rollback

If something goes wrong:

### 1. Destroy Infrastructure

```bash
cd infrastructure
terraform destroy
# Type: yes
```

### 2. Clean Up Local Files

```bash
rm -rf dist/
rm -f lambda-env.json
rm -f terraform-outputs.json
rm -f api-url.txt
```

---

## Best Practices

1. **Always backup** before deployment
2. **Test in staging** before production
3. **Review Terraform plan** before applying
4. **Save credentials** securely (admin password, API URL)
5. **Monitor CloudWatch logs** after deployment
6. **Verify all endpoints** work correctly

---

## Integration with Migration

The one-click deployment script works perfectly with migration:

### Migration Workflow

```bash
# 1. Export from old account
export AWS_PROFILE=old-account
./scripts/migrate-export-data.sh

# 2. Deploy to new account
export AWS_PROFILE=new-account
./scripts/deploy-all.sh --migration --skip-admin

# 3. Import data
./scripts/migrate-import-data.sh ./migration-export-YYYYMMDD-HHMMSS

# 4. Verify
./scripts/migrate-verify.sh ./migration-export-YYYYMMDD-HHMMSS
```

---

## Advanced Usage

### Custom Terraform Variables

Edit `infrastructure/terraform.tfvars` before running:

```hcl
aws_region = "us-east-1"
environment = "production"
jwt_secret = "your-custom-secret"
# ... other variables
```

### Skip Specific Steps

The script is modular - you can modify it to skip specific steps if needed.

### Parallel Deployment

For faster deployment, you could modify the script to deploy Lambda functions in parallel (current version deploys sequentially for safety).

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review CloudWatch logs
3. Check Terraform state: `terraform show`
4. Verify AWS credentials: `aws sts get-caller-identity`
5. Review error messages carefully

---

**Last Updated**: 2025-01-08  
**Version**: 1.0

