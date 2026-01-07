#!/bin/sh

# Setup DynamoDB tables from within Docker container
# This version works inside the container

set -e

DYNAMODB_ENDPOINT="${DYNAMODB_ENDPOINT:-http://dynamodb-local:8000}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "🔧 Setting up DynamoDB tables in container..."
echo "   Endpoint: $DYNAMODB_ENDPOINT"

# Install AWS CLI if not available
if ! command -v aws &> /dev/null; then
  echo "Installing AWS CLI..."
  apk add --no-cache aws-cli || pip3 install awscli || echo "AWS CLI not available, skipping table creation"
fi

# Function to create table
create_table() {
  local table_name=$1
  local pk=$2
  local sk=$3
  
  echo "Creating table: $table_name"
  
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
create_table "test-users" "PK" "SK"
create_table "test-patients" "PK" "SK"
create_table "test-procedures" "PK" "SK"
create_table "test-procedure-steps" "PK" "SK"
create_table "test-images" "PK" "SK"
create_table "test-consent" "PK" "SK"
create_table "test-audit-logs" "PK" "SK"
create_table "test-user-patient-mapping" "PK" "SK"

echo "✅ DynamoDB tables setup complete!"

