import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import {useAuthStore} from '../../../store/authStore';

jest.mock('../../../store/authStore');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      error: null,
      clearError: mockClearError,
    });
  });

  it('should render login form', () => {
    const {getByText, getByPlaceholderText} = render(<LoginScreen />);

    expect(getByText('auth.login.title')).toBeTruthy();
    expect(getByPlaceholderText).toBeDefined();
  });

  it('should call login on button press', async () => {
    mockLogin.mockResolvedValue({});

    const {getByText} = render(<LoginScreen />);
    const loginButton = getByText('auth.login.button');

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should display error message', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      error: 'Invalid credentials',
      clearError: mockClearError,
    });

    const {getByText} = render(<LoginScreen />);
    expect(getByText('Invalid credentials')).toBeTruthy();
  });
});

