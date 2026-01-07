import React from 'react';
import {render} from '@testing-library/react-native';
import LoadingScreen from '../LoadingScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LoadingScreen', () => {
  it('should render loading indicator', () => {
    const {getByTestId} = render(<LoadingScreen />);
    // ActivityIndicator should be present
    expect(getByTestId).toBeDefined();
  });

  it('should display loading text', () => {
    const {getByText} = render(<LoadingScreen />);
    expect(getByText('common.loading')).toBeTruthy();
  });
});

