#!/bin/bash

# ============================================================================
# Complete One-Click Deployment Script
# ============================================================================
# This script deploys everything needed for the Dental Hospital System:
# 1. Infrastructure (Terraform)
# 2. Lambda Functions
# 3. API Gateway
# 4. Initial Admin User
# 5. Verification
#
# Usage:
#   ./scripts/deploy-all.sh [--migration] [--skip-admin]
#
# Options:
#   --migration    : For migration scenario (assumes infrastructure exists)
#   --skip-admin   : Skip admin user creation
#   --skip-verify  : Skip verification steps
#
# Prerequisites:
#   - AWS CLI configured
#   - Terraform installed
#   - Node.js installed
#   - jq installed
#   - .env file with configuration
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Load configuration (from GitHub Secrets, .env, or defaults)
source "$SCRIPT_DIR/load-config.sh"

PROJECT_NAME="${PROJECT_NAME:-dental-hospital-system}"
ENVIRONMENT="${ENVIRONMENT:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Parse arguments
MIGRATION_MODE=false
SKIP_ADMIN=false
SKIP_VERIFY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --migration)
      MIGRATION_MODE=true
      shift
      ;;
    --skip-admin)
      SKIP_ADMIN=true
      shift
      ;;
    --skip-verify)
      SKIP_VERIFY=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 [--migration] [--skip-admin] [--skip-verify]"
      exit 1
      ;;
  esac
done

# Functions
print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
}

print_step() {
  echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

check_prerequisites() {
  print_header "Checking Prerequisites"
  
  # Check AWS CLI
  if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not found. Please install it first."
    exit 1
  fi
  print_success "AWS CLI found: $(aws --version | cut -d' ' -f1)"
  
  # Check Terraform
  if ! command -v terraform &> /dev/null; then
    print_error "Terraform not found. Please install it first."
    exit 1
  fi
  print_success "Terraform found: $(terraform version | head -1)"
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install it first."
    exit 1
  fi
  print_success "Node.js found: $(node --version)"
  
  # Check jq
  if ! command -v jq &> /dev/null; then
    print_error "jq not found. Please install it: brew install jq"
    exit 1
  fi
  print_success "jq found"
  
  # Check AWS credentials
  if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Run: aws configure"
    exit 1
  fi
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  print_success "AWS credentials valid (Account: $AWS_ACCOUNT_ID)"
  
  # Check .env file (not required in CI/CD)
  if [ -f ".env" ]; then
    print_success ".env file found"
  elif [ -z "$GITHUB_ACTIONS" ]; then
    print_info ".env file not found (will use environment variables or defaults)"
  else
    print_success "Using GitHub Secrets (CI/CD mode)"
  fi
  
  echo ""
}

setup_terraform_backend() {
  print_header "Setting Up Terraform Backend"
  
  cd infrastructure
  
  # Check if backend bucket is specified
  if [ -z "$TERRAFORM_STATE_BUCKET" ]; then
    print_step "Terraform state bucket not specified"
    print_step "Creating S3 bucket for Terraform state..."
    
    BUCKET_NAME="dental-hospital-terraform-state-$(date +%s)"
    print_step "Bucket name: $BUCKET_NAME"
    
    # Create bucket
    if aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION" 2>/dev/null; then
      print_success "Created S3 bucket: $BUCKET_NAME"
      
      # Enable versioning
      aws s3api put-bucket-versioning \
        --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled
      print_success "Enabled versioning"
      
      # Enable encryption
      aws s3api put-bucket-encryption \
        --bucket "$BUCKET_NAME" \
        --server-side-encryption-configuration '{
          "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
              "SSEAlgorithm": "AES256"
            }
          }]
        }'
      print_success "Enabled encryption"
      
      # Block public access
      aws s3api put-public-access-block \
        --bucket "$BUCKET_NAME" \
        --public-access-block-configuration \
          "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
      print_success "Blocked public access"
      
      TERRAFORM_STATE_BUCKET="$BUCKET_NAME"
      
      # Update .env file
      if [ -f "../.env" ]; then
        if ! grep -q "TERRAFORM_STATE_BUCKET" ../.env; then
          echo "TERRAFORM_STATE_BUCKET=$BUCKET_NAME" >> ../.env
        fi
      fi
    else
      print_error "Failed to create bucket. It may already exist."
      print_step "Please set TERRAFORM_STATE_BUCKET in .env file"
      exit 1
    fi
  else
    print_success "Using Terraform state bucket: $TERRAFORM_STATE_BUCKET"
    
    # Verify bucket exists
    if ! aws s3 ls "s3://$TERRAFORM_STATE_BUCKET" &>/dev/null; then
      print_step "Bucket doesn't exist, creating it..."
      aws s3 mb "s3://$TERRAFORM_STATE_BUCKET" --region "$AWS_REGION"
      aws s3api put-bucket-versioning \
        --bucket "$TERRAFORM_STATE_BUCKET" \
        --versioning-configuration Status=Enabled
      aws s3api put-bucket-encryption \
        --bucket "$TERRAFORM_STATE_BUCKET" \
        --server-side-encryption-configuration '{
          "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
              "SSEAlgorithm": "AES256"
            }
          }]
        }'
      aws s3api put-public-access-block \
        --bucket "$TERRAFORM_STATE_BUCKET" \
        --public-access-block-configuration \
          "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
      print_success "Bucket created and configured"
    fi
  fi
  
  # Initialize Terraform
  print_step "Initializing Terraform..."
  terraform init \
    -backend-config="bucket=$TERRAFORM_STATE_BUCKET" \
    -backend-config="key=dental-hospital/terraform.tfstate" \
    -backend-config="region=$AWS_REGION" \
    -backend-config="encrypt=true" \
    -reconfigure
  
  print_success "Terraform initialized"
  
  cd ..
  echo ""
}

