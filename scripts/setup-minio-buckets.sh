#!/bin/bash

# Setup MinIO buckets for local S3 testing
# This script creates all required S3 buckets in MinIO

set -e

MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://localhost:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"

echo "🔧 Setting up MinIO buckets..."
echo "   Endpoint: $MINIO_ENDPOINT"

# Install mc (MinIO client) if not available
if ! command -v mc &> /dev/null; then
  echo "Installing MinIO client (mc)..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install minio/stable/mc
  else
    echo "Please install MinIO client: https://min.io/docs/minio/linux/reference/minio-mc.html"
    exit 1
  fi
fi

# Configure MinIO alias
mc alias set local "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api s3v4

# Create buckets
echo ""
echo "Creating test-images-bucket..."
mc mb "local/test-images-bucket" --ignore-existing || true

echo "Creating test-archive-bucket..."
mc mb "local/test-archive-bucket" --ignore-existing || true

# Set bucket policies (public read for testing)
echo ""
echo "Setting bucket policies..."
mc anonymous set download "local/test-images-bucket" || true
mc anonymous set download "local/test-archive-bucket" || true

echo ""
echo "✅ MinIO buckets setup complete!"
echo ""
echo "MinIO Console: http://localhost:9001"
echo "  Username: minioadmin"
echo "  Password: minioadmin"

