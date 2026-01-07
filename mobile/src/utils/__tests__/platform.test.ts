import {isWeb, isIOS, isAndroid, isMobile, getWebStorage} from '../platform';
import {Platform} from 'react-native';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('Platform Utilities', () => {
  describe('isWeb', () => {
    it('should return false for iOS', () => {
      expect(isWeb).toBe(false);
    });
  });

  describe('isIOS', () => {
    it('should return true for iOS', () => {
      expect(isIOS).toBe(true);
    });
  });

  describe('isAndroid', () => {
    it('should return false for iOS', () => {
      expect(isAndroid).toBe(false);
    });
  });

  describe('isMobile', () => {
    it('should return true for iOS', () => {
      expect(isMobile).toBe(true);
    });
  });

  describe('getWebStorage', () => {
    it('should return null when not on web', () => {
      const storage = getWebStorage();
      expect(storage).toBeNull();
    });

    it('should return storage object when on web', () => {
      // Mock window object
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };

      (global as any).window = {
        localStorage: mockLocalStorage,
      };

      // Change Platform.OS to web
      (Platform as any).OS = 'web';

      const storage = getWebStorage();

      expect(storage).not.toBeNull();
      expect(storage?.getItem).toBeDefined();
      expect(storage?.setItem).toBeDefined();
      expect(storage?.removeItem).toBeDefined();
      expect(storage?.clear).toBeDefined();

      // Reset
      (Platform as any).OS = 'ios';
      delete (global as any).window;
    });
  });
});

