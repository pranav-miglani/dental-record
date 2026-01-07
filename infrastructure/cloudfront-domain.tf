/**
 * CloudFront Custom Domain Configuration
 * 
 * Optional: Configure custom domain for CloudFront distribution
 * Requires: ACM certificate in us-east-1, Route53 hosted zone
 */

# ============================================================================
# Route53 Record for CloudFront Custom Domain (Optional)
# ============================================================================
resource "aws_route53_record" "cloudfront" {
  count = var.cloudfront_custom_domain != "" && var.cloudfront_route53_hosted_zone_id != "" ? 1 : 0

  zone_id = var.cloudfront_route53_hosted_zone_id
  name    = var.cloudfront_custom_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.images[0].domain_name
    zone_id                = aws_cloudfront_distribution.images[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_ipv6" {
  count = var.cloudfront_custom_domain != "" && var.cloudfront_route53_hosted_zone_id != "" ? 1 : 0

  zone_id = var.cloudfront_route53_hosted_zone_id
  name    = var.cloudfront_custom_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.images[0].domain_name
    zone_id                = aws_cloudfront_distribution.images[0].hosted_zone_id
    evaluate_target_health = false
  }
}

