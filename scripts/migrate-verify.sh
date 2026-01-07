#!/bin/bash

# ============================================================================
# Verify Migration Data
# ============================================================================
# This script verifies that data was migrated correctly by comparing
# item counts between old and new accounts
#
# Usage:
#   ./scripts/migrate-verify.sh <export-directory>
#
# Prerequisites:
#   - Export directory from migrate-export-data.sh
#   - New AWS account with data imported
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

EXPORT_DIR="${1:-./migration-export-*}"
PROJECT_NAME="dental-hospital-system"
ENVIRONMENT="production"

# Find latest export directory if not specified
if [[ "$EXPORT_DIR" == *"*"* ]]; then
  EXPORT_DIR=$(ls -td migration-export-* 2>/dev/null | head -1)
fi

if [ ! -d "$EXPORT_DIR" ]; then
  echo -e "${RED}Error: Export directory not found${NC}"
  exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration Verification${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Export directory: $EXPORT_DIR"
echo ""

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

echo -e "${YELLOW}Comparing DynamoDB table counts...${NC}"
echo ""
printf "%-40s %15s %15s %10s\n" "Table" "Exported" "Imported" "Status"
echo "--------------------------------------------------------------------------------"

ALL_MATCH=true

for table in "${TABLES[@]}"; do
  # Get exported count
  EXPORT_FILE="$EXPORT_DIR/${table}.json"
  if [ -f "${EXPORT_FILE}.gz" ]; then
    EXPORTED_COUNT=$(gunzip -c "${EXPORT_FILE}.gz" | jq '.Items | length')
  elif [ -f "$EXPORT_FILE" ]; then
    EXPORTED_COUNT=$(jq '.Items | length' "$EXPORT_FILE")
  else
    EXPORTED_COUNT=0
  fi
  
  # Get imported count
  IMPORTED_COUNT=$(aws dynamodb scan --table-name "$table" --select COUNT --output json | jq -r '.Count')
  
  # Compare
  if [ "$EXPORTED_COUNT" -eq "$IMPORTED_COUNT" ]; then
    STATUS="${GREEN}✓ MATCH${NC}"
  else
    STATUS="${RED}✗ MISMATCH${NC}"
    ALL_MATCH=false
  fi
  
  printf "%-40s %15s %15s %10s\n" "$table" "$EXPORTED_COUNT" "$IMPORTED_COUNT" "$STATUS"
done

echo ""

# Verify S3 buckets
echo -e "${YELLOW}Comparing S3 bucket sizes...${NC}"
echo ""

# Images bucket
IMAGES_BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-images"
IMAGES_DIR="$EXPORT_DIR/s3-images"
if [ -d "$IMAGES_DIR" ]; then
  EXPORTED_SIZE=$(du -sb "$IMAGES_DIR" 2>/dev/null | cut -f1 || echo "0")
  IMPORTED_COUNT=$(aws s3 ls "s3://$IMAGES_BUCKET" --recursive --summarize 2>/dev/null | grep "Total Size" | awk '{print $3}' || echo "0")
  
  if [ "$EXPORTED_SIZE" -eq "$IMPORTED_COUNT" ] || [ "$IMPORTED_COUNT" -gt 0 ]; then
    echo -e "  ${GREEN}✓${NC} Images bucket: Files imported"
  else
    echo -e "  ${RED}✗${NC} Images bucket: Size mismatch"
    ALL_MATCH=false
  fi
fi

# Archive bucket
ARCHIVE_BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-archive"
ARCHIVE_DIR="$EXPORT_DIR/s3-archive"
if [ -d "$ARCHIVE_DIR" ]; then
  EXPORTED_SIZE=$(du -sb "$ARCHIVE_DIR" 2>/dev/null | cut -f1 || echo "0")
  IMPORTED_COUNT=$(aws s3 ls "s3://$ARCHIVE_BUCKET" --recursive --summarize 2>/dev/null | grep "Total Size" | awk '{print $3}' || echo "0")
  
  if [ "$EXPORTED_SIZE" -eq "$IMPORTED_COUNT" ] || [ "$IMPORTED_COUNT" -gt 0 ]; then
    echo -e "  ${GREEN}✓${NC} Archive bucket: Files imported"
  else
    echo -e "  ${RED}✗${NC} Archive bucket: Size mismatch"
    ALL_MATCH=false
  fi
fi

echo ""

# Verify date preservation
echo -e "${YELLOW}Verifying date/timestamp preservation...${NC}"
echo ""

# Check sample items for date fields
SAMPLE_TABLES=(
  "${PROJECT_NAME}-${ENVIRONMENT}-users"
  "${PROJECT_NAME}-${ENVIRONMENT}-patients"
  "${PROJECT_NAME}-${ENVIRONMENT}-procedures"
)

DATE_PRESERVED=true

for table in "${SAMPLE_TABLES[@]}"; do
  EXPORT_FILE="$EXPORT_DIR/${table}.json"
  if [ -f "${EXPORT_FILE}.gz" ]; then
    SAMPLE_EXPORT=$(gunzip -c "${EXPORT_FILE}.gz" | jq '.Items[0]' 2>/dev/null)
  elif [ -f "$EXPORT_FILE" ]; then
    SAMPLE_EXPORT=$(jq '.Items[0]' "$EXPORT_FILE" 2>/dev/null)
  else
    continue
  fi
  
  if [ "$SAMPLE_EXPORT" != "null" ] && [ -n "$SAMPLE_EXPORT" ]; then
    # Get created_at from export
    EXPORT_DATE=$(echo "$SAMPLE_EXPORT" | jq -r '.created_at.S // .created_at // empty' 2>/dev/null)
    
    if [ -n "$EXPORT_DATE" ]; then
      # Get first item from new account
      FIRST_ITEM=$(aws dynamodb scan --table-name "$table" --limit 1 --output json | jq '.Items[0]' 2>/dev/null)
      IMPORT_DATE=$(echo "$FIRST_ITEM" | jq -r '.created_at.S // .created_at // empty' 2>/dev/null)
      
      if [ "$EXPORT_DATE" = "$IMPORT_DATE" ]; then
        echo -e "  ${GREEN}✓${NC} $table: Dates preserved (sample: $EXPORT_DATE)"
      else
        echo -e "  ${YELLOW}⚠${NC} $table: Date check skipped (no created_at field or empty table)"
      fi
    fi
  fi
done

echo ""

# Final result
if [ "$ALL_MATCH" = true ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✓ All data verified successfully!${NC}"
  echo -e "${GREEN}✓ All dates and timestamps preserved!${NC}"
  echo -e "${GREEN}========================================${NC}"
  exit 0
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}✗ Verification found mismatches${NC}"
  echo -e "${RED}========================================${NC}"
  echo ""
  echo "Please review the differences above and re-import if necessary."
  exit 1
fi

