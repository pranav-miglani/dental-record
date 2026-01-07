/**
 * OTP Service
 * Handles OTP generation and SMS sending via SNS
 */

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { randomInt } from 'crypto'

export class OTPService {
  private readonly snsClient: SNSClient
  private readonly topicArn: string
  private readonly otpExpiryMinutes: number = 10

  // In-memory OTP storage (in production, use DynamoDB or Redis)
  private readonly otpStore: Map<
    string,
    { code: string; expiresAt: Date; attempts: number }
  > = new Map()

  constructor() {
    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    })
    this.topicArn = process.env.SNS_TOPIC_ARN || ''
  }

  /**
   * Generate and send OTP
   */
  async generateAndSendOTP(mobile_number: string): Promise<string> {
    // Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString()

    // Store OTP with expiry
    const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000)
    this.otpStore.set(mobile_number, {
      code: otp,
      expiresAt,
      attempts: 0,
    })

    // Send SMS via SNS
    const message = `Your OTP for password reset is ${otp}. Valid for ${this.otpExpiryMinutes} minutes.`

    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: message,
      PhoneNumber: mobile_number, // Direct SMS (if topic not configured)
    })

    try {
      await this.snsClient.send(command)
    } catch (error) {
      // Log error but don't fail (OTP is still generated)
      console.error('Failed to send OTP SMS:', error)
    }

    return otp
  }

  /**
   * Verify OTP
   */
  async verifyOTP(mobile_number: string, otp: string): Promise<boolean> {
    const stored = this.otpStore.get(mobile_number)

    if (!stored) {
      return false
    }

    // Check if expired
    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(mobile_number)
      return false
    }

    // Check attempts (max 3)
    if (stored.attempts >= 3) {
      this.otpStore.delete(mobile_number)
      return false
    }

    // Verify OTP
    if (stored.code === otp) {
      this.otpStore.delete(mobile_number)
      return true
    }

    // Increment attempts
    stored.attempts++
    this.otpStore.set(mobile_number, stored)

    return false
  }

  /**
   * Clear OTP (after successful verification or expiry)
   */
  clearOTP(mobile_number: string): void {
    this.otpStore.delete(mobile_number)
  }
}

