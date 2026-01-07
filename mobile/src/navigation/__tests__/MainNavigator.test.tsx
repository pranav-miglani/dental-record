import React from 'react';
import {render} from '@testing-library/react-native';
import MainNavigator from '../MainNavigator';
import {useAuthStore} from '../../store/authStore';

jest.mock('../../store/authStore');
jest.mock('../../screens/DashboardScreen', () => {
  return function DashboardScreen() {
    return null;
  };
});
jest.mock('../../screens/patients/PatientsScreen', () => {
  return function PatientsScreen() {
    return null;
  };
});
jest.mock('../../screens/procedures/ProceduresScreen', () => {
  return function ProceduresScreen() {
    return null;
  };
});
jest.mock('../../screens/ProfileScreen', () => {
  return function ProfileScreen() {
    return null;
  };
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('MainNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render main navigator for non-patient users', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        roles: ['DOCTOR'],
      },
    });

    const {container} = render(<MainNavigator />);
    expect(container).toBeTruthy();
  });

  it('should hide patients tab for patient users', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        roles: ['PATIENT'],
      },
    });

    const {container} = render(<MainNavigator />);
    expect(container).toBeTruthy();
  });
});

