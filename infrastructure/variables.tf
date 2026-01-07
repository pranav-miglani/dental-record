/**
 * Terraform Variables
 * 
 * This file defines all input variables for the infrastructure.
 * These can be overridden via terraform.tfvars or environment variables.
 */

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "dental-hospital-system"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "jwt_secret" {
  description = "JWT secret key for token generation (should be stored in AWS Secrets Manager in production)"
  type        = string
  sensitive   = true
}

variable "jwt_access_expiry" {
  description = "Access token expiry time (e.g., 30m, 1h)"
  type        = string
  default     = "30m"
}

variable "jwt_refresh_expiry" {
  description = "Refresh token expiry time (e.g., 30d, 90d)"
  type        = string
  default     = "30d"
}

variable "sns_otp_topic_name" {
  description = "SNS topic name for OTP SMS"
  type        = string
  default     = "dental-hospital-otp"
}

variable "api_gateway_stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "prod"
}

variable "lambda_memory_size" {
  description = "Memory size for Lambda functions (MB)"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Timeout for Lambda functions (seconds)"
  type        = number
  default     = 30
}

variable "lambda_image_processing_memory" {
  description = "Memory size for image processing Lambda (MB)"
  type        = number
  default     = 1024
}

variable "lambda_image_processing_timeout" {
  description = "Timeout for image processing Lambda (seconds)"
  type        = number
  default     = 300
}

variable "rate_limit_per_user" {
  description = "Rate limit per user/IP (requests per second)"
  type        = number
  default     = 15
}

variable "enable_cloudfront" {
  description = "Enable CloudFront distribution for image delivery"
  type        = bool
  default     = true
}

variable "s3_lifecycle_transition_days" {
  description = "Number of days before transitioning to Standard-IA storage class"
  type        = number
  default     = 1095 # 3 years
}

variable "s3_glacier_transition_days" {
  description = "Number of days before transitioning to Glacier storage class"
  type        = number
  default     = 2555 # 7 years
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "DentalHospitalSystem"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

