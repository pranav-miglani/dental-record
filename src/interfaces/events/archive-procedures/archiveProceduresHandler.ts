/**
 * Archive Procedures Handler
 * EventBridge scheduled handler to archive procedures older than 3 years
 */

import { EventBridgeEvent } from 'aws-lambda'
import { ProcedureRepository } from '../../../infrastructure/dynamodb/repositories/ProcedureRepository'
import { ImageRepository } from '../../../infrastructure/dynamodb/repositories/ImageRepository'
import { S3ImageService } from '../../../infrastructure/s3/S3ImageService'

const procedureRepository = new ProcedureRepository()
const imageRepository = new ImageRepository()
const s3ImageService = new S3ImageService()

const ARCHIVE_AGE_DAYS = 3 * 365 // 3 years

export async function handler(
  event: EventBridgeEvent<'Scheduled Event', any>
): Promise<void> {
  console.log('Archive procedures handler started')

  try {
    // Calculate cutoff date (3 years ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_AGE_DAYS)

    // Find procedures older than cutoff date that are not archived
    let lastKey: string | undefined
    let archivedCount = 0

    do {
      // Use findByCreatedBefore to efficiently find procedures to archive
      const procedures = await procedureRepository.findByCreatedBefore(cutoffDate, 100, lastKey)

      for (const procedure of procedures.items) {
        if (!procedure.archived) {
          await archiveProcedure(procedure.procedure_id)
          archivedCount++
        }
      }

      lastKey = procedures.last_key
    } while (lastKey)

    console.log(`Archived ${archivedCount} procedures`)
  } catch (error) {
    console.error('Error archiving procedures:', error)
    throw error
  }
}

async function archiveProcedure(procedure_id: string): Promise<void> {
  // Get procedure
  const procedure = await procedureRepository.findById(procedure_id)
  if (!procedure) {
    return
  }

  // Get all images for procedure
  const images = await imageRepository.findByProcedureId(procedure_id)

  // Archive images to S3
  const yearMonth = `${procedure.created_at.getFullYear()}-${String(procedure.created_at.getMonth() + 1).padStart(2, '0')}`
  const archivedImageKeys: string[] = []

  for (const image of images.items) {
    if (!image.is_deleted) {
      const archiveKey = await s3ImageService.archiveImage(
        procedure.patient_id,
        procedure_id,
        yearMonth,
        image.s3_key_original
      )
      archivedImageKeys.push(archiveKey)
    }
  }

  // Update procedure with archive location
  const archiveLocation = `s3://${process.env.ARCHIVE_BUCKET}/archived/${procedure.patient_id}/${procedure_id}/${yearMonth}/`
  procedure.archive(archiveLocation)
  await procedureRepository.update(procedure)

  console.log(`Archived procedure ${procedure_id} to ${archiveLocation}`)
}