deploy_infrastructure() {
  print_header "Deploying Infrastructure"
  
  if [ "$MIGRATION_MODE" = true ]; then
    print_step "Migration mode: Skipping infrastructure deployment"
    print_step "Assuming infrastructure already exists in new account"
    return
  fi
  
  cd infrastructure
  
  # Create or update terraform.tfvars
  print_step "Creating/updating terraform.tfvars..."
  
  # Get JWT secret from .env or generate new one
  if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    print_step "Generated new JWT secret"
  fi
  
  # Build terraform.tfvars content
  TFVARS_CONTENT="aws_region = \"$AWS_REGION\"
environment = \"$ENVIRONMENT\"
project_name = \"$PROJECT_NAME\"
jwt_secret = \"$JWT_SECRET\"
jwt_access_expiry = \"30m\"
jwt_refresh_expiry = \"30d\"
rate_limit_per_user = 15
api_gateway_stage_name = \"prod\"
enable_cloudfront = true"
  
  # Add custom domain variables if provided
  if [ -n "$API_CUSTOM_DOMAIN" ]; then
    TFVARS_CONTENT="$TFVARS_CONTENT

# API Gateway Custom Domain
api_custom_domain = \"$API_CUSTOM_DOMAIN\""
    
    if [ -n "$ACM_CERTIFICATE_ARN" ]; then
      TFVARS_CONTENT="$TFVARS_CONTENT
api_acm_certificate_arn = \"$ACM_CERTIFICATE_ARN\""
    fi
    
    if [ -n "$ROUTE53_HOSTED_ZONE_ID" ]; then
      TFVARS_CONTENT="$TFVARS_CONTENT
api_route53_hosted_zone_id = \"$ROUTE53_HOSTED_ZONE_ID\""
    fi
  fi
  
  if [ -n "$CLOUDFRONT_CUSTOM_DOMAIN" ]; then
    TFVARS_CONTENT="$TFVARS_CONTENT

# CloudFront Custom Domain
cloudfront_custom_domain = \"$CLOUDFRONT_CUSTOM_DOMAIN\""
    
    if [ -n "$CLOUDFRONT_ACM_CERTIFICATE_ARN" ]; then
      TFVARS_CONTENT="$TFVARS_CONTENT
cloudfront_acm_certificate_arn = \"$CLOUDFRONT_ACM_CERTIFICATE_ARN\""
    fi
    
    if [ -n "$CLOUDFRONT_ROUTE53_ZONE_ID" ]; then
      TFVARS_CONTENT="$TFVARS_CONTENT
cloudfront_route53_hosted_zone_id = \"$CLOUDFRONT_ROUTE53_ZONE_ID\""
    fi
  fi
  
  echo "$TFVARS_CONTENT" > terraform.tfvars
  print_success "terraform.tfvars created/updated"
  
  # Validate
  print_step "Validating Terraform configuration..."
  terraform validate
  print_success "Configuration valid"
  
  # Plan
  print_step "Planning infrastructure deployment..."
  terraform plan -out=tfplan
  print_success "Plan created"
  
  # Apply
  print_step "Applying infrastructure (this may take 10-15 minutes)..."
  terraform apply tfplan
  print_success "Infrastructure deployed"
  
  # Save outputs
  print_step "Saving Terraform outputs..."
  terraform output -json > ../terraform-outputs.json
  terraform output api_gateway_url > ../api-url.txt
  print_success "Outputs saved"
  
  cd ..
  echo ""
}

