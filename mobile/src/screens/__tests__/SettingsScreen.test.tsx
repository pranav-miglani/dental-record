import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import SettingsScreen from '../SettingsScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('SettingsScreen', () => {
  it('should render settings screen', () => {
    const {getByText} = render(<SettingsScreen />);
    expect(getByText('settings.title')).toBeTruthy();
  });

  it('should display language option', () => {
    const {getByText} = render(<SettingsScreen />);
    expect(getByText('settings.language')).toBeTruthy();
  });
});

