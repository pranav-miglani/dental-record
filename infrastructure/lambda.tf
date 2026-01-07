/**
 * Lambda Functions Configuration
 * 
 * Creates all Lambda functions for API handlers and background jobs
 */

# ============================================================================
# Shared Lambda Configuration
# ============================================================================
locals {
  lambda_runtime     = "nodejs20.x"
  lambda_timeout     = 30
  lambda_memory_size = 512
}

# ============================================================================
# API Handlers
# ============================================================================

# Auth Handler
resource "aws_lambda_function" "auth_handler" {
  filename         = "${path.module}/../dist/lambda/auth-handler.zip"
  function_name    = "${local.name_prefix}-auth-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "auth/loginHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      USERS_TABLE_NAME     = aws_dynamodb_table.users.name
      JWT_SECRET           = var.jwt_secret
      JWT_ACCESS_EXPIRY    = var.jwt_access_expiry
      JWT_REFRESH_EXPIRY   = var.jwt_refresh_expiry
      AWS_REGION           = var.aws_region
    }
  }

  tags = local.common_tags
}

# Users Handler
resource "aws_lambda_function" "users_handler" {
  filename         = "${path.module}/../dist/lambda/users-handler.zip"
  function_name    = "${local.name_prefix}-users-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "users/usersHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      USERS_TABLE_NAME = aws_dynamodb_table.users.name
      AWS_REGION       = var.aws_region
    }
  }

  tags = local.common_tags
}

# Patients Handler
resource "aws_lambda_function" "patients_handler" {
  filename         = "${path.module}/../dist/lambda/patients-handler.zip"
  function_name    = "${local.name_prefix}-patients-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "patients/patientsHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      PATIENTS_TABLE_NAME           = aws_dynamodb_table.patients.name
      USER_PATIENT_MAPPINGS_TABLE_NAME = aws_dynamodb_table.user_patient_mappings.name
      AWS_REGION                    = var.aws_region
    }
  }

  tags = local.common_tags
}

# Procedures Handler
resource "aws_lambda_function" "procedures_handler" {
  filename         = "${path.module}/../dist/lambda/procedures-handler.zip"
  function_name    = "${local.name_prefix}-procedures-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "procedures/proceduresHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      PROCEDURES_TABLE_NAME      = aws_dynamodb_table.procedures.name
      PROCEDURE_STEPS_TABLE_NAME = aws_dynamodb_table.procedure_steps.name
      AWS_REGION                 = var.aws_region
    }
  }

  tags = local.common_tags
}

# Images Handler
resource "aws_lambda_function" "images_handler" {
  filename         = "${path.module}/../dist/lambda/images-handler.zip"
  function_name    = "${local.name_prefix}-images-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "images/imagesHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = 60 # Longer timeout for image processing
  memory_size     = var.lambda_image_processing_memory

  environment {
    variables = {
      IMAGES_TABLE_NAME  = aws_dynamodb_table.images.name
      PROCEDURES_TABLE_NAME = aws_dynamodb_table.procedures.name
      IMAGES_BUCKET      = aws_s3_bucket.images.bucket
      ARCHIVE_BUCKET     = aws_s3_bucket.archive.bucket
      AWS_REGION         = var.aws_region
    }
  }

  tags = local.common_tags
}

# Consent Handler
resource "aws_lambda_function" "consent_handler" {
  filename         = "${path.module}/../dist/lambda/consent-handler.zip"
  function_name    = "${local.name_prefix}-consent-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "consent/consentHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      CONSENT_TABLE_NAME = aws_dynamodb_table.consent.name
      PATIENTS_TABLE_NAME = aws_dynamodb_table.patients.name
      AWS_REGION         = var.aws_region
    }
  }

  tags = local.common_tags
}

