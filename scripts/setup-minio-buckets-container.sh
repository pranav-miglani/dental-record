#!/bin/sh

# Setup MinIO buckets from within Docker container
# This version works inside the container

set -e

MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"

echo "🔧 Setting up MinIO buckets in container..."
echo "   Endpoint: $MINIO_ENDPOINT"

# Use AWS CLI to create buckets (MinIO is S3-compatible)
aws s3 mb "s3://test-images-bucket" \
  --endpoint-url "$MINIO_ENDPOINT" \
  --region us-east-1 \
  2>/dev/null || echo "Bucket test-images-bucket already exists"

aws s3 mb "s3://test-archive-bucket" \
  --endpoint-url "$MINIO_ENDPOINT" \
  --region us-east-1 \
  2>/dev/null || echo "Bucket test-archive-bucket already exists"

# Configure AWS CLI for MinIO
export AWS_ACCESS_KEY_ID="$MINIO_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$MINIO_SECRET_KEY"

echo "✅ MinIO buckets setup complete!"

