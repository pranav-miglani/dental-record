/**
 * API Gateway Custom Domain Configuration
 * 
 * Optional: Configure custom domain for API Gateway
 * Requires: ACM certificate in us-east-1, Route53 hosted zone
 */

# ============================================================================
# API Gateway Custom Domain (Optional)
# ============================================================================
resource "aws_apigatewayv2_domain_name" "api" {
  count = var.api_custom_domain != "" ? 1 : 0

  domain_name = var.api_custom_domain

  domain_name_configuration {
    certificate_arn = var.api_acm_certificate_arn != "" ? var.api_acm_certificate_arn : null
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = local.common_tags
}

# ============================================================================
# API Gateway Domain Mapping
# ============================================================================
resource "aws_apigatewayv2_api_mapping" "api" {
  count = var.api_custom_domain != "" ? 1 : 0

  api_id      = aws_api_gateway_rest_api.main.id
  domain_name = aws_apigatewayv2_domain_name.api[0].id
  stage       = aws_api_gateway_deployment.main.stage_name
}

# ============================================================================
# Route53 Record for API Gateway Custom Domain (Optional)
# ============================================================================
resource "aws_route53_record" "api" {
  count = var.api_custom_domain != "" && var.api_route53_hosted_zone_id != "" ? 1 : 0

  zone_id = var.api_route53_hosted_zone_id
  name    = var.api_custom_domain
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

