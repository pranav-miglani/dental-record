/**
 * Unified Auth Handler
 * Routes to appropriate auth handler based on path
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { handler as loginHandler } from './loginHandler'
import { handler as refreshHandler } from './refreshHandler'
import { requestOTPHandler, verifyOTPHandler } from './passwordResetHandler'
import { handler as changePasswordHandler } from './changePasswordHandler'

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const path = event.path
  const method = event.httpMethod

  // Route to appropriate handler
  if (path.includes('/auth/login') && method === 'POST') {
    return await loginHandler(event)
  }

  if (path.includes('/auth/refresh') && method === 'POST') {
    return await refreshHandler(event)
  }

  if (path.includes('/auth/password-reset/request') && method === 'POST') {
    return await requestOTPHandler(event)
  }

  if (path.includes('/auth/password-reset/verify') && method === 'POST') {
    return await verifyOTPHandler(event)
  }

  if (path.includes('/auth/password') && method === 'PUT') {
    return await changePasswordHandler(event as any)
  }

  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    }),
  }
}

