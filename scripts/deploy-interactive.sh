#!/bin/bash

# ============================================================================
# Interactive One-Click Deployment Script
# ============================================================================
# This script asks for all configuration upfront, then deploys everything
# automatically. Perfect for both initial setup and migration scenarios.
#
# Usage:
#   ./scripts/deploy-interactive.sh
#
# The script will:
# 1. Ask for all configuration (AWS region, domain, passwords, etc.)
# 2. Save configuration to .env file
# 3. Deploy everything automatically
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Functions
print_header() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC} $1"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

print_step() {
  echo -e "${CYAN}▶${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_info() {
  echo -e "${YELLOW}ℹ${NC} $1"
}

# Interactive prompts
prompt_with_default() {
  local prompt_text="$1"
  local default_value="$2"
  local var_name="$3"
  local is_secret="${4:-false}"
  
  if [ "$is_secret" = true ]; then
    echo -ne "${CYAN}$prompt_text${NC} ${YELLOW}[default: $default_value]${NC}: "
    read -s user_input
    echo ""
  else
    echo -ne "${CYAN}$prompt_text${NC} ${YELLOW}[default: $default_value]${NC}: "
    read user_input
  fi
  
  if [ -z "$user_input" ]; then
    eval "$var_name='$default_value'"
  else
    eval "$var_name='$user_input'"
  fi
}

prompt_yes_no() {
  local prompt_text="$1"
  local default_value="${2:-y}"
  local var_name="$3"
  
  local default_display="Y/n"
  if [ "$default_value" = "n" ]; then
    default_display="y/N"
  fi
  
  while true; do
    echo -ne "${CYAN}$prompt_text${NC} ${YELLOW}[$default_display]${NC}: "
    read user_input
    user_input=$(echo "$user_input" | tr '[:upper:]' '[:lower:]')
    
    if [ -z "$user_input" ]; then
      user_input="$default_value"
    fi
    
    if [ "$user_input" = "y" ] || [ "$user_input" = "yes" ]; then
      eval "$var_name=true"
      break
    elif [ "$user_input" = "n" ] || [ "$user_input" = "no" ]; then
      eval "$var_name=false"
      break
    else
      echo -e "${RED}Please enter 'y' or 'n'${NC}"
    fi
  done
}

