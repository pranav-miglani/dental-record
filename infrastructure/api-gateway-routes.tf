/**
 * API Gateway Routes - Complete Route Configuration
 * 
 * This file contains all API Gateway routes for the dental hospital system.
 * Routes are organized by resource group.
 */

# ============================================================================
# API Root Resource
# ============================================================================
resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "api"
}

# ============================================================================
# Auth Routes
# ============================================================================

# Auth resource path: /api/auth
resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "auth"
}

# POST /api/auth/login
resource "aws_api_gateway_resource" "auth_login" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "login"
}

resource "aws_api_gateway_method" "auth_login" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.auth_login.id
  http_method    = "POST"
  authorization  = "NONE"
}

resource "aws_api_gateway_integration" "auth_login" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.auth_login.id
  http_method  = aws_api_gateway_method.auth_login.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_handler.invoke_arn
}

# POST /api/auth/refresh
resource "aws_api_gateway_resource" "auth_refresh" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "refresh"
}

resource "aws_api_gateway_method" "auth_refresh" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.auth_refresh.id
  http_method    = "POST"
  authorization  = "NONE"
}

resource "aws_api_gateway_integration" "auth_refresh" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.auth_refresh.id
  http_method  = aws_api_gateway_method.auth_refresh.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_handler.invoke_arn
}

# POST /api/auth/password-reset/request
resource "aws_api_gateway_resource" "auth_password_reset" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "password-reset"
}

resource "aws_api_gateway_resource" "auth_password_reset_request" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.auth_password_reset.id
  path_part   = "request"
}

resource "aws_api_gateway_method" "auth_password_reset_request" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.auth_password_reset_request.id
  http_method    = "POST"
  authorization  = "NONE"
}

resource "aws_api_gateway_integration" "auth_password_reset_request" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.auth_password_reset_request.id
  http_method  = aws_api_gateway_method.auth_password_reset_request.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_handler.invoke_arn
}

# POST /api/auth/password-reset/verify
resource "aws_api_gateway_resource" "auth_password_reset_verify" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.auth_password_reset.id
  path_part   = "verify"
}

resource "aws_api_gateway_method" "auth_password_reset_verify" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.auth_password_reset_verify.id
  http_method    = "POST"
  authorization  = "NONE"
}

resource "aws_api_gateway_integration" "auth_password_reset_verify" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.auth_password_reset_verify.id
  http_method  = aws_api_gateway_method.auth_password_reset_verify.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_handler.invoke_arn
}

# PUT /api/auth/password
resource "aws_api_gateway_resource" "auth_password" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "password"
}

resource "aws_api_gateway_method" "auth_password" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.auth_password.id
  http_method    = "PUT"
  authorization  = "AWS_IAM" # Requires authentication
}

resource "aws_api_gateway_integration" "auth_password" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.auth_password.id
  http_method  = aws_api_gateway_method.auth_password.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_handler.invoke_arn
}

# ============================================================================
# Users Routes
# ============================================================================

resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "users"
}

# GET /api/users/me
resource "aws_api_gateway_resource" "users_me" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "me"
}

resource "aws_api_gateway_method" "users_me" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users_me.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "users_me" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users_me.id
  http_method  = aws_api_gateway_method.users_me.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.users_handler.invoke_arn
}

# GET /api/users
resource "aws_api_gateway_method" "users_list" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "users_list" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users.id
  http_method  = aws_api_gateway_method.users_list.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.users_handler.invoke_arn
}

# POST /api/users
resource "aws_api_gateway_method" "users_create" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "users_create" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users.id
  http_method  = aws_api_gateway_method.users_create.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.users_handler.invoke_arn
}

# GET /api/users/{user_id}
resource "aws_api_gateway_resource" "users_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{user_id}"
}

resource "aws_api_gateway_method" "users_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users_id.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "users_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users_id.id
  http_method  = aws_api_gateway_method.users_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.users_handler.invoke_arn
}

