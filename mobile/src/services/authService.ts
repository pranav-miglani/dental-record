import api from './api';
import {STORAGE_KEYS} from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isWeb, getWebStorage} from '../utils/platform';

export interface LoginRequest {
  mobileNumber: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    mobileNumber: string;
    roles: string[];
    name?: string;
  };
}

export interface PasswordResetRequest {
  mobileNumber: string;
}

export interface PasswordResetOTPRequest {
  mobileNumber: string;
  otp: string;
  newPassword: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens
    if (isWeb) {
      const storage = getWebStorage();
      storage?.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken);
      storage?.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
      storage?.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      if (isWeb) {
        const storage = getWebStorage();
        storage?.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        storage?.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        storage?.removeItem(STORAGE_KEYS.USER_DATA);
      } else {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
      }
    }
  }

  async requestPasswordReset(mobileNumber: string): Promise<void> {
    await api.post('/auth/password-reset', {mobileNumber});
  }

  async verifyOTPAndResetPassword(
    data: PasswordResetOTPRequest,
  ): Promise<void> {
    await api.post('/auth/password-reset/verify', data);
  }

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    await api.post('/auth/change-password', {oldPassword, newPassword});
  }

  async getCurrentUser(): Promise<any> {
    let userData: string | null = null;
    if (isWeb) {
      const storage = getWebStorage();
      userData = storage?.getItem(STORAGE_KEYS.USER_DATA) || null;
    } else {
      userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    }
    return userData ? JSON.parse(userData) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    let token: string | null = null;
    if (isWeb) {
      const storage = getWebStorage();
      token = storage?.getItem(STORAGE_KEYS.AUTH_TOKEN) || null;
    } else {
      token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return !!token;
  }
}

export const authService = new AuthService();

