import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';
import {useAuthStore} from '../../store/authStore';

jest.mock('../../store/authStore');
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

describe('ProfileScreen', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        name: 'John Doe',
        mobileNumber: '9999999999',
        roles: ['PATIENT'],
      },
      logout: mockLogout,
    });
  });

  it('should render profile information', () => {
    const {getByText} = render(<ProfileScreen />);

    expect(getByText('profile.title')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('9999999999')).toBeTruthy();
  });

  it('should call logout on logout button press', () => {
    mockLogout.mockResolvedValue(undefined);

    const {getByText} = render(<ProfileScreen />);
    const logoutButton = getByText('profile.logout');

    fireEvent.press(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should display roles', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        name: 'John Doe',
        mobileNumber: '9999999999',
        roles: ['PATIENT', 'DOCTOR'],
      },
      logout: mockLogout,
    });

    const {getByText} = render(<ProfileScreen />);
    expect(getByText(/PATIENT, DOCTOR/)).toBeTruthy();
  });
});