# PUT /api/users/{user_id}
resource "aws_api_gateway_method" "users_update" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users_id.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "users_update" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users_id.id
  http_method  = aws_api_gateway_method.users_update.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.users_handler.invoke_arn
}

# PUT /api/users/{user_id}/password
resource "aws_api_gateway_resource" "users_id_password" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.users_id.id
  path_part   = "password"
}

resource "aws_api_gateway_method" "users_password" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users_id_password.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "users_password" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users_id_password.id
  http_method  = aws_api_gateway_method.users_password.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.users_handler.invoke_arn
}

# PUT /api/users/{user_id}/block
resource "aws_api_gateway_resource" "users_id_block" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.users_id.id
  path_part   = "block"
}

resource "aws_api_gateway_method" "users_block" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users_id_block.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "users_block" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users_id_block.id
  http_method  = aws_api_gateway_method.users_block.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.users_handler.invoke_arn
}

# POST /api/users/{user_id}/impersonate
resource "aws_api_gateway_resource" "users_id_impersonate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.users_id.id
  path_part   = "impersonate"
}

resource "aws_api_gateway_method" "users_impersonate" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users_id_impersonate.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "users_impersonate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users_id_impersonate.id
  http_method  = aws_api_gateway_method.users_impersonate.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_handler.invoke_arn
}

# ============================================================================
# Patients Routes
# ============================================================================

resource "aws_api_gateway_resource" "patients" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "patients"
}

# GET /api/patients
resource "aws_api_gateway_method" "patients_list" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.patients.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "patients_list" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.patients.id
  http_method  = aws_api_gateway_method.patients_list.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.patients_handler.invoke_arn
}

# POST /api/patients
resource "aws_api_gateway_method" "patients_create" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.patients.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "patients_create" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.patients.id
  http_method  = aws_api_gateway_method.patients_create.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.patients_handler.invoke_arn
}

# GET /api/patients/{patient_id}
resource "aws_api_gateway_resource" "patients_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.patients.id
  path_part   = "{patient_id}"
}

resource "aws_api_gateway_method" "patients_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.patients_id.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "patients_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.patients_id.id
  http_method  = aws_api_gateway_method.patients_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.patients_handler.invoke_arn
}

# PUT /api/patients/{patient_id}
resource "aws_api_gateway_method" "patients_update" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.patients_id.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "patients_update" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.patients_id.id
  http_method  = aws_api_gateway_method.patients_update.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.patients_handler.invoke_arn
}

# POST /api/patients/{patient_id}/link
resource "aws_api_gateway_resource" "patients_id_link" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.patients_id.id
  path_part   = "link"
}

resource "aws_api_gateway_method" "patients_link" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.patients_id_link.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "patients_link" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.patients_id_link.id
  http_method  = aws_api_gateway_method.patients_link.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.patients_handler.invoke_arn
}

# DELETE /api/patients/{patient_id}/link
resource "aws_api_gateway_method" "patients_unlink" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.patients_id_link.id
  http_method    = "DELETE"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "patients_unlink" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.patients_id_link.id
  http_method  = aws_api_gateway_method.patients_unlink.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.patients_handler.invoke_arn
}

# GET /api/patients/{patient_id}/consent
resource "aws_api_gateway_resource" "patients_id_consent" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.patients_id.id
  path_part   = "consent"
}

resource "aws_api_gateway_method" "patients_consent_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.patients_id_consent.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "patients_consent_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.patients_id_consent.id
  http_method  = aws_api_gateway_method.patients_consent_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.consent_handler.invoke_arn
}

# POST /api/patients/{patient_id}/consent
resource "aws_api_gateway_method" "patients_consent_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.patients_id_consent.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "patients_consent_post" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.patients_id_consent.id
  http_method  = aws_api_gateway_method.patients_consent_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.consent_handler.invoke_arn
}

# ============================================================================
# Procedures Routes
# ============================================================================

