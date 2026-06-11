import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/src/theme';

export type ThemedViewProps = ViewProps & {
  colorType?: 'background' | 'surface' | 'card' | 'border';
};

export function ThemedView({
  style,
  colorType = 'background',
  ...otherProps
}: ThemedViewProps) {
  const { theme } = useTheme();
  const backgroundColor = theme.colors[colorType] || theme.colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
