import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import './index.web.css';

import AppNavigator from './navigation/AppNavigator';
import {useAuthStore} from './store/authStore';
import {initI18n} from './i18n';
import {theme} from './constants/theme';

// Web-specific localization
const getWebLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('@language');
    if (savedLanguage) return savedLanguage;

    const browserLanguage = navigator.language.split('-')[0];
    const supportedLanguages = ['en', 'hi', 'raj', 'mwr'];
    return supportedLanguages.includes(browserLanguage)
      ? browserLanguage
      : 'en';
  }
  return 'en';
};

const App = (): JSX.Element => {
  const {initializeAuth} = useAuthStore();
  const {i18n} = useTranslation();

  useEffect(() => {
    // Initialize i18n
    initI18n();

    // Set language based on browser/device locale
    const language = getWebLanguage();
    i18n.changeLanguage(language);

    // Initialize auth state
    initializeAuth();
  }, [i18n, initializeAuth]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

