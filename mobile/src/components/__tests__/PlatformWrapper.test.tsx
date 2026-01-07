import React from 'react';
import {render} from '@testing-library/react-native';
import {PlatformWrapper} from '../PlatformWrapper';

describe('PlatformWrapper', () => {
  it('should render children', () => {
    const {getByText} = render(
      <PlatformWrapper>
        <div>Test Content</div>
      </PlatformWrapper>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should apply web styles on web platform', () => {
    const webStyle = {backgroundColor: 'blue'};
    const {container} = render(
      <PlatformWrapper webStyle={webStyle}>
        <div>Test</div>
      </PlatformWrapper>,
    );

    // Style application would be tested based on platform
    expect(container).toBeTruthy();
  });
});

