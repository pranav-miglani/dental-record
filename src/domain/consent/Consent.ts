/**
 * Consent domain model
 * Represents patient consent record
 */

export class Consent {
  constructor(
    public readonly consent_id: string,
    public readonly patient_id: string,
    public consent_version: number,
    public is_active: boolean,
    public ip_address: string,
    public user_agent: string,
    public consented_at: Date,
    public readonly created_at: Date = new Date()
  ) {}

  /**
   * Revoke consent
   */
  revoke(): void {
    this.is_active = false
  }

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): Record<string, unknown> {
    return {
      consent_id: this.consent_id,
      patient_id: this.patient_id,
      consent_version: this.consent_version,
      is_active: this.is_active,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      consented_at: this.consented_at.toISOString(),
      created_at: this.created_at.toISOString(),
    }
  }

  /**
   * Create Consent from plain object
   */
  static fromPlainObject(data: Record<string, unknown>): Consent {
    return new Consent(
      data.consent_id as string,
      data.patient_id as string,
      data.consent_version as number,
      (data.is_active as boolean) || false,
      data.ip_address as string,
      data.user_agent as string,
      new Date(data.consented_at as string),
      new Date(data.created_at as string)
    )
  }
}

