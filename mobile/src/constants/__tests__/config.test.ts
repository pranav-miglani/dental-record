import {API_CONFIG, APP_CONFIG, STORAGE_KEYS} from '../config';

describe('Config', () => {
  describe('API_CONFIG', () => {
    it('should have BASE_URL', () => {
      expect(API_CONFIG.BASE_URL).toBeDefined();
    });

    it('should have VERSION', () => {
      expect(API_CONFIG.VERSION).toBeDefined();
    });

    it('should have TIMEOUT', () => {
      expect(API_CONFIG.TIMEOUT).toBe(30000);
    });
  });

  describe('APP_CONFIG', () => {
    it('should have NAME', () => {
      expect(APP_CONFIG.NAME).toBeDefined();
    });

    it('should have VERSION', () => {
      expect(APP_CONFIG.VERSION).toBeDefined();
    });

    it('should have supported languages', () => {
      expect(APP_CONFIG.SUPPORTED_LANGUAGES).toContain('en');
      expect(APP_CONFIG.SUPPORTED_LANGUAGES).toContain('hi');
    });

    it('should have IMAGE_MAX_SIZE', () => {
      expect(APP_CONFIG.IMAGE_MAX_SIZE).toBe(10 * 1024 * 1024);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have all required keys', () => {
      expect(STORAGE_KEYS.AUTH_TOKEN).toBeDefined();
      expect(STORAGE_KEYS.REFRESH_TOKEN).toBeDefined();
      expect(STORAGE_KEYS.USER_DATA).toBeDefined();
      expect(STORAGE_KEYS.LANGUAGE).toBeDefined();
    });
  });
});

