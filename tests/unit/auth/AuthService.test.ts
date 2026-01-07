/**
 * Unit tests for AuthService
 */

import { AuthService } from '../../../src/application/auth/AuthService'
import { IUserRepository } from '../../../src/infrastructure/dynamodb/repositories/IUserRepository'
import { User } from '../../../src/domain/user/User'
import { InvalidCredentialsError, BlockedUserError } from '../../../src/shared/errors'

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

describe('AuthService', () => {
  let authService: AuthService
  let mockUserRepository: jest.Mocked<IUserRepository>
  let mockUser: User

  beforeEach(() => {
    // Create mock user
    mockUser = User.fromPlainObject({
      user_id: 'test-user-id',
      mobile_number: '9876543210',
      name: 'Test User',
      password_hash: 'hashed-password',
      roles: ['PATIENT'],
      login_count: 0,
      is_default_password: false,
      is_blocked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create mock repository
    mockUserRepository = {
      findByMobileNumber: jest.fn(),
      findById: jest.fn(),
      findByRole: jest.fn(),
      findByPanelId: jest.fn(),
      mobileNumberExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countAll: jest.fn(),
    } as jest.Mocked<IUserRepository>

    // Create auth service
    authService = new AuthService(
      mockUserRepository,
      undefined, // userPatientMappingRepository (optional)
      undefined, // patientRepository (optional)
      'test-secret',
      '30m',
      '30d'
    )
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const bcrypt = require('bcryptjs')
      const jwt = require('jsonwebtoken')

      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValue('mock-token')
      mockUserRepository.findByMobileNumber.mockResolvedValue(mockUser)
      mockUserRepository.update.mockResolvedValue(mockUser)

      // Act
      const result = await authService.login('9876543210', 'password123')

      // Assert
      expect(result).toHaveProperty('access_token')
      expect(result).toHaveProperty('refresh_token')
      expect(result.user).toEqual(mockUser)
      expect(mockUserRepository.findByMobileNumber).toHaveBeenCalledWith('9876543210')
      expect(mockUserRepository.update).toHaveBeenCalled()
    })

    it('should throw InvalidCredentialsError for invalid mobile number', async () => {
      // Arrange
      mockUserRepository.findByMobileNumber.mockResolvedValue(null)

      // Act & Assert
      await expect(authService.login('9876543210', 'password123')).rejects.toThrow(
        InvalidCredentialsError
      )
    })

    it('should throw InvalidCredentialsError for invalid password', async () => {
      // Arrange
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(false)
      mockUserRepository.findByMobileNumber.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(authService.login('9876543210', 'wrong-password')).rejects.toThrow(
        InvalidCredentialsError
      )
    })

    it('should throw BlockedUserError for blocked user', async () => {
      // Arrange
      mockUser.is_blocked = true
      mockUser.blocked_until = new Date(Date.now() + 86400000) // Tomorrow
      mockUserRepository.findByMobileNumber.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(authService.login('9876543210', 'password123')).rejects.toThrow(
        BlockedUserError
      )
    })
  })

  describe('changePassword', () => {
    it('should successfully change password with valid current password', async () => {
      // Arrange
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(true)
      bcrypt.hash.mockResolvedValue('new-hashed-password')
      mockUserRepository.findById.mockResolvedValue(mockUser)
      mockUserRepository.update.mockResolvedValue(mockUser)

      // Act
      await authService.changePassword('test-user-id', 'old-password', 'new-password')

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('test-user-id')
      expect(mockUserRepository.update).toHaveBeenCalled()
    })

    it('should throw InvalidCredentialsError for incorrect current password', async () => {
      // Arrange
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(false)
      mockUserRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        authService.changePassword('test-user-id', 'wrong-password', 'new-password')
      ).rejects.toThrow(InvalidCredentialsError)
    })
  })
})

