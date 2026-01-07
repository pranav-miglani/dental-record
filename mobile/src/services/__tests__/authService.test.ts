import {authService} from '../authService';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../constants/config';

jest.mock('../api');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../utils/platform', () => ({
  isWeb: false,
  getWebStorage: () => null,
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'user-1',
            mobileNumber: '9999999999',
            roles: ['PATIENT'],
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login({
        mobileNumber: '9999999999',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        mobileNumber: '9999999999',
        password: 'password123',
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.AUTH_TOKEN,
        'access-token',
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.REFRESH_TOKEN,
        'refresh-token',
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(mockResponse.data.user),
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on login failure', async () => {
      const error = new Error('Login failed');
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(
        authService.login({
          mobileNumber: '9999999999',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Login failed');
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear tokens', async () => {
      (api.post as jest.Mock).mockResolvedValue({});

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    });

    it('should clear tokens even if API call fails', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset', async () => {
      (api.post as jest.Mock).mockResolvedValue({});

      await authService.requestPasswordReset('9999999999');

      expect(api.post).toHaveBeenCalledWith('/auth/password-reset', {
        mobileNumber: '9999999999',
      });
    });
  });

  describe('verifyOTPAndResetPassword', () => {
    it('should verify OTP and reset password', async () => {
      (api.post as jest.Mock).mockResolvedValue({});

      await authService.verifyOTPAndResetPassword({
        mobileNumber: '9999999999',
        otp: '123456',
        newPassword: 'newpassword123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/password-reset/verify', {
        mobileNumber: '9999999999',
        otp: '123456',
        newPassword: 'newpassword123',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data from storage', async () => {
      const userData = {
        id: 'user-1',
        mobileNumber: '9999999999',
        roles: ['PATIENT'],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(userData),
      );

      const result = await authService.getCurrentUser();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_DATA);
      expect(result).toEqual(userData);
    });

    it('should return null if no user data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('token');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false if no token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});

