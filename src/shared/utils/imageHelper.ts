/**
 * Image Helper
 * Utility functions for image processing and validation
 */

import sharp from 'sharp'

/**
 * Validate image file
 */
export function validateImageFile(
  buffer: Buffer,
  filename: string,
  maxSizeMB: number = 10
): { valid: boolean; error?: string; mimeType?: string; dimensions?: { width: number; height: number } } {
  // Check file size
  const sizeMB = buffer.length / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size ${sizeMB.toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`,
    }
  }

  // Detect MIME type from buffer
  let mimeType = 'image/jpeg' // Default
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    mimeType = 'image/png'
  } else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    mimeType = 'image/jpeg'
  }

  return {
    valid: true,
    mimeType,
  }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<{
  width: number
  height: number
}> {
  const metadata = await sharp(buffer).metadata()
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  }
}

/**
 * Generate thumbnail
 */
export async function generateThumbnail(
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
export async function compressImage(
  buffer: Buffer,
  quality: number
): Promise<Buffer> {
  return await sharp(buffer)
    .jpeg({ quality: Math.round(quality * 100) })
    .toBuffer()
}

