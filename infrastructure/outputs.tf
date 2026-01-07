/**
 * Terraform Outputs
 * 
 * This file defines all output values from Terraform.
 * These can be used by other Terraform configurations or scripts.
 */

output "users_table_name" {
  description = "Name of the users DynamoDB table"
  value       = aws_dynamodb_table.users.name
}

output "patients_table_name" {
  description = "Name of the patients DynamoDB table"
  value       = aws_dynamodb_table.patients.name
}

output "procedures_table_name" {
  description = "Name of the procedures DynamoDB table"
  value       = aws_dynamodb_table.procedures.name
}

output "images_table_name" {
  description = "Name of the images DynamoDB table"
  value       = aws_dynamodb_table.images.name
}

output "consent_table_name" {
  description = "Name of the consent DynamoDB table"
  value       = aws_dynamodb_table.consent.name
}

output "audit_logs_table_name" {
  description = "Name of the audit_logs DynamoDB table"
  value       = aws_dynamodb_table.audit_logs.name
}

output "procedure_steps_table_name" {
  description = "Name of the procedure_steps DynamoDB table"
  value       = aws_dynamodb_table.procedure_steps.name
}

output "user_patient_mapping_table_name" {
  description = "Name of the user_patient_mapping DynamoDB table"
  value       = aws_dynamodb_table.user_patient_mappings.name
}

output "images_bucket_name" {
  description = "Name of the S3 bucket for images (alias for s3_images_bucket_name)"
  value       = aws_s3_bucket.images.bucket
}

output "archive_bucket_name" {
  description = "Name of the S3 bucket for archive (alias for s3_archive_bucket_name)"
  value       = aws_s3_bucket.archive.bucket
}

output "jwt_secret" {
  description = "JWT secret (from terraform.tfvars)"
  value       = var.jwt_secret
  sensitive   = true
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = var.api_custom_domain != "" && var.api_acm_certificate_arn != "" ? "https://${var.api_custom_domain}" : "https://${aws_api_gateway_rest_api.main.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.api_gateway_stage_name}"
}

output "s3_images_bucket_name" {
  description = "Name of the S3 bucket for images"
  value       = aws_s3_bucket.images.bucket
}

output "s3_archive_bucket_name" {
  description = "Name of the S3 bucket for archived data"
  value       = aws_s3_bucket.archive.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.images[0].id : null
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.images[0].domain_name : null
}

output "api_custom_domain_name" {
  description = "API Gateway custom domain name (if configured)"
  value       = var.api_custom_domain != "" ? var.api_custom_domain : null
}

output "cloudfront_custom_domain_name" {
  description = "CloudFront custom domain name (if configured)"
  value       = var.cloudfront_custom_domain != "" ? var.cloudfront_custom_domain : null
}

