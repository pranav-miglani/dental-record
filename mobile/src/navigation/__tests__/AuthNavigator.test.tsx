import React from 'react';
import {render} from '@testing-library/react-native';
import AuthNavigator from '../AuthNavigator';

jest.mock('../../screens/auth/LoginScreen', () => {
  return function LoginScreen() {
    return null;
  };
});
jest.mock('../../screens/auth/PasswordResetScreen', () => {
  return function PasswordResetScreen() {
    return null;
  };
});
jest.mock('../../screens/auth/OTPVerificationScreen', () => {
  return function OTPVerificationScreen() {
    return null;
  };
});

describe('AuthNavigator', () => {
  it('should render auth navigator', () => {
    const {container} = render(<AuthNavigator />);
    expect(container).toBeTruthy();
  });
});

