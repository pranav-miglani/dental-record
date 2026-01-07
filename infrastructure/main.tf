/**
 * Main Terraform Configuration
 * 
 * This is the entry point for Terraform. It sets up the provider,
 * backend configuration, and calls all module files.
 * 
 * Usage:
 *   terraform init
 *   terraform plan
 *   terraform apply
 */

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state storage
  # Uncomment and configure for remote state storage
  # backend "s3" {
  #   bucket         = "dental-hospital-terraform-state"
  #   key            = "dental-hospital/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Get current AWS region
data "aws_region" "current" {}

# Local values for resource naming
locals {
  # Resource name prefix
  name_prefix = "${var.project_name}-${var.environment}"

  # Common resource tags
  common_tags = merge(
    var.tags,
    {
      Name        = local.name_prefix
      Environment = var.environment
    }
  )
}

