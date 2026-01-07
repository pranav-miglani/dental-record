import api from '../api';
import {API_CONFIG} from '../../constants/config';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock platform utilities
jest.mock('../../utils/platform', () => ({
  isWeb: false,
  getWebStorage: () => null,
}));

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create axios instance with correct base URL', () => {
    expect(api.defaults.baseURL).toBe(
      `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
    );
  });

  it('should have correct timeout', () => {
    expect(api.defaults.timeout).toBe(API_CONFIG.TIMEOUT);
  });

  it('should have correct default headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});

