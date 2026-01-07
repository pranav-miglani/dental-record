import {initI18n} from '../index';
import i18n from '../index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../constants/config';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../utils/platform', () => ({
  isWeb: false,
  getWebStorage: () => null,
}));

describe('i18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default language', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await initI18n();

    expect(i18n.language).toBeDefined();
  });

  it('should use saved language preference', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('hi');

    await initI18n();

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE);
  });

  it('should fallback to English for unsupported language', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('fr');

    await initI18n();

    // Should fallback to 'en'
    expect(i18n.language).toBe('en');
  });
});

