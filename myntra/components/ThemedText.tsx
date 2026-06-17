import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme } from '@/src/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  colorType?: 'text' | 'textMuted' | 'primary' | 'secondary' | 'error' | 'success';
};

export function ThemedText({
  style,
  type = 'default',
  colorType = 'text',
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();

  const getStyleByType = () => {
    switch (type) {
      case 'title':
        return {
          fontSize: theme.typography.sizes.xxl,
          lineHeight: theme.typography.lineHeights.xxl,
          fontWeight: theme.typography.weights.bold,
        };
      case 'subtitle':
        return {
          fontSize: theme.typography.sizes.lg,
          lineHeight: theme.typography.lineHeights.lg,
          fontWeight: theme.typography.weights.semiBold,
        };
      case 'defaultSemiBold':
        return {
          fontSize: theme.typography.sizes.md,
          lineHeight: theme.typography.lineHeights.md,
          fontWeight: theme.typography.weights.semiBold,
        };
      case 'link':
        return {
          fontSize: theme.typography.sizes.md,
          lineHeight: theme.typography.lineHeights.md,
          color: theme.colors.primary,
        };
      case 'default':
      default:
        return {
          fontSize: theme.typography.sizes.md,
          lineHeight: theme.typography.lineHeights.md,
          fontWeight: theme.typography.weights.regular,
        };
    }
  };

  const textColor = theme.colors[colorType] || theme.colors.text;

  return (
    <Text
      style={[
        { color: textColor, fontFamily: theme.typography.fontFamily },
        getStyleByType(),
        style,
      ]}
      {...rest}
    />
  );
}
