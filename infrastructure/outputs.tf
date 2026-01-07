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

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = aws_api_gateway_rest_api.main.execution_arn
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

