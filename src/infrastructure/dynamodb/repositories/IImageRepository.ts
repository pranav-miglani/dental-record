/**
 * Image repository interface
 */

import { Image } from '../../../domain/image/Image'
import { PaginatedResponse } from '../../../shared/types'

export interface IImageRepository {
  /**
   * Find image by ID and version
   */
  findById(image_id: string, version?: number): Promise<Image | null>

  /**
   * Find all versions of an image
   */
  findVersions(image_id: string, limit?: number, lastKey?: string): Promise<PaginatedResponse<Image>>

  /**
   * Find images by step ID
   */
  findByStepId(step_id: string, limit?: number, lastKey?: string): Promise<PaginatedResponse<Image>>

  /**
   * Find all images for a procedure
   */
  findByProcedureId(
    procedure_id: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<Image>>

  /**
   * Find images by uploader
   */
  findByUploader(
    user_id: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse<Image>>

  /**
   * Create image
   */
  create(image: Image): Promise<Image>

  /**
   * Update image
   */
  update(image: Image): Promise<Image>

  /**
   * Delete image (soft delete)
   */
  delete(image_id: string, version: number): Promise<void>

  /**
   * Count all images
   */
  countAll(): Promise<number>
}

