/**
 * API Gateway Configuration
 * 
 * Creates REST API with all routes and integrations
 */

# ============================================================================
# API Gateway REST API
# ============================================================================
resource "aws_api_gateway_rest_api" "main" {
  name        = "${local.name_prefix}-api"
  description = "Dental Hospital Records Management System API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# ============================================================================
# API Gateway Deployment
# ============================================================================
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = var.api_gateway_stage_name

  depends_on = [
    aws_api_gateway_method.auth_login,
    aws_api_gateway_method.auth_refresh,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# ============================================================================
# Rate Limiting (Throttling)
# ============================================================================
resource "aws_api_gateway_usage_plan" "main" {
  name = "${local.name_prefix}-usage-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.main.id
    stage  = aws_api_gateway_deployment.main.stage_name
  }

  throttle_settings {
    rate_limit  = var.rate_limit_per_user * 10 # Per second
    burst_limit = var.rate_limit_per_user * 20
  }
}

# ============================================================================
# CORS Configuration
# ============================================================================
resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_rest_api.main.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_rest_api.main.root_resource_id
  http_method  = aws_api_gateway_method.options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_rest_api.main.root_resource_id
  http_method  = aws_api_gateway_method.options.http_method
  status_code  = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_rest_api.main.root_resource_id
  http_method  = aws_api_gateway_method.options.http_method
  status_code  = aws_api_gateway_method_response.options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

