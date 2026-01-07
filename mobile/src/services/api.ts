import axios, {AxiosInstance, AxiosError} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG, STORAGE_KEYS} from '../constants/config';
import {isWeb, getWebStorage} from '../utils/platform';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async config => {
        let token: string | null = null;
        if (isWeb) {
          const storage = getWebStorage();
          token = storage?.getItem(STORAGE_KEYS.AUTH_TOKEN) || null;
        } else {
          token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        }
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            let refreshToken: string | null = null;
            if (isWeb) {
              const storage = getWebStorage();
              refreshToken = storage?.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
            } else {
              refreshToken = await AsyncStorage.getItem(
                STORAGE_KEYS.REFRESH_TOKEN,
              );
            }

            if (refreshToken) {
              const response = await axios.post(
                `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}/auth/refresh`,
                {refreshToken},
              );

              const {accessToken} = response.data;
              
              if (isWeb) {
                const storage = getWebStorage();
                storage?.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
              } else {
                await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
              }

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
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
            // Navigation will be handled by auth store
          }
        }

        return Promise.reject(error);
      },
    );
  }

  get instance(): AxiosInstance {
    return this.client;
  }
}

export const apiService = new ApiService();
export default apiService.instance;

