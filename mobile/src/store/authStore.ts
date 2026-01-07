import {create} from 'zustand';
import {authService, LoginRequest} from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/config';

interface User {
  id: string;
  mobileNumber: string;
  roles: string[];
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    try {
      const userData = await authService.getCurrentUser();
      const isAuth = await authService.isAuthenticated();

      set({
        user: userData,
        isAuthenticated: isAuth,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize auth',
      });
    }
  },

  login: async (credentials: LoginRequest) => {
    try {
      set({isLoading: true, error: null});
      const response = await authService.login(credentials);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.message || 'Login failed',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      // Clear state even if logout API fails
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  clearError: () => {
    set({error: null});
  },
}));