build_application() {
  print_header "Building Application"
  
  print_step "Installing dependencies..."
  npm install --silent
  print_success "Dependencies installed"
  
  print_step "Building Lambda functions..."
  npm run build:lambda
  print_success "Lambda functions built"
  
  echo ""
}

deploy_lambda_functions() {
  print_header "Deploying Lambda Functions"
  
  cd infrastructure
  
  # Get table names and bucket names from Terraform outputs
  print_step "Getting configuration from Terraform outputs..."
  
  # Get JWT secret from terraform.tfvars or .env
  JWT_SECRET_VALUE=$(grep '^jwt_secret' terraform.tfvars 2>/dev/null | cut -d'"' -f2 || grep 'JWT_SECRET' ../.env 2>/dev/null | cut -d'=' -f2 || echo '')
  
  # Create lambda-env.json
  cat > ../lambda-env.json << EOF
{
  "USERS_TABLE_NAME": "$(terraform output -raw users_table_name 2>/dev/null || echo '')",
  "PATIENTS_TABLE_NAME": "$(terraform output -raw patients_table_name 2>/dev/null || echo '')",
  "PROCEDURES_TABLE_NAME": "$(terraform output -raw procedures_table_name 2>/dev/null || echo '')",
  "PROCEDURE_STEPS_TABLE_NAME": "$(terraform output -raw procedure_steps_table_name 2>/dev/null || echo '')",
  "IMAGES_TABLE_NAME": "$(terraform output -raw images_table_name 2>/dev/null || echo '')",
  "CONSENT_TABLE_NAME": "$(terraform output -raw consent_table_name 2>/dev/null || echo '')",
  "AUDIT_LOGS_TABLE_NAME": "$(terraform output -raw audit_logs_table_name 2>/dev/null || echo '')",
  "USER_PATIENT_MAPPING_TABLE_NAME": "$(terraform output -raw user_patient_mapping_table_name 2>/dev/null || echo '')",
  "IMAGES_BUCKET": "$(terraform output -raw s3_images_bucket_name 2>/dev/null || echo '')",
  "ARCHIVE_BUCKET": "$(terraform output -raw s3_archive_bucket_name 2>/dev/null || echo '')",
  "JWT_SECRET": "$JWT_SECRET_VALUE",
  "JWT_ACCESS_EXPIRY": "30m",
  "JWT_REFRESH_EXPIRY": "30d",
  "AWS_REGION": "$AWS_REGION"
}
EOF
  
  print_success "Configuration file created"
  
  cd ..
  
  # Package Lambda functions
  print_step "Packaging Lambda functions..."
  cd dist/lambda
  
  for dir in */; do
    if [ -d "$dir" ]; then
      FUNCTION_NAME=$(basename "$dir")
      print_step "Packaging $FUNCTION_NAME..."
      cd "$dir"
      zip -q -r "../../${FUNCTION_NAME}.zip" . -x "*.git*" -x "*.DS_Store"
      cd ..
    fi
  done
  
  cd ../..
  print_success "Lambda functions packaged"
  
  # Deploy each function
  print_step "Deploying Lambda functions..."
  
  FUNCTIONS=(
    "auth-handler"
    "users-handler"
    "patients-handler"
    "procedures-handler"
    "images-handler"
    "consent-handler"
    "audit-handler"
    "admin-handler"
    "steps-handler"
    "archive-handler"
  )
  
  for func in "${FUNCTIONS[@]}"; do
    FUNCTION_NAME="${PROJECT_NAME}-${ENVIRONMENT}-${func}"
    ZIP_FILE="dist/${func}.zip"
    
    if [ ! -f "$ZIP_FILE" ]; then
      print_error "Package not found: $ZIP_FILE (skipping)"
      continue
    fi
    
    print_step "Deploying $func..."
    
    # Check if function exists
    if aws lambda get-function --function-name "$FUNCTION_NAME" &>/dev/null; then
      # Update function code
      aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://$ZIP_FILE" \
        --region "$AWS_REGION" \
        --output json > /dev/null
      
      # Wait for update to complete
      aws lambda wait function-updated --function-name "$FUNCTION_NAME"
      
      # Update environment variables
      aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment "Variables=$(cat lambda-env.json)" \
        --region "$AWS_REGION" \
        --output json > /dev/null
      
      print_success "$func deployed"
    else
      print_error "Function not found: $FUNCTION_NAME (run terraform apply first)"
    fi
  done
  
  echo ""
}

