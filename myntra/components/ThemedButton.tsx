import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme';
import { ThemedText } from './ThemedText';

export interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ThemedButtonProps) {
  const { theme } = useTheme();

  const getButtonStyles = (): ViewStyle => {
    let backgroundColor = theme.colors.primary;
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (variant === 'secondary') {
      backgroundColor = theme.colors.secondary;
    } else if (variant === 'outline') {
      backgroundColor = 'transparent';
      borderColor = theme.colors.border;
      borderWidth = 1;
    }

    let paddingVertical = theme.spacing.sm;
    let paddingHorizontal = theme.spacing.md;

    if (size === 'sm') {
      paddingVertical = theme.spacing.xs;
      paddingHorizontal = theme.spacing.sm;
    } else if (size === 'lg') {
      paddingVertical = theme.spacing.md;
      paddingHorizontal = theme.spacing.lg;
    }

    return {
      backgroundColor,
      borderColor,
      borderWidth,
      paddingVertical,
      paddingHorizontal,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled || loading ? 0.6 : 1,
      flexDirection: 'row',
    };
  };

  const getCustomTextColor = () => {
    if (variant === 'outline') {
      return theme.colors.primary;
    }
    if (variant === 'secondary') {
      return theme.colors.background;
    }
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyles(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getCustomTextColor()} style={{ marginRight: theme.spacing.sm }} />
      ) : null}
      <ThemedText
        style={[
          {
            color: getCustomTextColor(),
            fontWeight: theme.typography.weights.semiBold,
            fontSize: size === 'sm' ? theme.typography.sizes.sm : size === 'lg' ? theme.typography.sizes.lg : theme.typography.sizes.md,
          },
          textStyle,
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}
