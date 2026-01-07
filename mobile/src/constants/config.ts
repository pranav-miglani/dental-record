import Config from 'react-native-config';
import {Platform} from 'react-native';

// Web uses process.env, mobile uses react-native-config
const getConfigValue = (key: string, defaultValue: string): string => {
  if (Platform.OS === 'web') {
    return process.env[`REACT_APP_${key}`] || defaultValue;
  }
  return Config[key] || defaultValue;
};

export const API_CONFIG = {
  BASE_URL:
    getConfigValue('API_BASE_URL', 'https://api.example.com') ||
    'https://api.example.com',
  VERSION: getConfigValue('API_VERSION', 'v1') || 'v1',
  TIMEOUT: 30000,
};

export const APP_CONFIG = {
  NAME: 'Dental Hospital Records',
  VERSION: '1.0.0',
  SUPPORTED_LANGUAGES: ['en', 'hi', 'raj', 'mwr'],
  DEFAULT_LANGUAGE: 'en',
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_QUALITY: 0.8,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  LANGUAGE: '@language',
  CONSENT_VERSION: '@consent_version',
};

