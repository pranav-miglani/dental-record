import React from 'react';
import {render} from '@testing-library/react-native';
import ProceduresScreen from '../ProceduresScreen';

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

describe('ProceduresScreen', () => {
  it('should render procedures screen', () => {
    const {container} = render(<ProceduresScreen />);
    expect(container).toBeTruthy();
  });

  it('should show empty state when no procedures', () => {
    const {getByText} = render(<ProceduresScreen />);
    expect(getByText('procedures.noProcedures')).toBeTruthy();
  });
});

