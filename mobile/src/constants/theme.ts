import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#03DAC6',
    error: '#B00020',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onError: '#FFFFFF',
    onBackground: '#000000',
    onSurface: '#000000',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2196F3',
    secondary: '#03DAC6',
    error: '#B00020',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onError: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
  },
};

