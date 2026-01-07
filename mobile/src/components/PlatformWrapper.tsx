import React from 'react';
import {Platform, View, StyleSheet} from 'react-native';

interface PlatformWrapperProps {
  children: React.ReactNode;
  webStyle?: any;
  mobileStyle?: any;
}

/**
 * Wrapper component to apply platform-specific styles
 */
export const PlatformWrapper: React.FC<PlatformWrapperProps> = ({
  children,
  webStyle,
  mobileStyle,
}) => {
  const style = Platform.OS === 'web' ? webStyle : mobileStyle;

  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

