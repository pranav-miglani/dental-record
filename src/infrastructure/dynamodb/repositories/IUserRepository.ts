/**
 * User repository interface
 */

import { User } from '../../../domain/user/User'
import { UserRole } from '../../../shared/types'
import { PaginatedResponse } from '../../../shared/types'

export interface IUserRepository {
  /**
   * Find user by mobile number (for login)
   */
  findByMobileNumber(mobile_number: string): Promise<User | null>

  /**
   * Find user by ID
   */
  findById(user_id: string): Promise<User | null>

  /**
   * Find users by role
   */
  findByRole(role: UserRole, limit?: number, lastKey?: string): Promise<PaginatedResponse<User>>

  /**
   * Find users by panel ID
   */
  findByPanelId(panel_id: string, limit?: number, lastKey?: string): Promise<PaginatedResponse<User>>

  /**
   * Check if mobile number exists
   */
  mobileNumberExists(mobile_number: string): Promise<boolean>

  /**
   * Create user
   */
  create(user: User): Promise<User>

  /**
   * Update user
   */
  update(user: User): Promise<User>

  /**
   * Delete user (soft delete or hard delete)
   */
  delete(user_id: string): Promise<void>

  /**
   * Count all users
   */
  countAll(): Promise<number>
}

