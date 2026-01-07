module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@store': './src/store',
          '@utils': './src/utils',
          '@types': './src/types',
          '@constants': './src/constants',
          '@i18n': './src/i18n',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};

