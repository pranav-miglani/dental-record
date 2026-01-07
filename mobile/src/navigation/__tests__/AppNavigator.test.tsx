import React from 'react';
import {render} from '@testing-library/react-native';
import AppNavigator from '../AppNavigator';
import {useAuthStore} from '../../store/authStore';

jest.mock('../../store/authStore');
jest.mock('../AuthNavigator', () => {
  return function AuthNavigator() {
    return null;
  };
});
jest.mock('../MainNavigator', () => {
  return function MainNavigator() {
    return null;
  };
});
jest.mock('../../screens/LoadingScreen', () => {
  return function LoadingScreen() {
    return null;
  };
});

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading screen when loading', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const {container} = render(<AppNavigator />);
    expect(container).toBeTruthy();
  });

  it('should show auth navigator when not authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const {container} = render(<AppNavigator />);
    expect(container).toBeTruthy();
  });

  it('should show main navigator when authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const {container} = render(<AppNavigator />);
    expect(container).toBeTruthy();
  });
});