# Audit Handler
resource "aws_lambda_function" "audit_handler" {
  filename         = "${path.module}/../dist/lambda/audit-handler.zip"
  function_name    = "${local.name_prefix}-audit-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "audit/auditHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      AUDIT_LOGS_TABLE_NAME = aws_dynamodb_table.audit_logs.name
      AWS_REGION            = var.aws_region
    }
  }

  tags = local.common_tags
}

# Admin Handler
resource "aws_lambda_function" "admin_handler" {
  filename         = "${path.module}/../dist/lambda/admin-handler.zip"
  function_name    = "${local.name_prefix}-admin-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "admin/adminHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      USERS_TABLE_NAME     = aws_dynamodb_table.users.name
      PATIENTS_TABLE_NAME  = aws_dynamodb_table.patients.name
      PROCEDURES_TABLE_NAME = aws_dynamodb_table.procedures.name
      IMAGES_TABLE_NAME    = aws_dynamodb_table.images.name
      AWS_REGION           = var.aws_region
    }
  }

  tags = local.common_tags
}

# Steps Handler
resource "aws_lambda_function" "steps_handler" {
  filename         = "${path.module}/../dist/lambda/steps-handler.zip"
  function_name    = "${local.name_prefix}-steps-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "steps/stepsHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      PROCEDURE_STEPS_TABLE_NAME = aws_dynamodb_table.procedure_steps.name
      PROCEDURES_TABLE_NAME     = aws_dynamodb_table.procedures.name
      AWS_REGION                = var.aws_region
    }
  }

  tags = local.common_tags
}

# Archive Handler
resource "aws_lambda_function" "archive_handler" {
  filename         = "${path.module}/../dist/lambda/archive-handler.zip"
  function_name    = "${local.name_prefix}-archive-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "archive/archiveHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = local.lambda_timeout
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      PROCEDURES_TABLE_NAME = aws_dynamodb_table.procedures.name
      IMAGES_TABLE_NAME     = aws_dynamodb_table.images.name
      IMAGES_BUCKET         = aws_s3_bucket.images.bucket
      ARCHIVE_BUCKET        = aws_s3_bucket.archive.bucket
      AWS_REGION            = var.aws_region
    }
  }

  tags = local.common_tags
}

# ============================================================================
# Event Handlers (Background Jobs)
# ============================================================================

# Archive Procedures Handler
resource "aws_lambda_function" "archive_procedures" {
  filename         = "${path.module}/../dist/lambda/archive-procedures.zip"
  function_name    = "${local.name_prefix}-archive-procedures"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "events/archive-procedures/archiveProceduresHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = 300 # 5 minutes for archival
  memory_size     = local.lambda_memory_size

  environment {
    variables = {
      PROCEDURES_TABLE_NAME = aws_dynamodb_table.procedures.name
      IMAGES_TABLE_NAME     = aws_dynamodb_table.images.name
      IMAGES_BUCKET         = aws_s3_bucket.images.bucket
      ARCHIVE_BUCKET        = aws_s3_bucket.archive.bucket
      AWS_REGION            = var.aws_region
    }
  }

  tags = local.common_tags
}

# Generate Thumbnails Handler
resource "aws_lambda_function" "generate_thumbnails" {
  filename         = "${path.module}/../dist/lambda/generate-thumbnails.zip"
  function_name    = "${local.name_prefix}-generate-thumbnails"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "events/generate-thumbnails/generateThumbnailsHandler.handler"
  runtime         = local.lambda_runtime
  timeout         = var.lambda_image_processing_timeout
  memory_size     = var.lambda_image_processing_memory

  environment {
    variables = {
      IMAGES_TABLE_NAME = aws_dynamodb_table.images.name
      IMAGES_BUCKET     = aws_s3_bucket.images.bucket
      AWS_REGION        = var.aws_region
    }
  }

  tags = local.common_tags
}

# Permission for S3 to invoke thumbnail generation Lambda
resource "aws_lambda_permission" "allow_s3_thumbnails" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_thumbnails.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.images.arn
}

