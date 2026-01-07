/**
 * UserPatientMapping domain model
 * Represents relationship between user and patient (family relationships)
 */

import { RelationshipType } from '../../shared/types'

export class UserPatientMapping {
  constructor(
    public readonly user_id: string,
    public readonly patient_id: string,
    public relationship_type: RelationshipType,
    public readonly created_at: Date = new Date()
  ) {}

  /**
   * Update relationship type
   */
  updateRelationship(relationshipType: RelationshipType): void {
    this.relationship_type = relationshipType
  }

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): Record<string, unknown> {
    return {
      user_id: this.user_id,
      patient_id: this.patient_id,
      relationship_type: this.relationship_type,
      created_at: this.created_at.toISOString(),
    }
  }

  /**
   * Create UserPatientMapping from plain object
   */
  static fromPlainObject(data: Record<string, unknown>): UserPatientMapping {
    return new UserPatientMapping(
      data.user_id as string,
      data.patient_id as string,
      data.relationship_type as RelationshipType,
      new Date(data.created_at as string)
    )
  }
}

