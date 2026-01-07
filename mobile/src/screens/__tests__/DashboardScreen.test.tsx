import React from 'react';
import {render} from '@testing-library/react-native';
import DashboardScreen from '../DashboardScreen';
import {useAuthStore} from '../../store/authStore';

jest.mock('../../store/authStore');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        mobileNumber: '9999999999',
        roles: ['PATIENT'],
      },
    });

    const {getByText} = render(<DashboardScreen />);
    expect(getByText('navigation.dashboard')).toBeTruthy();
  });

  it('should display user name when available', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        name: 'John Doe',
        mobileNumber: '9999999999',
        roles: ['PATIENT'],
      },
    });

    const {getByText} = render(<DashboardScreen />);
    expect(getByText(/John Doe/)).toBeTruthy();
  });

  it('should display mobile number when name not available', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        mobileNumber: '9999999999',
        roles: ['PATIENT'],
      },
    });

    const {getByText} = render(<DashboardScreen />);
    expect(getByText(/9999999999/)).toBeTruthy();
  });
});

