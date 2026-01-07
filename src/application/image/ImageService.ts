/**
 * Image service
 * Business logic for image management, upload, download, annotation, versioning
 */

import { IImageRepository } from '../../infrastructure/dynamodb/repositories/IImageRepository'
import { IProcedureRepository } from '../../infrastructure/dynamodb/repositories/IProcedureRepository'
import { Image } from '../../domain/image/Image'
import { ImageDimensions, AnnotationData } from '../../shared/types'
import { NotFoundError, ValidationError, ForbiddenError } from '../../shared/errors'
import { v4 as uuidv4 } from 'uuid'
import { S3ImageService } from '../../infrastructure/s3/S3ImageService'

export class ImageService {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly procedureRepository: IProcedureRepository,
    private readonly s3ImageService: S3ImageService
  ) {}

  /**
   * Upload image(s) for a step
   */
  async uploadImages(data: {
    step_id: string
    procedure_id: string
    patient_id: string
    files: Array<{
      buffer: Buffer
      filename: string
      mime_type: string
      size: number
    }>
    uploaded_by: string
  }): Promise<Image[]> {
    // Validate step and procedure exist
    const procedure = await this.procedureRepository.findById(data.procedure_id)
    if (!procedure) {
      throw new NotFoundError('Procedure', data.procedure_id)
    }

    const images: Image[] = []

    for (const file of data.files) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new ValidationError(`File ${file.filename} exceeds 10MB limit`)
      }

      // Validate file type
      if (!file.mime_type.startsWith('image/')) {
        throw new ValidationError(`File ${file.filename} is not an image`)
      }

      // Generate image ID
      const image_id = uuidv4()

      // Get image dimensions
      const dimensions = await this.s3ImageService.getImageDimensions(file.buffer)

      // Upload original to S3
      const s3KeyOriginal = await this.s3ImageService.uploadImage(
        data.patient_id,
        data.procedure_id,
        data.step_id,
        image_id,
        file.buffer,
        'original',
        file.mime_type
      )

      // Generate thumbnails asynchronously (trigger Lambda)
      // For now, we'll generate them synchronously
      const thumbnail200 = await this.s3ImageService.generateThumbnail(
        file.buffer,
        200,
        200
      )
      const thumbnail800 = await this.s3ImageService.generateThumbnail(
        file.buffer,
        800,
        800
      )

      const s3KeyThumbnail200 = await this.s3ImageService.uploadImage(
        data.patient_id,
        data.procedure_id,
        data.step_id,
        image_id,
        thumbnail200,
        'thumbnail_200',
        file.mime_type
      )

      const s3KeyThumbnail800 = await this.s3ImageService.uploadImage(
        data.patient_id,
        data.procedure_id,
        data.step_id,
        image_id,
        thumbnail800,
        'thumbnail_800',
        file.mime_type
      )

      // Create image entity
      const image = new Image(
        image_id,
        data.step_id,
        data.procedure_id,
        1, // version
        true, // is_current
        s3KeyOriginal,
        s3KeyThumbnail200,
        s3KeyThumbnail800,
        undefined, // annotation key
        file.filename,
        file.size,
        file.mime_type,
        dimensions,
        data.uploaded_by,
        new Date()
      )

      // Save to database
      await this.imageRepository.create(image)
      images.push(image)
    }

    return images
  }

  /**
   * Get image by ID
   */
  async getImage(image_id: string, version?: number): Promise<Image> {
    const image = await this.imageRepository.findById(image_id, version)

    if (!image) {
      throw new NotFoundError('Image', image_id)
    }

    return image
  }

  /**
   * Get all versions of an image
   */
  async getImageVersions(image_id: string) {
    return await this.imageRepository.findVersions(image_id)
  }

  /**
   * Get images for a step
   */
  async getImagesByStep(step_id: string) {
    return await this.imageRepository.findByStepId(step_id)
  }

  /**
   * Get all images for a procedure
   */
  async getImagesByProcedure(procedure_id: string) {
    return await this.imageRepository.findByProcedureId(procedure_id)
  }

  /**
   * Replace image (creates new version)
   */
  async replaceImage(data: {
    image_id: string
    step_id: string
    procedure_id: string
    patient_id: string
    file: {
      buffer: Buffer
      filename: string
      mime_type: string
      size: number
    }
    uploaded_by: string
  }): Promise<Image> {
    // Get current image
    const currentImage = await this.getImage(data.image_id)

    // Validate file
    if (data.file.size > 10 * 1024 * 1024) {
      throw new ValidationError('File exceeds 10MB limit')
    }

    if (!data.file.mime_type.startsWith('image/')) {
      throw new ValidationError('File is not an image')
    }

    // Get next version number
    const versions = await this.imageRepository.findVersions(data.image_id, 1)
    const nextVersion = versions.items.length > 0 ? versions.items[0].version + 1 : 1

    // Mark current version as not current
    currentImage.markAsNotCurrent()
    await this.imageRepository.update(currentImage)

    // Get image dimensions
    const dimensions = await this.s3ImageService.getImageDimensions(data.file.buffer)

    // Upload new version to S3
    const s3KeyOriginal = await this.s3ImageService.uploadImage(
      data.patient_id,
      data.procedure_id,
      data.step_id,
      data.image_id,
      data.file.buffer,
      'original',
      data.file.mime_type
    )

    // Generate thumbnails
    const thumbnail200 = await this.s3ImageService.generateThumbnail(
      data.file.buffer,
      200,
      200
    )
    const thumbnail800 = await this.s3ImageService.generateThumbnail(
      data.file.buffer,
      800,
      800
    )

    const s3KeyThumbnail200 = await this.s3ImageService.uploadImage(
      data.patient_id,
      data.procedure_id,
      data.step_id,
      data.image_id,
      thumbnail200,
      'thumbnail_200',
      data.file.mime_type
    )

    const s3KeyThumbnail800 = await this.s3ImageService.uploadImage(
      data.patient_id,
      data.procedure_id,
      data.step_id,
      data.image_id,
      thumbnail800,
      'thumbnail_800',
      data.file.mime_type
    )

    // Create new version
    const newImage = new Image(
      data.image_id,
      data.step_id,
      data.procedure_id,
      nextVersion,
      true, // is_current
      s3KeyOriginal,
      s3KeyThumbnail200,
      s3KeyThumbnail800,
      undefined, // annotation not copied
      data.file.filename,
      data.file.size,
      data.file.mime_type,
      dimensions,
      data.uploaded_by,
      new Date()
    )

    await this.imageRepository.create(newImage)
    return newImage
  }

  /**
   * Delete image (soft delete)
   */
  async deleteImage(image_id: string, version: number): Promise<void> {
    const image = await this.getImage(image_id, version)
    image.delete()
    await this.imageRepository.update(image)
  }

  /**
   * Save annotation (doctors only)
   */
  async saveAnnotation(
    image_id: string,
    version: number,
    annotation_data: AnnotationData,
    patient_id: string,
    procedure_id: string,
    step_id: string
  ): Promise<Image> {
    const image = await this.getImage(image_id, version)

    // Upload annotation JSON to S3
    const annotationKey = await this.s3ImageService.uploadAnnotation(
      patient_id,
      procedure_id,
      step_id,
      image_id,
      annotation_data
    )

    image.setAnnotation(annotationKey)
    await this.imageRepository.update(image)

    return image
  }

  /**
   * Get annotation data
   */
  async getAnnotation(image_id: string, version: number): Promise<AnnotationData | null> {
    const image = await this.getImage(image_id, version)

    if (!image.has_annotation || !image.s3_key_annotation) {
      return null
    }

    return await this.s3ImageService.getAnnotation(image.s3_key_annotation)
  }

  /**
   * Get image URL (with optional watermark for patients)
   */
  async getImageUrl(
    image_id: string,
    size: 'original' | 'thumbnail_200' | 'thumbnail_800' = 'original',
    watermark: boolean = false,
    patient_name?: string,
    tooth_number?: string
  ): Promise<{ url: string; expires_at: Date }> {
    const image = await this.getImage(image_id)

    let s3Key: string
    switch (size) {
      case 'thumbnail_200':
        s3Key = image.s3_key_thumbnail_200 || image.s3_key_original
        break
      case 'thumbnail_800':
        s3Key = image.s3_key_thumbnail_800 || image.s3_key_original
        break
      default:
        s3Key = image.s3_key_original
    }

    // If watermark needed, create watermarked version
    if (watermark && patient_name) {
      const watermarkedKey = await this.s3ImageService.addWatermark(
        s3Key,
        patient_name,
        image.upload_timestamp,
        tooth_number
      )
      s3Key = watermarkedKey
    }

    // Generate pre-signed URL (expires in 1 hour)
    const url = await this.s3ImageService.getPresignedUrl(s3Key, 3600)
    const expires_at = new Date(Date.now() + 3600 * 1000)

    return { url, expires_at }
  }

  /**
   * Download image (original or compressed)
   */
  async downloadImage(
    image_id: string,
    compressed: boolean = false
  ): Promise<{ buffer: Buffer; mime_type: string; filename: string }> {
    const image = await this.getImage(image_id)

    let buffer: Buffer
    if (compressed) {
      // Get original and compress to 70% quality
      buffer = await this.s3ImageService.downloadImage(image.s3_key_original)
      buffer = await this.s3ImageService.compressImage(buffer, 0.7)
    } else {
      buffer = await this.s3ImageService.downloadImage(image.s3_key_original)
    }

    return {
      buffer,
      mime_type: image.mime_type,
      filename: image.filename,
    }
  }
}

