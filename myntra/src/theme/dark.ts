import { Theme } from './light';

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#ff3f6c', // Myntra Pink is kept for branding consistency
    secondary: '#eaeaec',
    background: '#121212',
    surface: '#1e1e1e',
    card: '#1e1e1e',
    text: '#ffffff',
    textMuted: '#a9abb2',
    border: '#2e2e33',
    notification: '#ff3f6c',
    error: '#f44336',
    success: '#81c784',
    warning: '#ffb74d',
    info: '#64b5f6',
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
