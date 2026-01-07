import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import PasswordResetScreen from '../PasswordResetScreen';
import {authService} from '../../../services/authService';

jest.mock('../../../services/authService');
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

describe('PasswordResetScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render password reset form', () => {
    const {getByText} = render(<PasswordResetScreen />);
    expect(getByText('auth.passwordReset.title')).toBeTruthy();
  });

  it('should request OTP on button press', async () => {
    (authService.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);

    const {getByText} = render(<PasswordResetScreen />);
    const button = getByText('auth.passwordReset.button');

    fireEvent.press(button);

    await waitFor(() => {
      expect(authService.requestPasswordReset).toHaveBeenCalled();
    });
  });
});