deploy_api_gateway() {
  print_header "Deploying API Gateway"
  
  cd infrastructure
  
  print_step "Creating API Gateway deployment..."
  
  API_ID=$(terraform output -raw api_gateway_id 2>/dev/null || echo '')
  
  if [ -z "$API_ID" ]; then
    print_error "API Gateway ID not found. Infrastructure may not be deployed."
    cd ..
    return
  fi
  
  # Create deployment
  aws apigateway create-deployment \
    --rest-api-id "$API_ID" \
    --stage-name prod \
    --description "Deployment $(date -u +"%Y-%m-%d %H:%M:%S UTC")" \
    --output json > /dev/null
  
  print_success "API Gateway deployed"
  
  # Get API URL
  API_URL=$(terraform output -raw api_gateway_url)
  echo "$API_URL" > ../api-url.txt
  
  print_success "API URL: $API_URL"
  
  cd ..
  echo ""
}

create_admin_user() {
  print_header "Creating Admin User"
  
  if [ "$SKIP_ADMIN" = true ]; then
    print_step "Skipping admin user creation (--skip-admin flag)"
    return
  fi
  
  cd infrastructure
  
  USERS_TABLE=$(terraform output -raw users_table_name 2>/dev/null || echo '')
  
  if [ -z "$USERS_TABLE" ]; then
    print_error "Users table not found. Infrastructure may not be deployed."
    cd ..
    return
  fi
  
  # Check if admin user already exists
  ADMIN_EXISTS=$(aws dynamodb get-item \
    --table-name "$USERS_TABLE" \
    --key '{"PK":{"S":"USER#admin-001"},"SK":{"S":"USER#admin-001"}}' \
    --output json 2>/dev/null | jq -r '.Item // empty')
  
  if [ -n "$ADMIN_EXISTS" ]; then
    print_step "Admin user already exists (skipping creation)"
    cd ..
    return
  fi
  
  print_step "Creating admin user..."
  
  # Get admin password from .env or use default
  ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"
  
  # Generate password hash
  PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('$ADMIN_PASSWORD', 10).then(hash => console.log(hash))")
  
  # Create admin user
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
    }" \
    --output json > /dev/null
  
  print_success "Admin user created"
  print_success "Mobile: 9999999999"
  print_success "Password: $ADMIN_PASSWORD"
  print_step "⚠️  Save these credentials securely!"
  
  cd ..
  echo ""
}

