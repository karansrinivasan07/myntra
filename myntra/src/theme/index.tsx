import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, Theme } from './light';
import { darkTheme } from './dark';

export { lightTheme, Theme } from './light';
export { darkTheme } from './dark';

export type ThemeMode = 'light' | 'dark' | 'system' | string;

// Registry of available themes. Future themes can simply be registered here.
export const themes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@myntra_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeState] = useState<ThemeMode>('system');
  const [loading, setLoading] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode) {
          setThemeState(savedMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode from AsyncStorage', error);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode to AsyncStorage', error);
    }
  };

  // Determine active theme
  const getActiveTheme = (): { theme: Theme; isDark: boolean } => {
    if (themeMode === 'system') {
      const isSystemDark = deviceColorScheme === 'dark';
      return {
        theme: isSystemDark ? themes.dark : themes.light,
        isDark: isSystemDark,
      };
    }
    
    // Default to light if theme doesn't exist in registry
    const selectedTheme = themes[themeMode] || themes.light;
    return {
      theme: selectedTheme,
      isDark: selectedTheme.dark,
    };
  };

  const { theme, isDark } = getActiveTheme();

  if (loading) {
    // Optionally render nothing or a loading spinner until preference is loaded
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
