import {webStorage} from '../webStorage';

// Declare global types for test environment
declare global {
  var localStorage: Storage;
}

describe('webStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('getItem', () => {
    it('should get item from localStorage', async () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('test-key', 'test-value');
      }

      const result = await webStorage.getItem('test-key');

      expect(result).toBe('test-value');
    });

    it('should return null if item does not exist', async () => {
      const result = await webStorage.getItem('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should set item in localStorage', async () => {
      await webStorage.setItem('test-key', 'test-value');

      if (typeof localStorage !== 'undefined') {
        expect(localStorage.getItem('test-key')).toBe('test-value');
      }
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', async () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('test-key', 'test-value');
      }

      await webStorage.removeItem('test-key');

      if (typeof localStorage !== 'undefined') {
        expect(localStorage.getItem('test-key')).toBeNull();
      }
    });
  });

  describe('multiRemove', () => {
    it('should remove multiple items from localStorage', async () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('key1', 'value1');
        localStorage.setItem('key2', 'value2');
        localStorage.setItem('key3', 'value3');
      }

      await webStorage.multiRemove(['key1', 'key2']);

      if (typeof localStorage !== 'undefined') {
        expect(localStorage.getItem('key1')).toBeNull();
        expect(localStorage.getItem('key2')).toBeNull();
        expect(localStorage.getItem('key3')).toBe('value3');
      }
    });
  });

  describe('clear', () => {
    it('should clear all items from localStorage', async () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('key1', 'value1');
        localStorage.setItem('key2', 'value2');
      }

      await webStorage.clear();

      if (typeof localStorage !== 'undefined') {
        expect(localStorage.length).toBe(0);
      }
    });
  });
});

