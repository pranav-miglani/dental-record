import React from 'react';
import {render} from '@testing-library/react-native';
import PatientDetailScreen from '../PatientDetailScreen';

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {patientId: 'patient-1'},
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('PatientDetailScreen', () => {
  it('should render patient detail screen', () => {
    const {getByText} = render(<PatientDetailScreen />);
    expect(getByText('patients.details.title')).toBeTruthy();
  });
});

