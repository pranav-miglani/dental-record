/**
 * S3 Buckets Configuration
 * 
 * Creates S3 buckets for images and archived data with lifecycle policies
 * for cost optimization (Standard → Standard-IA → Glacier)
 */

# ============================================================================
# Images Bucket (Active Images)
# ============================================================================
resource "aws_s3_bucket" "images" {
  bucket = "${local.name_prefix}-images"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-images"
      Purpose = "Active medical images"
    }
  )
}

# Enable versioning for image history
resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.images.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets  = true
}

# Lifecycle policy: Keep in Standard for 3 years, then move to Standard-IA
resource "aws_s3_bucket_lifecycle_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    id     = "transition-to-standard-ia"
    status = "Enabled"

    transition {
      days          = var.s3_lifecycle_transition_days # 3 years
      storage_class = "STANDARD_IA"
    }
  }

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = var.s3_glacier_transition_days # 7 years
      storage_class = "GLACIER"
    }
  }
}

# CORS configuration for image access
resource "aws_s3_bucket_cors_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"] # Configure with specific origins in production
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Event notification for thumbnail generation
resource "aws_s3_bucket_notification" "images" {
  bucket = aws_s3_bucket.images.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.generate_thumbnails.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "images/"
    filter_suffix       = "/original."
  }

  depends_on = [aws_lambda_permission.allow_s3_thumbnails]
}

# ============================================================================
# Archive Bucket (Archived Data)
# ============================================================================
resource "aws_s3_bucket" "archive" {
  bucket = "${local.name_prefix}-archive"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-archive"
      Purpose = "Archived medical records"
    }
  )
}

# Enable versioning
resource "aws_s3_bucket_versioning" "archive" {
  bucket = aws_s3_bucket.archive.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "archive" {
  bucket = aws_s3_bucket.archive.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "archive" {
  bucket = aws_s3_bucket.archive.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets  = true
}

# Lifecycle policy: Start with Standard-IA, move to Glacier after 7 years
resource "aws_s3_bucket_lifecycle_configuration" "archive" {
  bucket = aws_s3_bucket.archive.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = var.s3_glacier_transition_days # 7 years
      storage_class = "GLACIER"
    }
  }
}

