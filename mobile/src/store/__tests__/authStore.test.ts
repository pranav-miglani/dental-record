import {renderHook, act} from '@testing-library/react-hooks';
import {useAuthStore} from '../authStore';
import {authService} from '../../services/authService';

jest.mock('../../services/authService');

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('initializeAuth', () => {
    it('should initialize auth state with user data', async () => {
      const mockUser = {
        id: 'user-1',
        mobileNumber: '9999999999',
        roles: ['PATIENT'],
      };

      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.isAuthenticated as jest.Mock).mockResolvedValue(true);

      const {result} = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle initialization failure', async () => {
      (authService.getCurrentUser as jest.Mock).mockRejectedValue(
        new Error('Failed'),
      );

      const {result} = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Failed to initialize auth');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        user: {
          id: 'user-1',
          mobileNumber: '9999999999',
          roles: ['PATIENT'],
        },
        accessToken: 'token',
        refreshToken: 'refresh',
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const {result} = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({
          mobileNumber: '9999999999',
          password: 'password123',
        });
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle login failure', async () => {
      const error = {response: {data: {message: 'Invalid credentials'}}};
      (authService.login as jest.Mock).mockRejectedValue(error);

      const {result} = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login({
            mobileNumber: '9999999999',
            password: 'wrong',
          });
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const {result} = renderHook(() => useAuthStore());

      // Set initial state
      act(() => {
        useAuthStore.setState({
          user: {id: 'user-1', mobileNumber: '9999999999', roles: ['PATIENT']},
          isAuthenticated: true,
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const {result} = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({error: 'Some error'});
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});

