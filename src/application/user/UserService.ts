/**
 * User service
 * Business logic for user management
 */

import { IUserRepository } from '../../infrastructure/dynamodb/repositories/IUserRepository'
import { User } from '../../domain/user/User'
import { UserRole } from '../../shared/types'
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from '../../shared/errors'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Create a new user
   */
  async createUser(data: {
    mobile_number: string
    name: string
    panel_id?: string
    department?: string
    roles: UserRole[]
  }): Promise<{ user: User; default_password: string }> {
    // Check if mobile number already exists
    const exists = await this.userRepository.mobileNumberExists(data.mobile_number)

    if (exists) {
      throw new ConflictError('User with this mobile number already exists')
    }

    // Validate roles
    if (!data.roles || data.roles.length === 0) {
      throw new ValidationError('At least one role is required')
    }

    // Generate user ID
    const user_id = uuidv4()

    // Default password is mobile number
    const default_password = data.mobile_number
    const password_hash = await bcrypt.hash(default_password, 10)

    // Create user
    const user = new User(
      user_id,
      data.mobile_number,
      data.name,
      password_hash,
      data.roles,
      data.panel_id,
      data.department,
      0, // login_count
      true, // is_default_password
      false, // is_blocked
      undefined, // blocked_until
      new Date(),
      new Date()
    )

    // Save to database
    await this.userRepository.create(user)

    return { user, default_password }
  }

  /**
   * Get user by ID
   */
  async getUser(user_id: string): Promise<User> {
    const user = await this.userRepository.findById(user_id)

    if (!user) {
      throw new NotFoundError('User', user_id)
    }

    return user
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, limit: number = 50, lastKey?: string) {
    return await this.userRepository.findByRole(role, limit, lastKey)
  }

  /**
   * Get users by panel ID
   */
  async getUsersByPanelId(panel_id: string, limit: number = 50, lastKey?: string) {
    return await this.userRepository.findByPanelId(panel_id, limit, lastKey)
  }

  /**
   * Update user information
   */
  async updateUser(
    user_id: string,
    data: {
      name?: string
      roles?: UserRole[]
      panel_id?: string
      department?: string
    }
  ): Promise<User> {
    const user = await this.getUser(user_id)

    // Update information
    user.updateInfo({
      name: data.name,
      panel_id: data.panel_id,
      department: data.department,
    })

    // Update roles if provided
    if (data.roles) {
      // Remove all existing roles and add new ones
      const currentRoles = [...user.roles]
      for (const role of currentRoles) {
        user.removeRole(role)
      }
      for (const role of data.roles) {
        user.addRole(role)
      }
    }

    return await this.userRepository.update(user)
  }

  /**
   * Block user
   */
  async blockUser(user_id: string, until?: Date): Promise<User> {
    const user = await this.getUser(user_id)
    user.block(until)
    return await this.userRepository.update(user)
  }

  /**
   * Unblock user
   */
  async unblockUser(user_id: string): Promise<User> {
    const user = await this.getUser(user_id)
    user.unblock()
    return await this.userRepository.update(user)
  }

  /**
   * Add role to user
   */
  async addRole(user_id: string, role: UserRole): Promise<User> {
    const user = await this.getUser(user_id)
    user.addRole(role)
    return await this.userRepository.update(user)
  }

  /**
   * Remove role from user
   */
  async removeRole(user_id: string, role: UserRole): Promise<User> {
    const user = await this.getUser(user_id)

    // Prevent removing last role
    if (user.roles.length === 1) {
      throw new ValidationError('Cannot remove the last role from user')
    }

    user.removeRole(role)
    return await this.userRepository.update(user)
  }

  /**
   * Delete user (soft delete or hard delete)
   */
  async deleteUser(user_id: string): Promise<void> {
    const user = await this.getUser(user_id)
    await this.userRepository.delete(user_id)
  }
}

