import React from 'react';
import {render} from '@testing-library/react';
import App from './App.web';

jest.mock('./store/authStore', () => ({
  useAuthStore: () => ({
    initializeAuth: jest.fn(),
  }),
}));
jest.mock('./i18n', () => ({
  initI18n: jest.fn().mockResolvedValue({}),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('App.web', () => {
  it('should render app', () => {
    const {container} = render(<App />);
    expect(container).toBeTruthy();
  });
});

