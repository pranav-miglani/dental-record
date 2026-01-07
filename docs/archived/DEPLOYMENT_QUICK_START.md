# 🚀 Quick Start Deployment Guide
## For Experienced Developers

> **New to AWS?** See [DEPLOYMENT_GUIDE_BEGINNER.md](./DEPLOYMENT_GUIDE_BEGINNER.md) for detailed step-by-step instructions.

This is a condensed guide for developers familiar with AWS and Terraform.

---

## Prerequisites Checklist

- [ ] Node.js >= 20.0.0
- [ ] AWS CLI >= 2.0.0
- [ ] Terraform >= 1.5.0
- [ ] Git
- [ ] AWS Account with IAM user (AdministratorAccess)
- [ ] AWS CLI configured (`aws configure`)

---

## Quick Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Create .env file
cat > .env << EOF
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ENVIRONMENT=production
PROJECT_NAME=dental-hospital-system
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

### 3. Create S3 Bucket for Terraform State
```bash
BUCKET_NAME="dental-hospital-terraform-state-$(whoami)-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME
aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket $BUCKET_NAME --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

### 4. Deploy Infrastructure
```bash
cd infrastructure

# Create terraform.tfvars
cat > terraform.tfvars << EOF
aws_region = "us-east-1"
environment = "production"
jwt_secret = "$(grep JWT_SECRET ../.env | cut -d '=' -f2)"
EOF

# Initialize and apply
terraform init \
  -backend-config="bucket=$BUCKET_NAME" \
  -backend-config="key=dental-hospital/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="encrypt=true"

terraform plan
terraform apply  # Type 'yes' when prompted

# Save outputs
terraform output -json > ../terraform-outputs.json
terraform output api_gateway_url > ../api-url.txt

cd ..
```

### 5. Deploy Application Code
```bash
# Build
npm run build:lambda

# Deploy using script
./scripts/deploy-lambda.sh

# OR deploy manually
cd dist/lambda
for dir in */; do
  cd "$dir"
  zip -r "../${dir%/}.zip" .
  cd ..
done
cd ../..

# Deploy each function
cd infrastructure
ENV_VARS=$(terraform output -json | jq -r '{USERS_TABLE_NAME: .users_table_name.value, PATIENTS_TABLE_NAME: .patients_table_name.value, PROCEDURES_TABLE_NAME: .procedures_table_name.value, PROCEDURE_STEPS_TABLE_NAME: .procedure_steps_table_name.value, IMAGES_TABLE_NAME: .images_table_name.value, CONSENT_TABLE_NAME: .consent_table_name.value, AUDIT_LOGS_TABLE_NAME: .audit_logs_table_name.value, USER_PATIENT_MAPPING_TABLE_NAME: .user_patient_mapping_table_name.value, IMAGES_BUCKET: .images_bucket_name.value, ARCHIVE_BUCKET: .archive_bucket_name.value, JWT_SECRET: .jwt_secret.value, JWT_ACCESS_EXPIRY: "30m", JWT_REFRESH_EXPIRY: "30d", AWS_REGION: "us-east-1"} | tostring')

for func in auth-handler users-handler patients-handler procedures-handler images-handler consent-handler audit-handler admin-handler steps-handler archive-handler; do
  aws lambda update-function-code \
    --function-name "dental-hospital-system-production-${func}" \
    --zip-file "fileb://../dist/${func}.zip"
  
  aws lambda update-function-configuration \
    --function-name "dental-hospital-system-production-${func}" \
    --environment "Variables=$ENV_VARS"
done

# Deploy API Gateway
API_ID=$(terraform output -raw api_gateway_id)
aws apigateway create-deployment --rest-api-id "$API_ID" --stage-name prod

cd ..
```

### 6. Create Admin User
```bash
# Generate password hash
PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin123!', 10).then(hash => console.log(hash))")

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

### 7. Test
```bash
API_URL=$(cat api-url.txt)

# Test login
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"9999999999","password":"Admin123!"}'
```

---

## Verification Commands

```bash
# Check all resources
cd infrastructure
terraform output

# View Lambda logs
aws logs tail /aws/lambda/dental-hospital-system-production-auth-handler --follow

# List DynamoDB tables
aws dynamodb list-tables

# List S3 buckets
aws s3 ls | grep dental-hospital

# List Lambda functions
aws lambda list-functions | grep dental-hospital
```

---

## Troubleshooting

- **Terraform errors**: Check AWS credentials, bucket exists, region is correct
- **Lambda deployment fails**: Wait 2-3 min after terraform apply, check function names
- **API returns 500**: Check CloudWatch logs, verify environment variables
- **Login fails**: Verify user exists in DynamoDB, check password hash

---

## Cleanup

```bash
cd infrastructure
terraform destroy  # Deletes all resources
```

---

**For detailed instructions, see [DEPLOYMENT_GUIDE_BEGINNER.md](./DEPLOYMENT_GUIDE_BEGINNER.md)**

