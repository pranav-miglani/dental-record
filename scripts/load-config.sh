#!/bin/bash

# ============================================================================
# Configuration Loader
# ============================================================================
# This script loads configuration from multiple sources in priority order:
# 1. GitHub Secrets (in CI/CD environment)
# 2. Environment variables (already set)
# 3. .env file (local development)
# 4. Defaults (fallback)
#
# Usage:
#   source scripts/load-config.sh
# ============================================================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Function to load config
load_configuration() {
  local config_source=""
  
  # Check if running in GitHub Actions
  if [ -n "$GITHUB_ACTIONS" ]; then
    config_source="GitHub Secrets"
    echo -e "${BLUE}Loading configuration from GitHub Secrets...${NC}"
    
    # Load from GitHub Secrets (environment variables are already set by GitHub Actions)
    # No action needed - GitHub Actions automatically injects secrets as env vars
    
  elif [ -f "$PROJECT_ROOT/.env" ]; then
    config_source=".env file"
    echo -e "${BLUE}Loading configuration from .env file...${NC}"
    
    # Load from .env file
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | grep -v '^$' | xargs)
    
  else
    config_source="Environment variables/defaults"
    echo -e "${YELLOW}No .env file found, using environment variables or defaults...${NC}"
  fi
  
  # Set defaults if not provided
  export AWS_REGION="${AWS_REGION:-us-east-1}"
  export PROJECT_NAME="${PROJECT_NAME:-dental-hospital-system}"
  export ENVIRONMENT="${ENVIRONMENT:-production}"
  
  # Generate JWT secret if not provided
  if [ -z "$JWT_SECRET" ]; then
    if command -v openssl &> /dev/null; then
      export JWT_SECRET=$(openssl rand -base64 32)
      echo -e "${YELLOW}Generated JWT_SECRET (not saved)${NC}"
    else
      echo -e "${YELLOW}Warning: openssl not found, JWT_SECRET not generated${NC}"
    fi
  fi
  
  # Set admin password default if not provided
  export ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"
  
  echo -e "${GREEN}Configuration loaded from: $config_source${NC}"
}

# Load configuration
load_configuration

