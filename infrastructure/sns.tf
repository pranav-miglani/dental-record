/**
 * SNS Topic for OTP SMS
 * 
 * Creates SNS topic for sending OTP SMS messages
 */

# ============================================================================
# OTP SNS Topic
# ============================================================================
resource "aws_sns_topic" "otp" {
  name              = var.sns_otp_topic_name
  display_name      = "Dental Hospital OTP"
  
  tags = merge(
    local.common_tags,
    {
      Name = var.sns_otp_topic_name
      Purpose = "OTP SMS notifications"
    }
  )
}

# Output topic ARN for Lambda environment variables
output "sns_otp_topic_arn" {
  description = "ARN of the OTP SNS topic"
  value       = aws_sns_topic.otp.arn
}

