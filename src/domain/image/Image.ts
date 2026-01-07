/**
 * Image domain model
 * Represents a medical image (X-ray, photo) with versioning
 */

import { ImageDimensions, AnnotationData } from '../../shared/types'

export class Image {
  constructor(
    public readonly image_id: string,
    public readonly step_id: string,
    public readonly procedure_id: string,
    public version: number,
    public is_current: boolean,
    public s3_key_original: string,
    public s3_key_thumbnail_200?: string,
    public s3_key_thumbnail_800?: string,
    public s3_key_annotation?: string,
    public filename: string,
    public file_size: number,
    public mime_type: string,
    public dimensions: ImageDimensions,
    public uploaded_by: string,
    public upload_timestamp: Date,
    public has_annotation: boolean = false,
    public is_deleted: boolean = false,
    public deleted_at?: Date,
    public readonly created_at: Date = new Date(),
    public updated_at: Date = new Date()
  ) {}

  /**
   * Mark as current version
   */
  markAsCurrent(): void {
    this.is_current = true
    this.updated_at = new Date()
  }

  /**
   * Mark as not current (when new version is uploaded)
   */
  markAsNotCurrent(): void {
    this.is_current = false
    this.updated_at = new Date()
  }

  /**
   * Soft delete image
   */
  delete(): void {
    this.is_deleted = true
    this.deleted_at = new Date()
    this.updated_at = new Date()
  }

  /**
   * Restore deleted image
   */
  restore(): void {
    this.is_deleted = false
    this.deleted_at = undefined
    this.updated_at = new Date()
  }

  /**
   * Mark annotation as present
   */
  setAnnotation(annotationKey: string): void {
    this.has_annotation = true
    this.s3_key_annotation = annotationKey
    this.updated_at = new Date()
  }

  /**
   * Remove annotation
   */
  removeAnnotation(): void {
    this.has_annotation = false
    this.s3_key_annotation = undefined
    this.updated_at = new Date()
  }

  /**
   * Create new version
   */
  createNewVersion(newVersion: number): Image {
    const newImage = new Image(
      this.image_id,
      this.step_id,
      this.procedure_id,
      newVersion,
      true, // New version is current
      this.s3_key_original, // Will be updated by service
      this.s3_key_thumbnail_200,
      this.s3_key_thumbnail_800,
      undefined, // Annotation not copied to new version
      this.filename,
      this.file_size,
      this.mime_type,
      this.dimensions,
      this.uploaded_by,
      new Date(),
      false, // New version has no annotation initially
      false,
      undefined,
      new Date(),
      new Date()
    )

    // Mark old version as not current
    this.markAsNotCurrent()

    return newImage
  }

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): Record<string, unknown> {
    return {
      image_id: this.image_id,
      step_id: this.step_id,
      procedure_id: this.procedure_id,
      version: this.version,
      is_current: this.is_current,
      s3_key_original: this.s3_key_original,
      s3_key_thumbnail_200: this.s3_key_thumbnail_200,
      s3_key_thumbnail_800: this.s3_key_thumbnail_800,
      s3_key_annotation: this.s3_key_annotation,
      filename: this.filename,
      file_size: this.file_size,
      mime_type: this.mime_type,
      dimensions: this.dimensions,
      uploaded_by: this.uploaded_by,
      upload_timestamp: this.upload_timestamp.toISOString(),
      has_annotation: this.has_annotation,
      is_deleted: this.is_deleted,
      deleted_at: this.deleted_at?.toISOString(),
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    }
  }

  /**
   * Create Image from plain object
   */
  static fromPlainObject(data: Record<string, unknown>): Image {
    return new Image(
      data.image_id as string,
      data.step_id as string,
      data.procedure_id as string,
      data.version as number,
      (data.is_current as boolean) || false,
      data.s3_key_original as string,
      data.s3_key_thumbnail_200 as string | undefined,
      data.s3_key_thumbnail_800 as string | undefined,
      data.s3_key_annotation as string | undefined,
      data.filename as string,
      data.file_size as number,
      data.mime_type as string,
      data.dimensions as ImageDimensions,
      data.uploaded_by as string,
      new Date(data.upload_timestamp as string),
      (data.has_annotation as boolean) || false,
      (data.is_deleted as boolean) || false,
      data.deleted_at ? new Date(data.deleted_at as string) : undefined,
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    )
  }
}