resource "aws_api_gateway_resource" "procedures" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "procedures"
}

# GET /api/procedures
resource "aws_api_gateway_method" "procedures_list" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_list" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures.id
  http_method  = aws_api_gateway_method.procedures_list.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# POST /api/procedures
resource "aws_api_gateway_method" "procedures_create" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_create" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures.id
  http_method  = aws_api_gateway_method.procedures_create.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# GET /api/procedures/{procedure_id}
resource "aws_api_gateway_resource" "procedures_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures.id
  path_part   = "{procedure_id}"
}

resource "aws_api_gateway_method" "procedures_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id.id
  http_method  = aws_api_gateway_method.procedures_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# PUT /api/procedures/{procedure_id}
resource "aws_api_gateway_method" "procedures_update" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_update" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id.id
  http_method  = aws_api_gateway_method.procedures_update.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# PUT /api/procedures/{procedure_id}/confirm
resource "aws_api_gateway_resource" "procedures_id_confirm" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures_id.id
  path_part   = "confirm"
}

resource "aws_api_gateway_method" "procedures_confirm" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_confirm.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_confirm" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_confirm.id
  http_method  = aws_api_gateway_method.procedures_confirm.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# PUT /api/procedures/{procedure_id}/close
resource "aws_api_gateway_resource" "procedures_id_close" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures_id.id
  path_part   = "close"
}

resource "aws_api_gateway_method" "procedures_close" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_close.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_close" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_close.id
  http_method  = aws_api_gateway_method.procedures_close.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# PUT /api/procedures/{procedure_id}/cancel
resource "aws_api_gateway_resource" "procedures_id_cancel" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures_id.id
  path_part   = "cancel"
}

resource "aws_api_gateway_method" "procedures_cancel" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_cancel.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_cancel" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_cancel.id
  http_method  = aws_api_gateway_method.procedures_cancel.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# GET /api/procedures/{procedure_id}/steps
resource "aws_api_gateway_resource" "procedures_id_steps" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures_id.id
  path_part   = "steps"
}

resource "aws_api_gateway_method" "procedures_steps_list" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_steps.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_steps_list" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps.id
  http_method  = aws_api_gateway_method.procedures_steps_list.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# GET /api/procedures/{procedure_id}/steps/{step_id}
resource "aws_api_gateway_resource" "procedures_id_steps_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures_id_steps.id
  path_part   = "{step_id}"
}

resource "aws_api_gateway_method" "procedures_steps_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_steps_id.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_steps_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id.id
  http_method  = aws_api_gateway_method.procedures_steps_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# PUT /api/procedures/{procedure_id}/steps/{step_id}
resource "aws_api_gateway_method" "procedures_steps_update" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_steps_id.id
  http_method    = "PUT"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_steps_update" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id.id
  http_method  = aws_api_gateway_method.procedures_steps_update.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# POST /api/procedures/{procedure_id}/steps/{step_id}/complete
resource "aws_api_gateway_resource" "procedures_id_steps_id_complete" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures_id_steps_id.id
  path_part   = "complete"
}

resource "aws_api_gateway_method" "procedures_steps_complete" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_steps_id_complete.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_steps_complete" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id_complete.id
  http_method  = aws_api_gateway_method.procedures_steps_complete.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# POST /api/procedures/{procedure_id}/steps/{step_id}/skip
resource "aws_api_gateway_resource" "procedures_id_steps_id_skip" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures_id_steps_id.id
  path_part   = "skip"
}

resource "aws_api_gateway_method" "procedures_steps_skip" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_steps_id_skip.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_steps_skip" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id_skip.id
  http_method  = aws_api_gateway_method.procedures_steps_skip.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# POST /api/procedures/{procedure_id}/steps/{step_id}/images
resource "aws_api_gateway_resource" "procedures_id_steps_id_images" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.procedures_id_steps_id.id
  path_part   = "images"
}

