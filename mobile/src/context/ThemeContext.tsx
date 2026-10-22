import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../theme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    // Sync with initial device appearance
    const current = Appearance.getColorScheme();
    setThemeMode(current === 'dark' ? 'dark' : 'light');

    // Listen dynamically to OS / device appearance changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeMode(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription.remove();
  }, []);

  // Update whenever systemScheme changes
  useEffect(() => {
    if (systemScheme) {
      setThemeMode(systemScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemScheme]);

  // Keep toggleTheme as harmless no-op as theme is catered for by device default
  const toggleTheme = () => {
    // Theme follows device system default
  };

  const theme = useMemo(() => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      theme,
      isDark: themeMode === 'dark',
      toggleTheme,
      setThemeMode,
    }),
    [themeMode, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
