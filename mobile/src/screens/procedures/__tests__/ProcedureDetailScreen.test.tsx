import React from 'react';
import {render} from '@testing-library/react-native';
import ProcedureDetailScreen from '../ProcedureDetailScreen';

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {procedureId: 'proc-1'},
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ProcedureDetailScreen', () => {
  it('should render procedure detail screen', () => {
    const {container} = render(<ProcedureDetailScreen />);
    expect(container).toBeTruthy();
  });
});

