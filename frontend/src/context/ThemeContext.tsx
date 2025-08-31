import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { createCustomTheme } from '../theme';

interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  resetColors: () => void;
  theme: ReturnType<typeof createCustomTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get stored preferences from localStorage
  const getStoredPreferences = () => {
    if (typeof window !== 'undefined') {
      try {
        const storedMode = localStorage.getItem('themeMode') as PaletteMode | null;
        const storedPrimaryColor = localStorage.getItem('primaryColor');
        const storedSecondaryColor = localStorage.getItem('secondaryColor');
        
        return {
          mode: storedMode || 'light',
          primaryColor: storedPrimaryColor || undefined,
          secondaryColor: storedSecondaryColor || undefined,
        };
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
    
    return {
      mode: 'light',
      primaryColor: undefined,
      secondaryColor: undefined,
    };
  };
  
  const { mode: initialMode, primaryColor: initialPrimaryColor, secondaryColor: initialSecondaryColor } = getStoredPreferences();
  
  const [mode, setMode] = useState<PaletteMode>(initialMode);
  const [primaryColor, setPrimaryColor] = useState<string | undefined>(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState<string | undefined>(initialSecondaryColor);
  
  // Create theme based on current preferences
  const theme = createCustomTheme(mode, primaryColor, secondaryColor);
  
  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };
  
  // Set primary color
  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
  };
  
  // Set secondary color
  const handleSetSecondaryColor = (color: string) => {
    setSecondaryColor(color);
    localStorage.setItem('secondaryColor', color);
  };
  
  // Reset colors to default
  const resetColors = () => {
    setPrimaryColor(undefined);
    setSecondaryColor(undefined);
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('secondaryColor');
  };
  
  // Detect system preference changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('themeMode')) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setMode(e.matches ? 'dark' : 'light');
      };
      
      // Set initial value
      setMode(mediaQuery.matches ? 'dark' : 'light');
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);
  
  const contextValue: ThemeContextType = {
    mode,
    toggleColorMode,
    setPrimaryColor: handleSetPrimaryColor,
    setSecondaryColor: handleSetSecondaryColor,
    resetColors,
    theme,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};