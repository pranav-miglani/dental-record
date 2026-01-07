#!/bin/bash

# Deploy Lambda Functions Script
# Packages and deploys all Lambda functions to AWS

set -e

echo "Building Lambda functions..."
npm run build:lambda

echo "Packaging Lambda functions..."

# Create dist/lambda directory if it doesn't exist
mkdir -p dist/lambda

# Package each Lambda function
cd dist/lambda

for dir in */; do
  if [ -d "$dir" ]; then
    function_name=$(basename "$dir")
    echo "Packaging $function_name..."
    zip -r "../${function_name}.zip" "$dir"
  fi
done

cd ../..

echo "Deploying Lambda functions..."

# Deploy each function
for zip_file in dist/*.zip; do
  if [ -f "$zip_file" ]; then
    function_name=$(basename "$zip_file" .zip)
    echo "Deploying $function_name..."
    aws lambda update-function-code \
      --function-name "dental-hospital-system-production-${function_name}" \
      --zip-file "fileb://${zip_file}" \
      --region "${AWS_REGION:-us-east-1}"
  fi
done

echo "Lambda functions deployed successfully!"

