import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import PatientsScreen from '../PatientsScreen';

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

describe('PatientsScreen', () => {
  it('should render patients screen', () => {
    const {getByPlaceholderText} = render(<PatientsScreen />);
    expect(getByPlaceholderText('patients.searchPlaceholder')).toBeTruthy();
  });

  it('should update search query on input', () => {
    const {getByPlaceholderText} = render(<PatientsScreen />);
    const searchInput = getByPlaceholderText('patients.searchPlaceholder');

    fireEvent.changeText(searchInput, 'John');

    expect(searchInput.props.value).toBe('John');
  });

  it('should show empty state when no patients', () => {
    const {getByText} = render(<PatientsScreen />);
    expect(getByText('patients.noPatients')).toBeTruthy();
  });
});

