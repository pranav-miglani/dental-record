/**
 * Web storage utility that mimics AsyncStorage API
 * Uses localStorage for web platform
 */

export const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    keys.forEach(key => window.localStorage.removeItem(key));
  },

  clear: async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.clear();
  },
};

