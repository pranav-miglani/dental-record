/**
 * API Gateway Custom Domain Configuration
 * 
 * Optional: Configure custom domain for API Gateway REST API
 * Requires: ACM certificate in us-east-1, Route53 hosted zone
 * 
 * Note: For REST API, we use aws_api_gateway_domain_name (not v2)
 */

# ============================================================================
# API Gateway Custom Domain (Optional)
# ============================================================================
resource "aws_api_gateway_domain_name" "api" {
  count = var.api_custom_domain != "" && var.api_acm_certificate_arn != "" ? 1 : 0

  domain_name              = var.api_custom_domain
  regional_certificate_arn = var.api_acm_certificate_arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# ============================================================================
# API Gateway Base Path Mapping
# ============================================================================
resource "aws_api_gateway_base_path_mapping" "api" {
  count = var.api_custom_domain != "" && var.api_acm_certificate_arn != "" ? 1 : 0

  api_id      = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_deployment.main.stage_name
  domain_name = aws_api_gateway_domain_name.api[0].domain_name
}

# ============================================================================
# Route53 Record for API Gateway Custom Domain (Optional)
# ============================================================================
resource "aws_route53_record" "api" {
  count = var.api_custom_domain != "" && var.api_route53_hosted_zone_id != "" && var.api_acm_certificate_arn != "" ? 1 : 0

  zone_id = var.api_route53_hosted_zone_id
  name    = var.api_custom_domain
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.api[0].regional_domain_name
    zone_id                = aws_api_gateway_domain_name.api[0].regional_zone_id
    evaluate_target_health = false
  }
}

