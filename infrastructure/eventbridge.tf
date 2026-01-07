/**
 * EventBridge Rules
 * 
 * Creates scheduled rules for background jobs:
 * - Archive procedures (daily at 2 AM)
 * - Cleanup sessions (daily)
 */

# ============================================================================
# Archive Procedures Rule (Daily at 2 AM)
# ============================================================================
resource "aws_cloudwatch_event_rule" "archive_procedures" {
  name                = "${local.name_prefix}-archive-procedures"
  description         = "Archive procedures older than 3 years"
  schedule_expression = "cron(0 2 * * ? *)" # Daily at 2 AM UTC

  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "archive_procedures" {
  rule      = aws_cloudwatch_event_rule.archive_procedures.name
  target_id = "ArchiveProceduresTarget"
  arn       = aws_lambda_function.archive_procedures.arn
}

resource "aws_lambda_permission" "allow_eventbridge_archive" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.archive_procedures.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.archive_procedures.arn
}

