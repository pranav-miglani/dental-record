import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import OTPVerificationScreen from '../OTPVerificationScreen';
import {authService} from '../../../services/authService';

jest.mock('../../../services/authService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: {mobileNumber: '9999999999'},
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('OTPVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render OTP verification form', () => {
    const {getByText} = render(<OTPVerificationScreen />);
    expect(getByText('auth.otpVerification.title')).toBeTruthy();
  });

  it('should reset password on button press', async () => {
    (authService.verifyOTPAndResetPassword as jest.Mock).mockResolvedValue(
      undefined,
    );

    const {getByText} = render(<OTPVerificationScreen />);
    const button = getByText('auth.otpVerification.button');

    fireEvent.press(button);

    await waitFor(() => {
      expect(authService.verifyOTPAndResetPassword).toHaveBeenCalled();
    });
  });
});

