#!/bin/bash

# ============================================================================
# Import Data to New AWS Account
# ============================================================================
# This script imports all data from exported files into the new AWS account
# Run this script AFTER deploying infrastructure in the new AWS account
#
# Usage:
#   ./scripts/migrate-import-data.sh <export-directory>
#
# Example:
#   ./scripts/migrate-import-data.sh ./migration-export-20240108-120000
#
# Prerequisites:
#   - AWS CLI configured with NEW account credentials
#   - Infrastructure deployed in new account (terraform apply)
#   - jq installed (brew install jq)
#   - Export directory from migrate-export-data.sh
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
  echo -e "${RED}Error: Export directory required${NC}"
  echo "Usage: $0 <export-directory>"
  echo "Example: $0 ./migration-export-20240108-120000"
  exit 1
fi

EXPORT_DIR="$1"
PROJECT_NAME="dental-hospital-system"
ENVIRONMENT="production"

# Verify export directory exists
if [ ! -d "$EXPORT_DIR" ]; then
  echo -e "${RED}Error: Export directory not found: $EXPORT_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Data Import Script - New AWS Account${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Export directory: $EXPORT_DIR"
echo ""

# Verify AWS credentials
echo -e "${YELLOW}Verifying AWS credentials...${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "  ${GREEN}✓${NC} Connected to AWS Account: $ACCOUNT_ID"
echo ""

# Get table names
TABLES=(
  "${PROJECT_NAME}-${ENVIRONMENT}-users"
  "${PROJECT_NAME}-${ENVIRONMENT}-patients"
  "${PROJECT_NAME}-${ENVIRONMENT}-user-patient-mappings"
  "${PROJECT_NAME}-${ENVIRONMENT}-procedures"
  "${PROJECT_NAME}-${ENVIRONMENT}-procedure-steps"
  "${PROJECT_NAME}-${ENVIRONMENT}-images"
  "${PROJECT_NAME}-${ENVIRONMENT}-consent"
  "${PROJECT_NAME}-${ENVIRONMENT}-audit-logs"
)

# Verify tables exist in new account
echo -e "${YELLOW}Verifying tables exist in new account...${NC}"
for table in "${TABLES[@]}"; do
  if aws dynamodb describe-table --table-name "$table" &>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $table"
  else
    echo -e "  ${RED}✗${NC} $table (not found - run terraform apply first!)"
    exit 1
  fi
done
echo ""

# Import DynamoDB tables
echo -e "${YELLOW}Importing DynamoDB tables...${NC}"
for table in "${TABLES[@]}"; do
  echo "Importing $table..."
  
  # Find export file (may be compressed)
  EXPORT_FILE="$EXPORT_DIR/${table}.json"
  if [ ! -f "$EXPORT_FILE" ] && [ -f "${EXPORT_FILE}.gz" ]; then
    echo "  Decompressing ${EXPORT_FILE}.gz..."
    gunzip "${EXPORT_FILE}.gz"
  fi
  
  if [ ! -f "$EXPORT_FILE" ]; then
    echo -e "  ${YELLOW}⚠${NC} Export file not found: $EXPORT_FILE (skipping)"
    continue
  fi
  
  # Get item count
  ITEM_COUNT=$(jq '.Items | length' "$EXPORT_FILE")
  echo "  Items to import: $ITEM_COUNT"
  
  if [ "$ITEM_COUNT" -eq 0 ]; then
    echo -e "  ${YELLOW}⚠${NC} No items to import (skipping)"
    continue
  fi
  
  # Import items in batches (DynamoDB batch write limit: 25 items)
  # IMPORTANT: All attributes including timestamps (created_at, updated_at, etc.) are preserved
  BATCH_SIZE=25
  TOTAL_BATCHES=$(( ($ITEM_COUNT + $BATCH_SIZE - 1) / $BATCH_SIZE ))
  IMPORTED=0
  
  for ((i=0; i<$ITEM_COUNT; i+=$BATCH_SIZE)); do
    BATCH_NUM=$(( ($i / $BATCH_SIZE) + 1 ))
    echo -ne "  Processing batch $BATCH_NUM/$TOTAL_BATCHES...\r"
    
    # Extract batch - preserve ALL attributes exactly as exported (including dates/timestamps)
    # The .Items array contains complete DynamoDB items with all attributes preserved
    jq -c ".Items[$i:$((i+$BATCH_SIZE))] | map({PutRequest: {Item: .}})" "$EXPORT_FILE" > /tmp/batch.json
    
    # Write batch - DynamoDB PutRequest preserves all attributes including:
    # - created_at, updated_at (timestamps)
    # - assigned_date, step_date (procedure dates)
    # - upload_timestamp (image upload dates)
    # - consent_timestamp (consent dates)
    # - All other date/time fields
    aws dynamodb batch-write-item \
      --request-items "{\"$table\": $(cat /tmp/batch.json)}" \
      --output json > /dev/null
    
    IMPORTED=$((IMPORTED + $(jq 'length' /tmp/batch.json)))
  done
  
  echo -e "  ${GREEN}✓${NC} Imported $IMPORTED items"
