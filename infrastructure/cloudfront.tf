/**
 * CloudFront Distribution
 * 
 * Creates CloudFront distribution for image delivery (CDN)
 * Improves performance and reduces S3 costs
 */

# ============================================================================
# CloudFront Origin Access Identity (OAI)
# ============================================================================
resource "aws_cloudfront_origin_access_identity" "images" {
  comment = "OAI for ${local.name_prefix} images bucket"
}

# ============================================================================
# CloudFront Distribution
# ============================================================================
resource "aws_cloudfront_distribution" "images" {
  count = var.enable_cloudfront ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution for ${local.name_prefix} images"
  default_root_object = "index.html"

  # S3 origin
  origin {
    domain_name = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.images.bucket}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.images.cloudfront_access_identity_path
    }
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.images.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Price class (use only North America and Europe to reduce costs)
  price_class = "PriceClass_100"

  # Restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Viewer certificate (use CloudFront default)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-cloudfront"
    }
  )
}

# ============================================================================
# S3 Bucket Policy for CloudFront OAI
# ============================================================================
resource "aws_s3_bucket_policy" "images_cloudfront" {
  count = var.enable_cloudfront ? 1 : 0

  bucket = aws_s3_bucket.images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.images.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.images.arn}/*"
      }
    ]
  })
}

