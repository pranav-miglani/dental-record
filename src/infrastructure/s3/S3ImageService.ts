/**
 * S3 Image Service
 * Handles image upload, download, thumbnail generation, watermarking, annotation storage
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'
import { ImageDimensions, AnnotationData } from '../../shared/types'

export class S3ImageService {
  private readonly s3Client: S3Client
  private readonly imagesBucket: string
  private readonly archiveBucket: string

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    })
    this.imagesBucket = process.env.IMAGES_BUCKET || 'dental-hospital-images-prod'
    this.archiveBucket = process.env.ARCHIVE_BUCKET || 'dental-hospital-archive-prod'
  }

  /**
   * Upload image to S3
   */
  async uploadImage(
    patient_id: string,
    procedure_id: string,
    step_id: string,
    image_id: string,
    buffer: Buffer,
    type: 'original' | 'thumbnail_200' | 'thumbnail_800',
    mime_type: string
  ): Promise<string> {
    const extension = mime_type.split('/')[1] || 'jpg'
    const key = `images/${patient_id}/${procedure_id}/${step_id}/${image_id}/${type}.${extension}`

    const command = new PutObjectCommand({
      Bucket: this.imagesBucket,
      Key: key,
      Body: buffer,
      ContentType: mime_type,
      ServerSideEncryption: 'AES256',
    })

    await this.s3Client.send(command)

    return key
  }

  /**
   * Download image from S3
   */
  async downloadImage(s3Key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.imagesBucket,
      Key: s3Key,
    })

    const response = await this.s3Client.send(command)

    if (!response.Body) {
      throw new Error('Failed to download image')
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of response.Body as any) {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks)
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(buffer: Buffer): Promise<ImageDimensions> {
    const metadata = await sharp(buffer).metadata()
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(
    buffer: Buffer,
    width: number,
    height: number
  ): Promise<Buffer> {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer()
  }

  /**
   * Compress image
   */
  async compressImage(buffer: Buffer, quality: number): Promise<Buffer> {
    return await sharp(buffer)
      .jpeg({ quality: Math.round(quality * 100) })
      .toBuffer()
  }

  /**
   * Add watermark to image
   */
  async addWatermark(
    s3Key: string,
    patient_name: string,
    date: Date,
    tooth_number?: string
  ): Promise<string> {
    // Download original image
    const buffer = await this.downloadImage(s3Key)

    // Create watermark text
    const watermarkText = [
      `Patient: ${patient_name}`,
      `Date: ${date.toLocaleDateString()}`,
      tooth_number ? `Tooth: ${tooth_number}` : null,
    ]
      .filter(Boolean)
      .join(' | ')

    // Add watermark using Sharp
    const watermarked = await sharp(buffer)
      .composite([
        {
          input: {
            text: {
              text: watermarkText,
              font: 'Arial',
              fontSize: 24,
              color: 'white',
            },
          },
          gravity: 'southeast',
          blend: 'over',
        },
      ])
      .toBuffer()

    // Upload watermarked version
    const watermarkedKey = s3Key.replace('/original.', '/watermarked.')
    const command = new PutObjectCommand({
      Bucket: this.imagesBucket,
      Key: watermarkedKey,
      Body: watermarked,
      ContentType: 'image/jpeg',
      ServerSideEncryption: 'AES256',
    })

    await this.s3Client.send(command)

    return watermarkedKey
  }

  /**
   * Upload annotation JSON
   */
  async uploadAnnotation(
    patient_id: string,
    procedure_id: string,
    step_id: string,
    image_id: string,
    annotation_data: AnnotationData
  ): Promise<string> {
    const key = `images/${patient_id}/${procedure_id}/${step_id}/${image_id}/annotation.json`

    const command = new PutObjectCommand({
      Bucket: this.imagesBucket,
      Key: key,
      Body: JSON.stringify(annotation_data),
      ContentType: 'application/json',
      ServerSideEncryption: 'AES256',
    })

    await this.s3Client.send(command)

    return key
  }

  /**
   * Get annotation data
   */
  async getAnnotation(s3Key: string): Promise<AnnotationData> {
    const buffer = await this.downloadImage(s3Key)
    return JSON.parse(buffer.toString('utf-8')) as AnnotationData
  }

  /**
   * Get pre-signed URL for image access
   */
  async getPresignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.imagesBucket,
      Key: s3Key,
    })

    return await getSignedUrl(this.s3Client, command, { expiresIn })
  }

  /**
   * Archive image to archive bucket
   */
  async archiveImage(
    patient_id: string,
    procedure_id: string,
    yearMonth: string,
    s3Key: string
  ): Promise<string> {
    // Download from active bucket
    const buffer = await this.downloadImage(s3Key)

    // Upload to archive bucket
    const archiveKey = `archived/${patient_id}/${procedure_id}/${yearMonth}/images/${s3Key.split('/').pop()}`

    const command = new PutObjectCommand({
      Bucket: this.archiveBucket,
      Key: archiveKey,
      Body: buffer,
      StorageClass: 'STANDARD_IA', // Infrequent access
      ServerSideEncryption: 'AES256',
    })

    await this.s3Client.send(command)

    // Delete from active bucket
    await this.deleteImage(s3Key)

    return archiveKey
  }

  /**
   * Delete image from S3
   */
  async deleteImage(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.imagesBucket,
      Key: s3Key,
    })

    await this.s3Client.send(command)
  }
}

