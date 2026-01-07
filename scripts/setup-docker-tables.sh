#!/bin/bash

# Setup DynamoDB tables in local DynamoDB instance
# This script creates all required tables for local testing

set -e

DYNAMODB_ENDPOINT="${DYNAMODB_ENDPOINT:-http://localhost:8000}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "🔧 Setting up DynamoDB tables in local instance..."
echo "   Endpoint: $DYNAMODB_ENDPOINT"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to create table
create_table() {
  local table_name=$1
  local pk=$2
  local sk=$3
  
  echo -e "${YELLOW}Creating table: $table_name${NC}"
  
  aws dynamodb create-table \
    --endpoint-url "$DYNAMODB_ENDPOINT" \
    --region "$AWS_REGION" \
    --table-name "$table_name" \
    --attribute-definitions \
      AttributeName="$pk",AttributeType=S \
      AttributeName="$sk",AttributeType=S \
    --key-schema \
      AttributeName="$pk",KeyType=HASH \
      AttributeName="$sk",KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --no-cli-pager \
    2>/dev/null || echo "  Table $table_name already exists or error occurred"
}

# Create all tables
echo ""
echo "Creating Users table..."
create_table "test-users" "PK" "SK"

echo ""
echo "Creating Patients table..."
create_table "test-patients" "PK" "SK"

echo ""
echo "Creating Procedures table..."
create_table "test-procedures" "PK" "SK"

echo ""
echo "Creating Procedure Steps table..."
create_table "test-procedure-steps" "PK" "SK"

echo ""
echo "Creating Images table..."
create_table "test-images" "PK" "SK"

echo ""
echo "Creating Consent table..."
create_table "test-consent" "PK" "SK"

echo ""
echo "Creating Audit Logs table..."
create_table "test-audit-logs" "PK" "SK"

echo ""
echo "Creating User Patient Mapping table..."
create_table "test-user-patient-mapping" "PK" "SK"

echo ""
echo -e "${GREEN}✅ DynamoDB tables setup complete!${NC}"
echo ""
echo "To verify tables, run:"
echo "  aws dynamodb list-tables --endpoint-url $DYNAMODB_ENDPOINT"

