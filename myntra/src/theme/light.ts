export const lightTheme = {
  dark: false,
  colors: {
    primary: '#ff3f6c', // Myntra Pink
    secondary: '#3e4152',
    background: '#ffffff',
    surface: '#f5f5f6',
    card: '#ffffff',
    text: '#282c3f',
    textMuted: '#94969f',
    border: '#eaeaec',
    notification: '#ff3f6c',
    error: '#d32f2f',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semiBold: '600' as const,
      bold: '700' as const,
    },
    lineHeights: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 26,
      xl: 30,
      xxl: 34,
      xxxl: 40,
    }
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
};

export type Theme = typeof lightTheme;
