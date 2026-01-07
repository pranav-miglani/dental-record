/**
 * Images handler - Image upload, download, annotation, versioning
 */

import { AuthenticatedEvent, APIGatewayProxyResult } from '../../../shared/middleware/authMiddleware'
import { ImageService } from '../../../application/image/ImageService'
import { ImageRepository } from '../../../infrastructure/dynamodb/repositories/ImageRepository'
import { ProcedureRepository } from '../../../infrastructure/dynamodb/repositories/ProcedureRepository'
import { S3ImageService } from '../../../infrastructure/s3/S3ImageService'
import { ValidationError, NotFoundError, ForbiddenError } from '../../../shared/errors'
import { requireRole, canAnnotate, canDownloadImages } from '../../../shared/rbac/rbac'

const imageService = new ImageService(
  new ImageRepository(),
  new ProcedureRepository(),
  new S3ImageService()
)

export async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.user) {
      throw new ForbiddenError('User not authenticated')
    }

    const method = event.httpMethod
    const path = event.path

    // POST /api/procedures/:procedure_id/steps/:step_id/images - Upload images
    if (method === 'POST' && path.includes('/steps/') && path.includes('/images')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      const parts = path.split('/steps/')[1]?.split('/images')[0]
      const step_id = parts?.split('/')[0]
      const procedure_id = path.split('/procedures/')[1]?.split('/steps')[0]

      if (!step_id || !procedure_id) {
        throw new ValidationError('Step ID and Procedure ID are required')
      }

      // Get procedure to get patient_id
      const procedure = await imageService['procedureRepository'].findById(procedure_id)
      if (!procedure) {
        throw new NotFoundError('Procedure', procedure_id)
      }

      // Parse multipart form data (simplified - in production use proper multipart parser)
      // For now, assume files are passed in event.body as base64
      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const data = JSON.parse(event.body)
      const files = data.files || []

      if (files.length === 0) {
        throw new ValidationError('At least one file is required')
      }

      // Convert base64 to buffers
      const fileBuffers = files.map((file: any) => ({
        buffer: Buffer.from(file.content, 'base64'),
        filename: file.filename,
        mime_type: file.mime_type,
        size: file.size,
      }))

      const images = await imageService.uploadImages({
        step_id,
        procedure_id,
        patient_id: procedure.patient_id,
        files: fileBuffers,
        uploaded_by: event.user.user_id,
      })

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: true,
          data: { images },
        }),
      }
    }

    // GET /api/images/:image_id - Get image details
    if (method === 'GET' && path.includes('/images/') && !path.includes('/view') && !path.includes('/download') && !path.includes('/versions') && !path.includes('/annotation')) {
      const image_id = path.split('/images/')[1]?.split('/')[0]
      if (!image_id) {
        throw new ValidationError('Image ID is required')
      }

      const image = await imageService.getImage(image_id)
      return successResponse(image)
    }

    // GET /api/images/:image_id/versions - Get image versions
    if (method === 'GET' && path.includes('/images/') && path.includes('/versions')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'HOSPITAL_ADMIN'])

      const image_id = path.split('/images/')[1]?.split('/versions')[0]
      if (!image_id) {
        throw new ValidationError('Image ID is required')
      }

      const versions = await imageService.getImageVersions(image_id)
      return successResponse(versions)
    }

    // GET /api/images/:image_id/view - Get image URL
    if (method === 'GET' && path.includes('/images/') && path.includes('/view')) {
      const image_id = path.split('/images/')[1]?.split('/view')[0]
      if (!image_id) {
        throw new ValidationError('Image ID is required')
      }

      const size = (event.queryStringParameters?.size as any) || 'original'
      const watermark = event.queryStringParameters?.watermark === 'true'

      const image = await imageService.getImage(image_id)
      const procedure = await imageService['procedureRepository'].findById(image.procedure_id)

      const result = await imageService.getImageUrl(
        image_id,
        size,
        watermark && event.user.roles.includes('PATIENT'),
        procedure?.patient_id,
        procedure?.tooth_number?.fdi_notation
      )

      return successResponse(result)
    }

    // GET /api/images/:image_id/download - Download image
    if (method === 'GET' && path.includes('/images/') && path.includes('/download')) {
      if (!canDownloadImages(event.user.roles as any)) {
        throw new ForbiddenError('You do not have permission to download images')
      }

      const image_id = path.split('/images/')[1]?.split('/download')[0]
      if (!image_id) {
        throw new ValidationError('Image ID is required')
      }

      const compressed = event.queryStringParameters?.compressed === 'true' && event.user.roles.includes('RGHS_AGENT')

      const result = await imageService.downloadImage(image_id, compressed)

      return {
        statusCode: 200,
        headers: {
          'Content-Type': result.mime_type,
          'Content-Disposition': `attachment; filename="${result.filename}"`,
          'Access-Control-Allow-Origin': '*',
        },
        body: result.buffer.toString('base64'),
        isBase64Encoded: true,
      }
    }

    // POST /api/images/:image_id/annotate - Save annotation
    if (method === 'POST' && path.includes('/images/') && path.includes('/annotate')) {
      if (!canAnnotate(event.user.roles as any)) {
        throw new ForbiddenError('Only doctors can annotate images')
      }

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const image_id = path.split('/images/')[1]?.split('/annotate')[0]
      if (!image_id) {
        throw new ValidationError('Image ID is required')
      }

      const data = JSON.parse(event.body)
      const image = await imageService.getImage(image_id)
      const procedure = await imageService['procedureRepository'].findById(image.procedure_id)

      const updatedImage = await imageService.saveAnnotation(
        image_id,
        image.version,
        data.annotation_data,
        procedure?.patient_id || '',
        image.procedure_id,
        image.step_id
      )

      return successResponse(updatedImage)
    }

    // GET /api/images/:image_id/annotation - Get annotation
    if (method === 'GET' && path.includes('/images/') && path.includes('/annotation')) {
      if (!canAnnotate(event.user.roles as any)) {
        throw new ForbiddenError('Only doctors can view annotations')
      }

      const image_id = path.split('/images/')[1]?.split('/annotation')[0]
      if (!image_id) {
        throw new ValidationError('Image ID is required')
      }

      const image = await imageService.getImage(image_id)
      const annotation = await imageService.getAnnotation(image_id, image.version)

      return successResponse(annotation || {})
    }

    // POST /api/images/:image_id/replace - Replace image
    if (method === 'POST' && path.includes('/images/') && path.includes('/replace')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      if (!event.body) {
        throw new ValidationError('Request body is required')
      }

      const image_id = path.split('/images/')[1]?.split('/replace')[0]
      if (!image_id) {
        throw new ValidationError('Image ID is required')
      }

      const data = JSON.parse(event.body)
      const image = await imageService.getImage(image_id)
      const procedure = await imageService['procedureRepository'].findById(image.procedure_id)

      const fileBuffer = {
        buffer: Buffer.from(data.file.content, 'base64'),
        filename: data.file.filename,
        mime_type: data.file.mime_type,
        size: data.file.size,
      }

      const newImage = await imageService.replaceImage({
        image_id,
        step_id: image.step_id,
        procedure_id: image.procedure_id,
        patient_id: procedure?.patient_id || '',
        file: fileBuffer,
        uploaded_by: event.user.user_id,
      })

      return successResponse(newImage)
    }

    // DELETE /api/images/:image_id - Delete image
    if (method === 'DELETE' && path.includes('/images/') && !path.includes('/annotation')) {
      requireRole(event.user.roles as any, ['DOCTOR', 'ASSISTANT', 'HOSPITAL_ADMIN'])

      const image_id = path.split('/images/')[1]?.split('/')[0]
      if (!image_id) {
        throw new ValidationError('Image ID is required')
      }

      const image = await imageService.getImage(image_id)
      await imageService.deleteImage(image_id, image.version)

      return successResponse({ message: 'Image deleted successfully' })
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