resource "aws_api_gateway_method" "procedures_steps_images_upload" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.procedures_id_steps_id_images.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "procedures_steps_images_upload" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id_images.id
  http_method  = aws_api_gateway_method.procedures_steps_images_upload.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# Steps handler integration (for step-specific routes)
resource "aws_api_gateway_integration" "procedures_steps_list_steps_handler" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps.id
  http_method  = aws_api_gateway_method.procedures_steps_list.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.steps_handler.invoke_arn
}

resource "aws_api_gateway_integration" "procedures_steps_get_steps_handler" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id.id
  http_method  = aws_api_gateway_method.procedures_steps_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.steps_handler.invoke_arn
}

resource "aws_api_gateway_integration" "procedures_steps_update_steps_handler" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id.id
  http_method  = aws_api_gateway_method.procedures_steps_update.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.steps_handler.invoke_arn
}

resource "aws_api_gateway_integration" "procedures_steps_complete_steps_handler" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id_complete.id
  http_method  = aws_api_gateway_method.procedures_steps_complete.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.steps_handler.invoke_arn
}

resource "aws_api_gateway_integration" "procedures_steps_skip_steps_handler" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.procedures_id_steps_id_skip.id
  http_method  = aws_api_gateway_method.procedures_steps_skip.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.steps_handler.invoke_arn
}

# ============================================================================
# Images Routes
# ============================================================================

resource "aws_api_gateway_resource" "images" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "images"
}

# GET /api/images/{image_id}
resource "aws_api_gateway_resource" "images_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.images.id
  path_part   = "{image_id}"
}

resource "aws_api_gateway_method" "images_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.images_id.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "images_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.images_id.id
  http_method  = aws_api_gateway_method.images_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# GET /api/images/{image_id}/versions
resource "aws_api_gateway_resource" "images_id_versions" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.images_id.id
  path_part   = "versions"
}

resource "aws_api_gateway_method" "images_versions" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.images_id_versions.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "images_versions" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.images_id_versions.id
  http_method  = aws_api_gateway_method.images_versions.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# GET /api/images/{image_id}/view
resource "aws_api_gateway_resource" "images_id_view" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.images_id.id
  path_part   = "view"
}

resource "aws_api_gateway_method" "images_view" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.images_id_view.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "images_view" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.images_id_view.id
  http_method  = aws_api_gateway_method.images_view.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# GET /api/images/{image_id}/download
resource "aws_api_gateway_resource" "images_id_download" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.images_id.id
  path_part   = "download"
}

resource "aws_api_gateway_method" "images_download" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.images_id_download.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "images_download" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.images_id_download.id
  http_method  = aws_api_gateway_method.images_download.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# POST /api/images/{image_id}/replace
resource "aws_api_gateway_resource" "images_id_replace" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.images_id.id
  path_part   = "replace"
}

resource "aws_api_gateway_method" "images_replace" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.images_id_replace.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "images_replace" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.images_id_replace.id
  http_method  = aws_api_gateway_method.images_replace.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# DELETE /api/images/{image_id}
resource "aws_api_gateway_method" "images_delete" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.images_id.id
  http_method    = "DELETE"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "images_delete" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.images_id.id
  http_method  = aws_api_gateway_method.images_delete.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# POST /api/images/{image_id}/annotate
resource "aws_api_gateway_resource" "images_id_annotate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.images_id.id
  path_part   = "annotate"
}

resource "aws_api_gateway_method" "images_annotate" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.images_id_annotate.id
  http_method    = "POST"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "images_annotate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.images_id_annotate.id
  http_method  = aws_api_gateway_method.images_annotate.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# GET /api/images/{image_id}/annotation
resource "aws_api_gateway_resource" "images_id_annotation" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.images_id.id
  path_part   = "annotation"
}

resource "aws_api_gateway_method" "images_annotation_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.images_id_annotation.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "images_annotation_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.images_id_annotation.id
  http_method  = aws_api_gateway_method.images_annotation_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.images_handler.invoke_arn
}

