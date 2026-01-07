/**
 * User domain model
 * Represents a system user (patient, doctor, assistant, admin, RGHS agent)
 */

import { UserRole } from '../../shared/types'

export class User {
  constructor(
    public readonly user_id: string,
    public readonly mobile_number: string,
    public name: string,
    public password_hash: string,
    public roles: UserRole[],
    public panel_id?: string,
    public department?: string,
    public login_count: number = 0,
    public is_default_password: boolean = true,
    public is_blocked: boolean = false,
    public blocked_until?: Date,
    public readonly created_at: Date = new Date(),
    public updated_at: Date = new Date()
  ) {}

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.roles.includes(role)
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.roles.includes(role))
  }

  /**
   * Check if user account is currently blocked
   */
  isCurrentlyBlocked(): boolean {
    if (!this.is_blocked) {
      return false
    }

    if (this.blocked_until) {
      return new Date() < this.blocked_until
    }

    return this.is_blocked
  }

  /**
   * Check if default password needs to be changed
   * Default password is valid for first 5 logins
   */
  needsPasswordChange(): boolean {
    return this.is_default_password && this.login_count >= 5
  }

  /**
   * Increment login count
   */
  incrementLoginCount(): void {
    this.login_count++
    this.updated_at = new Date()
  }

  /**
   * Update password
   */
  updatePassword(newPasswordHash: string): void {
    this.password_hash = newPasswordHash
    this.is_default_password = false
    this.updated_at = new Date()
  }

  /**
   * Block user account
   */
  block(until?: Date): void {
    this.is_blocked = true
    this.blocked_until = until
    this.updated_at = new Date()
  }

  /**
   * Unblock user account
   */
  unblock(): void {
    this.is_blocked = false
    this.blocked_until = undefined
    this.updated_at = new Date()
  }

  /**
   * Add role to user
   */
  addRole(role: UserRole): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role)
      this.updated_at = new Date()
    }
  }

  /**
   * Remove role from user
   */
  removeRole(role: UserRole): void {
    this.roles = this.roles.filter((r) => r !== role)
    this.updated_at = new Date()
  }

  /**
   * Update user information
   */
  updateInfo(data: {
    name?: string
    panel_id?: string
    department?: string
  }): void {
    if (data.name !== undefined) {
      this.name = data.name
    }
    if (data.panel_id !== undefined) {
      this.panel_id = data.panel_id
    }
    if (data.department !== undefined) {
      this.department = data.department
    }
    this.updated_at = new Date()
  }

  /**
   * Convert to plain object for storage
   */
  toPlainObject(): Record<string, unknown> {
    return {
      user_id: this.user_id,
      mobile_number: this.mobile_number,
      name: this.name,
      password_hash: this.password_hash,
      roles: this.roles,
      panel_id: this.panel_id,
      department: this.department,
      login_count: this.login_count,
      is_default_password: this.is_default_password,
      is_blocked: this.is_blocked,
      blocked_until: this.blocked_until?.toISOString(),
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    }
  }

  /**
   * Create User from plain object
   */
  static fromPlainObject(data: Record<string, unknown>): User {
    return new User(
      data.user_id as string,
      data.mobile_number as string,
      data.name as string,
      data.password_hash as string,
      data.roles as UserRole[],
      data.panel_id as string | undefined,
      data.department as string | undefined,
      (data.login_count as number) || 0,
      (data.is_default_password as boolean) ?? true,
      (data.is_blocked as boolean) || false,
      data.blocked_until ? new Date(data.blocked_until as string) : undefined,
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    )
  }
}

