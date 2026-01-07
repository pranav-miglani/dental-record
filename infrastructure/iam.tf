/**
 * IAM Roles and Policies
 * 
 * Creates IAM roles and policies for Lambda functions to access
 * DynamoDB, S3, SNS, and other AWS services
 */

# ============================================================================
# Lambda Execution Role
# ============================================================================
resource "aws_iam_role" "lambda_execution" {
  name = "${local.name_prefix}-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# ============================================================================
# Lambda Execution Policy (CloudWatch Logs)
# ============================================================================
resource "aws_iam_role_policy" "lambda_logs" {
  name = "${local.name_prefix}-lambda-logs"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
      }
    ]
  })
}

# ============================================================================
# DynamoDB Access Policy
# ============================================================================
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${local.name_prefix}-lambda-dynamodb"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          "${aws_dynamodb_table.users.arn}/*",
          aws_dynamodb_table.patients.arn,
          "${aws_dynamodb_table.patients.arn}/*",
          aws_dynamodb_table.user_patient_mappings.arn,
          "${aws_dynamodb_table.user_patient_mappings.arn}/*",
          aws_dynamodb_table.procedures.arn,
          "${aws_dynamodb_table.procedures.arn}/*",
          aws_dynamodb_table.procedure_steps.arn,
          "${aws_dynamodb_table.procedure_steps.arn}/*",
          aws_dynamodb_table.images.arn,
          "${aws_dynamodb_table.images.arn}/*",
          aws_dynamodb_table.consent.arn,
          "${aws_dynamodb_table.consent.arn}/*",
          aws_dynamodb_table.audit_logs.arn,
          "${aws_dynamodb_table.audit_logs.arn}/*"
        ]
      }
    ]
  })
}

# ============================================================================
# S3 Access Policy
# ============================================================================
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${local.name_prefix}-lambda-s3"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.images.arn,
          "${aws_s3_bucket.images.arn}/*",
          aws_s3_bucket.archive.arn,
          "${aws_s3_bucket.archive.arn}/*"
        ]
      }
    ]
  })
}

# ============================================================================
# SNS Access Policy (for OTP)
# ============================================================================
resource "aws_iam_role_policy" "lambda_sns" {
  name = "${local.name_prefix}-lambda-sns"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.otp.arn
      }
    ]
  })
}

