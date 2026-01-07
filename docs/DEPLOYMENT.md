# 🚀 Complete Deployment Guide
## Dental Hospital Records System

> **One-stop guide for deploying the Dental Hospital System** - From zero to production in one document.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Interactive Deployment (Recommended)](#interactive-deployment-recommended)
4. [GitHub Secrets Setup (CI/CD)](#github-secrets-setup-cicd)
5. [Custom Domain Setup (Optional)](#custom-domain-setup-optional)
6. [Manual Deployment](#manual-deployment)
7. [Migration Guide](#migration-guide)
8. [Troubleshooting](#troubleshooting)
9. [Verification](#verification)

---

## Quick Start

### 🎯 Fastest Way (Interactive)

```bash
# 1. Configure AWS CLI
aws configure

# 2. Run interactive deployment
npm run deploy
```

**That's it!** The script will ask for all configuration and deploy everything automatically.

**Time**: 20-35 minutes (fully automated)

---

## Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|-------------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org/) or `brew install node@20` |
| **AWS CLI** | 2.0+ | [aws.amazon.com/cli](https://aws.amazon.com/cli/) or `brew install awscli` |
| **Terraform** | 1.5+ | [terraform.io](https://www.terraform.io/) or `brew install terraform` |
| **jq** | Latest | `brew install jq` (Mac) or `sudo apt install jq` (Linux) |
| **Git** | Latest | Usually pre-installed |

### Verify Installation

```bash
node --version      # Should show v20.x.x or higher
npm --version       # Should show 10.x.x or higher
aws --version       # Should show aws-cli/2.x.x
terraform version   # Should show Terraform v1.5.x or higher
jq --version        # Should show jq-1.6 or higher
```

### AWS Account Setup

1. **Create AWS Account**: [aws.amazon.com](https://aws.amazon.com/)
2. **Create IAM User**:
   - Go to IAM → Users → Create User
   - Name: `dental-hospital-admin`
   - Attach policy: `AdministratorAccess` (for initial setup)
   - Create access key
   - **Save credentials securely** (you won't see secret key again)

3. **Configure AWS CLI**:
   ```bash
   aws configure
   # Enter Access Key ID
   # Enter Secret Access Key
   # Default region: us-east-1
   # Default output: json
   ```

4. **Verify AWS Access**:
   ```bash
   aws sts get-caller-identity
   # Should show your account ID
   ```

---

## Interactive Deployment (Recommended)

### What It Does

The interactive deployment script (`npm run deploy`) will:

1. ✅ Ask for all configuration upfront
2. ✅ Save configuration to `.env` file
3. ✅ Check prerequisites
4. ✅ Set up Terraform backend
5. ✅ Deploy infrastructure
6. ✅ Build and deploy Lambda functions
7. ✅ Deploy API Gateway
8. ✅ Create admin user
9. ✅ Verify deployment

### Step-by-Step

```bash
# Run interactive deployment
npm run deploy
```

**Configuration Prompts**:

1. **AWS Region**: `us-east-1` (or your preferred)
2. **Project Name**: `dental-hospital-system`
3. **Environment**: `production`
4. **JWT Secret**: (generates automatically or enter your own)
5. **Admin Password**: Choose a strong password
6. **Terraform State Bucket**: (auto-creates if empty)
7. **Custom Domain (API)**: Optional (e.g., `api.rghs-dental.info`)
8. **Custom Domain (CloudFront)**: Optional (e.g., `cdn.rghs-dental.info`)
9. **Migration Mode**: `No` (for new setup)

**After Configuration**:

The script will:
- Save everything to `.env` file
- Deploy infrastructure (10-15 minutes)
- Deploy application code (5-10 minutes)
- Create admin user
- Show API URL and credentials

**Output**:

```
✅ Deployment completed successfully!

API Gateway URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod

Admin Credentials:
  Mobile: 9999999999
  Password: YourPassword123!
```

---

## GitHub Secrets Setup (CI/CD)

### Why Use GitHub Secrets?

✅ **Security**: Encrypted, never exposed in logs  
✅ **CI/CD Ready**: Automatic deployments  
✅ **Team Collaboration**: Shared secrets  
✅ **No Local Files**: No sensitive data in code  

### Required Secrets

**Core (Required)**:
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `JWT_SECRET` - Generate: `openssl rand -base64 32`

**Optional**:
- `AWS_REGION` - Defaults to `us-east-1`
- `PROJECT_NAME` - Defaults to `dental-hospital-system`
- `ADMIN_PASSWORD` - Defaults to `Admin123!`
- `TERRAFORM_STATE_BUCKET` - Auto-created if empty
- Custom domain secrets (see Custom Domain section)

### Setup Steps

1. **Go to Repository Settings**:
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
   ```

2. **Add Secrets**:
   - Click "New repository secret"
   - Add each secret:
     - `AWS_ACCESS_KEY_ID`: Your AWS access key
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
     - `JWT_SECRET`: Generated secret (`openssl rand -base64 32`)
     - `ADMIN_PASSWORD`: Your admin password
     - (Optional) Custom domain secrets

3. **Deploy via GitHub Actions**:
   - Push to `main` branch (auto-deploys)
   - OR Go to Actions → Deploy to AWS → Run workflow

### Configuration Priority

The deployment script uses this priority order:

1. **GitHub Secrets** (CI/CD environment)
2. **`.env` file** (local development)
3. **Environment Variables** (already set)
4. **Defaults** (sensible fallbacks)

---

## Custom Domain Setup (Optional)

### Overview

Custom domains are **completely optional**. The system works perfectly with default AWS URLs.

**Supported Domains**:
- **API Gateway**: `api.rghs-dental.info` (or your domain)
- **CloudFront**: `cdn.rghs-dental.info` (or your domain)

### Prerequisites

- Domain registered (e.g., `rghs-dental.info`)
- Route53 hosted zone created
- ACM certificates in `us-east-1` region

### Step 1: Create Route53 Hosted Zone

1. Go to [Route53 Console](https://console.aws.amazon.com/route53/)
2. Create Hosted Zone:
   - Domain name: `rghs-dental.info`
   - Type: Public hosted zone
   - Click "Create hosted zone"
3. **Save Hosted Zone ID**: Copy the ID (e.g., `Z1234567890ABC`)
4. **Update Nameservers**: Update your domain registrar with Route53 nameservers

### Step 2: Request ACM Certificates

**⚠️ IMPORTANT**: Certificates **MUST** be in `us-east-1` region!

#### For API Gateway:

1. Go to [ACM Console (us-east-1)](https://console.aws.amazon.com/acm/home?region=us-east-1)
2. Request Certificate:
   - Domain: `api.rghs-dental.info`
   - Validation: DNS validation
   - Click "Request"
3. Validate:
   - Click "Create record in Route53" (if available)
   - OR manually add CNAME to Route53
   - Wait 5-30 minutes for validation
4. **Save Certificate ARN**: Copy the ARN

#### For CloudFront:

1. Same process as above
2. Domain: `cdn.rghs-dental.info`
3. Save Certificate ARN

### Step 3: Configure During Deployment

When running `npm run deploy`, enter:

- **API Custom Domain**: `api.rghs-dental.info`
- **Route53 Hosted Zone ID**: `Z1234567890ABC`
- **ACM Certificate ARN**: `arn:aws:acm:us-east-1:...`
- **CloudFront Custom Domain**: `cdn.rghs-dental.info` (optional)
- **CloudFront Route53 Zone ID**: `Z1234567890ABC` (optional)
- **CloudFront ACM Certificate ARN**: `arn:aws:acm:us-east-1:...` (optional)

### Step 4: Verify DNS

After deployment:

```bash
# Check API domain
dig api.rghs-dental.info

# Check CloudFront domain (if configured)
dig cdn.rghs-dental.info
```

### Step 5: Test

```bash
# Test API Gateway custom domain
curl https://api.rghs-dental.info/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"9999999999","password":"YourPassword"}'
```

---

## Manual Deployment

### For Experienced Developers

If you prefer manual control:

#### 1. Create .env File

```bash
cat > .env << EOF
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
PROJECT_NAME=dental-hospital-system
ENVIRONMENT=production
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=YourSecurePassword123!
TERRAFORM_STATE_BUCKET=
EOF
```

#### 2. Deploy Infrastructure

```bash
cd infrastructure

# Create terraform.tfvars
cat > terraform.tfvars << EOF
aws_region = "us-east-1"
environment = "production"
project_name = "dental-hospital-system"
jwt_secret = "$(grep JWT_SECRET ../.env | cut -d'=' -f2)"
EOF

# Initialize Terraform
terraform init \
  -backend-config="bucket=$(grep TERRAFORM_STATE_BUCKET ../.env | cut -d'=' -f2)" \
  -backend-config="key=dental-hospital/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="encrypt=true"

# Plan and Apply
terraform plan
terraform apply  # Type 'yes' when prompted

# Save outputs
terraform output -json > ../terraform-outputs.json
terraform output api_gateway_url > ../api-url.txt

cd ..
```

#### 3. Deploy Application

```bash
# Build Lambda functions
npm run build:lambda

# Deploy Lambda functions
npm run deploy:lambda

# OR use the deployment script
./scripts/deploy-all.sh --skip-admin
```

#### 4. Create Admin User

```bash
# Generate password hash
PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123!', 10).then(hash => console.log(hash))")

# Get table name
cd infrastructure
USERS_TABLE=$(terraform output -raw users_table_name)
cd ..

# Create user
aws dynamodb put-item \
  --table-name "$USERS_TABLE" \
  --item "{
    \"PK\": {\"S\": \"USER#admin-001\"},
    \"SK\": {\"S\": \"USER#admin-001\"},
    \"GSI1PK\": {\"S\": \"MOBILE#9999999999\"},
    \"user_id\": {\"S\": \"admin-001\"},
    \"mobile_number\": {\"S\": \"9999999999\"},
    \"name\": {\"S\": \"Hospital Admin\"},
    \"roles\": {\"SS\": [\"HOSPITAL_ADMIN\"]},
    \"password_hash\": {\"S\": \"$PASSWORD_HASH\"},
    \"created_at\": {\"S\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"},
    \"updated_at\": {\"S\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"},
    \"login_count\": {\"N\": \"0\"},
    \"is_default_password\": {\"BOOL\": false},
    \"is_blocked\": {\"BOOL\": false}
  }"
```

---

## Migration Guide

> **For migrating to a new AWS account** (free tier strategy)

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for complete migration instructions.

**Quick Migration**:

```bash
# 1. Export from old account
export AWS_PROFILE=old-account
./scripts/migrate-export-data.sh

# 2. Deploy to new account
export AWS_PROFILE=new-account
npm run deploy:all:migration

# 3. Import data
./scripts/migrate-import-data.sh ./migration-export-YYYYMMDD-HHMMSS

# 4. Verify
./scripts/migrate-verify.sh ./migration-export-YYYYMMDD-HHMMSS
```

**Important**: All dates and timestamps are preserved during migration.

---

## Troubleshooting

### Problem: "AWS CLI not found"

**Solution**:
```bash
# Mac
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

---

### Problem: "Terraform not found"

**Solution**:
```bash
# Mac
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

---

### Problem: "AWS credentials not configured"

**Solution**:
```bash
aws configure
# Enter Access Key ID
# Enter Secret Access Key
# Default region: us-east-1
# Default output: json

# Verify
aws sts get-caller-identity
```

---

### Problem: "Function not found" during Lambda deployment

**Solution**:
- Make sure infrastructure is deployed first
- Run `terraform apply` in infrastructure directory
- Wait 2-3 minutes after terraform apply
- Check function names match: `dental-hospital-system-production-{function-name}`

---

### Problem: "Bucket already exists"

**Solution**:
- Set `TERRAFORM_STATE_BUCKET` in `.env` to an existing bucket
- Or choose a different bucket name (must be globally unique)

---

### Problem: Certificate validation failed

**Solution**:
- Check DNS records in Route53
- Ensure CNAME records match ACM requirements exactly
- Wait 30 minutes for DNS propagation
- Re-request certificate if needed

---

### Problem: Custom domain not working

**Solution**:
1. Check Route53 records exist:
   ```bash
   aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID
   ```

2. Check API Gateway domain name:
   ```bash
   aws apigateway get-domain-name --domain-name api.rghs-dental.info
   ```

3. Verify certificate is validated:
   ```bash
   aws acm describe-certificate --certificate-arn YOUR_CERT_ARN --region us-east-1
   ```

---

### Problem: Deployment fails in GitHub Actions

**Solution**:
1. Check Actions logs for specific error
2. Verify all required secrets are set:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `JWT_SECRET`
3. Check AWS credentials have correct permissions
4. Verify Terraform state bucket exists (or leave empty to auto-create)

---

## Verification

### Check API Gateway

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

### Check Lambda Functions

```bash
aws lambda list-functions | grep dental-hospital
```

### Check DynamoDB Tables

```bash
aws dynamodb list-tables | grep dental-hospital
```

### Check S3 Buckets

```bash
aws s3 ls | grep dental-hospital
```

### Check CloudWatch Logs

```bash
aws logs tail /aws/lambda/dental-hospital-system-production-auth-handler --follow
```

---

## Deployment Time Estimates

| Phase | Time | Complexity |
|-------|------|------------|
| Prerequisites Check | 10 seconds | Easy |
| Terraform Backend Setup | 1-2 minutes | Easy |
| Infrastructure Deployment | 10-15 minutes | Medium |
| Application Build | 1-2 minutes | Easy |
| Lambda Deployment | 5-10 minutes | Medium |
| API Gateway Deployment | 1 minute | Easy |
| Admin User Creation | 10 seconds | Easy |
| Verification | 1-2 minutes | Easy |
| **Total** | **20-35 minutes** | **Medium** |

---

## Success Criteria

You'll know deployment was successful when:

- ✅ `terraform apply` completes without errors
- ✅ All Lambda functions deployed
- ✅ API Gateway URL accessible
- ✅ Can login with admin credentials
- ✅ Can create a patient via API
- ✅ Can upload an image
- ✅ CloudWatch logs show no errors

---

## Next Steps

After successful deployment:

1. **Test Login**: Use admin credentials to login
2. **Create Users**: Use admin interface to create additional users
3. **Update Frontend/Mobile**: Update API URL in applications
4. **Monitor**: Check CloudWatch logs regularly
5. **Backup**: Document all credentials securely

---

## Additional Resources

- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Migration Quick Reference**: [MIGRATION_QUICK_REFERENCE.md](./MIGRATION_QUICK_REFERENCE.md)
- **Interactive Checklist**: [deployment-checklist.html](./deployment-checklist.html)

---

**Last Updated**: 2025-01-08  
**Version**: 2.0 (Consolidated)