verify_deployment() {
  print_header "Verifying Deployment"
  
  if [ "$SKIP_VERIFY" = true ]; then
    print_step "Skipping verification (--skip-verify flag)"
    return
  fi
  
  # Check API Gateway
  if [ -f "api-url.txt" ]; then
    API_URL=$(cat api-url.txt)
    print_step "Testing API Gateway: $API_URL"
    
    # Test health endpoint (if exists) or just check if URL is accessible
    if curl -s -f "$API_URL" > /dev/null 2>&1 || curl -s -f "$API_URL/health" > /dev/null 2>&1; then
      print_success "API Gateway is accessible"
    else
      print_error "API Gateway may not be accessible (this is okay if health endpoint doesn't exist)"
    fi
  fi
  
  # Check Lambda functions
  print_step "Verifying Lambda functions..."
  FUNCTIONS=(
    "auth-handler"
    "users-handler"
    "patients-handler"
  )
  
  for func in "${FUNCTIONS[@]}"; do
    FUNCTION_NAME="${PROJECT_NAME}-${ENVIRONMENT}-${func}"
    if aws lambda get-function --function-name "$FUNCTION_NAME" &>/dev/null; then
      print_success "$func exists"
    else
      print_error "$func not found"
    fi
  done
  
  # Check DynamoDB tables
  print_step "Verifying DynamoDB tables..."
  TABLES=(
    "${PROJECT_NAME}-${ENVIRONMENT}-users"
    "${PROJECT_NAME}-${ENVIRONMENT}-patients"
    "${PROJECT_NAME}-${ENVIRONMENT}-procedures"
  )
  
  for table in "${TABLES[@]}"; do
    if aws dynamodb describe-table --table-name "$table" &>/dev/null; then
      print_success "$table exists"
    else
      print_error "$table not found"
    fi
  done
  
  # Check S3 buckets
  print_step "Verifying S3 buckets..."
  BUCKETS=(
    "${PROJECT_NAME}-${ENVIRONMENT}-images"
    "${PROJECT_NAME}-${ENVIRONMENT}-archive"
  )
  
  for bucket in "${BUCKETS[@]}"; do
    if aws s3 ls "s3://$bucket" &>/dev/null; then
      print_success "$bucket exists"
    else
      print_error "$bucket not found"
    fi
  done
  
  echo ""
}

print_summary() {
  print_header "Deployment Summary"
  
  echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
  echo ""
  
  if [ -f "api-url.txt" ]; then
    API_URL=$(cat api-url.txt)
    echo -e "${BLUE}API Gateway URL:${NC} $API_URL"
  fi
  
  if [ "$SKIP_ADMIN" = false ]; then
    echo ""
    echo -e "${BLUE}Admin Credentials:${NC}"
    echo "  Mobile: 9999999999"
    if [ -n "$ADMIN_PASSWORD" ]; then
      echo "  Password: $ADMIN_PASSWORD"
    else
      echo "  Password: (check .env file or use default: Admin123!)"
    fi
  fi
  
  echo ""
  echo -e "${YELLOW}Next Steps:${NC}"
  echo "1. Test login with admin credentials"
  echo "2. Update frontend/mobile app with API URL"
  echo "3. Create additional users via admin interface"
  echo ""
  
  if [ "$MIGRATION_MODE" = true ]; then
    echo -e "${YELLOW}Migration Mode:${NC}"
    echo "1. Import data using: ./scripts/migrate-import-data.sh <export-dir>"
    echo "2. Verify migration: ./scripts/migrate-verify.sh <export-dir>"
    echo "3. Update applications with new API URL"
    echo ""
  fi
}

# Main execution
main() {
  echo -e "${GREEN}"
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║   Dental Hospital System - One-Click Deployment           ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  
  if [ "$MIGRATION_MODE" = true ]; then
    echo -e "${YELLOW}Running in MIGRATION mode${NC}"
  fi
  
  check_prerequisites
  setup_terraform_backend
  deploy_infrastructure
  build_application
  deploy_lambda_functions
  deploy_api_gateway
  create_admin_user
  verify_deployment
  print_summary
  
  echo -e "${GREEN}🎉 All done!${NC}"
}

# Run main function
main

