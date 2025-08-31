import { createTheme, responsiveFontSizes, Theme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { deepmerge } from '@mui/utils';

// Import color palettes
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { components } from './components';
import { shadows } from './shadows';

// Create theme options for light and dark modes
const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: mode === 'light' ? lightPalette : darkPalette,
  typography,
  components,
  shadows: mode === 'light' ? shadows : shadows.map(() => 'none') as any,
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  zIndex: {
    appBar: 1200,
    drawer: 1100,
  },
});

// Create base themes
const lightTheme = responsiveFontSizes(createTheme(getThemeOptions('light')));
const darkTheme = responsiveFontSizes(createTheme(getThemeOptions('dark')));

// Function to create a custom theme with user preferences
export const createCustomTheme = (
  mode: PaletteMode = 'light',
  primaryColor?: string,
  secondaryColor?: string
): Theme => {
  // Start with the base theme
  const baseTheme = mode === 'light' ? lightTheme : darkTheme;
  
  // If no custom colors are provided, return the base theme
  if (!primaryColor && !secondaryColor) {
    return baseTheme;
  }
  
  // Create custom palette overrides
  const customPalette: any = {};
  
  if (primaryColor) {
    customPalette.primary = {
      main: primaryColor,
      // The system will generate light, dark, and contrastText automatically
    };
  }
  
  if (secondaryColor) {
    customPalette.secondary = {
      main: secondaryColor,
    };
  }
  
  // Merge the base theme with custom overrides
  return createTheme(deepmerge(baseTheme, { palette: customPalette }));
};

// Default theme (light mode)
const theme = lightTheme;

export default theme;