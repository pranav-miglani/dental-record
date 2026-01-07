/**
 * Archive handler - View archived procedures (Admin/Doctor only)
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { ProcedureRepository } from '../../../infrastructure/dynamodb/repositories/ProcedureRepository'
import { ImageRepository } from '../../../infrastructure/dynamodb/repositories/ImageRepository'
import { S3ImageService } from '../../../infrastructure/s3/S3ImageService'
import { ValidationError, NotFoundError, ForbiddenError } from '../../../shared/errors'
import { requireRole, canViewArchived } from '../../../shared/rbac/rbac'

const procedureRepository = new ProcedureRepository()
const imageRepository = new ImageRepository()
const s3ImageService = new S3ImageService()

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new ForbiddenError('User not authenticated')
    }

    if (!canViewArchived(event.user.roles as any)) {
      throw new ForbiddenError('You do not have permission to view archived data')
    }

    const method = event.httpMethod
    const path = event.path

    // GET /api/archive/procedures - List archived procedures
    if (method === 'GET' && path.endsWith('/archive/procedures')) {
      const limit = parseInt(event.queryStringParameters?.limit || '50')
      const lastKey = event.queryStringParameters?.last_key

      const procedures = await procedureRepository.findArchived(limit, lastKey)
      return successResponse(procedures)
    }

    // GET /api/archive/procedures/:procedure_id - Get archived procedure
    if (method === 'GET' && path.includes('/archive/procedures/') && !path.includes('/images/')) {
      const procedure_id = path.split('/archive/procedures/')[1]?.split('/')[0]
      if (!procedure_id) {
        throw new ValidationError('Procedure ID is required')
      }

      const procedure = await procedureRepository.findById(procedure_id)

      if (!procedure || !procedure.archived) {
        throw new NotFoundError('Archived procedure', procedure_id)
      }

      return successResponse(procedure)
    }

    // GET /api/archive/procedures/:procedure_id/images/:image_id/download - Download archived image
    if (method === 'GET' && path.includes('/archive/procedures/') && path.includes('/images/') && path.includes('/download')) {
      const parts = path.split('/images/')[1]?.split('/download')[0]
      const image_id = parts?.split('/')[0]
      const procedure_id = path.split('/archive/procedures/')[1]?.split('/images')[0]

      if (!image_id || !procedure_id) {
        throw new ValidationError('Image ID and Procedure ID are required')
      }

      const image = await imageRepository.findById(image_id)
      if (!image) {
        throw new NotFoundError('Image', image_id)
      }

      const procedure = await procedureRepository.findById(procedure_id)
      if (!procedure || !procedure.archive_location) {
        throw new NotFoundError('Archived procedure', procedure_id)
      }

      // Download from archive bucket
      const buffer = await s3ImageService.downloadImage(image.s3_key_original)

      return {
        statusCode: 200,
        headers: {
          'Content-Type': image.mime_type,
          'Content-Disposition': `attachment; filename="${image.filename}"`,
          'Access-Control-Allow-Origin': '*',
        },
        body: buffer.toString('base64'),
        isBase64Encoded: true,
      }
    }

    return errorResponse(404, 'NOT_FOUND', 'Endpoint not found')
  } catch (error) {
    return handleError(error)
  }
}

function successResponse(data: any): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: true,
      data,
    }),
  }
}

function errorResponse(
  statusCode: number,
  code: string,
  message: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: false,
      error: { code, message },
    }),
  }
}

function handleError(error: unknown): APIGatewayProxyResult {
  if (error instanceof ValidationError) {
    return errorResponse(422, 'VALIDATION_ERROR', error.message)
  }
  if (error instanceof NotFoundError) {
    return errorResponse(404, 'NOT_FOUND', error.message)
  }
  if (error instanceof ForbiddenError) {
    return errorResponse(403, 'FORBIDDEN', error.message)
  }

  return errorResponse(
    500,
    'INTERNAL_SERVER_ERROR',
    error instanceof Error ? error.message : 'An error occurred'
  )
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }
}

