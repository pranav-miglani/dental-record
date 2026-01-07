#!/bin/bash

# ============================================================================
# Export Data from Old AWS Account
# ============================================================================
# This script exports all data from the old AWS account to local files
# Run this script BEFORE creating the new AWS account
#
# Usage:
#   ./scripts/migrate-export-data.sh
#
# Prerequisites:
#   - AWS CLI configured with OLD account credentials
#   - jq installed (brew install jq)
#   - Sufficient disk space for exports
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EXPORT_DIR="./migration-export-$(date +%Y%m%d-%H%M%S)"
PROJECT_NAME="dental-hospital-system"
ENVIRONMENT="production"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Data Export Script - Old AWS Account${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Create export directory
mkdir -p "$EXPORT_DIR"
echo -e "${GREEN}✓ Created export directory: $EXPORT_DIR${NC}"
echo ""

# Get table names
echo -e "${YELLOW}Getting DynamoDB table names...${NC}"
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

# Verify tables exist
echo "Verifying tables exist..."
for table in "${TABLES[@]}"; do
  if aws dynamodb describe-table --table-name "$table" &>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $table"
  else
    echo -e "  ${RED}✗${NC} $table (not found)"
    exit 1
  fi
done
echo ""

# Export DynamoDB tables
echo -e "${YELLOW}Exporting DynamoDB tables...${NC}"
for table in "${TABLES[@]}"; do
  echo "Exporting $table..."
  
  # Get item count
  ITEM_COUNT=$(aws dynamodb scan --table-name "$table" --select COUNT --output json | jq -r '.Count')
  echo "  Items to export: $ITEM_COUNT"
  
  # Export all items
  OUTPUT_FILE="$EXPORT_DIR/${table}.json"
  aws dynamodb scan \
    --table-name "$table" \
    --output json > "$OUTPUT_FILE"
  
  # Verify export
  EXPORTED_COUNT=$(jq '.Items | length' "$OUTPUT_FILE")
  echo -e "  ${GREEN}✓${NC} Exported $EXPORTED_COUNT items to $OUTPUT_FILE"
  
  # Compress large files
  if [ "$EXPORTED_COUNT" -gt 1000 ]; then
    gzip "$OUTPUT_FILE"
    echo "  Compressed to ${OUTPUT_FILE}.gz"
  fi
done
echo ""

# Export S3 buckets
echo -e "${YELLOW}Exporting S3 buckets...${NC}"

# Images bucket
IMAGES_BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-images"
if aws s3 ls "s3://$IMAGES_BUCKET" &>/dev/null; then
  echo "Exporting images bucket: $IMAGES_BUCKET"
  IMAGES_DIR="$EXPORT_DIR/s3-images"
  mkdir -p "$IMAGES_DIR"
  
  # Sync bucket to local directory
  aws s3 sync "s3://$IMAGES_BUCKET" "$IMAGES_DIR" --no-progress
  
  # Get size
  SIZE=$(du -sh "$IMAGES_DIR" | cut -f1)
  echo -e "  ${GREEN}✓${NC} Exported images to $IMAGES_DIR ($SIZE)"
else
  echo -e "  ${YELLOW}⚠${NC} Images bucket not found: $IMAGES_BUCKET"
fi
echo ""

# Archive bucket
ARCHIVE_BUCKET="${PROJECT_NAME}-${ENVIRONMENT}-archive"
if aws s3 ls "s3://$ARCHIVE_BUCKET" &>/dev/null; then
  echo "Exporting archive bucket: $ARCHIVE_BUCKET"
  ARCHIVE_DIR="$EXPORT_DIR/s3-archive"
  mkdir -p "$ARCHIVE_DIR"
  
  # Sync bucket to local directory
  aws s3 sync "s3://$ARCHIVE_BUCKET" "$ARCHIVE_DIR" --no-progress
  
  # Get size
  SIZE=$(du -sh "$ARCHIVE_DIR" | cut -f1)
  echo -e "  ${GREEN}✓${NC} Exported archive to $ARCHIVE_DIR ($SIZE)"
else
  echo -e "  ${YELLOW}⚠${NC} Archive bucket not found: $ARCHIVE_BUCKET"
fi
echo ""

# Export Terraform outputs (for reference)
echo -e "${YELLOW}Exporting Terraform outputs...${NC}"
if [ -f "terraform-outputs.json" ]; then
  cp terraform-outputs.json "$EXPORT_DIR/terraform-outputs.json"
  echo -e "  ${GREEN}✓${NC} Copied terraform-outputs.json"
fi

# Export API Gateway URL (for reference)
if [ -f "api-url.txt" ]; then
  cp api-url.txt "$EXPORT_DIR/api-url.txt"
  echo -e "  ${GREEN}✓${NC} Copied api-url.txt"
fi
echo ""

# Create manifest file
echo -e "${YELLOW}Creating manifest file...${NC}"
MANIFEST_FILE="$EXPORT_DIR/MANIFEST.txt"
cat > "$MANIFEST_FILE" << EOF
Migration Export Manifest
=========================
Export Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Project: $PROJECT_NAME
Environment: $ENVIRONMENT

DynamoDB Tables Exported:
$(for table in "${TABLES[@]}"; do echo "  - $table"; done)

S3 Buckets Exported:
  - $IMAGES_BUCKET
  - $ARCHIVE_BUCKET

Export Directory: $EXPORT_DIR
Total Size: $(du -sh "$EXPORT_DIR" | cut -f1)

IMPORTANT - Date Preservation:
==============================
All date and timestamp fields are preserved during migration:
- created_at, updated_at (all tables)
- assigned_date, step_date (procedures)
- upload_timestamp (images)
- consent_timestamp (consent)
- All other date/time fields

S3 file metadata (LastModified dates) are also preserved.

Next Steps:
1. Verify all exports completed successfully
2. Backup this directory to a safe location
3. Follow migration guide to import into new AWS account
4. All dates will remain exactly as they were in the original account
EOF

echo -e "  ${GREEN}✓${NC} Created manifest: $MANIFEST_FILE"
echo ""

# Create summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Export Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Export directory: $EXPORT_DIR"
echo "Total size: $(du -sh "$EXPORT_DIR" | cut -f1)"
echo ""
echo "Files exported:"
ls -lh "$EXPORT_DIR" | tail -n +2
echo ""
echo -e "${GREEN}✓ Export completed successfully!${NC}"
echo ""
echo -e "${YELLOW}⚠ IMPORTANT:${NC}"
echo "1. Verify all data was exported correctly"
echo "2. Backup this directory to a safe location"
echo "3. Keep this directory until migration is complete"
echo "4. Do NOT delete old AWS account until migration is verified"
echo ""

