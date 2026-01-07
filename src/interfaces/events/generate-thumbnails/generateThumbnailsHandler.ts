/**
 * Generate Thumbnails Handler
 * S3 event handler to generate thumbnails when images are uploaded
 */

import { S3Event } from 'aws-lambda'
import { S3ImageService } from '../../../infrastructure/s3/S3ImageService'
import { ImageRepository } from '../../../infrastructure/dynamodb/repositories/ImageRepository'

const s3ImageService = new S3ImageService()
const imageRepository = new ImageRepository()

export async function handler(event: S3Event): Promise<void> {
  console.log('Generate thumbnails handler started')

  for (const record of event.Records) {
    try {
      const bucket = record.s3.bucket.name
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '))

      // Only process original images (not thumbnails)
      if (!key.includes('/original.')) {
        continue
      }

      // Extract image metadata from key
      // Format: images/{patient_id}/{procedure_id}/{step_id}/{image_id}/original.{ext}
      const parts = key.split('/')
      if (parts.length < 6) {
        console.warn(`Invalid image key format: ${key}`)
        continue
      }

      const image_id = parts[4]

      // Find image in database
      const image = await imageRepository.findById(image_id)

      if (!image) {
        console.warn(`Image not found in database: ${image_id}`)
        continue
      }

      // Download original image
      const originalBuffer = await s3ImageService.downloadImage(key)

      // Generate thumbnails
      const thumbnail200 = await s3ImageService.generateThumbnail(originalBuffer, 200, 200)
      const thumbnail800 = await s3ImageService.generateThumbnail(originalBuffer, 800, 800)

      // Upload thumbnails
      const ext = key.split('.').pop() || 'jpg'
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png'

      const thumbnail200Key = await s3ImageService.uploadImage(
        image.procedure_id.split('/')[0], // patient_id (simplified)
        image.procedure_id,
        image.step_id,
        image_id,
        thumbnail200,
        'thumbnail_200',
        mimeType
      )

      const thumbnail800Key = await s3ImageService.uploadImage(
        image.procedure_id.split('/')[0],
        image.procedure_id,
        image.step_id,
        image_id,
        thumbnail800,
        'thumbnail_800',
        mimeType
      )

      // Update image with thumbnail keys
      image.s3_key_thumbnail_200 = thumbnail200Key
      image.s3_key_thumbnail_800 = thumbnail800Key
      await imageRepository.update(image)

      console.log(`Generated thumbnails for image ${image_id}`)
    } catch (error) {
      console.error(`Error processing image ${record.s3.object.key}:`, error)
      // Continue processing other images
    }
  }
}

