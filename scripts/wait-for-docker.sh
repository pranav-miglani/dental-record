#!/bin/bash

# Wait for Docker to be ready
# This script checks if Docker is running and waits if needed

set -e

echo "🔍 Checking Docker status..."

# Wait up to 60 seconds for Docker to be ready
MAX_WAIT=60
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
  if docker info > /dev/null 2>&1; then
    echo "✅ Docker is ready!"
    exit 0
  fi
  
  if [ $ELAPSED -eq 0 ]; then
    echo "⏳ Docker is not running. Waiting for Docker Desktop to start..."
    echo "   Please start Docker Desktop if it's not already running."
  fi
  
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  echo -n "."
done

echo ""
echo "❌ Docker did not become ready within $MAX_WAIT seconds."
echo "   Please:"
echo "   1. Open Docker Desktop application"
echo "   2. Wait for it to fully start (whale icon in menu bar)"
echo "   3. Try again"
exit 1

