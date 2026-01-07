import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as Localization from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/config';
import {isWeb, getWebStorage} from '../utils/platform';

import en from './locales/en.json';
import hi from './locales/hi.json';
import raj from './locales/raj.json';
import mwr from './locales/mwr.json';

const resources = {
  en: {translation: en},
  hi: {translation: hi},
  raj: {translation: raj},
  mwr: {translation: mwr},
};

export const initI18n = async () => {
  // Get saved language preference
  let savedLanguage: string | null = null;
  if (isWeb) {
    const storage = getWebStorage();
    savedLanguage = storage?.getItem(STORAGE_KEYS.LANGUAGE) || null;
  } else {
    savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
  }
  
  // Get device/browser language
  let deviceLanguage = 'en';
  if (isWeb) {
    deviceLanguage = navigator.language.split('-')[0];
  } else {
    deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  }
  
  // Determine language to use
  const language = savedLanguage || deviceLanguage;
  const supportedLanguages = ['en', 'hi', 'raj', 'mwr'];
  const finalLanguage = supportedLanguages.includes(language) ? language : 'en';

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: finalLanguage,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
    });

  return i18n;
};

export default i18n;