# ============================================================================
# Audit Routes
# ============================================================================

resource "aws_api_gateway_resource" "audit" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "audit"
}

resource "aws_api_gateway_resource" "audit_logs" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.audit.id
  path_part   = "logs"
}

# GET /api/audit/logs
resource "aws_api_gateway_method" "audit_logs" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.audit_logs.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "audit_logs" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.audit_logs.id
  http_method  = aws_api_gateway_method.audit_logs.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.audit_handler.invoke_arn
}

# ============================================================================
# Admin Routes
# ============================================================================

resource "aws_api_gateway_resource" "admin" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "admin"
}

# GET /api/admin/stats
resource "aws_api_gateway_resource" "admin_stats" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "stats"
}

resource "aws_api_gateway_method" "admin_stats" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.admin_stats.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "admin_stats" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.admin_stats.id
  http_method  = aws_api_gateway_method.admin_stats.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.admin_handler.invoke_arn
}

# ============================================================================
# Archive Routes
# ============================================================================

resource "aws_api_gateway_resource" "archive" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "archive"
}

resource "aws_api_gateway_resource" "archive_procedures" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.archive.id
  path_part   = "procedures"
}

# GET /api/archive/procedures
resource "aws_api_gateway_method" "archive_procedures_list" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.archive_procedures.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "archive_procedures_list" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.archive_procedures.id
  http_method  = aws_api_gateway_method.archive_procedures_list.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.procedures_handler.invoke_arn
}

# GET /api/archive/procedures/{procedure_id}
resource "aws_api_gateway_resource" "archive_procedures_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.archive_procedures.id
  path_part   = "{procedure_id}"
}

resource "aws_api_gateway_method" "archive_procedures_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.archive_procedures_id.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "archive_procedures_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.archive_procedures_id.id
  http_method  = aws_api_gateway_method.archive_procedures_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.archive_handler.invoke_arn
}

# GET /api/archive/procedures/{procedure_id}/images/{image_id}/download
resource "aws_api_gateway_resource" "archive_procedures_id_images" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.archive_procedures_id.id
  path_part   = "images"
}

resource "aws_api_gateway_resource" "archive_procedures_id_images_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.archive_procedures_id_images.id
  path_part   = "{image_id}"
}

resource "aws_api_gateway_resource" "archive_procedures_id_images_id_download" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.archive_procedures_id_images_id.id
  path_part   = "download"
}

resource "aws_api_gateway_method" "archive_procedures_images_download" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.archive_procedures_id_images_id_download.id
  http_method    = "GET"
  authorization  = "AWS_IAM"
}

resource "aws_api_gateway_integration" "archive_procedures_images_download" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.archive_procedures_id_images_id_download.id
  http_method  = aws_api_gateway_method.archive_procedures_images_download.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.archive_handler.invoke_arn
}

# ============================================================================
# Lambda Permissions for API Gateway
# ============================================================================

# Auth handler permissions
resource "aws_lambda_permission" "api_gateway_auth" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Users handler permissions
resource "aws_lambda_permission" "api_gateway_users" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.users_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Patients handler permissions
resource "aws_lambda_permission" "api_gateway_patients" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.patients_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Procedures handler permissions
resource "aws_lambda_permission" "api_gateway_procedures" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.procedures_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Images handler permissions
resource "aws_lambda_permission" "api_gateway_images" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.images_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Consent handler permissions
resource "aws_lambda_permission" "api_gateway_consent" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.consent_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Audit handler permissions
resource "aws_lambda_permission" "api_gateway_audit" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.audit_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Admin handler permissions
resource "aws_lambda_permission" "api_gateway_admin" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Steps handler permissions
resource "aws_lambda_permission" "api_gateway_steps" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.steps_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Archive handler permissions
resource "aws_lambda_permission" "api_gateway_archive" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.archive_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