done
echo ""

# Import S3 buckets
echo -e "${YELLOW}Importing S3 buckets...${NC}"

# Images bucket
IMAGES_BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-images"
IMAGES_DIR="$EXPORT_DIR/s3-images"
if [ -d "$IMAGES_DIR" ]; then
  echo "Importing images to $IMAGES_BUCKET..."
  
  # Verify bucket exists
  if aws s3 ls "s3://$IMAGES_BUCKET" &>/dev/null; then
    # Sync local directory to bucket
    # IMPORTANT: Use --metadata-directive COPY to preserve original file metadata
    # This preserves LastModified dates and other metadata from original files
    aws s3 sync "$IMAGES_DIR" "s3://$IMAGES_BUCKET" \
      --no-progress \
      --metadata-directive COPY
    
    # Get size
    SIZE=$(du -sh "$IMAGES_DIR" | cut -f1)
    echo -e "  ${GREEN}✓${NC} Imported images to $IMAGES_BUCKET ($SIZE)"
    echo -e "  ${GREEN}✓${NC} Preserved original file timestamps and metadata"
  else
    echo -e "  ${RED}✗${NC} Bucket not found: $IMAGES_BUCKET"
  fi
else
  echo -e "  ${YELLOW}⚠${NC} Images directory not found: $IMAGES_DIR (skipping)"
fi
echo ""

# Archive bucket
ARCHIVE_BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-archive"
ARCHIVE_DIR="$EXPORT_DIR/s3-archive"
if [ -d "$ARCHIVE_DIR" ]; then
  echo "Importing archive to $ARCHIVE_BUCKET..."
  
  # Verify bucket exists
  if aws s3 ls "s3://$ARCHIVE_BUCKET" &>/dev/null; then
    # Sync local directory to bucket
    # IMPORTANT: Use --metadata-directive COPY to preserve original file metadata
    # This preserves LastModified dates and other metadata from original files
    aws s3 sync "$ARCHIVE_DIR" "s3://$ARCHIVE_BUCKET" \
      --no-progress \
      --metadata-directive COPY
    
    # Get size
    SIZE=$(du -sh "$ARCHIVE_DIR" | cut -f1)
    echo -e "  ${GREEN}✓${NC} Imported archive to $ARCHIVE_BUCKET ($SIZE)"
    echo -e "  ${GREEN}✓${NC} Preserved original file timestamps and metadata"
  else
    echo -e "  ${RED}✗${NC} Bucket not found: $ARCHIVE_BUCKET"
  fi
else
  echo -e "  ${YELLOW}⚠${NC} Archive directory not found: $ARCHIVE_DIR (skipping)"
fi
echo ""

# Verification
echo -e "${YELLOW}Verifying import...${NC}"
echo "Running verification script..."
if [ -f "./scripts/migrate-verify.sh" ]; then
  ./scripts/migrate-verify.sh
else
  echo -e "  ${YELLOW}⚠${NC} Verification script not found (run manually)"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Import Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Import completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Verify all data was imported correctly"
echo "2. Test the application with new account"
echo "3. Update frontend/mobile app with new API URL"
echo "4. After verification, you can delete old AWS account"
echo ""

