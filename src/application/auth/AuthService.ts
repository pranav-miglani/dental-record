/**
 * Authentication service
 * Handles user authentication, JWT token generation, password management
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IUserRepository } from '../../infrastructure/dynamodb/repositories/IUserRepository'
import { IUserPatientMappingRepository } from '../../infrastructure/dynamodb/repositories/IUserPatientMappingRepository'
import { IPatientRepository } from '../../infrastructure/dynamodb/repositories/IPatientRepository'
import { User } from '../../domain/user/User'
import { JwtPayload } from '../../shared/types'
import {
  InvalidCredentialsError,
  BlockedUserError,
  NotFoundError,
} from '../../shared/errors'

export interface LoginResult {
  access_token: string
  refresh_token: string
  user: User
  linked_patients?: Array<{
    patient_id: string
    name: string
    relationship_type: string
  }>
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userPatientMappingRepository?: IUserPatientMappingRepository,
    private readonly patientRepository?: IPatientRepository,
    private readonly jwtSecret: string = process.env.JWT_SECRET || 'secret',
    private readonly accessTokenExpiry: string = process.env.JWT_ACCESS_EXPIRY || '30m',
    private readonly refreshTokenExpiry: string = process.env.JWT_REFRESH_EXPIRY || '30d'
  ) {}

  /**
   * Authenticate user with mobile number and password
   */
  async login(mobile_number: string, password: string): Promise<LoginResult> {
    // Find user by mobile number
    const user = await this.userRepository.findByMobileNumber(mobile_number)

    if (!user) {
      throw new InvalidCredentialsError('Invalid mobile number or password')
    }

    // Check if user is blocked
    if (user.isCurrentlyBlocked()) {
      throw new BlockedUserError('User account is blocked')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Invalid mobile number or password')
    }

    // Increment login count
    user.incrementLoginCount()
    await this.userRepository.update(user)

    // Generate tokens
    const access_token = this.generateAccessToken(user)
    const refresh_token = this.generateRefreshToken(user)

    // Get linked patients (for patient role)
    const linked_patients = user.hasRole('PATIENT')
      ? await this.getLinkedPatients(user.user_id)
      : undefined

    return {
      access_token,
      refresh_token,
      user,
      linked_patients,
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refresh_token: string): Promise<{ access_token: string }> {
    try {
      const decoded = jwt.verify(refresh_token, this.jwtSecret) as JwtPayload

      // Verify user still exists
      const user = await this.userRepository.findById(decoded.user_id)

      if (!user) {
        throw new NotFoundError('User', decoded.user_id)
      }

      // Check if user is blocked
      if (user.isCurrentlyBlocked()) {
        throw new BlockedUserError('User account is blocked')
      }

      // Generate new access token
      const access_token = this.generateAccessToken(user)

      return { access_token }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidCredentialsError('Invalid refresh token')
      }
      throw error
    }
  }

  /**
   * Change password
   */
  async changePassword(
    user_id: string,
    current_password: string,
    new_password: string
  ): Promise<void> {
    const user = await this.userRepository.findById(user_id)

    if (!user) {
      throw new NotFoundError('User', user_id)
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, user.password_hash)

    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Current password is incorrect')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 10)

    // Update password
    user.updatePassword(newPasswordHash)
    await this.userRepository.update(user)
  }

  /**
   * Reset password (by admin/doctor)
   */
  async resetPassword(user_id: string, new_password: string): Promise<void> {
    const user = await this.userRepository.findById(user_id)

    if (!user) {
      throw new NotFoundError('User', user_id)
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 10)

    // Update password
    user.updatePassword(newPasswordHash)
    await this.userRepository.update(user)
  }

  /**
   * Generate access token (public for admin impersonation)
   */
  generateAccessToken(user: User, impersonatedBy?: string): string {
    const payload: JwtPayload = {
      user_id: user.user_id,
      mobile_number: user.mobile_number,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
      ...(impersonatedBy && { impersonated_by: impersonatedBy }),
    }

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    })
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      user_id: user.user_id,
      mobile_number: user.mobile_number,
      roles: user.roles,
    }

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry,
    })
  }

  /**
   * Get linked patients for user
   */
  private async getLinkedPatients(user_id: string): Promise<Array<{
    patient_id: string
    name: string
    relationship_type: string
  }>> {
    if (!this.userPatientMappingRepository || !this.patientRepository) {
      return []
    }

    const mappings = await this.userPatientMappingRepository.findByUserId(user_id)

    // Fetch patient details for each mapping
    const linkedPatients = await Promise.all(
      mappings.items.map(async (mapping) => {
        const patient = await this.patientRepository!.findById(mapping.patient_id)
        return {
          patient_id: mapping.patient_id,
          name: patient?.name || 'Unknown',
          relationship_type: mapping.relationship_type,
        }
      })
    )

    return linkedPatients
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidCredentialsError('Invalid token')
      }
      throw error
    }
  }
}