# Collect configuration
collect_configuration() {
  print_header "Configuration Setup"
  
  echo -e "${GREEN}Welcome to the Dental Hospital System Deployment!${NC}"
  echo ""
  echo "This script will ask you a few questions, then deploy everything automatically."
  echo ""
  
  # AWS Region
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}AWS Configuration${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Get current AWS account info
  if aws sts get-caller-identity &>/dev/null; then
    CURRENT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    CURRENT_REGION=$(aws configure get region || echo "us-east-1")
    print_success "Connected to AWS Account: $CURRENT_ACCOUNT"
    print_info "Current region: $CURRENT_REGION"
  else
    print_error "AWS credentials not configured. Please run: aws configure"
    exit 1
  fi
  
  prompt_with_default "AWS Region" "$CURRENT_REGION" "AWS_REGION"
  
  # Project Configuration
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Project Configuration${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  prompt_with_default "Project Name" "dental-hospital-system" "PROJECT_NAME"
  prompt_with_default "Environment" "production" "ENVIRONMENT"
  
  # Security Configuration
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Security Configuration${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  GENERATED_JWT=$(openssl rand -base64 32)
  prompt_with_default "JWT Secret (for token encryption)" "$GENERATED_JWT" "JWT_SECRET" true
  echo ""
  
  prompt_with_default "Admin Password (for initial admin user)" "Admin123!" "ADMIN_PASSWORD" true
  echo ""
  print_info "Admin mobile number will be: 9999999999"
  
  # Terraform State Configuration
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Terraform State Configuration${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  DEFAULT_BUCKET="dental-hospital-terraform-state-$(date +%s)"
  prompt_with_default "Terraform State S3 Bucket Name" "$DEFAULT_BUCKET" "TERRAFORM_STATE_BUCKET"
  print_info "This bucket will store Terraform state files. Must be globally unique."
  
  # Domain Configuration
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Domain Configuration (Optional)${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  prompt_yes_no "Do you want to use a custom domain for the API?" "n" "USE_CUSTOM_DOMAIN"
  
  if [ "$USE_CUSTOM_DOMAIN" = true ]; then
    prompt_with_default "API Custom Domain (e.g., api.rghs-dental.info)" "" "API_CUSTOM_DOMAIN"
    
    if [ -n "$API_CUSTOM_DOMAIN" ]; then
      prompt_with_default "Route53 Hosted Zone ID (for DNS)" "" "ROUTE53_HOSTED_ZONE_ID"
      print_info "You'll need to create an ACM certificate in us-east-1 region for API Gateway"
      prompt_with_default "ACM Certificate ARN (for API Gateway)" "" "ACM_CERTIFICATE_ARN"
    fi
  else
    API_CUSTOM_DOMAIN=""
    ROUTE53_HOSTED_ZONE_ID=""
    ACM_CERTIFICATE_ARN=""
  fi
  
  prompt_yes_no "Do you want to use a custom domain for CloudFront (images)?" "n" "USE_CLOUDFRONT_DOMAIN"
  
  if [ "$USE_CLOUDFRONT_DOMAIN" = true ]; then
    prompt_with_default "CloudFront Custom Domain (e.g., cdn.rghs-dental.info)" "" "CLOUDFRONT_CUSTOM_DOMAIN"
    
    if [ -n "$CLOUDFRONT_CUSTOM_DOMAIN" ]; then
      prompt_with_default "Route53 Hosted Zone ID (for CloudFront DNS)" "" "CLOUDFRONT_ROUTE53_ZONE_ID"
      print_info "You'll need to create an ACM certificate in us-east-1 region for CloudFront"
      prompt_with_default "ACM Certificate ARN (for CloudFront)" "" "CLOUDFRONT_ACM_CERTIFICATE_ARN"
    fi
  else
    CLOUDFRONT_CUSTOM_DOMAIN=""
    CLOUDFRONT_ROUTE53_ZONE_ID=""
    CLOUDFRONT_ACM_CERTIFICATE_ARN=""
  fi
  
  # Migration Mode
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Deployment Mode${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  prompt_yes_no "Is this a migration deployment? (infrastructure already exists)" "n" "MIGRATION_MODE"
  
  if [ "$MIGRATION_MODE" = true ]; then
    prompt_yes_no "Skip admin user creation? (will import users from migration)" "y" "SKIP_ADMIN"
  else
    SKIP_ADMIN=false
  fi
  
  # Summary
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Configuration Summary${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  echo ""
  echo -e "${GREEN}AWS Configuration:${NC}"
  echo "  Region: $AWS_REGION"
  echo "  Account: $CURRENT_ACCOUNT"
  echo ""
  echo -e "${GREEN}Project Configuration:${NC}"
  echo "  Project Name: $PROJECT_NAME"
  echo "  Environment: $ENVIRONMENT"
  echo ""
  echo -e "${GREEN}Security:${NC}"
  echo "  JWT Secret: ${JWT_SECRET:0:20}... (hidden)"
  echo "  Admin Password: ${ADMIN_PASSWORD:0:5}... (hidden)"
  echo ""
  echo -e "${GREEN}Terraform State:${NC}"
  echo "  Bucket: $TERRAFORM_STATE_BUCKET"
  echo ""
  
  if [ "$USE_CUSTOM_DOMAIN" = true ] && [ -n "$API_CUSTOM_DOMAIN" ]; then
    echo -e "${GREEN}API Custom Domain:${NC}"
    echo "  Domain: $API_CUSTOM_DOMAIN"
    echo "  Certificate: ${ACM_CERTIFICATE_ARN:0:50}... (if provided)"
  fi
  
  if [ "$USE_CLOUDFRONT_DOMAIN" = true ] && [ -n "$CLOUDFRONT_CUSTOM_DOMAIN" ]; then
    echo -e "${GREEN}CloudFront Custom Domain:${NC}"
    echo "  Domain: $CLOUDFRONT_CUSTOM_DOMAIN"
    echo "  Certificate: ${CLOUDFRONT_ACM_CERTIFICATE_ARN:0:50}... (if provided)"
  fi
  
  echo ""
  echo -e "${GREEN}Deployment Mode:${NC}"
  if [ "$MIGRATION_MODE" = true ]; then
    echo "  Mode: Migration (infrastructure exists)"
    echo "  Skip Admin: $SKIP_ADMIN"
  else
    echo "  Mode: Full Deployment (new infrastructure)"
  fi
  
  echo ""
  prompt_yes_no "Proceed with deployment?" "y" "PROCEED"
  
  if [ "$PROCEED" = false ]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
  fi
  
  echo ""
}

# Save configuration to .env
save_configuration() {
  print_header "Saving Configuration"
  
  # Create .env file
  cat > .env << EOF
# AWS Configuration
AWS_REGION=$AWS_REGION
AWS_ACCOUNT_ID=$CURRENT_ACCOUNT

# Project Configuration
PROJECT_NAME=$PROJECT_NAME
ENVIRONMENT=$ENVIRONMENT

# Security
JWT_SECRET=$JWT_SECRET
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Terraform State
TERRAFORM_STATE_BUCKET=$TERRAFORM_STATE_BUCKET

# Custom Domains (Optional)
API_CUSTOM_DOMAIN=$API_CUSTOM_DOMAIN
ROUTE53_HOSTED_ZONE_ID=$ROUTE53_HOSTED_ZONE_ID
ACM_CERTIFICATE_ARN=$ACM_CERTIFICATE_ARN
CLOUDFRONT_CUSTOM_DOMAIN=$CLOUDFRONT_CUSTOM_DOMAIN
CLOUDFRONT_ROUTE53_ZONE_ID=$CLOUDFRONT_ROUTE53_ZONE_ID
CLOUDFRONT_ACM_CERTIFICATE_ARN=$CLOUDFRONT_ACM_CERTIFICATE_ARN

# Deployment Mode
MIGRATION_MODE=$MIGRATION_MODE
SKIP_ADMIN=$SKIP_ADMIN
EOF
  
  print_success "Configuration saved to .env file"
  print_info "You can edit .env file later if needed"
  echo ""
}

# Call the main deployment script with collected configuration
run_deployment() {
  print_header "Starting Deployment"
  
  # Export variables for deploy-all.sh
  export AWS_REGION
  export PROJECT_NAME
  export ENVIRONMENT
  export JWT_SECRET
  export ADMIN_PASSWORD
  export TERRAFORM_STATE_BUCKET
  export API_CUSTOM_DOMAIN
  export ROUTE53_HOSTED_ZONE_ID
  export ACM_CERTIFICATE_ARN
  export CLOUDFRONT_CUSTOM_DOMAIN
  export CLOUDFRONT_ROUTE53_ZONE_ID
  export CLOUDFRONT_ACM_CERTIFICATE_ARN
  
  # Build arguments for deploy-all.sh
  DEPLOY_ARGS=""
  if [ "$MIGRATION_MODE" = true ]; then
    DEPLOY_ARGS="$DEPLOY_ARGS --migration"
  fi
  
  if [ "$SKIP_ADMIN" = true ]; then
    DEPLOY_ARGS="$DEPLOY_ARGS --skip-admin"
  fi
  
  # Call the main deployment script
  print_step "Calling deployment script..."
  echo ""
  
  ./scripts/deploy-all.sh $DEPLOY_ARGS
}

# Main execution
main() {
  clear
  echo -e "${GREEN}"
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║   Dental Hospital System - Interactive Deployment        ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  
  collect_configuration
  save_configuration
  run_deployment
  
  echo ""
  print_header "Deployment Complete!"
  echo -e "${GREEN}✓ All configuration saved to .env${NC}"
  echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
  echo ""
  
  if [ -f "api-url.txt" ]; then
    API_URL=$(cat api-url.txt)
    echo -e "${BLUE}API Gateway URL:${NC} $API_URL"
  fi
  
  if [ -n "$API_CUSTOM_DOMAIN" ]; then
    echo ""
    echo -e "${YELLOW}⚠ Custom Domain Setup Required:${NC}"
    echo "1. Create ACM certificate in us-east-1 for: $API_CUSTOM_DOMAIN"
    echo "2. Update Route53 DNS to point $API_CUSTOM_DOMAIN to API Gateway"
    echo "3. Configure API Gateway custom domain in AWS Console"
  fi
  
  if [ -n "$CLOUDFRONT_CUSTOM_DOMAIN" ]; then
    echo ""
    echo -e "${YELLOW}⚠ CloudFront Custom Domain Setup Required:${NC}"
    echo "1. Create ACM certificate in us-east-1 for: $CLOUDFRONT_CUSTOM_DOMAIN"
    echo "2. Update CloudFront distribution with custom domain"
    echo "3. Update Route53 DNS to point $CLOUDFRONT_CUSTOM_DOMAIN to CloudFront"
  fi
  
  echo ""
}

# Run main function
main

