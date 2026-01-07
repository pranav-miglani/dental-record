# 🔄 AWS Account Migration Guide
## Migrate Data to New AWS Account (Free Tier Strategy)

> **Strategy**: Create a new AWS account every 10-11 months to stay within free tier limits. This guide helps you migrate all data from the old account to the new account.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Migration Strategy](#migration-strategy)
3. [Prerequisites](#prerequisites)
4. [Step 1: Export Data from Old Account](#step-1-export-data-from-old-account)
5. [Step 2: Create New AWS Account](#step-2-create-new-aws-account)
6. [Step 3: Deploy Infrastructure in New Account](#step-3-deploy-infrastructure-in-new-account)
7. [Step 4: Import Data to New Account](#step-4-import-data-to-new-account)
8. [Step 5: Verify Migration](#step-5-verify-migration)
9. [Step 6: Update Applications](#step-6-update-applications)
10. [Step 7: Cleanup Old Account](#step-7-cleanup-old-account)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## Overview

### Why Migrate?

AWS Free Tier is valid for **12 months** from account creation. By migrating to a new account every **10-11 months**, you can:
- ✅ Stay within free tier limits
- ✅ Avoid paying for AWS services
- ✅ Maintain all your data and functionality

### What Gets Migrated?

- ✅ **DynamoDB Tables** (8 tables):
  - users
  - patients
  - user-patient-mappings
  - procedures
  - procedure-steps
  - images
  - consent
  - audit-logs

- ✅ **S3 Buckets** (2 buckets):
  - images (all medical images)
  - archive (archived records)

- ✅ **Configuration**:
  - Terraform outputs
  - API Gateway URLs

### What Doesn't Need Migration?

- ❌ Lambda function code (redeployed via Terraform)
- ❌ API Gateway configuration (recreated via Terraform)
- ❌ CloudFront distribution (recreated via Terraform)
- ❌ IAM roles/policies (recreated via Terraform)

---

## Migration Strategy

### Timeline

```
Month 0:   Create Account 1, Deploy System
Month 10:  Export data from Account 1
Month 10:  Create Account 2, Deploy Infrastructure
Month 10:  Import data to Account 2
Month 10:  Update applications, verify
Month 11:  Delete Account 1 (after verification)
Month 12:  Account 1 free tier expires (already migrated)
Month 24:  Repeat process (Account 2 → Account 3)
```

### Migration Window

- **Recommended**: Migrate at **month 10** (2 months before free tier expires)
- **Minimum**: Migrate at **month 11** (1 month before expiration)
- **Buffer**: Keep old account for 1 month after migration for verification

---

## Prerequisites

### Required Software

- ✅ AWS CLI installed and configured
- ✅ Terraform installed
- ✅ jq installed (`brew install jq` or `apt install jq`)
- ✅ Sufficient disk space (at least 2x your data size)
- ✅ Internet connection

### Required Access

- ✅ Old AWS account credentials (with read access)
- ✅ New AWS account credentials (with write access)
- ✅ Admin access to both accounts

### Estimated Time

- **Export**: 30-60 minutes (depends on data size)
- **New Account Setup**: 30 minutes
- **Infrastructure Deployment**: 30-45 minutes
- **Import**: 30-60 minutes (depends on data size)
- **Verification**: 15-30 minutes
- **Total**: 2-4 hours

---

## Step 1: Export Data from Old Account

### 1.1 Configure AWS CLI for Old Account

```bash
# Configure AWS CLI with OLD account credentials
aws configure --profile old-account

# Enter:
# - Access Key ID (old account)
# - Secret Access Key (old account)
# - Region: us-east-1
# - Output: json

# Verify connection
aws sts get-caller-identity --profile old-account
```

### 1.2 Make Scripts Executable

```bash
cd /Users/apple/repository/dental-hospital-system
chmod +x scripts/migrate-*.sh
```

### 1.3 Run Export Script

```bash
# Set AWS profile to old account
export AWS_PROFILE=old-account

# Run export script
./scripts/migrate-export-data.sh
```

**What happens**:
- Exports all DynamoDB tables to JSON files
- Downloads all S3 objects to local directory
- Creates manifest file with export details
- Compresses large files automatically

**Expected output**:
```
========================================
Data Export Script - Old AWS Account
========================================

✓ Created export directory: ./migration-export-20240108-120000
Getting DynamoDB table names...
  ✓ dental-hospital-system-production-users
  ✓ dental-hospital-system-production-patients
  ...
Exporting DynamoDB tables...
Exporting dental-hospital-system-production-users...
  Items to export: 150
  ✓ Exported 150 items to ./migration-export-20240108-120000/dental-hospital-system-production-users.json
...
Export Summary
Export directory: ./migration-export-20240108-120000
Total size: 2.5GB
✓ Export completed successfully!
```

### 1.4 Verify Export

```bash
# Check export directory
ls -lh migration-export-*

# Verify all tables exported
ls migration-export-*/dental-hospital-system-production-*.json

# Check S3 exports
ls -lh migration-export-*/s3-*

# View manifest
cat migration-export-*/MANIFEST.txt
```

### 1.5 Backup Export Directory

```bash
# Create backup (recommended)
tar -czf migration-export-backup-$(date +%Y%m%d).tar.gz migration-export-*

# Or copy to external drive/cloud storage
# Keep this backup until migration is verified!
```

---

## Step 2: Create New AWS Account

### 2.1 Create New AWS Account

Follow the same steps as initial setup:
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Complete registration (use different email if possible)
4. Verify phone number
5. Choose Basic support plan

**⚠️ Important**: Use a different email address if possible to avoid confusion.

### 2.2 Create IAM User in New Account

1. Login to new AWS account
2. Go to IAM → Users → Create user
3. Username: `dental-hospital-admin`
4. Attach `AdministratorAccess` policy
5. **Save Access Keys** (you'll only see them once!)

### 2.3 Configure AWS CLI for New Account

```bash
# Configure AWS CLI with NEW account credentials
aws configure --profile new-account

# Enter:
# - Access Key ID (new account)
# - Secret Access Key (new account)
# - Region: us-east-1
# - Output: json

# Verify connection
aws sts get-caller-identity --profile new-account
```

### 2.4 Create S3 Bucket for Terraform State

```bash
# Set profile to new account
export AWS_PROFILE=new-account

# Create unique bucket name (add timestamp or random number)
BUCKET_NAME="dental-hospital-terraform-state-new-$(date +%s)"

# Create bucket
aws s3 mb s3://$BUCKET_NAME

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket $BUCKET_NAME \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Save bucket name for later
echo $BUCKET_NAME > terraform-state-bucket-new.txt
```

---

## Step 3: Deploy Infrastructure in New Account

### 3.1 Update Terraform Backend

```bash
# Navigate to infrastructure directory
cd infrastructure

# Get bucket name
BUCKET_NAME=$(cat ../terraform-state-bucket-new.txt)

# Initialize Terraform with new backend
terraform init \
  -backend-config="bucket=$BUCKET_NAME" \
  -backend-config="key=dental-hospital/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="encrypt=true" \
  -reconfigure
```

### 3.2 Update Terraform Variables

```bash
# Create terraform.tfvars (or update existing)
cat > terraform.tfvars << EOF
aws_region = "us-east-1"
environment = "production"
project_name = "dental-hospital-system"
jwt_secret = "GENERATE_NEW_SECRET_HERE"
jwt_access_expiry = "30m"
jwt_refresh_expiry = "30d"
rate_limit_per_user = 15
api_gateway_stage_name = "prod"
enable_cloudfront = true
EOF

# Generate new JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 32)
echo "New JWT Secret: $NEW_JWT_SECRET"

# Update terraform.tfvars with new secret
# (Edit file manually or use sed)
```

### 3.3 Deploy Infrastructure

```bash
# Make sure AWS profile is set to new account
export AWS_PROFILE=new-account

# Validate
terraform validate

# Plan
terraform plan

# Apply (creates all resources)
terraform apply
# Type: yes

# Save outputs
terraform output -json > ../terraform-outputs-new.json
terraform output api_gateway_url > ../api-url-new.txt

cd ..
```

**Time**: 30-45 minutes

---

## Step 4: Import Data to New Account

### 4.1 Verify Export Directory

```bash
# Find export directory
ls -td migration-export-* | head -1

# Or specify exact directory
EXPORT_DIR="./migration-export-20240108-120000"
```

### 4.2 Run Import Script

```bash
# Make sure AWS profile is set to new account
export AWS_PROFILE=new-account

# Run import script
./scripts/migrate-import-data.sh "$EXPORT_DIR"
```

**What happens**:
- Imports all DynamoDB tables from JSON files
- Uploads all S3 objects to new buckets
- Processes in batches (25 items per batch for DynamoDB)
- Shows progress for each table/bucket

**Expected output**:
```
========================================
Data Import Script - New AWS Account
========================================

Export directory: ./migration-export-20240108-120000

Verifying AWS credentials...
  ✓ Connected to AWS Account: 987654321098

Verifying tables exist in new account...
  ✓ dental-hospital-system-production-users
  ✓ dental-hospital-system-production-patients
  ...

Importing DynamoDB tables...
Importing dental-hospital-system-production-users...
  Items to import: 150
  ✓ Imported 150 items
...

Import Summary
✓ Import completed successfully!
```

**Time**: 30-60 minutes (depends on data size)

---

## Step 5: Verify Migration

### 5.1 Run Verification Script

```bash
# Run verification
./scripts/migrate-verify.sh "$EXPORT_DIR"
```

**Expected output**:
```
========================================
Migration Verification
========================================

Comparing DynamoDB table counts...
Table                                    Exported      Imported     Status
--------------------------------------------------------------------------------
dental-hospital-system-production-users         150          150    ✓ MATCH
dental-hospital-system-production-patients     2400        2400    ✓ MATCH
...

✓ All data verified successfully!
```

### 5.2 Manual Verification

```bash
# Test login with old credentials
API_URL=$(cat api-url-new.txt)

curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9999999999",
    "password": "YourPassword"
  }'

# Should return access_token and user data

# Test patient retrieval
ACCESS_TOKEN="your-access-token-here"
curl -X GET "$API_URL/api/patients" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Should return patient list
```

### 5.3 Verify S3 Objects

```bash
# Check images bucket
aws s3 ls s3://dental-hospital-system-production-images --recursive | wc -l

# Check archive bucket
aws s3 ls s3://dental-hospital-system-production-archive --recursive | wc -l

# Compare with export
ls -R migration-export-*/s3-images | wc -l
ls -R migration-export-*/s3-archive | wc -l
```

---

## Step 6: Update Applications

### 6.1 Update Frontend/Mobile App

```bash
# Get new API URL
NEW_API_URL=$(cat api-url-new.txt)
echo "New API URL: $NEW_API_URL"

# Update configuration files
# In frontend/.env or mobile/src/constants/config.ts
# Update API_BASE_URL to new URL
```

### 6.2 Test Application

1. **Test Login**: Login with existing credentials
2. **Test Patient List**: View patients
3. **Test Image Viewing**: View medical images
4. **Test Procedure Creation**: Create a test procedure
5. **Test Image Upload**: Upload a test image

### 6.3 Update DNS (if using custom domain)

If you're using a custom domain for API:
1. Update DNS records to point to new API Gateway
2. Wait for DNS propagation (5-30 minutes)
3. Test with custom domain

---

## Step 7: Cleanup Old Account

### 7.1 Wait for Verification Period

**⚠️ IMPORTANT**: Wait at least **1 week** after migration before deleting old account to ensure everything works correctly.

### 7.2 Final Verification

```bash
# Test all critical functions in new account
# - Login
# - View patients
# - View procedures
# - Upload images
# - Download images
# - Create new records

# If everything works, proceed with cleanup
```

### 7.3 Delete Old Account Resources

```bash
# Switch to old account profile
export AWS_PROFILE=old-account

# Navigate to infrastructure
cd infrastructure

# Destroy all resources
terraform destroy
# Type: yes

# This will delete:
# - All DynamoDB tables
# - All S3 buckets
# - All Lambda functions
# - API Gateway
# - CloudFront
# - IAM roles
```

### 7.4 Close Old AWS Account

1. Login to old AWS account
2. Go to Account Settings
3. Click "Close Account"
4. Follow instructions
5. **⚠️ This is permanent!** Make sure migration is verified first.

---

## Troubleshooting

### Problem: Export Script Fails

**Error**: "Table not found"
**Solution**: 
- Check table names match your actual table names
- Verify AWS credentials are correct
- Check you're using the right AWS profile

---

### Problem: Import Script Fails

**Error**: "Table not found"
**Solution**:
- Run `terraform apply` first to create tables
- Verify table names match
- Check AWS profile is set to new account

---

### Problem: Item Count Mismatch

**Error**: Verification shows different counts
**Solution**:
1. Check for errors in import script output
2. Re-import the specific table:
   ```bash
   # Re-import single table
   EXPORT_FILE="migration-export-*/dental-hospital-system-production-users.json"
   aws dynamodb batch-write-item --request-items file://$EXPORT_FILE
   ```
3. Run verification again

---

### Problem: S3 Sync Fails

**Error**: "Access Denied" or "Bucket not found"
**Solution**:
- Verify buckets exist: `aws s3 ls`
- Check IAM permissions
- Verify bucket names match

---

### Problem: Large Export Takes Too Long

**Solution**:
- Export runs in background: `nohup ./scripts/migrate-export-data.sh &`
- Check progress: `tail -f nohup.out`
- For very large datasets, consider using AWS Data Pipeline

---

## FAQ

### Q: How often should I migrate?

**A**: Every 10-11 months (before free tier expires at month 12).

---

### Q: Will there be downtime during migration?

**A**: Yes, minimal downtime (1-2 hours) during migration. Plan migration during low-usage hours.

---

### Q: Can I migrate while system is in use?

**A**: Not recommended. Export data first, then import to new account. Users can continue using old account during export, but should switch to new account after import.

---

### Q: What if migration fails halfway?

**A**: 
- Export is safe (read-only, doesn't affect old account)
- Import can be re-run (idempotent - won't duplicate data)
- Keep old account until migration is verified

---

### Q: Do I need to update user passwords?

**A**: No, passwords are hashed and stored in DynamoDB. They migrate with user data.

---

### Q: What about audit logs?

**A**: Audit logs are migrated, but timestamps remain the same. New audit logs will be created in new account.

---

### Q: Can I keep both accounts running?

**A**: Yes, but you'll pay for the old account after free tier expires. Recommended: Delete old account after verification.

---

### Q: What if I have more than 5GB of S3 data?

**A**: Free tier includes 5GB S3 storage. If you exceed this:
- Consider compressing images before migration
- Use S3 lifecycle policies to move old data to Glacier
- Or accept small S3 costs (usually $0.023/GB/month)

---

## Migration Checklist

### Before Migration
- [ ] Export data from old account
- [ ] Verify export completed successfully
- [ ] Backup export directory
- [ ] Create new AWS account
- [ ] Configure AWS CLI for new account
- [ ] Create S3 bucket for Terraform state

### During Migration
- [ ] Deploy infrastructure in new account
- [ ] Import DynamoDB tables
- [ ] Import S3 buckets
- [ ] Verify data counts match
- [ ] Test login and basic functions

### After Migration
- [ ] Update frontend/mobile app with new API URL
- [ ] Test all application features
- [ ] Monitor for errors (1 week)
- [ ] Update DNS (if using custom domain)
- [ ] Delete old account resources
- [ ] Close old AWS account

---

## Cost Comparison

### Staying in Same Account (After Free Tier)
- DynamoDB: ~$5-10/month
- Lambda: ~$2-5/month
- S3: ~$1-5/month
- API Gateway: ~$3-5/month
- **Total**: ~$11-25/month

### Migrating Every Year
- **Cost**: $0 (stays in free tier)
- **Time Investment**: 2-4 hours/year
- **Savings**: ~$132-300/year

---

**Last Updated**: 2025-01-08  
**Version**: 1.0

