import {Platform} from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isIOS || isAndroid;

// Web-specific utilities
export const getWebStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key: string) => window.localStorage.getItem(key),
      setItem: (key: string, value: string) =>
        window.localStorage.setItem(key, value),
      removeItem: (key: string) => window.localStorage.removeItem(key),
      clear: () => window.localStorage.clear(),
    };
  }
  return null;
};

