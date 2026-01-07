import React, {useEffect} from 'react';
import {StatusBar, Platform} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import * as Localization from 'react-native-localize';

import AppNavigator from './src/navigation/AppNavigator';
import {useAuthStore} from './src/store/authStore';
import {initI18n} from './src/i18n';
import {theme} from './src/constants/theme';

const App = (): JSX.Element => {
  const {initializeAuth} = useAuthStore();
  const {i18n} = useTranslation();

  useEffect(() => {
    // Initialize i18n
    initI18n();

    // Set language based on device locale
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    const supportedLanguages = ['en', 'hi', 'raj', 'mwr']; // English, Hindi, Rajasthani, Marwari
    const language = supportedLanguages.includes(deviceLanguage)
      ? deviceLanguage
      : 'en';
    i18n.changeLanguage(language);

    // Initialize auth state
    initializeAuth();
  }, [i18n, initializeAuth]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar
              barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
              backgroundColor={theme.colors.primary}
            />
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

